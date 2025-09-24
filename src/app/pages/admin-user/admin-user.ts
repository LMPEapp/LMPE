import { UserAccessapi } from './../../AccessAPi/userAccessapi/user-accessapi';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { User, UserIn } from '../../Models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { ProfilEdition } from '../../ExternComposent/profil-edition/profil-edition';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-user',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatSidenavModule,
    ProfilEdition
  ],
  templateUrl: './admin-user.html',
  styleUrl: './admin-user.scss'
})
export class AdminUser {

  @ViewChild(ProfilEdition) ProfilEdition!: ProfilEdition;

  public users:User[] = [];
  userEdit:User | null= null;

  constructor(private router: Router, private userAccessapi:UserAccessapi,
    private snackBar: MatSnackBar) {}

  ngOnInit(){
    this.init();
  }
  init(){
    this.userAccessapi.get().subscribe((data)=>{
      this.users=data;
    })
  }

  goBack() {
    this.router.navigate(['']); // remplace par la route voulue
  }

  onAdd() {
    this.userEdit=null;
    this.ProfilEdition.onOpen();
  }
  onEdit(user: User) {
    this.userEdit=user;
    console.log("Edit user", user);
    this.ProfilEdition.onOpen(user);
    // ici tu peux router vers un formulaire ou ouvrir un dialog
  }

  onDelete(user: User) {
    console.log("Delete user", user);
    // ici appeler ton API pour supprimer
  }

  handleUserSubmit(userData: UserIn) {
    if(this.userEdit!=null){
      this.userAccessapi.update(this.userEdit.id,userData).subscribe({
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
