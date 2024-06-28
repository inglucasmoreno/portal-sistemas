import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroOrdenesServicioPipe } from '../../pipes/filtro-ordenes-servicio.pipe';
import { AlertService } from '../../services/alert.service';
import { OrdenesServicioService } from '../../services/ordenes-servicio.service';
import { DataService } from '../../services/data.service';
import { FechaHoraPipe } from '../../pipes/fecha-hora.pipe';
import { AuthService } from '../../services/auth.service';
import { LimitarStringPipe } from '../../pipes/limitar-string.pipe';
import { ESTADO_ORDENES_SERVICIO } from '../../constants/ordenes-servicio-estado';

@Component({
  standalone: true,
  selector: 'app-ordenes-servicio-final',
  imports: [
    CommonModule,
    FormsModule,
    FechaHoraPipe,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroOrdenesServicioPipe,
    LimitarStringPipe
  ],
  templateUrl: './ordenes-servicio-final.component.html',
  styleUrls: []
})
export default class OrdenesServicioFinalComponent implements OnInit {

  public ordenes: any = [];
  public ESTADOS_ORDENES_SERVICIO = ESTADO_ORDENES_SERVICIO;

  // Dependencias
  public dependencias: any = [];
  public dependenciaSeleccionada: any = null;
  public dependenciaSeleccionadaNombre: string = '';

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
    estado: this.authService.usuario.role === 'ADMIN_ROLE' ? 'Sin asignar' : '',
  }

  // Ordenar
  public ordenar = {
    direccion: 'desc',  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  constructor(
    private dataService: DataService,
    public authService: AuthService,
    private alertService: AlertService,
    private ordenesServicioService: OrdenesServicioService,
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Portal - Listado de solicitudes';
    this.dependencias = this.authService.usuario.dependencias;
    this.dependenciaSeleccionada = this.dependencias[0].idDependencia;
    this.nombreDependenciaSeleccionada();
    this.listarOrdenes();
  }

  // Listar ordenes
  listarOrdenes(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      estado: this.filtro.estado,
      dependencia: this.authService.usuario.role === 'USER_ROLE' ? this.dependenciaSeleccionada : '',
      parametro: this.filtro.parametro,
      pagina: this.paginaActual,
      itemsPorPagina: this.cantidadItems,
    }
    this.alertService.loading();
    this.ordenesServicioService.listarOrdenes(parametros).subscribe({
      next: ({ ordenes, totalItems }) => {
        this.totalItems = totalItems;
        this.ordenes = ordenes;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nombre - Dependencia seleccionada
  nombreDependenciaSeleccionada(): void {
    this.dependenciaSeleccionadaNombre = this.dependencias.find((dependencia) => dependencia.idDependencia === Number(this.dependenciaSeleccionada)).nombre;
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void {
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 'asc' ? 'desc' : 'asc';
    this.alertService.loading();
    this.listarOrdenes();
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    // this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.nombreDependenciaSeleccionada();
    this.listarOrdenes();
  }

}
