import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';

const urlApi = environments.base_url + '/ordenes-servicio-historial';

@Injectable({
  providedIn: 'root'
})
export class OrdenesServicioHistorialService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getRelacion(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarRelaciones({ 
    direccion = 'desc', 
    columna = 'createdAt',
    estado = '',
    dependencia = '',
    pagina = 1,
    itemsPorPagina = 100000,
  }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        estado,
        dependencia
      },
      headers: this.getToken
    })
  }

  nuevaRelacion(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarRelacion(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
