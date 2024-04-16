import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalComponent } from '../../../components/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-detalles-orden-servicio-final',
  templateUrl: './detalles-orden-servicio-final.component.html',
  styleUrls: [],
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    CommonModule
  ]
})
export default class DetallesOrdenServicioFinalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
