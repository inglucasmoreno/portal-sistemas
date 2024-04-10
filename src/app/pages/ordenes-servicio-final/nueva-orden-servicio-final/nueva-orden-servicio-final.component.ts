import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { OrdenesServicioService } from '../../../services/ordenes-servicio.service';
import { DataService } from '../../../services/data.service';
import { TiposOrdenServicioService } from '../../../services/tipos-orden-servicio.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';

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
export default class NuevaOrdenServicioFinalComponent implements OnInit, AfterViewInit {

  // Flags
  public showUsuarios: boolean = false;
  public buscandoUsuarios: boolean = false;

  public tiposOrdenServicio: any[] = [];
  public usuarios: any[] = [];

  public filtroUsuarios = {
    parametro: ''
  }

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Formulario de solicitud
  solicitudForm: any = {
    usuarioId: '',
    tipoOrdenServicioId: '',
    creatorUserId: this.authService.usuario.userId,
    observacionSolicitud: ''
  }

  @ViewChild('buscadorUsuarios')
  public buscadorUsuarios?: ElementRef;

  constructor(
    private dataService: DataService,
    public authService: AuthService,
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
        this.alertService.close();
        // this.buscarUsuarios();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    });
  }

  ngAfterViewInit(): void {

    // Busqueda de usuarios en el backend
    fromEvent<any>(this.buscadorUsuarios?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(text => {
        this.filtroUsuarios.parametro = text;
        this.buscandoUsuarios = true;
        this.paginaActual = 1;
        this.buscarUsuarios();
      })

  }

  buscarUsuarios(): void {
    this.usuariosService.listarUsuarios(1, 'apellido', '', this.filtroUsuarios.parametro).subscribe({
      next: ({ usuarios }) => {
        this.usuarios = usuarios;
        console.log(usuarios);
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    });
  }

  generarSolicitud(): void {
    
    const {
      usuarioId,
      tipoOrdenServicioId,
      observacionSolicitud,
      creatorUserId
    } = this.solicitudForm;

    // Verificaciones
    
    if (!this.solicitudForm.usuarioId && this.authService.usuario.role === 'USER_ROLE') {
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

    this.alertService.loading();

    let dependenciaId = null;

    if(this.authService.usuario.role === 'USER_ROLE'){
      dependenciaId: this.authService.usuario.dependenciaId;
    }else{
      
    }

    const data = {
      usuarioId: this.authService.usuario.role === 'ADMIN_ROLE' ? this.authService.usuario.userId : usuarioId,
      tipoOrdenServicioId,
      dependenciaId,
      creatorUserId, 
      observacionSolicitud
    };

    this.ordenesServicio.nuevaOrden(data).subscribe({
      next: () => {
        
      }, error: ({error}) => this.alertService.errorApi(error.message)
    });

  }


}
