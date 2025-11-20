import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  currentUser: Usuario | null = null;
  showNavbar = true;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateNavbarVisibility();
    
    // Escuchar cambios de ruta para actualizar la visibilidad del navbar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateNavbarVisibility();
      });
  }

  private updateNavbarVisibility(): void {
    this.currentUser = this.authService.getCurrentUser();
    const currentRoute = this.router.url;
    
    // Ocultar navbar en la página de login
    this.showNavbar = this.currentUser !== null && currentRoute !== '/login';
  }

  logout(): void {
    this.authService.logout();
  }
}