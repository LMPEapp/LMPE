import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";

import { AgendaEdition } from './agenda-edition/agenda-edition';
import { WeekSelectorComponent } from "./week-selector/week-selector";
import { AgendaGridComponent } from "./agenda-grid/agenda-grid";

import { AgendaIn, AgendaOut } from './../../Models/Agenda.model';
import { AgendaAccessApi } from '../../service/AccessAPi/AgendaAccessapi/agenda-accessapi';
import { AgendaSignalRService } from '../../service/SignalR/AgendaSignalRService/agenda-signal-rservice';
import { AuthService } from '../../service/Auth/auth';
import { toLocalDate } from '../../Helper/date-utils';
import { User } from '../../Models/user.model';
import { Subscription } from 'rxjs';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-agenda-page',
  templateUrl: './agenda-page.html',
  styleUrls: ['./agenda-page.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    WeekSelectorComponent,
    AgendaGridComponent,
    AgendaEdition,
    MatProgressSpinner
],
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
  private visibilityHandler?: () => void;

  private createdSub?: Subscription;
  private updatedSub?: Subscription;
  private deletedSub?: Subscription;
  isLoading: boolean = false;

  constructor(
    private agendaAccessApi: AgendaAccessApi,
    private snackBar: MatSnackBar,
    private agendaHub: AgendaSignalRService,
    private auth: AuthService
  ) {
    this.user = auth.loginData?.user;
  }

  // ─────────────────────────────
  // 🚀 Cycle de vie
  // ─────────────────────────────
  ngOnInit(): void {
    this.init();

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        console.log('🌐 Page revenue au premier plan → Vérification SignalR');
        this.loadAgendas();
        this.ensureSignalRConnected();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    this.createdSub?.unsubscribe();
    this.updatedSub?.unsubscribe();
    this.deletedSub?.unsubscribe();
    this.agendaHub.leaveAgendasGlobal();

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  // ─────────────────────────────
  // ⚙️ Initialisation principale
  // ─────────────────────────────
  private init(): void {
    this.setToday();
    this.subscibeSignalR();
    this.ensureSignalRConnected();
  }

  // ─────────────────────────────
  // 🔗 Connexion SignalR
  // ─────────────────────────────
  private async ensureSignalRConnected(): Promise<void> {
    const state = this.agendaHub.connectionState;

    if (state === 'Connected' || state === 'Connecting' || state === 'Reconnecting') {
      console.log(`⏸️ SignalR déjà actif (${state})`);
      return;
    }

    console.log('🚀 Démarrage SignalR...');
    await this.agendaHub.startConnection(localStorage.getItem('token') || '');
    this.agendaHub.joinAgendasGlobal();
  }

  private subscibeSignalR(): void {
    this.createdSub?.unsubscribe();
    this.updatedSub?.unsubscribe();
    this.deletedSub?.unsubscribe();

    this.createdSub = this.agendaHub.agendaCreated$.subscribe(agd => {
      if (!agd) return;

      if (!this.agendas.find(a => a.id === agd.id)) {
        if (agd.isPublic || agd.createdBy === this.user?.id) {
          this.agendas.push(agd);
        }
      }
    });

    this.updatedSub = this.agendaHub.agendaUpdated$.subscribe(agd => {
      if (!agd) return;

      if (!agd.isPublic && agd.createdBy !== this.user?.id) {
        this.agendas = this.agendas.filter(a => a.id !== agd.id);
        return;
      }

      const index = this.agendas.findIndex(a => a.id === agd.id);
      if (index !== -1) {
        this.agendas[index] = agd;
      } else {
        this.agendas.push(agd);
      }
    });

    this.deletedSub = this.agendaHub.agendaDeleted$.subscribe(id => {
      if (!id) return;
      this.agendas = this.agendas.filter(a => a.id !== id);
    });
  }

  // ─────────────────────────────
  // 📅 Gestion des semaines
  // ─────────────────────────────
  setToday(): void {
    const today = new Date();
    this.setWeek(today);
    this.generateWeekDays();
    this.generateHours();
    this.loadAgendas();
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

  prevWeek(): void { this.changeWeek(-7); }
  nextWeek(): void { this.changeWeek(7); }

  changeWeek(offset: number): void {
    const newDate = new Date(this.currentMonday);
    newDate.setDate(newDate.getDate() + offset);
    this.setWeek(newDate);
    this.generateWeekDays();
    this.loadAgendas();
  }

  // ─────────────────────────────
  // 📡 Chargement / API
  // ─────────────────────────────
  loadAgendas(): void {
    this.isLoading = true;
    this.agendaAccessApi.getAll(this.currentMonday, this.currentSunday).subscribe({
      next: (data) => {
        this.agendas = data;
        console.log(this.agendas);
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 401) this.auth.logout();
        this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  // ─────────────────────────────
  // 🧩 Actions UI
  // ─────────────────────────────
  onAdd(): void {
    this.agendaSelected = null;
    this.AgendaEdition.onOpen();
  }

  onEditEvenement(event: AgendaOut): void {
    this.agendaSelected = event;
    this.AgendaEdition.onOpen(event);
  }

  onDeleteElement(agendaId: number): void {
    this.agendaAccessApi.delete(agendaId).subscribe({
      next: () => this.snackBar.open('Événement supprimé ✅', 'Fermer', { duration: 3000 }),
      error: (err) => {
        if (err.status === 401) this.auth.logout();
        this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  handleUserSubmit(agendaData: AgendaIn): void {
    if (this.agendaSelected) {
      this.agendaAccessApi.update(this.agendaSelected.id, agendaData).subscribe({
        next: () => this.snackBar.open('Événement modifié ✅', 'Fermer', { duration: 3000 }),
        error: (err) => {
          if(err.status === 401) {
            this.auth.logout();
          }
          this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
        }
      });
    } else {
      this.agendaAccessApi.create(agendaData).subscribe({
        next: () => this.snackBar.open('Événement créé ✅', 'Fermer', { duration: 3000 }),
        error: (err) => {
          if(err.status === 401) {
            this.auth.logout();
          }
          this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
        }
      });
    }
  }

  // ─────────────────────────────
  // 🎨 Positionnement dans la grille
  // ─────────────────────────────
  getEventStyleByDay(event: AgendaOut, day: Date): { [key: string]: string } {
    const start = toLocalDate(event.startDate);
    const end = toLocalDate(event.endDate);

    const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day); dayEnd.setHours(23, 50, 0, 0);

    const rowStartDate = start > dayStart ? start : dayStart;
    const rowEndDate = end < dayEnd ? end : dayEnd;

    const startRow = rowStartDate.getHours() * 2 + (rowStartDate.getMinutes() >= 30 ? 2 : 1) + 1;
    let endRow = rowEndDate.getHours() * 2 + (rowEndDate.getMinutes() >= 30 ? 2 : 1) + 1;
    if (rowEndDate >= dayEnd) endRow = 50;

    const dayIndex = day.getDay() === 0 ? 7 : day.getDay();

    return { 'grid-column': `${dayIndex + 1}`, 'grid-row': `${startRow} / ${endRow}` };
  }
}
