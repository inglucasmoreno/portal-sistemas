import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  standalone: true,
  name: 'fechaHora'
})
export class FechaHoraPipe implements PipeTransform {
  transform(fecha: any): string {
    return format(new Date(fecha), 'dd/MM/yyyy HH:mm') === '01/01/1970 00:00' ? 'SIN ESPECIFICAR' : format(new Date(fecha), 'dd/MM/yyyy HH:mm')
  }
}
