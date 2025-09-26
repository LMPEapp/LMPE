// src/app/Helper/DatePipe/date-utils.ts
export function toLocalDate(value: string | Date): Date {
  if (!value) throw new Error('Invalid date');
  if (typeof value === 'string') {
    // Ajouter 'Z' pour indiquer que c'est UTC
    return new Date(value + 'Z');
  }
  return value;
}
