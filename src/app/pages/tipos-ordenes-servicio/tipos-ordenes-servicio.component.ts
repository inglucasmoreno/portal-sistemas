import { CommonModule } from "@angular/common";
import { Component } from '@angular/core';
import { AlertService } from "../../services/alert.service";
import { DataService } from "../../services/data.service";
import { TiposOrdenServicioService } from "../../services/tipos-orden-servicio.service";
import { FormsModule } from "@angular/forms";
import { FechaPipe } from "../../pipes/fecha.pipe";
import { ModalComponent } from "../../components/modal/modal.component";
import { NgxPaginationModule } from "ngx-pagination";
import { RouterModule } from "@angular/router";
import { PastillaEstadoComponent } from "../../components/pastilla-estado/pastilla-estado.component";
import { TarjetaListaComponent } from "../../components/tarjeta-lista/tarjeta-lista.component";
import { FiltroTiposOrdenesServicioPipe } from "../../pipes/filtro-tipos-ordenes-servicios.pipe";
import AbmTipoOrdenServicioComponent from "./abm-tipo-orden-servicio/abm-tipo-orden-servicio.component";

@Component({
    selector: 'app-tipos-orden-servicio',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FechaPipe,
        ModalComponent,
        NgxPaginationModule,
        RouterModule,
        PastillaEstadoComponent,
        TarjetaListaComponent,
        FiltroTiposOrdenesServicioPipe,
        AbmTipoOrdenServicioComponent
    ],
    templateUrl: './tipos-ordenes-servicio.component.html',
})
export default class TiposOrdenServicioComponent {

    // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 'desc',  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(
    public tiposService: TiposOrdenServicioService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Tipos de orden';
    this.alertService.loading();
    this.listarTipos();
  }

  abrirAbm(estado: 'crear' | 'editar', tipo: any = null): void {
    this.tiposService.abrirAbm(estado, tipo);
  }

  nuevoTipo(tipo): void {
    this.tiposService.tipos = [tipo, ...this.tiposService.tipos];
    this.alertService.close();
  }

  actualizarTipo(tipo): void {
    const index = this.tiposService.tipos.findIndex((t: any) => t.id === tipo.id);
    this.tiposService.tipos[index] = tipo;
    this.tiposService.tipos = [...this.tiposService.tipos];
    this.alertService.close();
  }

  // Listar tipos
  listarTipos(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.tiposService.listarTipos(parametros).subscribe({
      next: ({ tipos }) => {
        this.tiposService.tipos = tipos;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(tipo: any): void {

    const { id, activo } = tipo;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.tiposService.actualizarTipo(id, { activo: !activo }).subscribe({
            next: () => {
              this.listarTipos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
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
    this.listarTipos();
  }

}
