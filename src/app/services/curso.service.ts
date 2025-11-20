import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Modulo {
  id?: number;
  titulo: string;
  descripcion: string;
  tipo: 'VIDEO' | 'TEXTO' | 'PDF' | 'QUIZ';
  contenido: string;
  orden: number;
}

export interface Curso {
  id?: number;
  titulo: string;
  descripcion: string;
  duracionEstimada: number;
  nivel: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
  instructorId: number;
  instructor?: {
    id: number;
    nombre: string;
    email: string;
  };
  modulos?: Modulo[];
  activo?: boolean;
}

export interface CursoCreateDTO {
  titulo: string;
  descripcion: string;
  duracionEstimada: number;
  nivel: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
  instructorId: number;
  modulos: ModuloCreateDTO[];
}

export interface ModuloCreateDTO {
  titulo: string;
  descripcion: string;
  tipo: 'VIDEO' | 'TEXTO' | 'PDF' | 'QUIZ';
  contenido: string;
  orden: number;
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  crear(curso: CursoCreateDTO): Observable<Curso> {
    return this.http.post<Curso>(this.apiUrl, curso);
  }

  actualizar(id: number, curso: CursoCreateDTO): Observable<Curso> {
    return this.http.put<Curso>(`${this.apiUrl}/${id}`, curso);
  }

  eliminarPermanente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/permanente`);
  }
}