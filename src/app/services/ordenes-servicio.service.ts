import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/ordenes-servicio';

@Injectable({
  providedIn: 'root'
})
export class OrdenesServicioService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getOrden(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarOrdenes({ direccion = 'desc', columna = 'createdAt' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: this.getToken
    })
  }

  nuevaOrden(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarOrden(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
