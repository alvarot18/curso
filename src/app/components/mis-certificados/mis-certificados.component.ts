import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CertificadoService, Certificado } from '../../services/certificado.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-certificados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-certificados.component.html',
  styleUrl: './mis-certificados.component.css'
})
export class MisCertificadosComponent implements OnInit {
  misCertificados: Certificado[] = [];
  cargandoCertificados = false;
  usuarioId: number = 0;

  constructor(
    private certificadoService: CertificadoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const usuario = this.authService.getCurrentUser();
    if (usuario && usuario.id) {
      this.usuarioId = usuario.id;
      this.cargarMisCertificados();
    }
  }

  cargarMisCertificados() {
    this.cargandoCertificados = true;
    this.certificadoService.obtenerPorUsuario(this.usuarioId).subscribe({
      next: (certificados) => {
        this.misCertificados = certificados;
        this.cargandoCertificados = false;
      },
      error: (error) => {
        console.error('Error al cargar certificados:', error);
        this.cargandoCertificados = false;
        alert('Error al cargar los certificados');
      }
    });
  }

  verCertificado(certificado: Certificado) {
    // Implementar vista del certificado (modal o nueva ventana)
    alert(`Ver certificado: ${certificado.hash}\nCurso: ${certificado.cursoTitulo}`);
  }

  descargarCertificado(certificado: Certificado) {
    // Implementar descarga del certificado
    alert(`Descargar certificado: ${certificado.hash}\nCurso: ${certificado.cursoTitulo}`);
  }
}