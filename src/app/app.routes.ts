import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  // Default
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  // Login
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./auth/login/login.component'),
  },

  // Inicializacion
  {
    path: 'init',
    title: 'Inicializacion',
    loadComponent: () => import('./inicializacion/inicializacion.component'),
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/pages.component'),
    canActivate: [AuthGuard],
    children: [

      // Home
      {
        path: 'home',
        title: 'Inicio',
        loadComponent: () => import('./pages/home/home.component'),
      },

      // Perfil
      {
        path: 'perfil',
        title: 'Perfil',
        loadComponent: () => import('./pages/perfil/perfil.component'),
      },

      // Usuarios

      {
        path: 'usuarios',
        title: 'Usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.component'),
      },

      {
        path: 'usuarios/nuevo',
        title: 'Nuevo usuario',
        loadComponent: () => import('./pages/usuarios/nuevo-usuario/nuevo-usuario.component'),
      },

      {
        path: 'usuarios/editar/:id',
        title: 'Editar usuario',
        loadComponent: () => import('./pages/usuarios/editar-usuario/editar-usuario.component'),
      },

      {
        path: 'usuarios/password/:id',
        title: 'Editar password',
        loadComponent: () => import('./pages/usuarios/editar-password/editar-password.component'),
      },

      // Mi bandeja

      {
        path: 'miBandeja',
        title: 'Mi bandeja',
        loadComponent: () => import('./pages/mi-bandeja/mi-bandeja.component'),
      },

      // Dependencias

      {
        path: 'dependencias',
        title: 'Dependencias',
        loadComponent: () => import('./pages/dependencias/dependencias.component'),
      },

      // Tipos de orden de servicio

      {
        path: 'tiposOrdenServicio',
        title: 'Tipos de ordenes',
        loadComponent: () => import('./pages/tipos-ordenes-servicio/tipos-ordenes-servicio.component'),
      },

      // Ordenes de servicio

      {
        path: 'ordenesServicio',
        title: 'Solicitudes de asistencia',
        loadComponent: () => import('./pages/ordenes-servicio-final/ordenes-servicio-final.component'),
      },

      {
        path: 'ordenServicio/nueva',
        title: 'Nueva solicitud',
        loadComponent: () => import('./pages/ordenes-servicio-final/nueva-orden-servicio-final/nueva-orden-servicio-final.component'),
      },

      {
        path: 'ordenServicio/detalles/:id',
        title: 'Detalles de solicitud',
        loadComponent: () => import('./pages/ordenes-servicio-final/detalles-orden-servicio-final/detalles-orden-servicio-final.component'),
      },

      // Reportes

      {
        path: 'reportes/solicitudes-asistencia',
        title: 'Reporte - Solicitudes',
        loadComponent: () => import('./pages/reportes/reportes-solicitudes/reportes-solicitudes.component'),
      },


    ]
  },

  // Error Page
  {
    path: '**',
    title: 'Error',
    loadComponent: () => import('./error-page/error-page.component'),
  },

];
