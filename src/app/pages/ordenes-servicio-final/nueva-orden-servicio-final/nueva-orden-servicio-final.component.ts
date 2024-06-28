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
import { OrdenesServicioHistorialService } from '../../../services/ordenes-servicio-historial.service';
import { NgSelectModule } from '@ng-select/ng-select';
import gsap from 'gsap';

@Component({
  standalone: true,
  selector: 'app-nueva-orden-servicio-final',
  templateUrl: './nueva-orden-servicio-final.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
})
export default class NuevaOrdenServicioFinalComponent implements OnInit, AfterViewInit {

  // Dependencias
  public dependenciaSeleccionada: string = '';
  public dependenciasUsuario: any[] = [];

  // Flags
  public solicitudEnviada: boolean = false;

  // Busqueda de usuarios
  public showUsuarios: boolean = false;
  public buscandoUsuarios: boolean = false;
  public usuarios: any[] = [];
  public usuarioSeleccionado: any = null;
  public filtroUsuarios = { parametro: '' };

  // Ordenes de servicio
  public tiposOrdenServicio: any[] = [];

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Formulario de solicitud
  solicitudForm: any = {
    usuarioId: '',
    tipoOrdenServicioId: '',
    telefonoContacto: '',
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
    private ordenesServicioHistorial: OrdenesServicioHistorialService,
    private usuariosService: UsuariosService,
    private tiposOrdenServicioService: TiposOrdenServicioService,
  ) { }

  ngOnInit() {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = "Portal - Nueva solicitud";

    this.alertService.loading();

    this.authService.usuario.role === 'USER_ROLE' ?
    this.solicitudForm.telefonoContacto = this.authService.usuario.telefono : null;

    // Asignacion de dependencias
    if(this.authService.usuario.role === 'USER_ROLE') {
      this.dependenciasUsuario = [];
      this.authService.usuario.dependencias.map((item) => {
        if(!item.soloLectura){
          this.dependenciasUsuario.push({
            idDependencia: item.idDependencia,
            idRelacion: item.idRelacion,
            nombre: item.nombre
          });
        }
      })
      this.dependenciasUsuario.length > 0 ? this.dependenciaSeleccionada = this.dependenciasUsuario[0].idDependencia : null;
    }else{
      this.dependenciaSeleccionada = '';
      this.dependenciasUsuario = [];
    }

    // Listar tipos de solicitudes
    this.tiposOrdenServicioService.listarTipos({
      activo: 'true',
    }).subscribe({
      next: ({ tipos }) => {
        this.tiposOrdenServicio = tipos;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    });
  }

  ngAfterViewInit(): void {

    // Busqueda de usuarios en el backend
    fromEvent<any>(this.buscadorUsuarios?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(text => {
        this.filtroUsuarios.parametro = text;
        this.buscandoUsuarios = true;
        this.paginaActual = 1;
        this.buscarUsuarios();
      })

  }

  buscarUsuarios(): void {

    if(this.filtroUsuarios.parametro.trim() === ''){
      this.buscandoUsuarios = false;
      return;
    }

    this.usuarios = [];

    this.usuariosService.listarUsuarios(1, 'apellido', '', '', this.filtroUsuarios.parametro).subscribe({
      next: ({ usuarios }) => {
        this.usuarios = usuarios;
        this.buscandoUsuarios = false;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    });
  }

  seleccionarUsuario(usuario: any): void {

    this.filtroUsuarios.parametro = '';
    this.usuarioSeleccionado = usuario;
    this.solicitudForm.telefonoContacto = usuario.telefono;
    this.dependenciasUsuario = [];

    usuario.UsuariosDependencias.map((item) => {
      if(!item.soloLectura){
        this.dependenciasUsuario.push({
          idDependencia: item.dependencia.id,
          idRelacion: item.id,
          nombre: item.dependencia.nombre
        });
      }
    })

    this.dependenciasUsuario.length > 0 ? this.dependenciaSeleccionada = this.dependenciasUsuario[0].idDependencia : null;

    this.usuarios = [];

  }

  eliminarUsuario(): void {
    this.solicitudForm.telefonoContacto = '';
    this.usuarioSeleccionado = null;
  }

  generarSolicitud(): void {

    const {
      tipoOrdenServicioId,
      telefonoContacto,
      observacionSolicitud,
      creatorUserId
    } = this.solicitudForm;

    // Verificaciones

    if (!this.dependenciaSeleccionada) {
      this.alertService.info('Debe seleccionar una dependencia');
      return;
    }

    if (!this.usuarioSeleccionado && this.authService.usuario.role !== 'USER_ROLE') {
      this.alertService.info('Debe seleccionar un usuario');
      return;
    }

    if (!telefonoContacto) {
      this.alertService.info('Debe ingresar un telefono de contacto');
      return;
    }

    if (!tipoOrdenServicioId) {
      this.alertService.info('Debe seleccionar un tipo de orden de servicio');
      return;
    }

    if (!observacionSolicitud) {
      this.alertService.info('Debe ingresar un detalle');
      return;
    }

    this.alertService.question({ msg: 'Generando solicitud', buttonText: 'Aceptar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.alertService.loading();

        const data = {
          usuarioId: this.authService.usuario.role === 'USER_ROLE' ? this.authService.usuario.userId : this.usuarioSeleccionado.id,
          tipoOrdenServicioId: Number(tipoOrdenServicioId),
          telefonoContacto,
          dependenciaId: Number(this.dependenciaSeleccionada),
          creatorUserId,
          observacionSolicitud
        };
    
        this.ordenesServicio.nuevaOrden(data).subscribe({
          next: ({ orden }) => {
    
            const dataHistorial = {
              ordenServicioId: orden.id,
              tipo: 'Generada',
              creatorUserId: this.authService.usuario.userId
            }
    
            this.ordenesServicioHistorial.nuevaRelacion(dataHistorial).subscribe({
              next: () => {
                this.usuarioSeleccionado = null;
                this.solicitudEnviada = true;
                this.solicitudForm = {
                  usuarioId: '',
                  telefonoContacto: this.authService.usuario.telefono,
                  tipoOrdenServicioId: '',
                  creatorUserId: this.authService.usuario.userId,
                  observacionSolicitud: ''
                }
                this.alertService.close();
              }, error: ({ error }) => this.alertService.errorApi(error.message)
            })
    
          }, error: ({error}) => this.alertService.errorApi(error.message)
        });
    
      }
    });
  }

  regresarFormulario(): void {
    this.solicitudEnviada = false;
  }


}
