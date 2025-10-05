export class DateOnly {
  year: number;
  month: number;
  day: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  /**
   * Crée un DateOnly à partir d'un objet Date JS
   */
  static fromDate(date: Date): DateOnly {
    return new DateOnly(
      date.getFullYear(),
      date.getMonth() + 1, // ⚠️ +1 car JS commence les mois à 0
      date.getDate()
    );
  }
  /**
   * Crée un DateOnly à partir d'une string "YYYY-MM-DD"
   */
  static fromString(dateStr: string): DateOnly {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new DateOnly(year, month, day);
  }

  /**
   * Convertit en string au format "YYYY-MM-DD"
   */
  toString(): string {
    const mm = this.month.toString().padStart(2, '0');
    const dd = this.day.toString().padStart(2, '0');
    return `${this.year}-${mm}-${dd}`;
  }

  /**
   * Convertit en objet Date (local, à minuit)
   */
  toDate(): Date {
    return new Date(this.year, this.month - 1, this.day, 0, 0, 0);
  }
  isBefore(other: DateOnly): boolean {
    return this.toDate().getTime() < other.toDate().getTime();
  }

  isAfter(other: DateOnly): boolean {
    return this.toDate().getTime() > other.toDate().getTime();
  }

  isEqual(other: DateOnly): boolean {
    return this.year === other.year && this.month === other.month && this.day === other.day;
  }

  isBetween(start: DateOnly, end: DateOnly): boolean {
    return !this.isBefore(start) && !this.isAfter(end);
  }
}
