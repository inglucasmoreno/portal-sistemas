import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: []
})
export default class HomeComponent implements OnInit {

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    console.log(this.authService.usuario);
    this.dataService.ubicacionActual = 'Dashboard - Inicio';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
  }

}
