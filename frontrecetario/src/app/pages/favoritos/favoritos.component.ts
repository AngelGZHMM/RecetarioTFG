import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FavoritosService, Favorito, FavoritosResponse } from '../../services/favoritos.service';
import { Router } from '@angular/router';
import { BotonFavoritoComponent } from '../../components/boton-favorito/boton-favorito.component';
import { FormsModule } from '@angular/forms';
import { IngredientesService } from '../../services/ingredientes.service';
import { CATEGORIAS_RECETAS, DIFICULTADES_RECETAS, ORIGENES_RECETAS } from '../../shared/constants/constantes';

@Component({
  selector: 'app-favoritos',
  imports: [CommonModule, RouterModule, FormsModule, BotonFavoritoComponent],
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.scss'
})
export class FavoritosComponent implements OnInit, OnDestroy {
  favoritos: Favorito[] = [];
  cargando: boolean = false;
  error: string | null = null;

  // Paginación
  paginaActual: number = 1;
  totalPaginas: number = 1;
  totalElementos: number = 0;
  elementosPorPagina: number = 3;
  // Filtros
  filterCriteria: string = 'nombre';
  searchQuery: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
    // Opciones para filtros
  categorias: string[] = CATEGORIAS_RECETAS;
  dificultades: string[] = DIFICULTADES_RECETAS;
  origenes: string[] = ORIGENES_RECETAS;
    // Ingredientes
  ingredientesDisponibles: any[] = [];
  ingredientesSeleccionados: any[] = [];

  // Bandera para controlar el fallback de imagen por receta
  imagenFallbacks: { [key: number]: boolean } = {};

  // Imagen por defecto igual que en cards-recetas y recetas-personales
  defaultRecetaImg: string = 'https://imgs.search.brave.com/RyayBzOkSlvHKy60tX0q2pdoMuXuNQxBrI9lj86jJuc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTU2/MzkzNTM4L2VzL3Zl/Y3Rvci9ib25qb3Vy/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz0ybmRaYVZURzZZ/WTYxVHJrcWdtZTY1/SGFOdHFseDRUbnA5/SDlwUXdZYTM0PQ';

  private favoritosSubscription?: Subscription;

  constructor(
    private favoritosService: FavoritosService,
    public router: Router,
    private ingredientesService: IngredientesService
  ) {}
  ngOnInit(): void {
    // Inicializar favoritos en el servicio
    this.favoritosService.inicializarFavoritos();
    
    this.cargarFavoritos();
    this.cargarIngredientes();
    this.favoritosSubscription = this.favoritosService.favoritos$.subscribe(() => {
      this.cargarFavoritos();
    });
  }

  ngOnDestroy(): void {
    if (this.favoritosSubscription) {
      this.favoritosSubscription.unsubscribe();
    }
  }

