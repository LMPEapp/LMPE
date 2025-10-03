import { Pipe, PipeTransform } from '@angular/core';
import { toLocalDate } from '../date-utils';

@Pipe({
  name: 'myRelativeDate',
  standalone: true
})
export class MyRelativeDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = toLocalDate(value);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const hoursLeft = diffHours % 24;

    if (diffMinutes < 1) return 'à l’instant';
    if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays < 7) {
        return `il y a ${diffDays} j${hoursLeft > 0 ? ' ' + hoursLeft + ' h' : ''}`;
    }

    return date.toLocaleDateString();
  }

}
