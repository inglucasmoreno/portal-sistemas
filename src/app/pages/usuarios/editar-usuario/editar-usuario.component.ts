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
  public dependenciaSeleccionada: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dependenciasService: DependenciasService,
    private usuariosService: UsuariosService,
    private alertService: AlertService,
    private dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Editando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(4)]],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dependencia: [''],
      role: ['USER_ROLE', [Validators.required, Validators.minLength(4)]],
      activo: ['true', Validators.required],
    });

    this.alertService.loading();
    this.dependenciasService.listarDependencias({}).subscribe({
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
        const { usuario, apellido, nombre, telefono, dni, email, role, UsuariosDependencias, activo } = this.usuario;

        this.usuarioForm.patchValue({
          usuario,
          apellido,
          nombre,
          dni,
          telefono,
          dependencia: this.usuario?.UsuariosDependencias[0]?.dependencia?.id ? this.usuario?.UsuariosDependencias[0]?.dependencia?.id : "",
          email,
          role,
          activo: String(activo)
        });

        UsuariosDependencias.length > 0 ? this.dependenciasUsuario.push(UsuariosDependencias[0]?.dependencia) : null;

        this.alertService.close();

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Editar usuario
  editarUsuario(): void | boolean {

    if (this.usuarioForm.valid) {

      // Si el usuario no es administrador debe seleccionar una dependencia
      if (this.usuarioForm.value.role !== 'ADMIN_ROLE' && this.dependenciasUsuario.length === 0) {
        this.alertService.info('Debe seleccionar una dependencia');
        return;
      }

      this.usuarioForm.value.dependencia = this.usuarioForm.value.dependencia === '' ? '' : Number(this.usuarioForm.value.dependencia);

      let data: any = {
        ...this.usuarioForm.value,
        dependencias: this.usuarioForm.value !== 'ADMIN_ROLE' ? this.dependenciasUsuario.map(dep => dep.id) : [],
        creatorUserId: this.authService.usuario.userId
      };

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
    this.dependenciasService.listarDependencias({}).subscribe({
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

    // Verificacion: Dependencia repetida
    const dependenciaRepetida = this.dependenciasUsuario.find(dep => dep.id == this.dependenciaSeleccionada);
    if (dependenciaRepetida) {
      this.alertService.info('La dependencia ya fue asignada');
      return;
    }

    const dependencia = this.dependencias.find(dep => dep.id == this.dependenciaSeleccionada);
    this.dependenciasUsuario.push(dependencia);
    this.dependenciaSeleccionada = '';
    this.showDependencias = false;

  }

  // Eliminar dependencia
  eliminarDependencia(dependencia: any): void {
    this.dependenciasUsuario = this.dependenciasUsuario.filter(dep => dep.id != dependencia);
  }

  // Funcion del boton regresar
  regresar(): void {
    this.router.navigateByUrl('/dashboard/usuarios');
  }

}
