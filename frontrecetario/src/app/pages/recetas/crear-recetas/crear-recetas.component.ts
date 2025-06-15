import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecetasService } from '../../../services/recetas.service';
import { IngredientesService } from '../../../services/ingredientes.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CATEGORIAS_RECETAS, DIFICULTADES_RECETAS, ORIGENES_RECETAS } from '../../../shared/constants/constantes';

@Component({
  selector: 'app-crear-recetas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-recetas.component.html',
  styleUrls: ['./crear-recetas.component.scss']
})
export class CrearRecetasComponent implements OnInit {
  // Exponer Object para uso en template
  Object = Object;
  
  ingredientesDisponibles: any[] = [];
  ingredientesSeleccionados: any[] = [];
    // Propiedades para previsualizaciones
  imagePreview: string | null = null;
  imageError: boolean = false;
  videoPreview: SafeResourceUrl | null = null;
  videoError: boolean = false;
  
  // Definir limites según la estructura de la base de datos
  readonly NOMBRE_MAX_LENGTH = 255;
  readonly IMAGEN_MAX_LENGTH = 255;
  readonly DESCRIPCION_MAX_LENGTH = 255;
  readonly ORIGEN_MAX_LENGTH = 255;
  readonly VIDEO_MAX_LENGTH = 255;
  readonly AUTOR_MAX_LENGTH = 255;
  readonly DIFICULTAD_MAX_LENGTH = 255;
  readonly CATEGORIA_MAX_LENGTH = 255;  // Lista de categorías disponibles (sincronizada con cards-recetas)
  categorias: string[] = CATEGORIAS_RECETAS;
  
  // Lista de dificultades disponibles (sincronizada con cards-recetas)
  dificultades: string[] = DIFICULTADES_RECETAS;

  // Lista de orígenes disponibles (sincronizada con otros componentes)
  origenes: string[] = ORIGENES_RECETAS;
    // Nuevos campos para la receta
  videoLink: string = '';
  esPublica: boolean = true;
  esCreacionPropia: boolean = true;
  autorOriginal: string = '';
  origen: string = '';
  fechaCreacion: string = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  formErrors: {[key: string]: string} = {};
    // Propiedades para el cálculo automático del tiempo total
  tiempoPreparacion: number | null = null;
  tiempoCoccion: number | null = null;
  tiempoTotalCalculado: number = 0;
    // Propiedades del formulario para el estado de campos obligatorios
  nombre: string = '';
  descripcion: string = '';
  categoria: string = '';
  dificultad: string = '';
  porciones: number = 1; // Campo obligatorio con valor por defecto
  
