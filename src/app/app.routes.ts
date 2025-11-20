import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios.component';
import { GestionCursosComponent } from './components/gestion-cursos/gestion-cursos.component';
import { MisInscripcionesComponent } from './components/mis-inscripciones/mis-inscripciones.component';
import { MisCertificadosComponent } from './components/mis-certificados/mis-certificados.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'gestion-usuarios', component: GestionUsuariosComponent, canActivate: [authGuard] },
  { path: 'gestion-cursos', component: GestionCursosComponent, canActivate: [authGuard] },
  { path: 'mis-inscripciones', component: MisInscripcionesComponent, canActivate: [authGuard] },
  { path: 'mis-certificados', component: MisCertificadosComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
