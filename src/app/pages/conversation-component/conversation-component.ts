// conversation-component.ts
import { Component, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardHeader, MatCardModule, MatCardTitle } from "@angular/material/card";
import { GroupeConversation, GroupeConversationIn } from '../../Models/GroupeConversation.model';
import { GroupsAccessApi } from '../../AccessAPi/GroupsAccessApi/groups-access-api';
import { CommonModule, DatePipe } from '@angular/common';
import { MyLocalDatePipe } from "../../Helper/myLocalDate/my-local-date-pipe";
import { MyRelativeDatePipe } from '../../Helper/DatePipe/relative-date-pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ConversationEdition } from "./conversation-edition/conversation-edition";
import { AuthService } from '../../service/Auth/auth';
import { User } from '../../Models/user.model';
import { MatMenuModule } from '@angular/material/menu';
import { ValidationDialogComponent } from "../../ExternComposent/validation-dialog/validation-dialog";
import { Router } from '@angular/router';

@Component({
  selector: 'app-conversation-component',
  templateUrl: './conversation-component.html',
  styleUrls: ['./conversation-component.scss'],
  imports: [
    MatCardHeader,
    MatCardTitle,
    MatCardModule,
    MyRelativeDatePipe,
    CommonModule, // nécessaire pour *ngFor et *ngIf
    MatCardModule, // nécessaire pour <mat-card>
    MyLocalDatePipe,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    ConversationEdition,
    ValidationDialogComponent
]
})
export class ConversationComponent {

  @ViewChild(ConversationEdition) ConversationEdition!: ConversationEdition;
  @ViewChild(ValidationDialogComponent) alert!: ValidationDialogComponent;

  groupeConversation: GroupeConversation[] = [];
  groupeSelected:GroupeConversation | null= null;
  user: User | undefined;

  constructor(private groupsAccessApi: GroupsAccessApi, private snackBar: MatSnackBar, public auth: AuthService,private router: Router) {
      this.user = auth.loginData?.user;
    }

  ngOnInit() {
    this.init();
  }

  init(){
    this.groupsAccessApi.getAll().subscribe({
      next: (res) => {
        this.groupeConversation = res; // déjà trié côté API
        console.log(this.groupeConversation)
      },
      error: (err) => {
        this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSelectGroupe(groupe: GroupeConversation) {
    this.router.navigate(['/conversation', groupe.id]);
  }
  onAdd() {
    this.groupeSelected=null;
    this.ConversationEdition.onOpen();
  }

  handleUserSubmit(groupeData: GroupeConversationIn) {
    if(this.groupeSelected!=null){
      this.groupsAccessApi.update(this.groupeSelected.id,groupeData).subscribe({
        next: (res) => {
          this.snackBar.open('Groupe Modifier avec succès ✅', 'Fermer', {
            duration: 3000
          });
          this.init();
        },
        error: (err) => {
          this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }else{
      this.groupsAccessApi.create(groupeData).subscribe({
        next: (res) => {
          this.snackBar.open('Groupe créé avec succès ✅', 'Fermer', {
            duration: 3000
          });
          this.init();
        },
        error: (err) => {
          this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }

    console.log(groupeData)
  }
  deleteorleave?:"delete"|"leave";

  onDelete(_t4: GroupeConversation) {
    this.groupeSelected=_t4;
    this.deleteorleave = "delete";
    this.alert.open(
      'Supprimer l’élément',
      'Êtes-vous sûr de vouloir supprimer cet élément ?',
      false
    );
  }
  onleaveGroupe(_t4: GroupeConversation) {
    this.groupeSelected=_t4;
    this.deleteorleave = "leave";
    this.alert.open(
      'Quitter la Conversation',
      'Êtes-vous sûr de vouloir Quitter cet élément ?',
      false
    );
  }
  onEdit(_t4: GroupeConversation) {
    this.groupeSelected=_t4;
    this.ConversationEdition.onOpen(_t4);
  }
  onAlertClosed(event: boolean) {
    if(event && this.groupeSelected && this.user){
      if(this.deleteorleave=="leave"){
        this.groupsAccessApi.removeUser(this.groupeSelected.id,this.user?.id).subscribe({
          next: (res) => {
            this.snackBar.open('Groupe quitté avec succès ✅', 'Fermer', {
              duration: 3000
            });
            this.init();
          },
          error: (err) => {
            this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }else{
        this.groupsAccessApi.delete(this.groupeSelected.id).subscribe({
          next: (res) => {
            this.snackBar.open('Groupe supprimé avec succès ✅', 'Fermer', {
              duration: 3000
            });
            this.init();
          },
          error: (err) => {
            this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }

    }
    throw new Error('Method not implemented.');
  }
}