  cargarIngredientes(): void {
    this.ingredientesService.obtenerTodosIngredientes().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.datos)) {
          this.ingredientesDisponibles = data.datos;
        } else if (Array.isArray(data)) {
          this.ingredientesDisponibles = data;
        } else {
          this.ingredientesDisponibles = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar ingredientes:', err);
        this.ingredientesDisponibles = [];
      }
    });
  }

  cargarFavoritos(): void {
    this.cargando = true;
    this.error = null;
    
    // Preparar parámetros según el tipo de filtro seleccionado
    let criterio = this.filterCriteria || '';
    let busqueda = this.searchQuery ? this.searchQuery.trim() : '';
    let fechaDesdeParam = '';
    let fechaHastaParam = '';
    let ingredientesParam = '';
    
    // Manejar filtros especiales
    if (this.filterCriteria === 'fecha_creacion' || this.filterCriteria === 'fecha_publicacion') {
      fechaDesdeParam = this.fechaDesde;
      fechaHastaParam = this.fechaHasta;
      busqueda = ''; // No usar búsqueda de texto para fechas
    } else if (this.filterCriteria === 'ingrediente') {
      ingredientesParam = this.ingredientesSeleccionados.map(i => i.ingrediente_id).join(',');
      busqueda = ''; // No usar búsqueda de texto para ingredientes
    }
    
    
    this.favoritosService.obtenerFavoritos(
      this.paginaActual,
      this.elementosPorPagina,
      criterio,
      busqueda,
      fechaDesdeParam,
      fechaHastaParam,
      ingredientesParam
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          const data: FavoritosResponse = response.data;
          this.favoritos = data.favoritos;
          this.paginaActual = data.paginacion.currentPage;
          this.totalPaginas = data.paginacion.totalPages;
          this.totalElementos = data.paginacion.totalItems;
          this.elementosPorPagina = data.paginacion.itemsPerPage;
          this.error = null;
        } else {
          this.error = 'Error al cargar favoritos';
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar favoritos:', error);
        this.error = 'Error al cargar favoritos. Por favor, inténtalo de nuevo.';
        this.cargando = false;
      }
    });
  }

  // Manejo de filtros
  onFilterChange(): void {
    this.paginaActual = 1;
    // Limpiar valores cuando cambie el tipo de filtro
    this.searchQuery = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.ingredientesSeleccionados = [];
    this.cargarFavoritos();
  }

  onSearch(): void {
    this.paginaActual = 1;
    this.cargarFavoritos();
  }

  limpiarFiltros(): void {
    this.filterCriteria = '';
    this.searchQuery = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.ingredientesSeleccionados = [];
    this.paginaActual = 1;
    this.cargarFavoritos();
  }

  // Manejo de ingredientes
  onIngredientSelect(event: any): void {
    const ingredienteId = parseInt(event.target.value);
    if (ingredienteId) {
      const ingrediente = this.ingredientesDisponibles.find(i => i.ingrediente_id === ingredienteId);
      if (ingrediente && !this.isIngredienteSeleccionado(ingrediente)) {
        this.ingredientesSeleccionados.push(ingrediente);
        this.onSearch();
      }
      // Resetear el select
      event.target.value = '';
    }
  }

  onIngredientToggle(ingrediente: any): void {
    const idx = this.ingredientesSeleccionados.findIndex(i => i.ingrediente_id === ingrediente.ingrediente_id);
    if (idx > -1) {
      this.ingredientesSeleccionados.splice(idx, 1);
    } else {
      this.ingredientesSeleccionados.push(ingrediente);
    }
    this.onSearch();
  }

  quitarIngredienteSeleccionado(ingrediente: any): void {
    this.ingredientesSeleccionados = this.ingredientesSeleccionados.filter(i => i.ingrediente_id !== ingrediente.ingrediente_id);
    this.onSearch();
  }

  isIngredienteSeleccionado(ingrediente: any): boolean {
    return this.ingredientesSeleccionados.some(i => i.ingrediente_id === ingrediente.ingrediente_id);
  }

  // Getter para obtener ingredientes que no han sido seleccionados
  get ingredientesNoSeleccionados(): any[] {
    return this.ingredientesDisponibles.filter(ingrediente => 
      !this.isIngredienteSeleccionado(ingrediente)
    );
  }

  // Paginación
  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas && nuevaPagina !== this.paginaActual) {
      this.paginaActual = nuevaPagina;
      this.cargarFavoritos();
    }
  }

  cambiarElementosPorPagina(): void {
    this.paginaActual = 1;
    this.cargarFavoritos();
  }

  // Métodos para paginación inteligente
  getTotalPages(): number {
    return this.totalPaginas;
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const current = this.paginaActual;
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Siempre agregar las primeras 2 páginas
      pageNumbers.push(1, 2);

      // Calcular las páginas del centro (3 páginas centradas en la página actual)
      let centerStart = Math.max(current - 1, 3);
      let centerEnd = Math.min(current + 1, totalPages - 2);
      
      // Asegurar que tengamos exactamente 3 páginas centrales cuando sea posible
      const centerSize = centerEnd - centerStart + 1;
      if (centerSize < 3) {
        if (centerStart === 3) {
          // Expandir hacia la derecha
          centerEnd = Math.min(centerStart + 2, totalPages - 2);
        } else if (centerEnd === totalPages - 2) {
          // Expandir hacia la izquierda
          centerStart = Math.max(centerEnd - 2, 3);
        }
      }

      // Solo agregar puntos suspensivos si hay un gap después de las primeras páginas
      const needsLeftEllipsis = centerStart > 3;
      if (needsLeftEllipsis) {
        pageNumbers.push('...');
      }

      // Agregar las páginas del centro (solo si no son duplicados)
      for (let i = centerStart; i <= centerEnd; i++) {
        if (i > 2 && i < totalPages - 1 && !pageNumbers.includes(i)) {
          pageNumbers.push(i);
        }
      }

      // Solo agregar puntos suspensivos si hay un gap antes de las últimas páginas
      const needsRightEllipsis = centerEnd < totalPages - 2;
      if (needsRightEllipsis) {
        pageNumbers.push('...');
      }

      // Siempre agregar las últimas 2 páginas (solo si no son duplicados)
      if (totalPages - 1 > 2 && !pageNumbers.includes(totalPages - 1)) {
        pageNumbers.push(totalPages - 1);
      }
      if (totalPages > 2 && !pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.getTotalPages()) {
      this.cambiarPagina(page);
    }
  }

  goToPreviousPage(): void {
    if (this.paginaActual > 1) {
      this.goToPage(this.paginaActual - 1);
    }
  }

  goToNextPage(): void {
    if (this.paginaActual < this.getTotalPages()) {
      this.goToPage(this.paginaActual + 1);
    }
  }

  isCurrentPage(page: number | string): boolean {
    return typeof page === 'number' && page === this.paginaActual;
  }

  get paginasParaMostrar(): number[] {
    // Método deprecated, mantener por compatibilidad pero usar getPageNumbers() en el template
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Acciones de recetas
  verDetalleReceta(recetaId: number): void {
    this.router.navigate(['/recetas/detalle', recetaId]);
  }

  quitarDeFavoritos(recetaId: number): void {
    this.favoritosService.quitarFavorito(recetaId).subscribe({
      next: (response) => {
        if (response.success) {
          // La lista se actualizará automáticamente a través de la suscripción
        }
      },
      error: (error) => {
        console.error('Error al quitar de favoritos:', error);
      }
    });
  }

  // Utilidades
  formatearTiempo(minutos: number): string {
    if (minutos == null || isNaN(minutos)) return '';
    if (minutos < 60) return minutos + ' min';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas + 'h' + (mins > 0 ? ' ' + mins + 'min' : '');
  }
  // Devuelve la imagen correcta según el estado del fallback
  getImagenReceta(receta: any): string {
    // Si la imagen ya falló antes, muestra la imagen por defecto
    if (this.imagenFallbacks[receta.receta_id]) {
      return this.defaultRecetaImg;
    }
    // Si no hay imagen o la imagen es claramente inválida, usa la imagen por defecto
    if (!receta.imagen || typeof receta.imagen !== 'string' || receta.imagen.trim() === '' || receta.imagen === 'null' || receta.imagen === 'undefined') {
      return this.defaultRecetaImg;
    }
    return receta.imagen;
  }

  // Maneja el error de carga de imagen y activa el fallback solo una vez
  onImgError(receta: any, event: Event) {
    if (this.imagenFallbacks[receta.receta_id]) return;
    this.imagenFallbacks[receta.receta_id] = true;
    (event.target as HTMLImageElement).src = this.defaultRecetaImg;
  }

  // Exponer Math para usar en template
  Math = Math;
}
