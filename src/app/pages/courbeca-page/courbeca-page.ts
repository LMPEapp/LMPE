import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

import { CourbeCAGroupByDatePoint, CourbeCAIn } from '../../Models/Courbeca.model';
import { CourbeCAAccessApi } from '../../service/AccessAPi/CourbecaAccessapi/courbeca-accessapi';
import { CourbecaSignalRService } from '../../service/SignalR/CourbecaSignalRService/courbeca-signal-rservice';
import { CourbecaEdit } from "./courbeca-edit/courbeca-edit";
import { DateOnly } from '../../Helper/DateOnly';
import { ShortNumberFrPipe } from "../../Helper/ShortNumber/short-number-pipe";
import { CourbecaListe } from "./courbeca-liste/courbeca-liste";
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-courbeca-page',
  templateUrl: './courbeca-page.html',
  styleUrls: ['./courbeca-page.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    NgxChartsModule,
    MatButtonModule,
    MatIconModule,
    CourbecaEdit,
    MatTabsModule,
    ShortNumberFrPipe,
    CourbecaListe
]
})
export class CourbecaPage implements OnInit {

  @ViewChild(CourbecaEdit) CourbecaEdit!: CourbecaEdit;

  courbes: CourbeCAGroupByDatePoint[] = [];
  totalAmountLast30Days: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  graphData: any[] = [];

  endDateOnly:DateOnly;
  startDateOnly:DateOnly;

  colorScheme: Color = {
    name: 'blueScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2575fc']
  };

  constructor(
    private caApi: CourbeCAAccessApi,
    private courbecaHub: CourbecaSignalRService,
    private snackBar: MatSnackBar
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    this.endDateOnly = DateOnly.fromDate(endDate);
    this.startDateOnly = DateOnly.fromDate(startDate);
  }

  ngOnInit(): void {
    this.init();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('🌐 Page revenue au premier plan → Reconnexion SignalR');
        this.init();
      }
    });
  }
  ngOnDestroy() {
    this.courbecaHub.LeaveCourbeca();
  }

  private init(){

    const state = this.courbecaHub.connectionState;

    if (state === 'Connected' || state === 'Connecting' || state === 'Reconnecting') {
      console.log(`⏸️ SignalR déjà en cours (${state})`);
      return;
    }

    this.loadLast30Days();
    this.initSignalR();
    this.subscibeSignalR();
  }

  // --- Initialisation de SignalR ---
  private initSignalR(): void {
    this.courbecaHub.startConnection(localStorage.getItem('token') || '')
      .then(() => this.courbecaHub.JoinCourbeca());
  }

  private subscibeSignalR(): void {
        // Création dynamique
    this.courbecaHub.Created$.subscribe(newItem => {
      if (!newItem) return;

      const newDate = DateOnly.fromString(newItem.datePoint);

      // Ne push que si la date est dans la plage
      if (!newDate.isBetween(this.startDateOnly, this.endDateOnly)) return;

      const existing = this.courbes.find(c => c.datePoint === newItem.datePoint);

      if (existing) {
        existing.ids += `,${newItem.id}`;
        existing.totalAmount += newItem.amount;
        existing.countItems += 1;
      } else {
        this.courbes.push({
          ids: `${newItem.id}`,
          datePoint: newItem.datePoint,
          datePointDateOnly: newDate,
          totalAmount: newItem.amount,
          countItems: 1
        });
      }

      this.updateGraphAndTotal();
    });
    // Suppression dynamique
    this.courbecaHub.Deleted$.subscribe(deletedItem => {
      if (!deletedItem) return;

      const { id, datePoint, amount } = deletedItem;
      const group = this.courbes.find(c => c.datePoint === datePoint);
      if (!group) return;

      // Supprime l'id du groupe
      const idsArray = group.ids.split(',').filter(x => x !== String(id));
      group.ids = idsArray.join(',');

      // Ajuste total et count
      group.totalAmount -= amount;
      group.countItems -= 1;

      // Si plus d'éléments, supprime le groupe
      if (group.countItems <= 0) {
        this.courbes = this.courbes.filter(c => c.datePoint !== datePoint);
      }

      this.updateGraphAndTotal();
    });
  }



  // --- Chargement initial ---
  loadLast30Days(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    this.endDateOnly = DateOnly.fromDate(endDate);
    this.startDateOnly = DateOnly.fromDate(startDate);

    this.caApi.GetAllGroupeByDate(this.startDateOnly, this.endDateOnly).subscribe({
      next: (data: CourbeCAGroupByDatePoint[]) => {
        this.courbes = data.map(c => ({
          ...c,
          datePointDateOnly: DateOnly.fromString(c.datePoint)
        }));
        this.updateGraphAndTotal();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les données.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // --- Recalcul du total et du graph ---
  private updateGraphAndTotal(): void {
    // Total
    this.totalAmountLast30Days = this.courbes.reduce((sum, c) => sum + c.totalAmount, 0);

    // Graph
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const map = new Map<string, number>();
    for (let i = 0; i <= 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}`;
      map.set(key, 0);
    }

    this.courbes.forEach(c => {
      const d = c.datePointDateOnly;
      const key = `${d.day.toString().padStart(2,'0')}/${d.month.toString().padStart(2,'0')}`;
      map.set(key, (map.get(key) || 0) + c.totalAmount);
    });

    this.graphData = [
      {
        name: 'CA',
        series: Array.from(map.entries()).map(([date, amount]) => ({ name: date, value: amount }))
      }
    ];
  }

  // --- Ouverture du formulaire d'ajout ---
  onAdd(): void {
    this.CourbecaEdit.onOpen();
  }

  // --- Soumission d'un nouvel élément ---
  handleUserSubmit(event: CourbeCAIn): void {
    this.caApi.create(event).subscribe({
      next: () => {
        this.snackBar.open('Événement créé ✅', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        this.errorMessage = 'Impossible de créer la donnée.';
        console.error(err);
      }
    });
  }
}
