import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">Gestión de Usuarios</h5>
        </div>
        <div class="card-body">
          <p>Aquí se gestionarán los usuarios del sistema.</p>
        </div>
      </div>
    </div>
  `
})
export class GestionUsuariosComponent {

}