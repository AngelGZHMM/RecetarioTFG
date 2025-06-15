import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PasosService } from '../../../services/pasos.service';
import { RecetasService } from '../../../services/recetas.service';

// Importaciones de Angular Material
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-crear-pasos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './crear-pasos.component.html',
  styleUrl: './crear-pasos.component.scss'
})
export class CrearPasosComponent implements OnInit {
  pasoForm!: FormGroup;
  recetaId: number = 0;
  orden: number = 1;
  recetaInfo: any = {};
  isLoading: boolean = false;
  error: string | null = null;
  tiposPaso = ['preparación', 'mezcla', 'cocción', 'montaje', 'reposo', 'otro'];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pasosService: PasosService,
    private recetasService: RecetasService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.isLoading = true;
    
    // Obtener el ID de la receta de los parámetros de la URL
    this.route.params.subscribe(params => {
      if (params['receta_id']) {
        this.recetaId = +params['receta_id'];
        this.cargarReceta();
        this.cargarOrdenPaso();
      } else {
        this.error = 'No se ha proporcionado un ID de receta válido';
        this.mostrarMensaje('Error: ' + this.error);
        this.isLoading = false;
      }
    });
    
    // Inicializar el formulario
    this.inicializarFormulario();
  }
  
  inicializarFormulario(): void {
    this.pasoForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(7)]],
      ingrediente: [''],
      cantidad: [null],
      unidad_medida: [''],
      tipo: ['preparación', Validators.required],
      duracion: [5, [Validators.required, Validators.min(1)]],
      necesario: [true, Validators.required]
    });
  }
  
  cargarReceta(): void {
    this.recetasService.obtenerRecetaPorId(this.recetaId).subscribe({
      next: (response) => {
        if (response && response.datos) {
          this.recetaInfo = response.datos;
        } else {
          this.error = 'No se pudo cargar la información de la receta';
          this.mostrarMensaje('Error: ' + this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la información de la receta';
        this.mostrarMensaje('Error: ' + this.error);
        console.error(err);
      }
    });
  }
  
  cargarOrdenPaso(): void {
    this.isLoading = true;
    this.pasosService.obtenerPasosPorReceta(this.recetaId).subscribe({
      next: (response) => {
        let pasos: any[] = [];
        if (response && Array.isArray(response.data)) {
          pasos = response.data;
        } else if (Array.isArray(response)) {
          pasos = response;
        } else if (response && response.data) {
          pasos = [response.data];
        }
        // Buscar el mayor orden real (ignorando 0, null, undefined, NaN)
        const ordenesValidos = pasos
          .map((paso: any) => Number(paso.orden))
          .filter((n: number) => Number.isInteger(n) && n > 0);
        if (ordenesValidos.length > 0) {
          this.orden = Math.max(...ordenesValidos) + 1;
        } else {
          this.orden = 1;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.orden = 1;
        this.isLoading = false;
      }
    });
  }
  
  onSubmit(): void {
    if (this.pasoForm.valid) {
      this.isLoading = true;
      const formValue = this.pasoForm.value;
      if ((formValue.cantidad && !formValue.unidad_medida) || 
          (!formValue.cantidad && formValue.unidad_medida)) {
        this.mostrarMensaje('Si se especifica cantidad, debe incluirse unidad de medida y viceversa.');
        this.isLoading = false;
        return;
      }      // Preparar los datos del paso SIN enviar el campo orden
      const pasoData = {
        ...formValue,
        receta: this.recetaId
        // No enviar 'orden', el backend lo calculará
      };
      this.pasosService.crearPasoReceta(pasoData).subscribe({
        next: (response) => {
          this.mostrarMensaje('Paso creado correctamente');
          this.router.navigate(['recetas/detalle/', this.recetaId]);
        },
        error: (err) => {
          console.error('Error al crear el paso:', err);
          this.error = err.error?.mensaje || 'Error al crear el paso';
          this.mostrarMensaje('Error: ' + this.error);
          this.isLoading = false;
        }
      });
    } else {
      this.mostrarMensaje('Por favor complete correctamente todos los campos requeridos');
    }
  }
    cancelar(): void {
    // Volver a la página de detalles de la receta
    this.router.navigate(['recetas/detalle', this.recetaId]);
  }
  
  // Método de diagnóstico para verificar el estado del formulario
  diagnosticarFormulario(): void {
    
    // Verificar cada control individualmente
    Object.keys(this.pasoForm.controls).forEach(key => {
      const control = this.pasoForm.get(key);
      
    });
  }
  
  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
