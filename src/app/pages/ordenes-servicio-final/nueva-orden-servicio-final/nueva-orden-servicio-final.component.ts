import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { OrdenesServicioService } from '../../../services/ordenes-servicio.service';
import { DataService } from '../../../services/data.service';
import { TiposOrdenServicioService } from '../../../services/tipos-orden-servicio.service';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  standalone: true,
  selector: 'app-nueva-orden-servicio-final',
  templateUrl: './nueva-orden-servicio-final.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule
  ],
})
export default class NuevaOrdenServicioFinalComponent implements OnInit {

  public tiposOrdenServicio: any[] = [];
  public usuarios: any[] = [];

  // Formulario de solicitud
  solicitudForm: any = {
    usuarioId: '',
    tipoOrdenServicioId: '',
    dependenciaId: '',
    creatorUserId: this.authService.usuario.userId,
    observacionSolicitud: ''
  }

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private alertService: AlertService,
    private ordenesServicio: OrdenesServicioService,
    private usuariosService: UsuariosService,
    private tiposOrdenServicioService: TiposOrdenServicioService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = "Nueva orden de servicio";

    this.alertService.loading();

    // Listar tipos de solicitudes
    this.tiposOrdenServicioService.listarTipos({}).subscribe({
      next: ({ tipos }) => {
        this.tiposOrdenServicio = tipos;
        this.usuariosService.listarUsuarios().subscribe({
          next: ({ usuarios }) => {
            this.usuarios = usuarios;
            console.log(this.usuarios);
            this.alertService.close();
          }, error: ({error}) => this.alertService.errorApi(error.message)
        });
      }, error: ({error}) => this.alertService.errorApi(error.message)
    });
  }

  generarSolicitud(): void {
    
    // Verificacion de campos solicitudForm
    
    if (!this.solicitudForm.usuarioId) {
      this.alertService.info('Debe seleccionar un usuario');
      return;
    }

    if (!this.solicitudForm.tipoOrdenServicioId) {
      this.alertService.info('Debe seleccionar un tipo de orden de servicio');
      return;
    }

    if (!this.solicitudForm.observacionSolicitud) {
      this.alertService.info('Debe ingresar un detalle');
      return;
    }

    // this.alertService.loading();

  }



}
