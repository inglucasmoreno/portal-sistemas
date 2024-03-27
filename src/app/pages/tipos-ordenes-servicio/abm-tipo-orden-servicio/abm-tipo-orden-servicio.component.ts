import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { RouterModule } from '@angular/router';
import { TiposOrdenServicioService } from '../../../services/tipos-orden-servicio.service';

@Component({
  standalone: true,
  selector: 'app-abm-tipo-orden-servicio',
  templateUrl: './abm-tipo-orden-servicio.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export default class AbmTipoOrdenServicioComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  @Output()
  public updateEvent = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    public tiposOrdenServicioService: TiposOrdenServicioService,
  ) { }

  ngOnInit() {}

  nuevoTipo(): void {

    // Verificacion
    if (this.tiposOrdenServicioService.abmForm.descripcion === '') return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.tiposOrdenServicioService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }
    this.tiposOrdenServicioService.nuevoTipo(data).subscribe({
      next: ({ tipo }) => {
        this.insertEvent.emit(tipo);
        this.tiposOrdenServicioService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  actualizarTipo(): void {

    // Verificacion
    if (this.tiposOrdenServicioService.abmForm.descripcion === '') return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.tiposOrdenServicioService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }

    this.tiposOrdenServicioService.actualizarTipo(this.tiposOrdenServicioService.tipoSeleccionado.id, data).subscribe({
      next: ({ tipo }) => {
        this.updateEvent.emit(tipo);
        this.tiposOrdenServicioService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  submit(): void {
    this.tiposOrdenServicioService.estadoAbm === 'crear' ? this.nuevoTipo() : this.actualizarTipo();
  }

}
