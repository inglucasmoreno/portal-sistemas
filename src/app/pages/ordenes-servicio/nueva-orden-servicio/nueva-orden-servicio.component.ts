import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { DependenciasService } from '../../../services/dependencias.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { AlertService } from '../../../services/alert.service';
import { TiposOrdenServicioService } from '../../../services/tipos-orden-servicio.service';
import { CommonModule } from '@angular/common';
import { OrdenesServicioService } from '../../../services/ordenes-servicio.service';
import gsap from 'gsap';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  standalone: true,
  selector: 'app-nueva-orden-servicio',
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './nueva-orden-servicio.component.html',
  styleUrls: []
})
export default class NuevaOrdenServicioComponent implements OnInit {

  public ordenServicioForm = {
    tipoOrdenServicioId: "",
    dependenciaId: "",
    usuarioId: "",
    estadoOrden: "PENDIENTE",
    observacionSolicitud: "",
    creatorUserId: this.authService.usuario.userId
  }

  public dependencias: any[] = [];
  public usuarios: any[] = [];
  public tiposOrdenes: any[] = [];

  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private alertService: AlertService,
    private dependenciasService: DependenciasService,
    private tiposOrdenServicioService: TiposOrdenServicioService,
    private ordenesServicioService: OrdenesServicioService,
    private usuariosService: UsuariosService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = "Dashboard - Solicitud de asistencia";
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.inicializacion();
    console.log(this.authService.usuario)
  }

  inicializacion(): void {
    this.alertService.loading();
    this.dependenciasService.listarDependencias({ activo: 'true' }).subscribe({
      next: ({ dependencias }) => {
        this.dependencias = dependencias;
        this.usuariosService.listarUsuarios(1,'apellido','true').subscribe({
          next: ({ usuarios }) => {
            this.usuarios = usuarios;
            this.tiposOrdenServicioService.listarTipos({activo: 'true'}).subscribe({
              next: ({ tipos }) => {
                this.tiposOrdenes = tipos;
                this.alertService.close();
              },error: ({ error }) => this.alertService.errorApi(error.message)
            })
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        });
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  generarOrdenServicio(): void {

    const { 
      usuarioId, 
      dependenciaId, 
      tipoOrdenServicioId,
      observacionSolicitud, 
      estadoOrden
    } = this.ordenServicioForm;

    // Verificaciones

    if(usuarioId == "" && this.authService.usuario.role !== "USER_ROLE") {
      this.alertService.info("Debe seleccionar un usuario");
      return;
    }

    if(dependenciaId == "" && this.authService.usuario.role !== "USER_ROLE") {
      this.alertService.info("Debe seleccionar una dependencia");
      return;
    }

    if(tipoOrdenServicioId == "") {
      this.alertService.info("Debe seleccionar un tipo de solicitud");
      return;
    } 

    const data = {
      usuarioId: this.authService.usuario.role === "USER_ROLE" ? this.authService.usuario.userId : Number(this.ordenServicioForm.usuarioId),
      dependenciaId: this.authService.usuario.role === "USER_ROLE" ? this.authService.usuario.dependencia.id : Number(this.ordenServicioForm.dependenciaId),
      tipoOrdenServicioId: Number(this.ordenServicioForm.tipoOrdenServicioId),
      creatorUserId: this.authService.usuario.userId,
      estadoOrden,
      observacionSolicitud
    }

    this.ordenesServicioService.nuevaOrden(data).subscribe({
      next: () => {
        this.alertService.success("Orden de servicio generada");
        this.ordenServicioForm = {
          tipoOrdenServicioId: "",
          dependenciaId: "",
          usuarioId: "",
          estadoOrden: "PENDIENTE",
          observacionSolicitud: "",
          creatorUserId: this.authService.usuario.userId
        }
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

}
