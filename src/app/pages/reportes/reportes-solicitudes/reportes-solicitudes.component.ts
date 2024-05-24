import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import gsap from 'gsap';

@Component({
  standalone: true,
  selector: 'app-reportes-solicitudes',
  templateUrl: './reportes-solicitudes.component.html',
  styleUrls: []
})
export default class ReportesSolicitudesComponent implements OnInit {

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Reportes - Solicitudes';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
  }

}
