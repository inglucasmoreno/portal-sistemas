import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ModalComponent,
    CommonModule
  ],
  styleUrls: []
})
export default class NuevoUsuarioComponent implements OnInit {

  // Dependencias - Usuarios
  public showDependencias: boolean = false;
  public dependenciasUsuario: any[] = [];
  public dependencias: any[] = [];
  public dependenciaSeleccionada: string = null;

  get usuario() {
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

  // Modelo reactivo
  public usuarioForm: FormGroup;

  constructor(private fb: FormBuilder,
    private router: Router,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private dependenciasService: DependenciasService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {

    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Creando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(4)]],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      asignableSolicitud: ['false'],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      repetir: ['', [Validators.required, Validators.minLength(4)]],
      role: ['ADMIN_ROLE', Validators.required],
    });

    this.alertService.loading();
    this.dependenciasService.listarDependencias({
      activo: 'true'
    }).subscribe({
      next: ({ dependencias }) => {
        this.dependencias = dependencias;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Crear nuevo usuario
  nuevoUsuario(): void {

    const { password, repetir } = this.usuarioForm.value;

    // Se verifica si las contraseñas coinciden
    if (password !== repetir) {
      this.alertService.info('Las contraseñas deben coincidir');
      return;
    }

    // El usuario debe seleccionar una dependencia
    if (this.dependenciasUsuario.length === 0) {
      this.alertService.info('Debe seleccionar una dependencia');
      return;
    }

    // Se genera la DATA de dependencias
    let dependencias = [];
    this.dependenciasUsuario.forEach(dep => {
      dependencias.push({
        id: dep.id,
        soloLectura: dep.soloLectura
      });
    });

    // Generamos el DATA - USUARIO
    const dataUsuario = {
      ...this.usuarioForm.value,
      dependencias: this.usuarioForm.value !== 'ADMIN_ROLE' ? dependencias : [],
      creatorUserId: this.authService.usuario.userId
    };

    // Adaptando Booleans
    dataUsuario.asignableSolicitud = dataUsuario.asignableSolicitud === 'true' ? true : false;

    delete dataUsuario.repetir;

    if (this.usuarioForm.valid) {
      this.alertService.loading();
      this.usuariosService.nuevoUsuario(dataUsuario).subscribe({
        next: () => {
          this.router.navigateByUrl('dashboard/usuarios');
          this.alertService.close();
        }, error: ({ error }) => {
          this.alertService.errorApi(error.message);
        }
      })
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
      next: () => {
        this.dependenciaSeleccionada = null;
        this.showDependencias = true;
        this.alertService.close();
      }, error: () => this.alertService.errorApi('Error al cargar dependencias')
    });
  }

  // Agregar dependencia
  agregarDependencia(): void {

    // Verificacion: Dependencia seleccionada
    if (!this.dependenciaSeleccionada) {
      this.alertService.info('Debe seleccionar una dependencia');
      return;
    }

    // Verificacion: Dependencia repetida
    const dependenciaRepetida = this.dependenciasUsuario.find(dep => dep.id == this.dependenciaSeleccionada);
    if (dependenciaRepetida) {
      this.alertService.info('La dependencia ya fue asignada');
      return;
    }

    const dependencia = this.dependencias.find(item => item.id == this.dependenciaSeleccionada);
    this.dependenciasUsuario.push({...dependencia, soloLectura: false});
    this.dependenciaSeleccionada = null;
    this.dependencias = this.dependencias.filter(item => item.id != dependencia.id);
    this.dependenciasUsuario.sort((a, b) => a.nombre > b.nombre ? 1 : -1);

  }

  // Activar/Desactivar solo lectura
  soloLectura(dependencia): void {
    dependencia.soloLectura = !dependencia.soloLectura;
  }

  // Eliminar dependencia
  eliminarDependencia(dependencia: any): void {
    this.dependencias.push(dependencia);
    this.dependenciasUsuario = this.dependenciasUsuario.filter(item => item.id != dependencia.id);
    this.dependencias.sort((a, b) => a.nombre > b.nombre ? 1 : -1);
  }

  cambiarRole(): void {
    this.usuarioForm.value.role === 'TECHNICAL_ROLE' ? this.usuarioForm.patchValue({ asignableSolicitud: 'true' }) : this.usuarioForm.patchValue({ asignableSolicitud: 'false' });
  }

}
