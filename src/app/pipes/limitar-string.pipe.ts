import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'limitarString'
})
export class LimitarStringPipe implements PipeTransform {

  transform(value: any, cantidad: number): any {

    // Limitar string y devolverlo con puntos suspensivos
    if (value.length > cantidad) {
      return value.substring(0, cantidad) + '...';
    } else {
      return value;
    }

    return null;
  }

}
