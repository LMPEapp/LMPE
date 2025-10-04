import { Component, OnInit, ViewChild } from '@angular/core';
import { AgendaIn, AgendaOut } from './../../Models/Agenda.model';
import { AgendaEdition } from './agenda-edition/agenda-edition';
import { AgendaAccessApi } from '../../service/AccessAPi/AgendaAccessapi/agenda-accessapi';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MyLocalDatePipe } from '../../Helper/myLocalDate/my-local-date-pipe';
import { CommonModule } from '@angular/common';
import { User } from '../../Models/user.model';
import { AuthService } from '../../service/Auth/auth';
import { toLocalDate } from '../../Helper/date-utils';
import { AgendaSignalRService } from '../../service/SignalR/AgendaSignalRService/agenda-signal-rservice';

@Component({
  selector: 'app-agenda-page',
  templateUrl: './agenda-page.html',
  styleUrls: ['./agenda-page.scss'],
  imports: [
    MatIcon,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MyLocalDatePipe,
    AgendaEdition],
})
export class AgendaPage implements OnInit {

  @ViewChild(AgendaEdition) AgendaEdition!: AgendaEdition;

  agendas: AgendaOut[] = [];
  isLoading = false;
  errorMessage = '';
  agendaSelected: AgendaOut | null = null;

  currentMonday!: Date;
  currentSunday!: Date;
  weekDays: Date[] = [];
  hours: string[] = [];

  user: User | undefined;

  constructor(private agendaAccessApi: AgendaAccessApi, private snackBar: MatSnackBar, public auth: AuthService,private agendaHub: AgendaSignalRService) {
    this.user = auth.loginData?.user;
  }

  ngOnInit(): void {
    this.setToday();

    this.agendaHub.startConnection(localStorage.getItem('token') || '')
    .then(() => {
      this.agendaHub.joinAgendasGlobal();
    });

    this.agendaHub.agendaCreated$.subscribe(agd => {
      if(agd){
        if (!this.agendas.find(a => a.id === agd.id)) {
          // trouver l'index où l'insérer pour garder l'ordre croissant par id
          this.agendas.push(agd);
          console.log("Add Agenda:", agd);
        }
      }
    });

    this.agendaHub.agendaUpdated$.subscribe(agd => {
      if(agd){
        const index = this.agendas.findIndex(a => a.id === agd.id);
        if (index != -1) {
          this.agendas[index] = agd;
          console.log("Update Agenda:", agd);
        }
      }

    });

    this.agendaHub.agendaDeleted$.subscribe(id => {
      if(id){
        const index = this.agendas.findIndex(a => a.id === id);
        if (index != -1) {
          this.agendas.splice(index, 1);
          console.log("Delete Agenda:", id);
        }
      }
    });
  }
  ngOnDestroy() {
    this.agendaHub.leaveAgendasGlobal();
  }

  isMine(agenda: AgendaOut): boolean {
    return agenda.createdBy === this.user?.id;
  }
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate();
  }
  // Vérifie si la semaine affichée est la semaine actuelle
  isCurrentWeek(): boolean {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // lundi
    startOfWeek.setHours(0,0,0,0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    return this.currentMonday >= startOfWeek && this.currentSunday <= endOfWeek;
  }

  /** Génère les jours de la semaine */
  generateWeekDays() {
    this.weekDays = [];
    const monday = new Date(this.currentMonday);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      this.weekDays.push(d);
    }
  }

  /** Génère les demi-heures */
  generateHours() {
    this.hours = Array.from({ length: 48 }, (_, i) => {
      const h = Math.floor(i / 2);
      const m = i % 2 === 0 ? '00' : '30';
      return `${h.toString().padStart(2, '0')}:${m}`;
    });
  }

  setToday(){
    const today = new Date();
    this.setWeek(today);
    this.generateWeekDays();
    this.generateHours();
    this.loadAgendas();
  }
  /** Définit le lundi et dimanche */
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

  /** Charge les agendas */
  loadAgendas(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.agendaAccessApi.getAll(this.currentMonday, this.currentSunday).subscribe({
      next: data => { this.agendas = data; this.isLoading = false; },
      error: err => { this.errorMessage = 'Impossible de charger les agendas.'; this.isLoading = false; }
    });
  }

  /** Vérifie si l'événement touche ce jour */
  isEventOnDay(event: AgendaOut, day: Date): boolean {
    const start = toLocalDate(event.startDate);
    const end = toLocalDate(event.endDate);

    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return start <= dayEnd && end >= dayStart;
  }

  /** Calcule style pour un événement sur un jour précis */
  getEventStyleByDay(event: AgendaOut, day: Date): { [key: string]: string } {
    const start = toLocalDate(event.startDate);
    const end = toLocalDate(event.endDate);

    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 50, 0, 0);

    // startRow = max(événement start, début du jour)
    const rowStartDate = start > dayStart ? start : dayStart;
    const rowEndDate = end < dayEnd ? end : dayEnd;

    const startRow = rowStartDate.getHours() * 2 + (rowStartDate.getMinutes() >= 30 ? 2 : 1) + 1;
    let endRow = rowEndDate.getHours() * 2 + (rowEndDate.getMinutes() >= 30 ? 2 : 1) + 1;

    if (rowEndDate >= dayEnd) {
      endRow = 50;
    }

    const dayIndex = day.getDay() === 0 ? 7 : day.getDay();

    return {
      'grid-column': `${dayIndex + 1}`,
      'grid-row': `${startRow} / ${endRow}`,
    };
  }


  // Dans AgendaPage
  getFullHours(): string[] {
    return this.hours.filter((_, i) => i % 2 === 0);
  }
  // renvoie les index de lignes pour chaque heure (0,2,4,... pour les 48 demi-heures)
  getHourIndexes(): number[] {
    const indexes: number[] = [];
    for (let i = 0; i < 48; i += 2) {
      indexes.push(i);
    }
    return indexes;
  }



  getDayNameShort(day: Date): string {
    return day.toLocaleDateString('fr-FR', { weekday: 'short' });
  }

  /** Navigation semaine */
  prevWeek(): void { this.changeWeek(-7); }
  nextWeek(): void { this.changeWeek(7); }
  private changeWeek(offset: number) {
    const newDate = new Date(this.currentMonday);
    newDate.setDate(newDate.getDate() + offset);
    this.setWeek(newDate);
    this.generateWeekDays();
    this.loadAgendas();
  }

  onAdd() {
    this.agendaSelected = null;
    this.AgendaEdition.onOpen();
  }
  onEditEvenement(event: AgendaOut) {
    this.agendaSelected = event;
    this.AgendaEdition.onOpen(event);
  }

  onDeleteElement(agendaId: number){
    this.agendaAccessApi.delete(agendaId).subscribe({
        next: () => { this.snackBar.open('Événement Suprimé ✅', 'Fermer', { duration: 3000 }); }
      });
  }

  handleUserSubmit(agendaData: AgendaIn) {
    if (this.agendaSelected) {
      this.agendaAccessApi.update(this.agendaSelected.id, agendaData).subscribe({
        next: () => { this.snackBar.open('Événement modifié ✅', 'Fermer', { duration: 3000 }); }
      });
    } else {
      this.agendaAccessApi.create(agendaData).subscribe({
        next: () => { this.snackBar.open('Événement créé ✅', 'Fermer', { duration: 3000 }); }
      });
    }
  }
}
