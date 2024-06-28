import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { AlertService } from "../../services/alert.service";
import { DataService } from "../../services/data.service";
import { DependenciasService } from "../../services/dependencias.service";
import { FormsModule } from "@angular/forms";
import { FechaPipe } from "../../pipes/fecha.pipe";
import { NgxPaginationModule } from "ngx-pagination";
import { RouterModule } from "@angular/router";
import { PastillaEstadoComponent } from "../../components/pastilla-estado/pastilla-estado.component";
import { TarjetaListaComponent } from "../../components/tarjeta-lista/tarjeta-lista.component";
import { ModalComponent } from "../../components/modal/modal.component";
import { FiltroDependenciasPipe } from "../../pipes/filtro-dependencias.pipe";

@Component({
    selector: 'app-dependencias',
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
        FiltroDependenciasPipe
    ],
    templateUrl: `dependencias.component.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DependenciasComponent {

  // Modal
  public showModalDependencia = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Dependencias
  public idDependencia: string = '';
  public dependencias: any = [];
  public dependenciaSeleccionada: any;
  public nombre: string = '';

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
    direccion: 'asc',  // Asc (1) | Desc (-1)
    columna: 'nombre'
  }

  constructor(
    private dependenciasService: DependenciasService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Portal - Dependencias';
    this.alertService.loading();
    this.listarDependencias();
  }

  // Abrir modal
  abrirModal(estado: string, dependencia: any = null): void {
    this.reiniciarFormulario();
    this.nombre = '';
    this.idDependencia = '';

    if (estado === 'editar') this.getDependencia(dependencia);
    else this.showModalDependencia = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de dependencia
  getDependencia(dependencia: any): void {
    this.alertService.loading();
    this.idDependencia = dependencia.id;
    this.dependenciaSeleccionada = dependencia;
    this.dependenciasService.getDependencia(dependencia.id).subscribe({
      next: ({ dependencia }) => {
        this.nombre = dependencia.nombre;
        this.alertService.close();
        this.showModalDependencia = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar dependencias
  listarDependencias(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
    }
    this.dependenciasService.listarDependencias(parametros).subscribe({
      next: ({ dependencias }) => {
        this.dependencias = dependencias;
        this.showModalDependencia = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nueva dependencia
  nuevaDependencia(): void {

    // Verificacion: Nombre vacio
    if (this.nombre.trim() === "") {
      this.alertService.info('Debes colocar un nombre');
      return;
    }

    this.alertService.loading();

    const data = {
      nombre: this.nombre,
      creatorUserId: this.authService.usuario.userId,
    }

    this.dependenciasService.nuevaDependencia(data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarDependencias();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar dependencias
  actualizarDependencia(): void {

    // Verificacion: nombre vacio
    if (this.nombre.trim() === "") {
      this.alertService.info('Debes colocar un nombre');
      return;
    }

    this.alertService.loading();

    const data = {
      nombre: this.nombre,
    }

    this.dependenciasService.actualizarDependencia(this.idDependencia, data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarDependencias();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(dependencia: any): void {

    const { id, activo } = dependencia;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.dependenciasService.actualizarDependencia(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarDependencias();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.nombre = '';
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
    this.listarDependencias();
  }

}
