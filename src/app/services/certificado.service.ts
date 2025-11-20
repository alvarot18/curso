import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Certificado {
  id?: number;
  usuarioId: number;
  usuarioNombre: string;
  cursoId: number;
  cursoTitulo: string;
  fechaEmision: string;
  hash: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {
  private apiUrl = `${environment.apiUrl}/certificados`;

  constructor(private http: HttpClient) { }

  obtenerPorUsuario(usuarioId: number): Observable<Certificado[]> {
    return this.http.get<Certificado[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  obtenerTodos(): Observable<Certificado[]> {
    return this.http.get<Certificado[]>(this.apiUrl);
  }
}