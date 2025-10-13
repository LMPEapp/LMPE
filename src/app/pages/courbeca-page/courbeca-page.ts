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
import { AuthService } from '../../service/Auth/auth';
import { Subscription } from 'rxjs';
import { UserAccessapi } from '../../service/AccessAPi/userAccessapi/user-accessapi';
import { User } from '../../Models/user.model';
import { MatInputModule } from "@angular/material/input";
import { AvatarComponent } from "../../ExternComposent/avatar/avatar";
import { MatOption } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

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
    CourbecaListe,
    MatInputModule,
    MatOption,
    AvatarComponent,
    MatSelectModule,
]
})
export class CourbecaPage implements OnInit {

  @ViewChild(CourbecaEdit) CourbecaEdit!: CourbecaEdit;
  @ViewChild(CourbecaListe) CourbecaListe!: CourbecaListe;

  courbes: CourbeCAGroupByDatePoint[] = [];
  totalAmountLast30Days: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  graphData: any[] = [];

  endDateOnly:DateOnly;
  startDateOnly:DateOnly;

  user: User | undefined;
  public users:User[] = [];
  userSelected?:User;

  private visibilityHandler?: () => void;

  colorScheme: Color = {
    name: 'blueScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2575fc']
  };

  constructor(
    private caApi: CourbeCAAccessApi,
    private courbecaHub: CourbecaSignalRService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private userAccessapi:UserAccessapi
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    this.endDateOnly = DateOnly.fromDate(endDate);
    this.startDateOnly = DateOnly.fromDate(startDate);
    this.user = auth.loginData?.user;
  }

  ngOnInit(): void {
    this.init();

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.loadLast30Days();
        this.ensureSignalRConnected();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }
  ngOnDestroy() {
    this.createdSub?.unsubscribe();
    this.deletedSub?.unsubscribe();
    this.courbecaHub.LeaveCourbeca();
    
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  private init(){
    this.loadLast30Days();
    this.subscibeSignalR();
    this.ensureSignalRConnected();

    this.userAccessapi.get().subscribe((data)=>{
      this.users = data;
    })
  }

  // --- Initialisation de SignalR ---
  private async ensureSignalRConnected(): Promise<void> {
    const state = this.courbecaHub.connectionState;

    if (state === 'Connected' || state === 'Connecting' || state === 'Reconnecting') {
      console.log(`⏸️ SignalR déjà actif (${state})`);
      return;
    }

    console.log('🚀 Démarrage SignalR...');
    await this.courbecaHub.startConnection(localStorage.getItem('token') || '');
    this.courbecaHub.JoinCourbeca();
  }

  private createdSub?: Subscription;
  private deletedSub?: Subscription;

  private subscibeSignalR(): void {
      // Nettoie avant de réabonner
    this.createdSub?.unsubscribe();
    this.deletedSub?.unsubscribe();
        // Création dynamique
    this.createdSub = this.courbecaHub.Created$.subscribe(newItem => {
      if (!newItem) return;

      if(this.userSelected && newItem.userId !== this.userSelected.id) {
        return; // Ignore si l'élément n'appartient pas à l'utilisateur sélectionné
      }

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
    this.deletedSub = this.courbecaHub.Deleted$.subscribe(deletedItem => {
      if (!deletedItem) return;

      if(this.userSelected && deletedItem.userId !== this.userSelected.id) {
        return; // Ignore si l'élément n'appartient pas à l'utilisateur sélectionné
      }

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
  loadLast30Days(idUser?: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    this.endDateOnly = DateOnly.fromDate(endDate);
    this.startDateOnly = DateOnly.fromDate(startDate);

    this.caApi.GetAllGroupeByDate(this.startDateOnly, this.endDateOnly, idUser).subscribe({
      next: (data: CourbeCAGroupByDatePoint[]) => {
        this.courbes = data.map(c => ({
          ...c,
          datePointDateOnly: DateOnly.fromString(c.datePoint)
        }));
        this.updateGraphAndTotal();
        this.isLoading = false;
        console.log(this.courbes)
      },
      error: (err) => {
        if(err.status === 401) {
          this.auth.logout();
        }
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

    // Conversion en série cumulée
    let cumulative = 0;
    this.graphData = [
      {
        name: 'CA',
        series: Array.from(map.entries()).map(([date, amount]) => {
          cumulative += amount; // somme progressive
          return { name: date, value: cumulative };
        })
      }
    ];
  }

  onUserChange(user?: User) {
    this.userSelected = user;
    console.log('Utilisateur sélectionné :', user);
    this.loadLast30Days(user?.id);
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
        if(err.status === 401) {
          this.auth.logout();
        }
        this.errorMessage = 'Impossible de créer la donnée.';
        console.error(err);
      }
    });
  }
}
