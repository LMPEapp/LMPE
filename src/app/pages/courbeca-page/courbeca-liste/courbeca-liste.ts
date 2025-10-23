import { CourbeCA } from './../../../Models/Courbeca.model';
import { Component, HostListener, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CourbeCAAccessApi } from '../../../service/AccessAPi/CourbecaAccessapi/courbeca-accessapi';
import { CourbecaSignalRService } from '../../../service/SignalR/CourbecaSignalRService/courbeca-signal-rservice';
import { ShortNumberFrPipe } from "../../../Helper/ShortNumber/short-number-pipe";
import { MatCardModule } from "@angular/material/card";
import { toLocalDate } from '../../../Helper/date-utils';
import { ValidationDialogComponent } from '../../../ExternComposent/validation-dialog/validation-dialog';
import { AuthService } from '../../../service/Auth/auth';
import { User } from '../../../Models/user.model';
import { AvatarComponent } from "../../../ExternComposent/avatar/avatar";
import { DateOnly } from '../../../Helper/DateOnly';

@Component({
  selector: 'app-courbeca-liste',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ShortNumberFrPipe,
    MatCardModule,
    ValidationDialogComponent,
    AvatarComponent
],
  templateUrl: './courbeca-liste.html',
  styleUrls: ['./courbeca-liste.scss']
})
export class CourbecaListe {
  @ViewChild(ValidationDialogComponent) alert!: ValidationDialogComponent;

  courbes: CourbeCA[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  user: User | undefined;

  @Input() userFilter: User | "ALL" | "WEB" = "ALL";

  constructor(
    private caApi: CourbeCAAccessApi,
    private courbecaHub: CourbecaSignalRService,
    private snackBar: MatSnackBar,
    public auth: AuthService
  ) {
      this.user = auth.loginData?.user;
    }

  ngOnInit(): void {
    this.init();
    this.initSignalR();
  }

  rightDelete(CourbeCA:CourbeCA): boolean{
    if(this.user?.isAdmin){
      return true;
    }
    if(CourbeCA.userId == this.user?.id){
      return true;
    }
    return false;
  }

  // --- Initialisation de SignalR ---
  private initSignalR(): void {
    // Création dynamique
    this.courbecaHub.CreatedForListe$.subscribe(newItem => {
      if (!newItem) return;
      var allData=this.userFilter==="ALL"?true:false;
      if (!allData && newItem.userId !== this.isUser(this.userFilter)?.id) {
        return;
      }
      newItem.datePointDateOnly = DateOnly.fromString(newItem.datePoint);
      this.courbes.unshift(newItem);
    });

    // Suppression dynamique
    this.courbecaHub.DeletedForListe$.subscribe(deletedItem => {
      if (!deletedItem) return;

      var allData=this.userFilter==="ALL"?true:false;
      if (!allData && deletedItem.userId !== this.isUser(this.userFilter)?.id) {
        return;
      }

      const index = this.courbes.findIndex(c => c.id === deletedItem.id);
      if (index !== -1) {
        this.courbes.splice(index, 1);
        this.courbes = [...this.courbes]; // rafraîchir l'affichage
      }
    });
  }

  // --- Chargement initial ---
  init(): void {
    this.isLoading = true;
    var allData=this.userFilter==="ALL"?true:false;
    this.caApi.GetAll(null,allData, this.isUser(this.userFilter)?.id).subscribe({
      next: (data: CourbeCA[]) => {
        this.courbes = data.map(c => ({
          ...c,
          datePointDateOnly: DateOnly.fromString(c.datePoint)
        }));
        this.isLoading = false;
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

  LigneSelected?:number;
  onDeleteMessage(event: CourbeCA) {
    this.LigneSelected=event.id;
    this.alert.open(
      'Supprimer le Message',
      'Êtes-vous sûr de vouloir Supprimer la Ligne ?',
      false
    );
  }

  getAmountClass(amount: number): string {
    return amount >= 0 ? 'amount-positive' : 'amount-negative';
  }

  loadPage(): void {
    var allData=this.userFilter==="ALL"?true:false;
    this.caApi.GetAll(this.courbes[this.courbes.length-1].id, allData, this.isUser(this.userFilter)?.id).subscribe({
      next: data => {
        this.courbes.push(...data);
      },
      error: err => {
        console.error(err);
      }
    });
  }
  loadMore(): void {
    this.loadPage();
  }
  isUser(value: User | "ALL" | "WEB"): User | undefined {
    return value && typeof value === 'object' ? value : undefined;
  }
  onAlertClosed(event: boolean) {
    if(event && this.LigneSelected){
      this.caApi.delete(this.LigneSelected).subscribe({
        next: () => {
          this.LigneSelected=undefined;
          this.snackBar.open('Ligne supprimée', 'Fermer', { duration: 2000 });
        },
        error: (err) => {
          if(err.status === 401) {
            this.auth.logout();
          }
          console.error(err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}
