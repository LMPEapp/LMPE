import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AgendaOut } from '../../../Models/Agenda.model';
import { User } from '../../../Models/user.model';
import { toLocalDate } from '../../../Helper/date-utils';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-agenda-grid',
  templateUrl: './agenda-grid.html',
  styleUrls: ['./agenda-grid.scss'],
  imports:[
    CommonModule,
    MatButtonModule,
  ]
})
export class AgendaGridComponent {
  @ViewChild('agendaGrid') agendaGrid!: ElementRef<HTMLDivElement>;


  @Input() weekDays: Date[] = [];
  @Input() hours: string[] = [];
  @Input() agendas: AgendaOut[] = [];
  @Input() user?: User;

  @Output() editEvent = new EventEmitter<AgendaOut>();

  hourIndexes: number[];



  constructor(){
    const indexes: number[] = [];
    for (let i = 0; i < 48; i += 2) {
      indexes.push(i);
    }
    this.hourIndexes = indexes;
  }

  ngOnInit(): void {
    this.timer = setInterval(() => this.updateCurrentTimeLine(), 60000);
  }
  ngAfterViewInit(): void {
    this.updateCurrentTimeLine();
  }
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  currentTimeTop: string | null = null;
  private timer?: any;

  private updateCurrentTimeLine(): void {
    const now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    // totalMinutes : minutes écoulées depuis minuit
    const totalMinutes = hours * 60 + minutes;

    // nombre total de cellules = 48 pour 30 min
    const grid = this.agendaGrid.nativeElement;
    const gridHeight = grid.scrollHeight; // hauteur réelle (prend gap et responsive)
    const headerHeight = grid.querySelector('.grid-header')?.clientHeight || 30;
    const usableHeight = gridHeight - headerHeight;

    // position en pourcentage dans la zone horaire
    const top = headerHeight + (totalMinutes / (24 * 60)) * usableHeight;
    this.currentTimeTop = `${top}px`;
  }


  isMine(event: AgendaOut): boolean {
    return event.createdBy === this.user?.id;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }

  isEventOnDay(event: AgendaOut, day: Date): boolean {
    const start = toLocalDate(event.startDate);
    const end = toLocalDate(event.endDate);

    const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999);

    return start <= dayEnd && end >= dayStart;
  }

  getEventStyleByDay(event: AgendaOut, day: Date): { [key: string]: string } {
    const start = toLocalDate(event.startDate);
    const end = toLocalDate(event.endDate);

    const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(day); dayEnd.setHours(23,50,0,0);

    const rowStartDate = start > dayStart ? start : dayStart;
    const rowEndDate = end < dayEnd ? end : dayEnd;

    const startRow = rowStartDate.getHours()*2 + (rowStartDate.getMinutes()>=30?2:1) + 1;
    let endRow = rowEndDate.getHours()*2 + (rowEndDate.getMinutes()>=30?2:1) + 1;
    if (rowEndDate >= dayEnd) endRow = 50;

    const dayIndex = day.getDay() === 0 ? 7 : day.getDay();

    return { 'grid-column': `${dayIndex + 1}`, 'grid-row': `${startRow} / ${endRow}` };
  }
}
