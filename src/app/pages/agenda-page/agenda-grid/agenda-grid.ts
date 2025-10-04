import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() weekDays: Date[] = [];
  @Input() hours: string[] = [];
  @Input() agendas: AgendaOut[] = [];
  @Input() user?: User;

  @Output() editEvent = new EventEmitter<AgendaOut>();

  hourIndexes;

  constructor(){
    const indexes: number[] = [];
    for (let i = 0; i < 48; i += 2) {
      indexes.push(i);
    }
    this.hourIndexes = indexes;
  }

  ngOnInit(): void {

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
