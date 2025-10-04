import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

import { CourbeCA, CourbeCAIn } from '../../Models/Courbeca.model';
import { CourbeCAAccessApi } from '../../service/AccessAPi/CourbecaAccessapi/courbeca-accessapi';
import { CourbecaSignalRService } from '../../service/SignalR/CourbecaSignalRService/courbeca-signal-rservice';
import { CourbecaEdit } from "./courbeca-edit/courbeca-edit";
import { toLocalDate } from '../../Helper/date-utils';

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
    CourbecaEdit
  ]
})
export class CourbecaPage implements OnInit {

  @ViewChild(CourbecaEdit) CourbecaEdit!: CourbecaEdit;

  courbes: CourbeCA[] = [];
  totalAmountLast30Days: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  graphData: any[] = [];

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
  ) { }

  ngOnInit(): void {
    this.loadLast30Days();
    this.initSignalR();
  }

  // --- Initialisation de SignalR ---
  private initSignalR(): void {
    this.courbecaHub.startConnection(localStorage.getItem('token') || '')
      .then(() => this.courbecaHub.JoinCourbeca());

    // ✅ Création dynamique
    this.courbecaHub.Created$.subscribe(newItem => {
      if (!newItem) return; // sécurité contre null

      const item: CourbeCA = {
        ...newItem,
        id: newItem.id!, // on force car côté serveur c'est toujours défini
        datePoint: toLocalDate(newItem.datePoint),
        userEmail: newItem.userEmail ?? '',
        userPseudo: newItem.userPseudo ?? '',
        userIsAdmin: newItem.userIsAdmin ?? false
      };

      this.courbes.push(item);
      this.updateGraphAndTotal();
    });

    // ✅ Suppression dynamique
    this.courbecaHub.Deleted$.subscribe(id => {
      if (id == null) return;
      this.courbes = this.courbes.filter(c => c.id !== id);
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

    this.caApi.getAll(startDate, endDate).subscribe({
      next: (data: CourbeCA[]) => {
        this.courbes = data.map(c => ({
          ...c,
          datePoint: toLocalDate(c.datePoint)
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
    this.totalAmountLast30Days = this.courbes.reduce((sum, c) => sum + c.amount, 0);

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
      const d = c.datePoint;
      const key = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
      map.set(key, (map.get(key) || 0) + c.amount);
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