  // Unidades de medida organizadas por grupos con formato nombre completo (abreviatura)
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
  constructor(
    private recetasService: RecetasService,
    private ingredientesService: IngredientesService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit(): void {
    this.cargarIngredientesDisponibles();
    // Inicializar valores por defecto
    this.tiempoPreparacion = null;
    this.tiempoCoccion = null;
    this.tiempoTotalCalculado = 0;
    
  }
  cargarIngredientesDisponibles(): void {
    this.ingredientesService.obtenerTodosIngredientes().subscribe({
      next: (response: any) => {
        this.ingredientesDisponibles = response.datos;
      },
      error: (err: any) => {
        console.error('Error al cargar los ingredientes:', err);
      }
    });
  }
  agregarIngrediente(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const ingredienteId = parseInt(target.value, 10);
    
    // Solo proceder si se seleccionó un ingrediente válido
    if (ingredienteId) {
      const ingrediente = this.ingredientesDisponibles.find(i => i.ingrediente_id === ingredienteId);
        if (ingrediente && !this.ingredientesSeleccionados.some(i => i.ingrediente_id === ingrediente.ingrediente_id)) {
        // Establecer "Unidad" como unidad por defecto en lugar de cadena vacía
        this.ingredientesSeleccionados.push({ ...ingrediente, cantidad: '', unidad: 'Unidad' });
        
        // Reset del select a la opción por defecto después de agregar
        target.value = '';
      }
    }
  }

  eliminarIngrediente(index: number): void {
    this.ingredientesSeleccionados.splice(index, 1);
  }

  validarFormulario(form: NgForm): boolean {
    this.formErrors = {};
    let isValid = true;    // Validar longitudes máximas
    if (this.nombre && this.nombre.length > this.NOMBRE_MAX_LENGTH) {
      this.formErrors['nombre'] = `El nombre no puede exceder los ${this.NOMBRE_MAX_LENGTH} caracteres.`;
      isValid = false;
    }

    if (form.value.imagen && form.value.imagen.length > this.IMAGEN_MAX_LENGTH) {
      this.formErrors['imagen'] = `La URL de imagen no puede exceder los ${this.IMAGEN_MAX_LENGTH} caracteres.`;
      isValid = false;
    }

    if (this.descripcion && this.descripcion.length > this.DESCRIPCION_MAX_LENGTH) {
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
    }

    // Validar que los campos numéricos sean positivos
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
      // Validar cantidad y unidad para todos los ingredientes seleccionados
      for (let i = 0; i < this.ingredientesSeleccionados.length; i++) {
        const ingrediente = this.ingredientesSeleccionados[i];
        if (!ingrediente.cantidad || !ingrediente.unidad || 
            parseFloat(ingrediente.cantidad) <= 0 || 
            ingrediente.cantidad.toString().trim() === '' || 
            ingrediente.unidad.trim() === '') {
          this.formErrors['ingredientes'] = 'Todos los ingredientes seleccionados deben tener cantidad y unidad válidas.';
          isValid = false;
          break;
        }
      }    }

    return isValid;
  }

