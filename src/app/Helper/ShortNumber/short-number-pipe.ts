import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber'
})
export class ShortNumberFrPipe implements PipeTransform {
  transform(value: number, digits: number = 3): string {
    if (value === null || value === undefined) return '';

    const abs = Math.abs(value);

    if (abs < 1_000) return value.toFixed(digits);
    if (abs < 1_000_000) return (value / 1_000).toFixed(digits) + ' k';
    if (abs < 1_000_000_000) return (value / 1_000_000).toFixed(digits) + ' M';
    if (abs < 1_000_000_000_000) return (value / 1_000_000_000).toFixed(digits) + ' Md';
    return (value / 1_000_000_000_000).toFixed(digits) + ' Bn';
  }
}
