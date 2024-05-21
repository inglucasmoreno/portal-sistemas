import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from '../../../components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { OrdenesServicioService } from '../../../services/ordenes-servicio.service';
import { AlertService } from '../../../services/alert.service';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { FechaHoraPipe } from '../../../pipes/fecha-hora.pipe';
import { OrdenesServicioHistorialService } from '../../../services/ordenes-servicio-historial.service';
import { AuthService } from '../../../services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { UsuariosService } from '../../../services/usuarios.service';
import { OrdenesServicioToTecnicosService } from '../../../services/ordenes-servicio-to-tecnicos.service';

@Component({
  standalone: true,
  selector: 'app-detalles-orden-servicio-final',
  templateUrl: './detalles-orden-servicio-final.component.html',
  styleUrls: [],
  imports: [
    RouterModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    ModalComponent,
    CommonModule,
    FechaPipe,
    FechaHoraPipe
  ]
})
export default class DetallesOrdenServicioFinalComponent implements OnInit {

  // Flags
  public showSeccion: string = 'Detalles';      // Detalles | Historial
  public showModalAsignacion: boolean = false;  // Asignacion de tecnico

  // Tecnico seleccionado
  public tecnicoSeleccionado = '';
  public tecnicosAsignados: any[] = [];
  public tecnicosParaAsignar: any[] = [];

  // Rechazo de solicitud
  public showRechazar: boolean = false;
  public motivoRechazo: string = '';

  // Historial
  public historialOrden: any[] = [];

  public idSolicitud = '';
  public orden = null;
  public tecnicos: any[] = []

  constructor(
    private dataService: DataService,
    private usuariosService: UsuariosService,
    public authService: AuthService,
    private ordenesServicio: OrdenesServicioService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private ordenesServicioHistorialService: OrdenesServicioHistorialService,
    private ordenesServicioToTecnicosService: OrdenesServicioToTecnicosService,
    private router: Router
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Detalles de solicitud';
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({ id }) => {
      this.idSolicitud = id;
      this.obtenerSolicitud();
    })
  }

  obtenerSolicitud(): void {
    this.alertService.loading()
    this.ordenesServicio.getOrden(this.idSolicitud).subscribe({
      next: ({ orden }) => {
        this.orden = orden;
        this.historialOrden = this.orden.ordenesServicioHistorial;
        console.log(this.historialOrden);
        this.tecnicosAsignados = orden.ordenesServicioTecnico;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  abrirRechazar(): void {
    // El motivo de rechazo se limpia cada vez que se abre el modal
    this.motivoRechazo = '';
    this.showRechazar = true;
  }

  rechazarSolicitud(): void {

    // Se verifica que el motivo de rechazo no esté vacío
    if (!this.motivoRechazo.trim()) {
      this.alertService.info('El motivo de rechazo no puede estar vacío');
      return;
    }

    this.alertService.question({ msg: '¿Quieres rechazar la solicitud?', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          const dataRechazo = {
            fechaCierre: new Date().toISOString(),
            estadoOrden: 'Rechazada',
            motivoRechazo: this.motivoRechazo,
            activo: false
          }

          // Rechazo de solicitud
          this.ordenesServicio.actualizarOrden(this.idSolicitud, dataRechazo).subscribe({
            next: () => {
              const dataHistorial = {
                tipo: 'Rechazada',
                motivoRechazo: this.motivoRechazo,
                ordenServicioId: this.orden.id,
                creatorUserId: this.authService.usuario.userId,
              }
              // Actualizacion de historial
              this.ordenesServicioHistorialService.nuevaRelacion(dataHistorial).subscribe({
                next: () => {
                  this.alertService.close();
                  this.router.navigateByUrl('/dashboard/ordenesServicio');
                }, error: ({ error }) => this.alertService.errorApi(error.message)
              });
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });

        }
      });

  }

  reactivarSolicitud(): void {
    this.alertService.question({ msg: '¿Quieres reactivar la solicitud?', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          const dataHistorial = {
            tipo: 'Reactivada',
            motivoRechazo: '',
            ordenServicioId: this.orden.id,
            creatorUserId: this.authService.usuario.userId,
          }

          // Actualizacion de historial
          this.ordenesServicioHistorialService.nuevaRelacion(dataHistorial).subscribe({
            next: () => {

              const dataReactivar = {
                fechaCierre: new Date().toISOString(),
                estadoOrden: 'Pendiente',
                motivoRechazo: '',
                activo: true
              }

              // Reactivacion de solicitud
              this.ordenesServicio.actualizarOrden(this.idSolicitud, dataReactivar).subscribe({
                next: ({ orden }) => {
                  this.orden = orden;
                  this.alertService.close();
                }, error: ({ error }) => this.alertService.errorApi(error.message)
              });

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });
  }

  abrirAsignacion(): void {
    this.tecnicoSeleccionado = '';
    this.tecnicosParaAsignar = [];
    this.alertService.loading();
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        this.tecnicos = usuarios;
        this.showModalAsignacion = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  agregarTecnico(): void {
    if (!this.tecnicoSeleccionado) {
      this.alertService.info('Debes seleccionar un técnico');
      return;
    }
    const tecnico = this.tecnicos.find(t => t.id === this.tecnicoSeleccionado);
    this.tecnicosParaAsignar.push(tecnico);
    this.tecnicos = this.tecnicos.filter(t => t.id !== this.tecnicoSeleccionado);
    this.tecnicoSeleccionado = '';
  }

  eliminarTecnico(tecnicoId: string): void {
    const tecnico = this.tecnicosParaAsignar.find(t => t.id === tecnicoId);
    this.tecnicosParaAsignar = this.tecnicosParaAsignar.filter(t => t.id !== tecnicoId);
    this.tecnicos.push(tecnico);
  }

  asignarTecnicos(): void {

    if(this.tecnicosParaAsignar.length === 0) {
      this.alertService.info('Debes seleccionar al menos un técnico');
      return;
    }

    const data = {
      tecnicos: [],
      ordenServicioId: this.idSolicitud,
      creatorUserId: this.authService.usuario.userId
    };

    this.tecnicosParaAsignar.forEach(t => data.tecnicos.push({ id: t.id }));

    this.alertService.question({ msg: '¿Quieres asignar el/los técnicos a la solicitud?', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ordenesServicioToTecnicosService.nuevaOrdenTecnico(data).subscribe({
            next: () => {

              const dataHistorial = {
                tipo: 'En proceso',
                tecnicos: data.tecnicos,
                ordenServicioId: this.orden.id,
                creatorUserId: this.authService.usuario.userId,
              }
              // Actualizacion de historial
              this.ordenesServicioHistorialService.nuevaRelacion(dataHistorial).subscribe({
                next: () => {
                  this.alertService.close();
                  this.router.navigateByUrl('/dashboard/ordenesServicio');
                }, error: ({ error }) => this.alertService.errorApi(error.message)
              });

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });

  }

  cambiarSeccion(seccion: string): void {
    this.showSeccion = seccion;
  }

}