  /**
   * Calcula automáticamente el tiempo total sumando preparación + cocción
   * Tiempo de cocción default a 0 si está vacío
   */
  calcularTiempoTotal(): void {
    const preparacion = this.tiempoPreparacion || 0;
    const coccion = this.tiempoCoccion || 0;
    this.tiempoTotalCalculado = preparacion + coccion;
  }  onSubmit(form: NgForm): void {
    // Calcular tiempo total antes de la validación
    this.calcularTiempoTotal();
    
    const validacionCustoma = this.validarFormulario(form);
      if (form.valid && validacionCustoma) {
      const recetaData = {
        nombre: this.nombre,
        imagen: form.value.imagen || '',
        descripcion: this.descripcion,
        tiempo_preparacion: this.tiempoPreparacion || 0,
        tiempo_coccion: this.tiempoCoccion || 0,
        tiempo_total: this.tiempoTotalCalculado,
        categoria: this.categoria,
        porciones: this.porciones,
        calorias_totales: form.value.calorias_totales || 0,
        dificultad: this.dificultad,
        videoLink: this.videoLink || '',
        esPublica: this.esPublica,
        esCreacionPropia: this.esCreacionPropia,
        autorOriginal: this.esCreacionPropia ? '' : this.autorOriginal,
        origen: this.origen,
        fechaCreacion: this.fechaCreacion,
        ingredientes: this.ingredientesSeleccionados.map(i => ({
          id: i.ingrediente_id,
          cantidad: parseFloat(i.cantidad),
          unidad: i.unidad        }))
      };

      this.recetasService.crearReceta(recetaData).subscribe({
        next: (response: any) => {
          const recetaId = response?.receta?.receta_id;
          if (recetaId) {
            this.router.navigate(['/recetas/detalle/', recetaId]);
          } else {
            this.router.navigate(['/inicio']);
          }
        },
        error: (err: any) => {
          console.error('✗ Error al crear la receta:', err);
          if (err.error && err.error.mensaje) {
            alert('Error: ' + err.error.mensaje);
          } else {
            alert('Error al crear la receta. Por favor, inténtalo de nuevo.');
          }        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(form.controls).forEach(campo => {
        const control = form.controls[campo];
        control.markAsTouched();
      });
      
      // Mostrar el primer error encontrado
      const primerError = Object.keys(this.formErrors)[0];
      if (primerError) {
        alert('Error de validación: ' + this.formErrors[primerError]);
      }
    }
  }// Método para actualizar la previsualización de la imagen
  updateImagePreview(event: any): void {
    const url = event.target.value.trim();
    
    if (!url) {
      this.imagePreview = null;
      this.imageError = false;
      return;
    }

    // Resetear estados
    this.imageError = false;
    this.imagePreview = null;

    // Crear una nueva imagen para probar la URL
    const img = new Image();
      // Configurar timeout para URLs que tarden mucho
    const timeout = setTimeout(() => {
      this.imagePreview = null;
      this.imageError = true;
    }, 8000); // 8 segundos de timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      this.imagePreview = url;
      this.imageError = false;
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      this.imagePreview = null;
      this.imageError = true;
    };
    
    // Configurar crossOrigin para evitar problemas de CORS
    img.crossOrigin = 'anonymous';
    
    // Iniciar la carga de la imagen
    img.src = url;
  }

  // Método para actualizar la previsualización del video
  updateVideoPreview(event: any): void {
    const url = event.target.value;
    
    if (!url || url.trim() === '') {
      this.videoPreview = null;
      this.videoError = false;
      return;
    }    // Convertir URLs de YouTube a formato embed
    const convertedUrl = this.convertToEmbedUrl(url);
    if (convertedUrl) {
      this.videoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(convertedUrl);
      this.videoError = false;
    } else {
      this.videoPreview = null;
      this.videoError = true;
    }
  }

  // Método para convertir URLs de YouTube a formato embed
  private convertToEmbedUrl(url: string): string | null {
    // Patrones para diferentes formatos de URL de YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // Si ya es una URL embed válida, devolverla tal como está
    if (url.includes('youtube.com/embed/') || url.includes('youtu.be/embed/')) {
      return url;
    }
    
    return null;
  }
  /**
   * Obtiene el estado de todos los campos obligatorios
   * @returns Array con el estado de cada campo obligatorio
   */
  getCamposObligatoriosEstado(): {campo: string, completado: boolean, valor?: any}[] {
    return [
      {
        campo: 'Nombre',
        completado: !!this.nombre?.trim(),
        valor: this.nombre?.trim() || ''
      },
      {
        campo: 'Descripción',
        completado: !!this.descripcion?.trim(),
        valor: this.descripcion?.trim() || ''
      },
      {
        campo: 'Origen',
        completado: !!this.origen?.trim(),
        valor: this.origen?.trim() || ''
      },
      {
        campo: 'Tiempo de preparación',
        completado: this.tiempoPreparacion !== null && this.tiempoPreparacion !== undefined && this.tiempoPreparacion > 0,
        valor: this.tiempoPreparacion ? `${this.tiempoPreparacion} min` : ''
      },
      {
        campo: 'Categoría',
        completado: !!this.categoria?.trim(),
        valor: this.categoria || ''
      },      {
        campo: 'Dificultad',
        completado: !!this.dificultad?.trim(),
        valor: this.dificultad || ''
      },
      {
        campo: 'Porciones',
        completado: this.porciones !== null && this.porciones !== undefined && this.porciones > 0,
        valor: this.porciones ? `${this.porciones} porción${this.porciones === 1 ? '' : 'es'}` : ''
      },
      {
        campo: 'Ingredientes',
        completado: this.ingredientesSeleccionados.length > 0 && this.ingredientesSeleccionados.every(i => i.cantidad && i.unidad),
        valor: this.ingredientesSeleccionados.length > 0 ? `${this.ingredientesSeleccionados.length} ingrediente(s)` : ''
      }
    ];
  }
}
