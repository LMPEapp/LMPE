import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { User, UserIn } from '../../Models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { ProfilEdition } from './profil-edition/profil-edition';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../service/Auth/auth';
import { MatDialog } from '@angular/material/dialog';
import { ValidationDialogComponent, ValidationDialogData } from '../../ExternComposent/validation-dialog/validation-dialog';
import { GroupeConversationIn, UserGroupeIn } from '../../Models/GroupeConversation.model';
import { UserAccessapi } from '../../service/AccessAPi/userAccessapi/user-accessapi';
import { GroupsAccessApi } from '../../service/AccessAPi/GroupsAccessApi/groups-access-api';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatSidenavModule,
    ProfilEdition,
    ValidationDialogComponent
],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class UsersComponent {

  @ViewChild(ValidationDialogComponent) alert!: ValidationDialogComponent;
  @ViewChild(ProfilEdition) ProfilEdition!: ProfilEdition;

  public users:User[] = [];
  userSelected:User | null= null;

  user: User | undefined;

  constructor(private router: Router, private userAccessapi:UserAccessapi,
    private snackBar: MatSnackBar, public auth: AuthService,private groupsAccessApi: GroupsAccessApi) {
      this.user = auth.loginData?.user;
    }

  ngOnInit(){
    this.init();
  }
  init(){
    this.userAccessapi.get().subscribe((data)=>{
      this.users = data.filter(u => u.id !== this.user?.id);
    })
  }

  goBack() {
    this.router.navigate(['']); // remplace par la route voulue
  }

  onAdd() {
    this.userSelected=null;
    this.ProfilEdition.onOpen();
  }
  onEdit(user: User) {
    this.userSelected=user;
    console.log("Edit user", user);
    this.ProfilEdition.onOpen(user);
    // ici tu peux router vers un formulaire ou ouvrir un dialog
  }

  onDelete(user: User) {
    this.userSelected=user;
    this.alert.open(
      'Supprimer l’élément',
      'Êtes-vous sûr de vouloir supprimer cet élément ?',
      false
    );
  }
  onMessage(user: User) {
    let groupeData: GroupeConversationIn = { name: this.user?.pseudo+ " " + user.pseudo };
    this.groupsAccessApi.create(groupeData).subscribe({
        next: (result) => {

          const payload: UserGroupeIn = { userIds: [user.id] };
          this.groupsAccessApi.addUsers(result.id, payload).subscribe({
            next: (res) => {
              this.router.navigate(['/conversation', result.id]);
            },
            error: (err) => {
              this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });

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

  onAlertClosed(result: boolean) {
    if (result === true) {
      this.userAccessapi.delete(this.userSelected!.id).subscribe({
        next: (res) => {
          this.snackBar.open('Utilisateur supprimé avec succès ✅', 'Fermer', {
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
    } else {
      console.log('Annulé ou fermé');
    }
  }


  handleUserSubmit(userData: UserIn) {
    if(this.userSelected!=null){
      this.userAccessapi.update(this.userSelected.id,userData).subscribe({
        next: (res) => {
          this.snackBar.open('Utilisateur Modifier avec succès ✅', 'Fermer', {
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
      this.userAccessapi.create(userData).subscribe({
        next: (res) => {
          this.snackBar.open('Utilisateur créé avec succès ✅', 'Fermer', {
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

    console.log(userData)
  }

}
