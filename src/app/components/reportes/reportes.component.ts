import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">Reportes</h5>
        </div>
        <div class="card-body">
          <p>Aquí se mostrarán los reportes del sistema.</p>
        </div>
      </div>
    </div>
  `
})
export class ReportesComponent {

}