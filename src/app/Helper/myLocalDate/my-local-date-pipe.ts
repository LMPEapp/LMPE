import { Pipe, PipeTransform } from '@angular/core';
import { toLocalDate } from '../date-utils';

@Pipe({
  name: 'myLocalDate',
  standalone: true
})
export class MyLocalDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';
    const date = toLocalDate(value);
    return date.toLocaleDateString(); // ou toLocaleString() si tu veux date + heure
  }
}
