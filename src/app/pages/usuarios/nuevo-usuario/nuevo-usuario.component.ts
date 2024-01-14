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

@Component({
  standalone: true,
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule
  ],
  styleUrls: []
})
export default class NuevoUsuarioComponent implements OnInit {

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

  public dependencias: any[] = [];

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
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dependencia: [''],
      password: ['', [Validators.required, Validators.minLength(4)]],
      repetir: ['', [Validators.required, Validators.minLength(4)]],
      role: ['ADMIN_ROLE', Validators.required],
    });

    this.alertService.loading();
    this.dependenciasService.listarDependencias({}).subscribe({
      next: ({dependencias}) => {
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

    // Se verifica si un usuario estandar tiene seleccionada una dependencia
    if (this.usuarioForm.value.role === 'USER_ROLE' && this.usuarioForm.value.dependencia === '') {
      this.alertService.info('Debe seleccionar una dependencia');
      return;
    }

    // Generar una constante data con usuarioForm sin el campo repetir
    const data = {...this.usuarioForm.value, creatorUserId: this.authService.usuario.userId};
    delete data.repetir;

    if (this.usuarioForm.valid) {
      this.alertService.loading();  // Comienzo de loading
      this.usuariosService.nuevoUsuario(data).subscribe({
        next: () => {
          this.router.navigateByUrl('dashboard/usuarios');
          this.alertService.close();  // Finaliza el loading
        }, error: ({ error }) => {
          this.alertService.errorApi(error.message);
        }
      })
    } else {
      this.usuarioForm.markAllAsTouched();
    }

  }

}
