import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AgendaIn, AgendaOut } from './../../Models/Agenda.model';
import { AgendaEdition } from './agenda-edition/agenda-edition';
import { AgendaAccessApi } from '../../service/AccessAPi/AgendaAccessapi/agenda-accessapi';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../Models/user.model';
import { AuthService } from '../../service/Auth/auth';
import { toLocalDate } from '../../Helper/date-utils';
import { AgendaSignalRService } from '../../service/SignalR/AgendaSignalRService/agenda-signal-rservice';
import { WeekSelectorComponent } from "./week-selector/week-selector";
import { AgendaGridComponent } from "./agenda-grid/agenda-grid";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-agenda-page',
  templateUrl: './agenda-page.html',
  styleUrls: ['./agenda-page.scss'],
  imports: [WeekSelectorComponent, AgendaGridComponent, MatIconModule, AgendaEdition],
})
export class AgendaPage implements OnInit, OnDestroy {

  @ViewChild(AgendaEdition) AgendaEdition!: AgendaEdition;

  agendas: AgendaOut[] = [];
  agendaSelected: AgendaOut | null = null;

  currentMonday!: Date;
  currentSunday!: Date;
  weekDays: Date[] = [];
  hours: string[] = [];

  user?: User;

  constructor(
    private agendaAccessApi: AgendaAccessApi,
    private snackBar: MatSnackBar,
    public auth: AuthService,
    private agendaHub: AgendaSignalRService
  ) {
    this.user = auth.loginData?.user;
  }

  ngOnInit(): void {
    this.setToday();

    this.agendaHub.startConnection(localStorage.getItem('token') || '')
      .then(() => this.agendaHub.joinAgendasGlobal());

    this.agendaHub.agendaCreated$.subscribe(agd => {
      if (agd && !this.agendas.find(a => a.id === agd.id)) this.agendas.push(agd);
    });

    this.agendaHub.agendaUpdated$.subscribe(agd => {
      if (agd) {
        const index = this.agendas.findIndex(a => a.id === agd.id);
        if (index !== -1) this.agendas[index] = agd;
      }
    });

    this.agendaHub.agendaDeleted$.subscribe(id => {
      if (id) this.agendas = this.agendas.filter(a => a.id !== id);
    });
  }

  ngOnDestroy(): void {
    this.agendaHub.leaveAgendasGlobal();
  }

  setToday(): void {
    const today = new Date();
    this.setWeek(today);
    this.generateWeekDays();
    this.generateHours();
    this.loadAgendas();
  }

  private setWeek(reference: Date): void {
    const day = reference.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    this.currentMonday = new Date(reference);
    this.currentMonday.setHours(0, 0, 0, 0);
    this.currentMonday.setDate(this.currentMonday.getDate() + diffToMonday);

    this.currentSunday = new Date(this.currentMonday);
    this.currentSunday.setDate(this.currentMonday.getDate() + 6);
    this.currentSunday.setHours(23, 59, 59, 999);
  }

  generateWeekDays(): void {
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.currentMonday);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  generateHours(): void {
    this.hours = Array.from({ length: 48 }, (_, i) => {
      const h = Math.floor(i / 2);
      const m = i % 2 === 0 ? '00' : '30';
      return `${h.toString().padStart(2, '0')}:${m}`;
    });
  }

  loadAgendas(): void {
    this.agendaAccessApi.getAll(this.currentMonday, this.currentSunday).subscribe({
      next: data => this.agendas = data,
      error: () => this.snackBar.open('Impossible de charger les agendas.', 'Fermer', { duration: 3000 })
    });
  }

  isMine(agenda: AgendaOut): boolean {
    return agenda.createdBy === this.user?.id;
  }

  isCurrentWeek(): boolean {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.currentMonday >= startOfWeek && this.currentSunday <= endOfWeek;
  }

  prevWeek(): void { this.changeWeek(-7); }
  nextWeek(): void { this.changeWeek(7); }

  changeWeek(offset: number): void {
    const newDate = new Date(this.currentMonday);
    newDate.setDate(newDate.getDate() + offset);
    this.setWeek(newDate);
    this.generateWeekDays();
    this.loadAgendas();
  }

  onAdd(): void { this.agendaSelected = null; this.AgendaEdition.onOpen(); }
  onEditEvenement(event: AgendaOut): void { this.agendaSelected = event; this.AgendaEdition.onOpen(event); }

  onDeleteElement(agendaId: number): void {
    this.agendaAccessApi.delete(agendaId).subscribe({
      next: () => this.snackBar.open('Événement Supprimé ✅', 'Fermer', { duration: 3000 })
    });
  }

  handleUserSubmit(agendaData: AgendaIn): void {
    if (this.agendaSelected) {
      this.agendaAccessApi.update(this.agendaSelected.id, agendaData).subscribe({
        next: () => this.snackBar.open('Événement modifié ✅', 'Fermer', { duration: 3000 })
      });
    } else {
      this.agendaAccessApi.create(agendaData).subscribe({
        next: () => this.snackBar.open('Événement créé ✅', 'Fermer', { duration: 3000 })
      });
    }
  }

  getEventStyleByDay(event: AgendaOut, day: Date): { [key: string]: string } {
    const start = toLocalDate(event.startDate);
    const end = toLocalDate(event.endDate);

    const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(day); dayEnd.setHours(23,50,0,0);

    const rowStartDate = start > dayStart ? start : dayStart;
    const rowEndDate = end < dayEnd ? end : dayEnd;

    const startRow = rowStartDate.getHours() * 2 + (rowStartDate.getMinutes() >= 30 ? 2 : 1) + 1;
    let endRow = rowEndDate.getHours() * 2 + (rowEndDate.getMinutes() >= 30 ? 2 : 1) + 1;
    if (rowEndDate >= dayEnd) endRow = 50;

    const dayIndex = day.getDay() === 0 ? 7 : day.getDay();

    return { 'grid-column': `${dayIndex + 1}`, 'grid-row': `${startRow} / ${endRow}` };
  }

}
