import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber'
})
export class ShortNumberFrPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) return '';

    const abs = Math.abs(value);

    if (abs < 1_000) return value.toFixed(3);
    if (abs < 1_000_000) return (value / 1_000).toFixed(3) + ' k';
    if (abs < 1_000_000_000) return (value / 1_000_000).toFixed(3) + ' M';
    if (abs < 1_000_000_000_000) return (value / 1_000_000_000).toFixed(3) + ' Md';
    // plus grand que 1 trillion
    return (value / 1_000_000_000_000).toFixed(3) + ' Bn';
  }
}
