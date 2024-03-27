import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroOrdenesServicioPipe } from '../../pipes/filtro-ordenes-servicio.pipe';

@Component({
  standalone: true,
  selector: 'app-ordenes-servicio-final',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroOrdenesServicioPipe
  ],
  templateUrl: './ordenes-servicio-final.component.html',
  styleUrls: []
})
export class OrdenesServicioFinalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
