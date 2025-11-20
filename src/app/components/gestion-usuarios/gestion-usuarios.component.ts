import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService, Usuario, UsuarioCreateDTO } from '../../services/usuario.service';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioForm: FormGroup;
  mostrarFormulario = false;
  editando = false;
  usuarioEditando: Usuario | null = null;
  cargando = false;

  // Listas estáticas
  departamentos = [
    'Recursos Humanos',
    'Tecnología',
    'Marketing', 
    'Ventas',
    'Administración'
  ];

  roles: ('ADMIN' | 'INSTRUCTOR' | 'USER')[] = ['ADMIN', 'INSTRUCTOR', 'USER'];

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['USER', Validators.required],
      departamento: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.obtenerTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.cargando = false;
      }
    });
  }

  mostrarFormularioCrear(): void {
    this.mostrarFormulario = true;
    this.editando = false;
    this.usuarioEditando = null;
    this.usuarioForm.reset({
      rol: 'USER',
      departamento: ''
    });
    // Hacer password requerido para nuevo usuario
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
  }

  editarUsuario(usuario: Usuario): void {
    this.mostrarFormulario = true;
    this.editando = true;
    this.usuarioEditando = usuario;
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      departamento: usuario.departamento
    });
    // Password opcional para edición
    this.usuarioForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.usuarioEditando = null;
    this.usuarioForm.reset();
  }

  guardarUsuario(): void {
    if (this.usuarioForm.valid) {
      this.cargando = true;
      const usuarioData = this.prepararDatosUsuario();

      if (this.editando && this.usuarioEditando) {
        // Para actualización, solo enviar los campos necesarios sin el ID
        this.usuarioService.actualizar(this.usuarioEditando.id!, usuarioData).subscribe({
          next: () => {
            this.cargarUsuarios();
            this.cancelarFormulario();
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error al actualizar usuario:', error);
            this.cargando = false;
          }
        });
      } else {
        this.usuarioService.crear(usuarioData).subscribe({
          next: () => {
            this.cargarUsuarios();
            this.cancelarFormulario();
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error al crear usuario:', error);
            this.cargando = false;
          }
        });
      }
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) {
      this.cargando = true;
      this.usuarioService.eliminar(usuario.id!).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.cargando = false;
        }
      });
    }
  }

  // Métodos para validaciones
  campoEsInvalido(campo: string): boolean {
    const control = this.usuarioForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  obtenerMensajeError(campo: string): string {
    const control = this.usuarioForm.get(campo);
    if (control?.errors) {
      if (control.errors['required']) return `${campo} es requerido`;
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['minlength']) return `${campo} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  // Método para preparar los datos según el backend espera
  private prepararDatosUsuario(): any {
    const formValue = this.usuarioForm.value;
    const usuarioData: any = {
      nombre: formValue.nombre,
      email: formValue.email,
      rol: formValue.rol, // El backend espera el enum como string
      departamento: formValue.departamento
    };

    // Solo incluir password si tiene valor
    if (formValue.password && formValue.password.trim() !== '') {
      usuarioData.password = formValue.password;
    }

    return usuarioData;
  }
}