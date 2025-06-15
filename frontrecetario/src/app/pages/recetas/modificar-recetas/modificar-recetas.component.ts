import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecetasService } from '../../../services/recetas.service';
import { IngredientesService } from '../../../services/ingredientes.service';
import { RecetaIngredientesService } from '../../../services/receta-ingredientes.service';
import { AuthService } from '../../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CATEGORIAS_RECETAS, DIFICULTADES_RECETAS, ORIGENES_RECETAS } from '../../../shared/constants/constantes';

@Component({
  selector: 'app-modificar-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modificar-recetas.component.html',
  styleUrl: './modificar-recetas.component.scss'
})
export class ModificarRecetasComponent implements OnInit {
  recetaId: number = 0;
  receta: any = {};
  ingredientesDisponibles: any[] = [];
  ingredientesSeleccionados: any[] = [];
    // Variables para controlar el acceso y estado
  cargando: boolean = true;
  error: string | null = null;
  esPropietario: boolean = false;
  usuarioActualId: number | null = null;
  
  // Variable para controlar si el usuario puede editar (propietario, admin o creador)
  puedeEditar: boolean = false;
  rolUsuario: string | null = null;
  
  // Variables para los campos del formulario
  nombre: string = '';
  imagen: string = '';
  videoLink: string = '';
  descripcion: string = '';
  origen: string = '';
  fechaCreacion: string = '';
  esPublica: boolean = true;
  esCreacionPropia: boolean = true;
  autorOriginal: string = '';
  tiempo_preparacion: number = 0;
  tiempo_coccion: number = 0;
  tiempo_total: number = 0;
  categoria: string = '';
  porciones: number = 1;
  calorias_totales: number = 0;
  dificultad: string = '';
  
  // Propiedades para el cálculo automático del tiempo total
  tiempoPreparacion: number | null = null;
  tiempoCoccion: number | null = null;
  tiempoTotalCalculado: number = 0;
  
  // Manejo de errores del formulario
  formErrors: {[key: string]: string} = {};
  
  // Constantes para validar longitudes
  readonly NOMBRE_MAX_LENGTH = 255;
  readonly IMAGEN_MAX_LENGTH = 2048;
  readonly DESCRIPCION_MAX_LENGTH = 255;
  readonly ORIGEN_MAX_LENGTH = 255;
  readonly VIDEO_MAX_LENGTH = 255;
  readonly AUTOR_MAX_LENGTH = 255;
  readonly DIFICULTAD_MAX_LENGTH = 255;
  readonly CATEGORIA_MAX_LENGTH = 255;
  
  // Arrays de opciones para dropdowns
  categorias: string[] = CATEGORIAS_RECETAS;
  dificultades: string[] = DIFICULTADES_RECETAS;
  origenes: string[] = ORIGENES_RECETAS;
  
  // Unidades de medida organizadas por grupos
  unidadesMedidaGrupos = [
    {
      nombre: 'Peso',
      unidades: [
        { valor: 'Gramo (g)', texto: 'Gramo (g)' },
        { valor: 'Kilogramo (kg)', texto: 'Kilogramo (kg)' },
        { valor: 'Miligramo (mg)', texto: 'Miligramo (mg)' },
        { valor: 'Libra (lb)', texto: 'Libra (lb)' },
        { valor: 'Onza (oz)', texto: 'Onza (oz)' }
      ]
    },
    {
      nombre: 'Volumen',
      unidades: [
        { valor: 'Mililitro (ml)', texto: 'Mililitro (ml)' },
        { valor: 'Centilitro (cl)', texto: 'Centilitro (cl)' },
        { valor: 'Litro (l)', texto: 'Litro (l)' },
        { valor: 'Centímetro cúbico (cc)', texto: 'Centímetro cúbico (cc)' },
        { valor: 'Taza', texto: 'Taza' },
        { valor: 'Cucharada', texto: 'Cucharada' },
        { valor: 'Cucharadita', texto: 'Cucharadita' }
      ]
    },
    {
      nombre: 'Unidades',
      unidades: [
        { valor: 'Unidad', texto: 'Unidad' },
        { valor: 'Pieza', texto: 'Pieza' },
        { valor: 'Rodaja', texto: 'Rodaja' },
        { valor: 'Rebanada', texto: 'Rebanada' },
        { valor: 'Trozo', texto: 'Trozo' }
      ]
    },
    {
      nombre: 'Otros',
      unidades: [
        { valor: 'Pizca', texto: 'Pizca' },
        { valor: 'Al gusto', texto: 'Al gusto' },
        { valor: 'Manojo', texto: 'Manojo' },
        { valor: 'Puñado', texto: 'Puñado' }
      ]
    }
  ];

