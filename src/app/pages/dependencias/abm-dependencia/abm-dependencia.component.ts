import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { DependenciasService } from '../../../services/dependencias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-abm-dependencia',
  templateUrl: './abm-dependencia.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export class AbmDependenciaComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  @Output()
  public updateEvent = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    public dependenciasService: DependenciasService,
  ) { }

  ngOnInit() {}

  nuevaDependencia(): void {

    // Verificacion
    if (this.dependenciasService.abmForm.descripcion === '') return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.dependenciasService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }
    this.dependenciasService.nuevaDependencia(data).subscribe({
      next: ({ dependencia }) => {
        this.insertEvent.emit(dependencia);
        this.dependenciasService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  actualizarDependencia(): void {

    // Verificacion
    if (this.dependenciasService.abmForm.descripcion === '') return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.dependenciasService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }

    this.dependenciasService.actualizarDependencia(this.dependenciasService.dependenciaSeleccionada.id, data).subscribe({
      next: ({ dependencia }) => {
        this.updateEvent.emit(dependencia);
        this.dependenciasService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  submit(): void {
    this.dependenciasService.estadoAbm === 'crear' ? this.nuevaDependencia() : this.actualizarDependencia();
  }

}
