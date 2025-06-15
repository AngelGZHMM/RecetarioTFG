import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RegistroActividadService, RegistroActividad, RangoEstadistica } from '../../../services/registro-actividad.service';

@Component({
  selector: 'app-estadisticas-de-uso',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './estadisticas-de-uso.component.html',
  styleUrl: './estadisticas-de-uso.component.scss',
  providers: [DatePipe]
})
export class EstadisticasDeUsoComponent implements OnInit {  rango: RangoEstadistica = 'dia';
  datosGrafica: number[] = [];
  labelsGrafica: string[] = [];
  registros: RegistroActividad[] = [];
  cargando = false;
  error = '';
  filtroNombre = '';
  cantidadMostrar = 10;
  opcionesCantidad = [10, 20, 40, 60, 80, 100];  registroSeleccionado: RegistroActividad | null = null;
  fechaSeleccionada: string = ''; // Nueva propiedad para fecha seleccionada
  fechaMaxima: string = ''; // Fecha máxima permitida (hoy)

  // Tipos de evento disponibles (puedes añadir más en el futuro)
  tiposEvento: string[] = ['login'];
  tipoEventoSeleccionado: string = 'login';  constructor(private registroActividadService: RegistroActividadService) {
    // Inicializar fecha seleccionada con la fecha actual en formato YYYY-MM-DD
    const hoy = new Date();
    this.fechaSeleccionada = hoy.toISOString().split('T')[0];
    this.fechaMaxima = hoy.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarEstadisticas();
    this.cargarRegistros();
  }

  cambiarTipoEvento() {
    this.cargarEstadisticas();
  }
  cambiarFecha() {
    if (this.rango === 'dia') {
      this.cargarEstadisticas();
    }
  }
  setRango(r: RangoEstadistica) {
    this.rango = r;
    // Si cambiamos a 'dia' y no hay fecha seleccionada, usar hoy
    if (r === 'dia' && !this.fechaSeleccionada) {
      const hoy = new Date();
      this.fechaSeleccionada = hoy.toISOString().split('T')[0];
    }
    this.cargarEstadisticas();
  }  cargarEstadisticas() {
    this.cargando = true;
    this.error = '';
    const fecha = this.rango === 'dia' ? this.fechaSeleccionada : undefined;
    this.registroActividadService.getEstadisticasLogin(this.rango, this.tipoEventoSeleccionado, fecha).subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length > 0 && (res[0].hasOwnProperty('total') || res[0].hasOwnProperty('count'))) {
          this.datosGrafica = res.map((item: any) => Number(item.total ?? item.count ?? 0) as number);
          if (res[0].hasOwnProperty('label')) {
            this.labelsGrafica = res.map((item: any) => String(item.label));
          } else {
            if (this.rango === 'dia') {
              this.labelsGrafica = Array.from({length: 24}, (_, i) => i.toString());
              if (this.datosGrafica.length < 24) {
                const datosAlineados = Array(24).fill(0);
                for (let i = 0; i < this.datosGrafica.length; i++) {
                  datosAlineados[i] = this.datosGrafica[i];
                }
                this.datosGrafica = datosAlineados;
              }
            } else if (this.rango === 'semana') {
              this.labelsGrafica = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            } else if (this.rango === 'mes') {
              this.labelsGrafica = Array.from({length: this.datosGrafica.length}, (_, i) => `Día ${i+1}`);
            } else if (this.rango === 'anio') {
              this.labelsGrafica = Array.from({length: this.datosGrafica.length}, (_, i) => `Año ${new Date().getFullYear() - this.datosGrafica.length + i + 1}`);
            } else {
              this.labelsGrafica = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].slice(0, this.datosGrafica.length);
            }
          }
        } else {
          this.datosGrafica = [];
          this.labelsGrafica = [];
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar estadísticas';
        this.cargando = false;
      }
    });
  }

  cargarRegistros() {
    this.registroActividadService.getRegistros().subscribe({
      next: (res) => {
        this.registros = res;
      },
      error: (err) => {
        this.error = 'Error al cargar registros';
      }
    });
  }

  get totalUsuarios(): number {
    return this.datosGrafica.reduce((acc, val) => acc + val, 0);
  }

  get puntosGrafica(): string {
    const datos = this.datosGrafica;
    if (!datos || datos.length < 2) return '';
    const max = Math.max(...datos, 1);
    return datos.map((valor, i) => {
      const x = i * 600 / (datos.length - 1);
      const y = 200 - (valor / max) * 180;
      return `${x},${isNaN(y) ? 200 : y}`;
    }).join(' ');
  }

  get valorMaximoGrafica(): number {
    return this.datosGrafica.length > 0 ? Math.max(...this.datosGrafica, 1) : 1;
  }  get valoresEjeY(): number[] {
    if (this.datosGrafica.length === 0) return [];
    
    // Obtener valores únicos de los datos reales, ordenados de mayor a menor
    const valoresUnicos = [...new Set(this.datosGrafica)]
      .filter(valor => valor > 0) // Solo valores positivos (excluye 0)
      .sort((a, b) => b - a); // Orden descendente
    
    return valoresUnicos;
  }

  get puntosGraficaConMargen(): string {
    const datos = this.datosGrafica;
    if (!datos || datos.length < 2) return '';
    const max = Math.max(...datos, 1);
    return datos.map((valor, i) => {
      const x = 50 + i * 590 / (datos.length - 1); // Ajuste para el margen izquierdo
      const y = 200 - (valor / max) * 180;
      return `${x},${isNaN(y) ? 200 : y}`;
    }).join(' ');
  }

  calcularPosicionY(valor: number): number {
    return 200 - (valor / this.valorMaximoGrafica) * 180;
  }

  get registrosFiltrados(): RegistroActividad[] {
    return this.registros
      .filter(r => !this.filtroNombre || (r.usuario_id + '').includes(this.filtroNombre))
      .slice(0, this.cantidadMostrar);
  }

  calcularSalto(len: number): number {
    return Math.ceil(len / 8);
  }

  abrirModal(reg: RegistroActividad) {
    this.registroSeleccionado = reg;
  }

  cerrarModal() {
    this.registroSeleccionado = null;
  }
}
