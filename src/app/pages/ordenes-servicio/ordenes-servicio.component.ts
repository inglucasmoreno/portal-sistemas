import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { OrdenesServicioService } from '../../services/ordenes-servicio.service';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroOrdenesServicioPipe } from '../../pipes/filtro-ordenes-servicio.pipe';
import { FechaHoraPipe } from '../../pipes/fecha-hora.pipe';

@Component({
  standalone: true,
  selector: 'app-ordenes-servicio',
  templateUrl: './ordenes-servicio.component.html',
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
    FiltroOrdenesServicioPipe
  ],
  styleUrls: []
})
export default class OrdenesServicioComponent implements OnInit {

  // Modal
  public showModalOrden = false;
  public showModalDetalles = false;

  // Estado formulario
  public estadoFormulario = 'detalles';

  // Orden de servicio
  public motivoRechazo: string = '';
  public idOrden: string = '';
  public ordenes: any = [];
  public ordenSeleccionada: any;

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
    columna: 'createdAt'
  }

  public ordenForm: FormGroup;

  constructor(
    private ordenesServicioService: OrdenesServicioService,
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Ordenes de servicio';

    this.ordenForm = this.fb.group({
      
    });

    this.alertService.loading();
    this.listarOrdenes();

  }

  // Abrir modal
  abrirModal(estado: string = "detalles", orden: any = null): void {

    this.estadoFormulario = estado;
    this.motivoRechazo = '';

    if(estado === "detalles"){
      this.idOrden = '';
      this.ordenSeleccionada = orden;
      this.showModalDetalles = true;
    }else if(estado === "rechazada"){
    
    }else if(estado === "aceptada"){
    
    }

  }

  // Traer datos de orden
  getOrden(orden: any): void {
    this.alertService.loading();
    this.idOrden = orden.id;
    this.ordenSeleccionada = orden;
    this.ordenesServicioService.getOrden(orden.id).subscribe({
      next: ({ orden }) => {
        this.alertService.close();
        this.showModalOrden = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar ordenes
  listarOrdenes(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.ordenesServicioService.listarOrdenes(parametros).subscribe({
      next: ({ ordenes }) => {
        console.log(ordenes);
        this.ordenes = ordenes;
        this.showModalOrden = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nueva orden
  nuevaOrden(): void {


    this.alertService.loading();

    const data = {
      creatorUserId: this.authService.usuario.userId,
    }

    this.ordenesServicioService.nuevaOrden(data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarOrdenes();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar ordenes
  actualizarOrden(): void {

    this.alertService.loading();

    const data = {}

    this.ordenesServicioService.actualizarOrden(this.idOrden, data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarOrdenes();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Rechazar orden de servicio
  rechazarOrden(): void {
  
    // Verificar: Motivo de rechazo vacio
    if(!this.motivoRechazo){
      return this.alertService.info('El motivo de rechazo es obligatorio');
    }

    this.alertService.question({ msg: 'Rechazando orden', buttonText: 'Rechazar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.alertService.loading();
        this.ordenesServicioService.actualizarOrden(this.ordenSeleccionada.id, {
          estadoOrden: 'Rechazada',
          motivoRechazo: this.motivoRechazo,
          fechaCierre: new Date()
        }).subscribe({
          next: () => {
            this.ordenSeleccionada.estadoOrden = 'Rechazada';
            this.ordenSeleccionada.motivoRechazo = this.motivoRechazo;
            this.showModalDetalles = false;        
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(orden: any): void {

    const { id, activo } = orden;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ordenesServicioService.actualizarOrden(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarOrdenes();
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
    this.listarOrdenes();
  }

}
