import { Component, type OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {  isLoggedIn = false;
  username: string | null = null;
  fotoPerfil: string | null = null;
  isDarkMode = false;
  isMenuOpen = false;
  isMobileMenuOpen = false;
  isAdmin: boolean = false;
  currentRoute: string = '';
  defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNlNzRjM2MiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPHBhdGggZD0iTTggMjVjMC00LjQgMy42LTggOC04czggMy42IDggOCIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+Cg==';
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}  ngOnInit(): void { 
    
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isLoggedIn = isAuthenticated;
      if (isAuthenticated) {
        // Obtener datos completos del usuario desde la base de datos
        this.loadUserProfile();
      } else {
        this.username = null;
        this.fotoPerfil = null;
        this.isAdmin = false;
      }
    });

    // El AuthService ya maneja la verificación inicial de tokens en su constructor
    // No necesitamos verificar manualmente aquí - solo cargar perfil si ya está autenticado
    if (this.authService.getCurrentUser()) {
      this.loadUserProfile();
    }

    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
    this.currentRoute = this.router.url;

  }

  private loadUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (response) => {
        if (response?.exito && response?.datos) {
          const userData = response.datos;
          this.username = userData.Nombre_de_usuario;
          this.fotoPerfil = userData.Foto_de_perfil || this.defaultAvatar;
          this.isAdmin = userData.Rol === 'admin';
          
          // También actualizar el usuario actual en el servicio con todos los datos
          this.authService.updateCurrentUser({
            usuario_id: userData.usuario_id,
            Nombre_de_usuario: userData.Nombre_de_usuario,
            Rol: userData.Rol,
            Foto_de_perfil: userData.Foto_de_perfil
          });
        }
      },
      error: (err) => {
        // En caso de error, usar los datos básicos del usuario actual
        const user = this.authService.getCurrentUser();
        if (user) {
          this.username = user.Nombre_de_usuario;
          this.fotoPerfil = user.Foto_de_perfil || this.defaultAvatar;
        }
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
      },
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    // Guardar preferencia en localStorage
    localStorage.setItem('modo_oscuro_claro', this.isDarkMode ? 'oscuro' : 'claro');
  }  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
  onImageError(event: any): void {
    // Si falla la carga de la imagen, usar el avatar por defecto
    event.target.src = this.defaultAvatar;
    // También actualizar la propiedad para evitar futuros intentos de carga
    this.fotoPerfil = this.defaultAvatar;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest('.user-menu');
    const mobileMenu = target.closest('.mobile-nav');
    const hamburgerBtn = target.closest('.hamburger-menu');
    
    // Si el clic no fue dentro del menú de usuario, cerrar el menú
    if (!userMenu && this.isMenuOpen) {
      this.isMenuOpen = false;
    }

    // Si el clic no fue dentro del menú móvil o botón hamburguesa, cerrar el menú móvil
    if (!mobileMenu && !hamburgerBtn && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
}
