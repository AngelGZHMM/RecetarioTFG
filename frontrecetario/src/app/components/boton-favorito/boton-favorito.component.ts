import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FavoritosService } from '../../services/favoritos.service';

@Component({
  selector: 'app-boton-favorito',
  imports: [CommonModule],
  templateUrl: './boton-favorito.component.html',
  styleUrl: './boton-favorito.component.scss'
})
export class BotonFavoritoComponent implements OnInit, OnDestroy {
  @Input() recetaId!: number;
  @Input() mostrarTexto: boolean = false;
  @Input() tamaño: 'small' | 'medium' | 'large' = 'medium';
  @Input() variante: 'outlined' | 'filled' = 'outlined';

  esFavorito: boolean = false;
  cargando: boolean = false;
  totalFavoritos: number = 0;
  
  private favoritosSubscription?: Subscription;

  constructor(private favoritosService: FavoritosService) {}

  ngOnInit(): void {
    this.verificarEstadoFavorito();
    this.cargarEstadisticas();
    
    // Suscribirse a cambios en favoritos
    this.favoritosSubscription = this.favoritosService.favoritos$.subscribe(() => {
      this.verificarEstadoFavorito();
    });
  }

  ngOnDestroy(): void {
    if (this.favoritosSubscription) {
      this.favoritosSubscription.unsubscribe();
    }
  }

  verificarEstadoFavorito(): void {
    this.esFavorito = this.favoritosService.esFavorito(this.recetaId);
  }

  cargarEstadisticas(): void {
    this.favoritosService.obtenerEstadisticasFavoritos(this.recetaId).subscribe({
      next: (response) => {
        if (response.success) {
          this.totalFavoritos = response.data.totalFavoritos;
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de favoritos:', error);
      }
    });
  }

  alternarFavorito(): void {
    if (this.cargando) return;
    
    this.cargando = true;
    
    if (this.esFavorito) {
      this.favoritosService.quitarFavorito(this.recetaId).subscribe({
        next: (response) => {
          if (response.success) {
            this.esFavorito = false;
            this.totalFavoritos = Math.max(0, this.totalFavoritos - 1);
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al quitar favorito:', error);
          this.cargando = false;
        }
      });
    } else {
     
       this.favoritosService.agregarFavorito(this.recetaId).subscribe({
        next: (response) => {
          if (response.success) {
            this.esFavorito = true;
            this.totalFavoritos++;
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al agregar favorito:', error);
          
          // Si el error es 409 (Conflict), significa que ya estaba en favoritos
          // En este caso, actualizamos el estado para reflejar que es favorito
          if (error.status === 409) {
            this.esFavorito = true;
            console.info('La receta ya estaba en favoritos, sincronizando estado');
          }
          
          this.cargando = false;
        }
      });
    }
  }
  get iconoClase(): string {
    const baseClase = 'boton-favorito';
    const tamaño = `boton-favorito--${this.tamaño}`;
    const variante = `boton-favorito--${this.variante}`;
    const estado = this.esFavorito ? 'boton-favorito--favorito' : '';
    const cargandoClase = this.cargando ? 'boton-favorito--cargando' : '';

    return `${baseClase} ${tamaño} ${variante} ${estado} ${cargandoClase}`.trim();
  }
  get iconoCorazon(): string {
    if (this.esFavorito) {
      return 'fas fa-heart'; // Corazón sólido rojo cuando es favorito
    } else {
      return 'far fa-heart'; // Corazón vacío cuando no es favorito
    }
  }

  get textoBoton(): string {
    if (this.cargando) {
      return 'Cargando...';
    }
    return this.esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos';
  }
}