  // Previsualización de imagen y video
  imagePreview: string | null = null;
  imageError: boolean = false;
  videoPreview: SafeResourceUrl | null = null;
  videoError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recetasService: RecetasService,
    private ingredientesService: IngredientesService,
    private recetaIngredientesService: RecetaIngredientesService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}  ngOnInit(): void {
    // Obtener el ID del usuario actual y su rol
    const usuarioActual = this.authService.getCurrentUser();
    this.usuarioActualId = usuarioActual?.usuario_id || null;
    this.rolUsuario = usuarioActual?.Rol || null;
    
    if (!this.usuarioActualId) {
      this.error = 'Necesitas iniciar sesión para modificar recetas';
      this.cargando = false;
      return;
    }
    
    // Obtener el ID de la receta de los parámetros de la ruta
    this.route.params.subscribe(params => {
      this.recetaId = +params['id']; // Convertir el parámetro de la ruta a número
      
      if (this.recetaId) {
        // Cargar primero los ingredientes disponibles y luego la receta
        this.cargarIngredientesDisponibles();
      } else {
        this.error = 'ID de receta no válido';
        this.cargando = false;
      }
    });
  }
  cargarIngredientesDisponibles(): void {
    this.ingredientesService.obtenerTodosIngredientes().subscribe({
      next: (response: any) => {
        this.ingredientesDisponibles = response.datos;
        // Una vez cargados los ingredientes disponibles, cargar la receta
        this.cargarReceta();
      },
      error: (err: any) => {
        console.error('Error al cargar los ingredientes:', err);
        this.error = 'Error al cargar los ingredientes disponibles';
        this.cargando = false;
      }
    });
  }

  cargarReceta(): void {
    this.cargando = true;
    this.error = null;
    
    this.recetasService.obtenerRecetaPorId(this.recetaId).subscribe({
      next: (response) => {
        if (response && response.datos) {
          this.receta = response.datos;
            // Verificar si el usuario actual es el propietario de la receta
          this.esPropietario = this.usuarioActualId !== null && 
                               this.receta.usuario_id === this.usuarioActualId;
          
          // Verificar si el usuario puede editar (propietario, admin o creador)
          const esAdmin = this.rolUsuario === "admin";
          const esCreador = this.rolUsuario === "creador";
          this.puedeEditar = this.esPropietario || esAdmin || esCreador;
          
          if (!this.puedeEditar) {
            this.error = 'No tienes permiso para modificar esta receta';
            this.cargando = false;
            return;
          }
          
          // Cargar los datos de la receta en los campos del formulario
          this.nombre = this.receta.nombre || '';
          this.imagen = this.receta.imagen || '';
          this.videoLink = this.receta.video_instrucciones || '';
          this.descripcion = this.receta.descripcion || '';
          this.origen = this.receta.origen || '';
          this.fechaCreacion = this.receta.fecha_creacion ? this.formatDate(this.receta.fecha_creacion) : '';
          
          // Convertir valores 0/1 a valores booleanos para los checkboxes
          this.esPublica = this.receta.publica === 1 || this.receta.publica === true;
          
          // Verificar si es creación propia basado en si hay autor
          this.autorOriginal = this.receta.autor || '';
          this.esCreacionPropia = !this.autorOriginal; // Si no hay autor, es creación propia
          
            this.tiempo_preparacion = this.receta.tiempo_preparacion || 0;
          this.tiempo_coccion = this.receta.tiempo_coccion || 0;
          this.tiempo_total = this.receta.tiempo_total || 0;
          
          // Asignar también a las nuevas propiedades para el cálculo automático
          this.tiempoPreparacion = this.receta.tiempo_preparacion || 0;
          this.tiempoCoccion = this.receta.tiempo_coccion || 0;
          this.calcularTiempoTotal();
          this.categoria = this.receta.categoria || '';
          this.porciones = this.receta.porciones || 1;
          this.calorias_totales = this.receta.calorias_totales || 0;
          this.dificultad = this.receta.dificultad || '';
          
          // Cargar los ingredientes de la receta
          this.cargarIngredientesReceta();
          
          // Llamar SIEMPRE a updateImagePreview al cargar receta
          this.updateImagePreview(this.imagen);
          
          this.cargando = false;
        } else {
          this.error = 'No se encontró la receta';
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar la receta:', err);
        this.error = 'Error al cargar la receta. Por favor, inténtalo de nuevo.';
        this.cargando = false;
      }
    });
  }  cargarIngredientesReceta(): void {
    
    this.recetaIngredientesService.getIngredientesByReceta(this.recetaId).subscribe({
      next: (response: any) => {
        
        // Procesar los ingredientes según el formato de respuesta del backend
        let ingredientesData = [];
        if (response && typeof response === 'object') {
          // El backend devuelve en format { success: true, data: [...], message: "..." }
          if (response.data && Array.isArray(response.data)) {
            ingredientesData = response.data;
          } else if (response.datos && Array.isArray(response.datos)) {
            ingredientesData = response.datos;
          } else if (Array.isArray(response)) {
            ingredientesData = response;
          }
        }
        
        
        // Transformar los datos al formato esperado
        // Los datos vienen con estructura: { ingrediente_id, Cantidad, Unidad, ingrediente: { ingrediente_id, Nombre, ... } }
        this.ingredientesSeleccionados = ingredientesData.map((item: any) => {
          
          // Obtener el nombre del ingrediente desde la relación incluida o buscar en disponibles
          let nombreIngrediente = '';
          let ingredienteId = item.ingrediente_id;
          
          if (item.ingrediente && item.ingrediente.Nombre) {
            // Si viene con la relación incluida del backend
            nombreIngrediente = item.ingrediente.Nombre;
          } else {
            // Si no, buscar en los ingredientes disponibles
            const ingrediente = this.ingredientesDisponibles.find(
              ing => ing.ingrediente_id === ingredienteId
            );
            nombreIngrediente = ingrediente ? ingrediente.Nombre : `Ingrediente ID: ${ingredienteId}`;
          }
          
          
          return {
            ingrediente_id: ingredienteId,
            Nombre: nombreIngrediente,
            cantidad: item.Cantidad || item.cantidad || '',
            unidad: item.Unidad || item.unidad || ''
          };
        });
        
      },
      error: (err) => {
        console.error('Error al cargar los ingredientes de la receta:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    // Convertir la fecha al formato YYYY-MM-DD para el input tipo date
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
  agregarIngrediente(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const ingredienteId = parseInt(target.value, 10);
    
    if (ingredienteId) {
      const ingrediente = this.ingredientesDisponibles.find(i => i.ingrediente_id === ingredienteId);
      
      if (ingrediente && !this.ingredientesSeleccionados.some(i => i.ingrediente_id === ingrediente.ingrediente_id)) {
        // Establecer "Unidad" como unidad por defecto en lugar de cadena vacía
        this.ingredientesSeleccionados.push({ 
          ingrediente_id: ingrediente.ingrediente_id,
          Nombre: ingrediente.Nombre,
          cantidad: '', 
          unidad: 'Unidad' 
        });
        
        // Reset del select a la opción por defecto después de agregar
        target.value = '';
      }
    }
  }

  eliminarIngrediente(index: number): void {
    this.ingredientesSeleccionados.splice(index, 1);
  }

  // Método para obtener ingredientes disponibles que no están ya seleccionados
  getIngredientesDisponiblesParaAgregar(): any[] {
    return this.ingredientesDisponibles.filter(ingredienteDisponible => 
      !this.ingredientesSeleccionados.some(ingredienteSeleccionado => 
        ingredienteSeleccionado.ingrediente_id === ingredienteDisponible.ingrediente_id
      )
    );
  }

  validarFormulario(form: NgForm): boolean {
    this.formErrors = {};
    let isValid = true;

    // Validar longitudes máximas
    if (form.value.nombre && form.value.nombre.length > this.NOMBRE_MAX_LENGTH) {
      this.formErrors['nombre'] = `El nombre no puede exceder los ${this.NOMBRE_MAX_LENGTH} caracteres.`;
      isValid = false;
    }

    if (form.value.imagen && form.value.imagen.length > this.IMAGEN_MAX_LENGTH) {
      this.formErrors['imagen'] = `La URL de imagen no puede exceder los ${this.IMAGEN_MAX_LENGTH} caracteres.`;
      isValid = false;
    }

    if (form.value.descripcion && form.value.descripcion.length > this.DESCRIPCION_MAX_LENGTH) {
      this.formErrors['descripcion'] = `La descripción no puede exceder los ${this.DESCRIPCION_MAX_LENGTH} caracteres.`;
      isValid = false;
    }

    if (this.origen && this.origen.length > this.ORIGEN_MAX_LENGTH) {
      this.formErrors['origen'] = `El origen no puede exceder los ${this.ORIGEN_MAX_LENGTH} caracteres.`;
      isValid = false;
    }

    if (this.videoLink && this.videoLink.length > this.VIDEO_MAX_LENGTH) {
      this.formErrors['videoLink'] = `El enlace del vídeo no puede exceder los ${this.VIDEO_MAX_LENGTH} caracteres.`;
      isValid = false;
    }

    if (!this.esCreacionPropia && this.autorOriginal && this.autorOriginal.length > this.AUTOR_MAX_LENGTH) {
      this.formErrors['autorOriginal'] = `El nombre del autor no puede exceder los ${this.AUTOR_MAX_LENGTH} caracteres.`;
      isValid = false;
    }    // Validar que los campos numéricos sean positivos
    if (this.tiempoPreparacion !== null && this.tiempoPreparacion < 0) {
      this.formErrors['tiempo_preparacion'] = 'El tiempo de preparación debe ser un número positivo.';
      isValid = false;
    }
    
    if (this.tiempoCoccion !== null && this.tiempoCoccion < 0) {
      this.formErrors['tiempo_coccion'] = 'El tiempo de cocción debe ser un número positivo.';
      isValid = false;
    }    // Validar porciones (campo obligatorio)
    if (!form.value.porciones || form.value.porciones < 1) {
      this.formErrors['porciones'] = 'Las porciones son obligatorias y deben ser al menos 1.';
      isValid = false;
    }

    if (form.value.calorias_totales && form.value.calorias_totales < 0) {
      this.formErrors['calorias_totales'] = 'Las calorías totales deben ser un número positivo.';
      isValid = false;
    }

    // Validar que al menos un ingrediente esté seleccionado
    if (this.ingredientesSeleccionados.length === 0) {
      this.formErrors['ingredientes'] = 'Debes seleccionar al menos un ingrediente.';
      isValid = false;
    } else {
      // Validar que todos los ingredientes tengan cantidad y unidad
      const ingredienteInvalido = this.ingredientesSeleccionados.findIndex(
        i => !i.cantidad || !i.unidad
      );
      
      if (ingredienteInvalido >= 0) {
        this.formErrors['ingredientes'] = 'Todos los ingredientes deben tener cantidad y unidad.';
        isValid = false;
      }
    }

    return isValid;
  }
  onSubmit(form: NgForm): void {
    // Calcular tiempo total antes de la validación
    this.calcularTiempoTotal();
    
    if (form.valid && this.validarFormulario(form)) {
      const recetaData = {
        receta_id: this.recetaId,
        nombre: this.nombre,
        imagen: this.imagen,
        descripcion: this.descripcion,
        tiempo_preparacion: this.tiempoPreparacion || 0,
        tiempo_coccion: this.tiempoCoccion || 0,
        tiempo_total: this.tiempoTotalCalculado,
        categoria: this.categoria,
        porciones: this.porciones,
        calorias_totales: this.calorias_totales,
        dificultad: this.dificultad,
        // Campos adicionales mapeados con los nombres correctos de la BD
        video_instrucciones: this.videoLink,
        publica: this.esPublica,
        es_creacion_propia: this.esCreacionPropia,
        // Usar el campo correcto para el autor (autor en lugar de autor_original)
        autor: this.esCreacionPropia ? null : this.autorOriginal,
        origen: this.origen,
        fecha_creacion: this.fechaCreacion,
        // Ingredientes para procesamiento posterior en el backend
        ingredientes: this.ingredientesSeleccionados.map(i => ({
          ingrediente_id: i.ingrediente_id,
          cantidad: i.cantidad,
          unidad: i.unidad
        }))
      };
      
      
      this.recetasService.actualizarReceta(this.recetaId, recetaData).subscribe({
        next: (response: any) => {
          // Redireccionar a la página de detalles de la receta
          this.router.navigate(['/recetas/detalle', this.recetaId]);
        },
        error: (err: any) => {
          console.error('Error al actualizar la receta:', err);
          this.formErrors['general'] = 'Error al guardar los cambios. Por favor, inténtalo de nuevo.';
        }
      });
    } else {
      console.error('El formulario no es válido');
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(form.controls).forEach(campo => {
        const control = form.controls[campo];
        control.markAsTouched();
      });
    }
  }

  cancelar(): void {
    // Volver a la página de detalles de la receta
    this.router.navigate(['/recetas/detalle', this.recetaId]);
  }

  // --- PREVISUALIZACIÓN DE IMAGEN EXACTA (COPIADO DE PROFILE) ---
  updateImagePreview(url: string): void {
    if (!url || url.trim() === '') {
      this.imagePreview = null;
      this.imageError = false;
      return;
    }
    // Validar que la URL tenga formato de imagen (igual que en profile)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    if (!hasImageExtension && !url.includes('http')) {
      this.imagePreview = null;
      this.imageError = false;
      return;
    }
    const img = new Image();
    img.onload = () => {
      this.imagePreview = url;
      this.imageError = false;
    };
    img.onerror = () => {
      this.imagePreview = null;
      this.imageError = true;
    };
    img.src = url;
  }

  updateVideoPreview(event: any): void {
    const url = event.target.value;
    if (!url || url.trim() === '') {
      this.videoPreview = null;
      this.videoError = false;
      return;
    }
    const convertedUrl = this.convertToEmbedUrl(url);
    if (convertedUrl) {
      this.videoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(convertedUrl);
      this.videoError = false;
    } else {
      this.videoPreview = null;
      this.videoError = true;
    }
  }

  private convertToEmbedUrl(url: string): string | null {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    if (url.includes('youtube.com/embed/') || url.includes('youtu.be/embed/')) {
      return url;
    }
    return null;
  }

  /**
   * Calcula automáticamente el tiempo total sumando preparación + cocción
   * Tiempo de cocción default a 0 si está vacío
   */
  calcularTiempoTotal(): void {
    const preparacion = this.tiempoPreparacion || 0;
    const coccion = this.tiempoCoccion || 0;
    this.tiempoTotalCalculado = preparacion + coccion;
    // También actualizar el campo tiempo_total para mantener compatibilidad
    this.tiempo_total = this.tiempoTotalCalculado;
  }
}
