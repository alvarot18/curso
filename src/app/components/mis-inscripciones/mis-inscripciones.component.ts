import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InscripcionService, Inscripcion, InscripcionCreateDTO } from '../../services/inscripcion.service';
import { CursoService, Curso, Modulo } from '../../services/curso.service';
import { ModuloService } from '../../services/modulo.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-inscripciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-inscripciones.component.html',
  styleUrl: './mis-inscripciones.component.css'
})
export class MisInscripcionesComponent implements OnInit {
  tabActiva = 'disponibles'; // 'disponibles' o 'inscripciones'
  cursosDisponibles: Curso[] = [];
  misInscripciones: Inscripcion[] = [];
  cargandoCursos = false;
  cargandoInscripciones = false;
  usuarioId: number = 0;
  
  // Para el modal de módulos
  cursoSeleccionado: Inscripcion | null = null;
  modulosCurso: Modulo[] = [];
  cargandoModulos = false;
  modulosCompletados: Set<number> = new Set();
  mostrarModal = false;

  constructor(
    private inscripcionService: InscripcionService,
    private cursoService: CursoService,
    private moduloService: ModuloService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const usuario = this.authService.getCurrentUser();
    if (usuario && usuario.id) {
      this.usuarioId = usuario.id;
      this.cargarCursosDisponibles();
      this.cargarMisInscripciones();
    }
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
    if (tab === 'disponibles' && this.cursosDisponibles.length === 0) {
      this.cargarCursosDisponibles();
    } else if (tab === 'inscripciones') {
      this.cargarMisInscripciones();
    }
  }

  cargarCursosDisponibles() {
    this.cargandoCursos = true;
    this.cursoService.obtenerTodos().subscribe({
      next: (cursos) => {
        // Filtrar solo cursos activos
        this.cursosDisponibles = cursos.filter(curso => curso.activo);
        this.cargandoCursos = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.cargandoCursos = false;
      }
    });
  }

  cargarMisInscripciones() {
    this.cargandoInscripciones = true;
    this.inscripcionService.obtenerPorUsuario(this.usuarioId).subscribe({
      next: (inscripciones) => {
        this.misInscripciones = inscripciones;
        this.cargandoInscripciones = false;
      },
      error: (error) => {
        console.error('Error al cargar inscripciones:', error);
        this.cargandoInscripciones = false;
      }
    });
  }

  inscribirseACurso(curso: Curso) {
    if (confirm(`¿Está seguro de que desea inscribirse al curso "${curso.titulo}"?`)) {
      const inscripcionData: InscripcionCreateDTO = {
        usuarioId: this.usuarioId,
        cursoId: curso.id!
      };

      this.inscripcionService.inscribirUsuario(inscripcionData).subscribe({
        next: () => {
          alert('¡Inscripción exitosa!');
          this.cargarMisInscripciones(); // Refrescar mis inscripciones
          this.cargarCursosDisponibles(); // Refrescar cursos disponibles
        },
        error: (error) => {
          console.error('Error al inscribirse:', error);
          if (error.status === 400) {
            alert('Ya estás inscrito en este curso o el curso no está disponible');
          } else {
            alert('Error al procesar la inscripción');
          }
        }
      });
    }
  }

  eliminarInscripcion(inscripcion: Inscripcion) {
    if (confirm(`¿Está seguro de que desea eliminar su inscripción al curso "${inscripcion.cursoTitulo}"?`)) {
      this.inscripcionService.eliminarInscripcion(inscripcion.usuarioId, inscripcion.cursoId).subscribe({
        next: () => {
          alert('Inscripción eliminada exitosamente');
          this.cargarMisInscripciones(); // Refrescar la lista
          this.cargarCursosDisponibles(); // Refrescar cursos disponibles
        },
        error: (error) => {
          console.error('Error al eliminar inscripción:', error);
          alert('Error al eliminar la inscripción');
        }
      });
    }
  }

  estaInscrito(cursoId: number): boolean {
    return this.misInscripciones.some(inscripcion => 
      inscripcion.cursoId === cursoId && 
      (inscripcion.estado === 'INSCRITO' || inscripcion.estado === 'COMPLETADO' || inscripcion.estado === 'EN_PROGRESO')
    );
  }

  iniciarCurso(inscripcion: Inscripcion) {
    this.cursoSeleccionado = inscripcion;
    this.mostrarModal = true;
    this.cargarModulosCurso(inscripcion.cursoId);
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.cursoSeleccionado = null;
    this.modulosCurso = [];
    this.modulosCompletados.clear();
  }

  cargarModulosCurso(cursoId: number) {
    this.cargandoModulos = true;
    this.moduloService.obtenerPorCurso(cursoId, this.usuarioId).subscribe({
      next: (modulos) => {
        this.modulosCurso = modulos;
        this.modulosCompletados.clear();
        // Agregar módulos completados al Set
        modulos.forEach(modulo => {
          if (modulo.estadoProgreso === 'TERMINADO') {
            this.modulosCompletados.add(modulo.id!);
          }
        });
        this.cargandoModulos = false;
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
        this.cargandoModulos = false;
        alert('Error al cargar los módulos del curso');
      }
    });
  }

  completarModulo(modulo: Modulo) {
    if (confirm(`¿Desea marcar como completado el módulo "${modulo.titulo}"?`)) {
      this.inscripcionService.completarModulo(this.usuarioId, modulo.id!).subscribe({
        next: (response) => {
          // Actualizar inmediatamente el estado del módulo en la lista
          const moduloEnLista = this.modulosCurso.find(m => m.id === modulo.id);
          if (moduloEnLista) {
            moduloEnLista.estadoProgreso = 'TERMINADO';
            moduloEnLista.fechaCompletado = new Date().toISOString();
          }
          
          this.modulosCompletados.add(modulo.id!);
          alert('Módulo completado exitosamente');
          
          // Recargar inscripciones para actualizar el progreso general
          this.cargarMisInscripciones();
          this.cargarCursosDisponibles(); // Refrescar cursos disponibles
        },
        error: (error) => {
          console.error('Error al completar módulo:', error);
          alert('Error al completar el módulo: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  obtenerEstadoModulo(moduloId: number): string {
    const modulo = this.modulosCurso.find(m => m.id === moduloId);
    return modulo?.estadoProgreso || 'PENDIENTE';
  }
}