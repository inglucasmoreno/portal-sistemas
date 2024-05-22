import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroTiposOrdenesServicioPipe } from '../../pipes/filtro-tipos-ordenes-servicios.pipe';
import AbmTipoOrdenServicioComponent from '../tipos-ordenes-servicio/abm-tipo-orden-servicio/abm-tipo-orden-servicio.component';
import { DataService } from '../../services/data.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { OrdenesServicioToTecnicosService } from '../../services/ordenes-servicio-to-tecnicos.service';
import { FechaHoraPipe } from '../../pipes/fecha-hora.pipe';
import { LimitarStringPipe } from '../../pipes/limitar-string.pipe';

@Component({
  selector: 'app-mi-bandeja',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    FechaHoraPipe,
    LimitarStringPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroTiposOrdenesServicioPipe,
    AbmTipoOrdenServicioComponent
  ],
  templateUrl: './mi-bandeja.component.html',
  styleUrls: []
})
export default class MiBandejaComponent implements OnInit {

  public relaciones: any = [];
  public ordenes: any = [];

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
    estado: 'Pendiente',
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
    private ordenesServicioToTecnicosService: OrdenesServicioToTecnicosService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Listado de solicitudes';
    this.listarOrdenes();
  }

  listarOrdenes(): void {
    this.alertService.loading();
    this.ordenesServicioToTecnicosService.listarOrdenesTecnicos({
      tecnico: this.authService.usuario.userId,
      activo: "true"
    }).subscribe({
      next: ({ordenesToTecnicos}) => {
        this.relaciones = ordenesToTecnicos;
        this.ordenes = [];
        ordenesToTecnicos.map(({ordenServicio}) => { this.ordenes.push(ordenServicio); })
        console.log(this.relaciones);
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
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
    this.listarOrdenes();
  }

}
