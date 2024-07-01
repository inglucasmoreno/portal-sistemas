import { Component, OnInit } from '@angular/core';
import { Usuarios } from '../../../interfaces/Usuarios.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { AlertService } from '../../../services/alert.service';
import { DataService } from '../../../services/data.service';
import gsap from 'gsap';
import { CommonModule } from '@angular/common';
import { DependenciasService } from '../../../services/dependencias.service';
import { AuthService } from '../../../services/auth.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { UsuariosDependenciasService } from '../../../services/usuarios-dependencias.service';

@Component({
  standalone: true,
  selector: 'app-editar-usuario',
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    CommonModule,
    NgSelectModule
  ],
  templateUrl: './editar-usuario.component.html',
  styleUrls: []
})
export default class EditarUsuarioComponent implements OnInit {

  get nombre_usuario() {
    return this.usuarioForm.get('usuario');
  }

  get apellido() {
    return this.usuarioForm.get('apellido');
  }

  get nombre() {
    return this.usuarioForm.get('nombre');
  }

  get telefono() {
    return this.usuarioForm.get('telefono');
  }

  get dni() {
    return this.usuarioForm.get('dni');
  }

  get email() {
    return this.usuarioForm.get('email');
  }

  get password() {
    return this.usuarioForm.get('password');
  }

  get repetir() {
    return this.usuarioForm.get('repetir');
  }

  get role() {
    return this.usuarioForm.get('role');
  }

  public id: string;
  public usuario: Usuarios;
  public usuarioForm: FormGroup;

  // Dependencias - Usuarios
  public showDependencias: boolean = false;
  public dependencias: any[] = [];
  public dependenciasUsuario: any[] = [];
  public dependenciaSeleccionada: string = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dependenciasService: DependenciasService,
    private usuariosDependenciasService: UsuariosDependenciasService,
    private usuariosService: UsuariosService,
    private alertService: AlertService,
    private dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Portal - Editando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(4)]],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      asignableSolicitud: ['false'],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER_ROLE', [Validators.required, Validators.minLength(4)]],
      activo: ['true', Validators.required],
    });

    this.alertService.loading();
    this.dependenciasService.listarDependencias({
      activo: 'true'
    }).subscribe({
      next: ({ dependencias }) => {
        this.dependencias = dependencias;
        this.getUsuario(); // Datos iniciales de usuarios
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Datos iniciales de usuarios
  getUsuario(): void {

    // Se buscan los datos iniciales del usuario a editar
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({ id }) => { this.id = id; });
    this.usuariosService.getUsuario(this.id).subscribe({
      next: (usuarioRes) => {

        this.usuario = usuarioRes;
        const {
          usuario,
          apellido,
          nombre,
          telefono,
          asignableSolicitud,
          dni,
          email,
          role,
          UsuariosDependencias,
          activo
        } = this.usuario;

        this.usuarioForm.patchValue({
          usuario,
          apellido,
          nombre,
          dni,
          telefono,
          asignableSolicitud: asignableSolicitud ? 'true' : 'false',
          email,
          role,
          activo: String(activo)
        });

        this.dependenciasUsuario = UsuariosDependencias

        this.alertService.close();

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Editar usuario
  editarUsuario(): void | boolean {

    if (this.usuarioForm.valid) {

      let data: any = {
        ...this.usuarioForm.value,
        creatorUserId: this.authService.usuario.userId
      };

      // Se adaptan los booleanos
      data.asignableSolicitud = data.asignableSolicitud === 'true' ? true : false;
      data.activo = data.activo === 'true' ? true : false;

      this.alertService.loading();

      this.usuariosService.actualizarUsuario(this.id, data).subscribe({
        next: () => {
          this.alertService.close();
          this.router.navigateByUrl('dashboard/usuarios');
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      });

    } else {
      this.usuarioForm.markAllAsTouched();
    }
  }

  // Modal: Dependencias
  abrirDependencias(): void {
    this.alertService.loading();
    this.dependenciasService.listarDependencias({
      activo: 'true'
    }).subscribe({
      next: ({ dependencias }) => {
        this.showDependencias = true;
        this.alertService.close();
      }, error: () => this.alertService.errorApi('Error al cargar dependencias')
    });
  }

  // Agregar dependencia
  agregarDependencia(): void {

    // Verificacion: Dependencia seleccionada
    if (this.dependenciaSeleccionada === '') {
      this.alertService.info('Debe seleccionar una dependencia');
      return;
    }

    this.alertService.loading();

    const data = {
      usuarioId: Number(this.id),
      dependenciaId: this.dependenciaSeleccionada,
      creatorUserId: this.authService.usuario.userId
    };

    this.usuariosDependenciasService.nuevaRelacion(data).subscribe({
      next: ({ relacion }) => {
        this.dependenciasUsuario.push(relacion);
        this.alertService.close();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })

    this.dependenciaSeleccionada = null;
    this.showDependencias = false;

  }

  // Eliminar dependencia
  eliminarDependencia(relacion: any): void {

    if(this.dependenciasUsuario.length === 1) {
      this.alertService.info('El usuario debe tener al menos una dependencia asignada');
      return;
    }

    this.alertService.loading();
    this.usuariosDependenciasService.eliminarRelacion(relacion.id).subscribe({
      next: ({ relacion }) => {
        this.dependenciasUsuario = this.dependenciasUsuario.filter(item => item.id !== relacion.id);
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  actualizarSoloLectura(relacionFront: any): void {
    this.alertService.loading();
    this.usuariosDependenciasService.actualizarRelacion(relacionFront.id, { soloLectura: !relacionFront.soloLectura }).subscribe({
      next: ({ relacion }) => {

        // Actualizar solo lectura en el front
        const relacionIndex = this.dependenciasUsuario.findIndex(item => item.id === relacion.id);
        this.dependenciasUsuario[relacionIndex].soloLectura = relacion.soloLectura;

        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Funcion del boton regresar
  regresar(): void {
    this.router.navigateByUrl('/dashboard/usuarios');
  }

}
