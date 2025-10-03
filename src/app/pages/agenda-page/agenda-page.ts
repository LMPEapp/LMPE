import { AgendaIn, AgendaOut } from './../../Models/Agenda.model';
import { AgendaEdition } from './agenda-edition/agenda-edition';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AgendaAccessApi } from '../../service/AccessAPi/AgendaAccessapi/agenda-accessapi';
import { MyLocalDatePipe } from "../../Helper/myLocalDate/my-local-date-pipe";
import { CommonModule } from '@angular/common';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardHeader, MatCardTitle, MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { ValidationDialogComponent } from '../../ExternComposent/validation-dialog/validation-dialog';
import { MyRelativeDatePipe } from '../../Helper/DatePipe/relative-date-pipe';
import { ConversationEdition } from '../conversation-component/conversation-edition/conversation-edition';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agenda-page',
  templateUrl: './agenda-page.html',
  styleUrls: ['./agenda-page.scss'],
  imports: [
    MatCardModule,
    CommonModule, // nécessaire pour *ngFor et *ngIf
    MatCardModule, // nécessaire pour <mat-card>
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MyLocalDatePipe,
    AgendaEdition
]
})
export class AgendaPage implements OnInit {

  @ViewChild(AgendaEdition) AgendaEdition!: AgendaEdition;

  agendas: AgendaOut[] = [];
  isLoading = false;
  errorMessage = '';
  agendaSelected:AgendaOut | null= null;

  currentMonday!: Date;
  currentSunday!: Date;

  constructor(private agendaAccessApi: AgendaAccessApi, private snackBar: MatSnackBar) {
    const today = new Date();
    this.setWeek(today);
  }

  ngOnInit(): void {
    this.loadAgendas();
  }

  /** Définit le lundi et dimanche d'une semaine donnée */
  private setWeek(reference: Date): void {
    const day = reference.getDay(); // 0 = dimanche, 1 = lundi ...
    const diffToMonday = day === 0 ? -6 : 1 - day; // si dimanche, -6
    this.currentMonday = new Date(reference);
    this.currentMonday.setHours(0, 0, 0, 0);
    this.currentMonday.setDate(this.currentMonday.getDate() + diffToMonday);

    this.currentSunday = new Date(this.currentMonday);
    this.currentSunday.setDate(this.currentMonday.getDate() + 6);
    this.currentSunday.setHours(23, 59, 59, 999);
  }

  /** Charge les agendas de la semaine en cours */
  loadAgendas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.agendaAccessApi.getAll(this.currentMonday, this.currentSunday).subscribe({
      next: (data) => {
        this.agendas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des agendas :', err);
        this.errorMessage = 'Impossible de charger les agendas.';
        this.isLoading = false;
      }
    });
  }

  /** Semaine précédente */
  prevWeek(): void {
    this.setWeek(new Date(this.currentMonday.getTime() - 7 * 24 * 60 * 60 * 1000));
    this.loadAgendas();
  }

  /** Semaine suivante */
  nextWeek(): void {
    this.setWeek(new Date(this.currentMonday.getTime() + 7 * 24 * 60 * 60 * 1000));
    this.loadAgendas();
  }

  onAdd() {
    this.agendaSelected=null;
    this.AgendaEdition.onOpen();
  }
    handleUserSubmit(agendaData: AgendaIn) {
      if(this.agendaSelected!=null){
        this.agendaAccessApi.update(this.agendaSelected.id,agendaData).subscribe({
          next: (res) => {
            this.snackBar.open('Evenement Modifier avec succès ✅', 'Fermer', {
              duration: 3000
            });
            this.loadAgendas();
          },
          error: (err) => {
            this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }else{
        this.agendaAccessApi.create(agendaData).subscribe({
          next: (res) => {
            this.snackBar.open('Evenement créé avec succès ✅', 'Fermer', {
              duration: 3000
            });
            this.loadAgendas();
          },
          error: (err) => {
            this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }

      console.log(agendaData)
    }
}
