import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {

  public usuarioLogin: any = null;

  public showSeccion = {
    configuraciones: false,
    reportes: false
  }

  constructor(
    public authService: AuthService,
    public dataService: DataService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.usuarioLogin = this.authService.usuario;
    // console.log(this.usuarioLogin);
  }

  mostrarOcultarSeccion(seccion = 'configuraciones'): void {
    this.showSeccion[seccion] = !this.showSeccion[seccion];
  }

  // Metodo: Cerrar sesion
  logout(): void { 
    // question 
    this.alertService.question({ msg: 'Cerrando sesión', buttonText: 'Aceptar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) this.authService.logout(); 
    });
  }

}
