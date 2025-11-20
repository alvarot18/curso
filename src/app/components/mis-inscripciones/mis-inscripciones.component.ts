import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-inscripciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">Mis Inscripciones</h5>
        </div>
        <div class="card-body">
          <p>Aquí se mostrarán tus inscripciones a cursos.</p>
        </div>
      </div>
    </div>
  `
})
export class MisInscripcionesComponent {

}