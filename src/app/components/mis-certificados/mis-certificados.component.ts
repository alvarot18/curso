import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-certificados',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">Mis Certificados</h5>
        </div>
        <div class="card-body">
          <p>Aquí se mostrarán tus certificados obtenidos.</p>
        </div>
      </div>
    </div>
  `
})
export class MisCertificadosComponent {

}