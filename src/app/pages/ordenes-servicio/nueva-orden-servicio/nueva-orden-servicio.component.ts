import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-nueva-orden-servicio',
  templateUrl: './nueva-orden-servicio.component.html',
  styleUrls: []
})
export default class NuevaOrdenServicioComponent implements OnInit {

  public ordenServicioForm  = {
    tipoOrdenServicioId: "",
    dependenciaId: "",
    creatorUser: this.authService.usuario.userId
  }

  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = "Solicitud de asistencia";
  }

}
