import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Inscripcion {
  id?: number;
  usuarioId: number;
  usuarioNombre: string;
  cursoId: number;
  cursoTitulo: string;
  progreso: number;
  fechaInscripcion: string;
  estado: 'INSCRITO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO';
}

export interface InscripcionCreateDTO {
  usuarioId: number;
  cursoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  private apiUrl = `${environment.apiUrl}/inscripciones`;

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(this.apiUrl);
  }

  obtenerPorUsuario(usuarioId: number): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  inscribirUsuario(inscripcionData: InscripcionCreateDTO): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(this.apiUrl, inscripcionData);
  }

  eliminarInscripcion(usuarioId: number, cursoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}?usuarioId=${usuarioId}&cursoId=${cursoId}`);
  }

  completarModulo(usuarioId: number, moduloId: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/completar-modulo?usuarioId=${usuarioId}&moduloId=${moduloId}`, {}, 
      { responseType: 'text' });
  }
}