import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/ordenes-servicio-to-tecnicos';

@Injectable({
  providedIn: 'root'
})
export class OrdenesServicioToTecnicosService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getOrdenTecnico(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarOrdenesTecnicos({ 
    direccion = 'asc', 
    columna = 'id', 
    tecnico = '',
    parametro = '',
    activo = '' 
  }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        tecnico,
        parametro,
        activo
      },
      headers: this.getToken
    })
  }

  nuevaOrdenTecnico(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarOrdenTecnico(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
