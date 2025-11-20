import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CursoService, Curso, CursoCreateDTO, ModuloCreateDTO } from '../../services/curso.service';
import { ModuloService } from '../../services/modulo.service';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-gestion-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-cursos.component.html',
  styleUrl: './gestion-cursos.component.css'
})
export class GestionCursosComponent implements OnInit {
  cursos: Curso[] = [];
  instructores: Usuario[] = [];
  cursoForm: FormGroup;
  mostrarFormulario = false;
  editando = false;
  cursoEditando: Curso | null = null;
  cargando = false;
  modulosOriginales = 0; // Contador de módulos originales cargados desde BD
  
  // Gestión de módulos por separado
  mostrarGestionModulos = false;
  cursoSeleccionado: Curso | null = null;
  modulosCurso: any[] = [];
  cargandoModulos = false;

  constructor(
    private cursoService: CursoService,
    private moduloService: ModuloService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {
    this.cursoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      duracionEstimada: [0, [Validators.required, Validators.min(1), Validators.max(9999)]],
      nivel: ['', Validators.required],
      instructorId: ['', Validators.required],
      modulos: this.fb.array([])
    });
  }

  ngOnInit() {
    this.cargarCursos();
    this.cargarInstructores();
  }

  get modulos(): FormArray {
    return this.cursoForm.get('modulos') as FormArray;
  }

  cargarCursos() {
    this.cargando = true;
    this.cursoService.obtenerTodos().subscribe({
      next: (cursos) => {
        this.cursos = cursos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.cargando = false;
      }
    });
  }

  cargarInstructores() {
    this.usuarioService.obtenerTodos().subscribe({
      next: (usuarios) => {
        this.instructores = usuarios.filter(usuario => usuario.rol === 'INSTRUCTOR');
      },
      error: (error) => {
        console.error('Error al cargar instructores:', error);
      }
    });
  }

  mostrarFormularioCrear() {
    this.editando = false;
    this.cursoEditando = null;
    this.modulosOriginales = 0;
    this.cursoForm.reset();
    this.modulos.clear();
    this.mostrarFormulario = true;
    
    // Autoseleccionar el instructor logueado después de mostrar el formulario
    setTimeout(() => {
      const usuarioLogueado = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (usuarioLogueado && usuarioLogueado.id) {
        this.cursoForm.patchValue({
          instructorId: usuarioLogueado.id.toString()
        });
      }
    }, 100);
  }

  editarCurso(curso: Curso) {
    this.editando = true;
    this.cursoEditando = curso;
    this.mostrarFormulario = true;
    
    this.cursoForm.patchValue({
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      duracionEstimada: curso.duracionEstimada,
      nivel: curso.nivel,
      instructorId: curso.instructorId || curso.instructor?.id || ''
    });

    // Limpiar módulos para empezar desde cero como en crear
    this.modulos.clear();
    this.modulosOriginales = 0;
  }

  cargarModulosParaEdicion(cursoId: number) {
    this.moduloService.obtenerPorCurso(cursoId).subscribe({
      next: (modulos) => {
        this.modulos.clear();
        this.modulosOriginales = modulos.length; // Guardar cantidad original
        modulos.forEach(modulo => {
          this.modulos.push(this.fb.group({
            id: [modulo.id],
            titulo: [modulo.titulo, [Validators.required, Validators.minLength(3)]],
            descripcion: [modulo.descripcion, [Validators.required, Validators.minLength(10)]],
            tipo: [modulo.tipo, Validators.required],
            contenido: [modulo.contenido, [Validators.required, Validators.minLength(5)]],
            orden: [modulo.orden, [Validators.required, Validators.min(1)]]
          }));
        });
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      }
    });
  }

  agregarModulo() {
    const moduloForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipo: ['VIDEO', Validators.required],
      contenido: ['', [Validators.required, Validators.minLength(5)]],
      orden: [this.modulos.length + 1, [Validators.required, Validators.min(1)]]
    });
    
    this.modulos.push(moduloForm);
  }

  eliminarModulo(index: number) {
    if (confirm('¿Está seguro de que desea eliminar este módulo?')) {
      const moduloForm = this.modulos.at(index);
      const moduloId = moduloForm.get('id')?.value;
      
      if (moduloId && this.editando) {
        this.moduloService.eliminar(moduloId).subscribe({
          next: () => {
            this.modulos.removeAt(index);
            this.reordenarModulos();
          },
          error: (error) => {
            console.error('Error al eliminar módulo:', error);
            alert('Error al eliminar el módulo');
          }
        });
      } else {
        this.modulos.removeAt(index);
        this.reordenarModulos();
      }
    }
  }

  reordenarModulos() {
    for (let i = 0; i < this.modulos.length; i++) {
      this.modulos.at(i).get('orden')?.setValue(i + 1);
    }
  }

  prepararDatosCurso(): CursoCreateDTO {
    const formValue = this.cursoForm.value;
    
    const modulosDTO: ModuloCreateDTO[] = formValue.modulos.map((modulo: any) => ({
      titulo: modulo.titulo,
      descripcion: modulo.descripcion,
      tipo: modulo.tipo,
      contenido: modulo.contenido,
      orden: modulo.orden
    }));

    return {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      duracionEstimada: Number(formValue.duracionEstimada),
      nivel: formValue.nivel,
      instructorId: Number(formValue.instructorId),
      modulos: modulosDTO
    };
  }

  onSubmit() {
    if (!this.cursoForm.valid) {
      alert('Por favor, complete todos los campos requeridos correctamente');
      return;
    }
    
    if (!this.validarModulos()) {
      alert('Debe agregar al menos un módulo al curso');
      return;
    }
    
    const cursoData = this.prepararDatosCurso();
    this.cargando = true;

      if (this.editando && this.cursoEditando) {
        this.cursoService.actualizar(this.cursoEditando.id!, cursoData).subscribe({
          next: () => {
            alert('Curso actualizado exitosamente');
            this.cancelar();
            this.cargarCursos();
          },
          error: (error) => {
            console.error('Error al actualizar curso:', error);
            alert('Error al actualizar el curso');
            this.cargando = false;
          }
        });
      } else {
        this.cursoService.crear(cursoData).subscribe({
          next: () => {
            alert('Curso creado exitosamente');
            this.cancelar();
            this.cargarCursos();
          },
          error: (error) => {
            console.error('Error al crear curso:', error);
            alert('Error al crear el curso');
            this.cargando = false;
          }
        });
      }

  }

  validarModulos(): boolean {
    return this.modulos.length > 0;
  }

  puedeEnviarFormulario(): boolean {
    if (this.editando) {
      // En modo edición: solo verificar formulario válido
      return this.cursoForm.valid;
    } else {
      // En modo creación: formulario válido Y módulos
      return this.cursoForm.valid && this.modulos.length > 0;
    }
  }

  eliminarCurso(curso: Curso) {
    if (confirm(`¿Está seguro de que desea eliminar el curso "${curso.titulo}"?`)) {
      this.cursoService.eliminarPermanente(curso.id!).subscribe({
        next: () => {
          alert('Curso eliminado exitosamente');
          
          // Si el curso eliminado es el que está siendo gestionado, cerrar la gestión de módulos
          if (this.mostrarGestionModulos && this.cursoSeleccionado?.id === curso.id) {
            this.cerrarGestionModulos();
          }
          
          this.cargarCursos();
        },
        error: (error: any) => {
          console.error('Error al eliminar curso:', error);
          alert('Error al eliminar el curso');
        }
      });
    }
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.editando = false;
    this.cursoEditando = null;
    this.cargando = false;
    this.modulosOriginales = 0;
    this.cursoForm.reset();
    this.modulos.clear();
  }

  campoEsInvalido(campo: string): boolean {
    const control = this.cursoForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  moduloCampoEsInvalido(index: number, campo: string): boolean {
    const control = this.modulos.at(index).get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  obtenerErrorCampo(campo: string): string {
    const control = this.cursoForm.get(campo);
    if (control?.errors) {
      if (control.errors['required']) return `${campo} es requerido`;
      if (control.errors['minlength']) return `${campo} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `${campo} debe ser mayor a ${control.errors['min'].min}`;
    }
    return '';
  }

  obtenerErrorModuloCampo(index: number, campo: string): string {
    const control = this.modulos.at(index).get(campo);
    if (control?.errors) {
      if (control.errors['required']) return `${campo} es requerido`;
      if (control.errors['minlength']) return `${campo} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `${campo} debe ser mayor a ${control.errors['min'].min}`;
    }
    return '';
  }

  obtenerNombreInstructor(instructorId: number): string {
    const instructor = this.instructores.find(i => i.id === instructorId);
    return instructor ? instructor.nombre : 'No asignado';
  }

  // Gestión de módulos por separado
  mostrarModulosCurso(curso: Curso) {
    this.cursoSeleccionado = curso;
    this.mostrarGestionModulos = true;
    this.cargarModulosCurso(curso.id!);
  }

  cargarModulosCurso(cursoId: number) {
    this.cargandoModulos = true;
    this.moduloService.obtenerPorCurso(cursoId).subscribe({
      next: (modulos) => {
        this.modulosCurso = modulos;
        this.cargandoModulos = false;
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
        this.cargandoModulos = false;
      }
    });
  }

  eliminarModuloPorId(moduloId: number) {
    if (confirm('¿Está seguro de que desea eliminar este módulo?')) {
      this.moduloService.eliminar(moduloId).subscribe({
        next: () => {
          alert('Módulo eliminado exitosamente');
          this.cargarModulosCurso(this.cursoSeleccionado!.id!);
        },
        error: (error) => {
          console.error('Error al eliminar módulo:', error);
          alert('Error al eliminar el módulo');
        }
      });
    }
  }

  cerrarGestionModulos() {
    this.mostrarGestionModulos = false;
    this.cursoSeleccionado = null;
    this.modulosCurso = [];
  }
}