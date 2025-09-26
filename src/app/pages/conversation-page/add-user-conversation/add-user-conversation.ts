import { Component } from '@angular/core';
import { User } from '../../../Models/user.model';
import { UserAccessapi } from '../../../AccessAPi/userAccessapi/user-accessapi';
import { AuthService } from '../../../service/Auth/auth';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GroupeConversation, UserGroupeIn } from '../../../Models/GroupeConversation.model';
import { GroupsAccessApi } from '../../../AccessAPi/GroupsAccessApi/groups-access-api';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-user-conversation',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
  ],
  templateUrl: './add-user-conversation.html',
  styleUrls: ['./add-user-conversation.scss']
})
export class AddUserConversation {
  public users: User[] = [];
  public listSelected: number[] = [];
  groupe?: GroupeConversation;

  user: User | undefined;
  public isOpen = false;

  public erreur?:string

  constructor(
    private userAccessapi: UserAccessapi,
    public auth: AuthService,
    private groupsAccessApi: GroupsAccessApi, private snackBar: MatSnackBar
  ) {
    this.user = auth.loginData?.user;
  }

  ngOnInit() {
    this.init();
  }

  init() {
    this.erreur=undefined;
    this.userAccessapi.get().subscribe((data) => {
      // On exclut l'utilisateur courant
      this.users = data.filter(u => u.id !== this.user?.id);
    });
  }

  onOpen(groupe?: GroupeConversation) {
    this.isOpen = true;
    this.groupe = groupe;
    this.listSelected = [];
    this.init();
  }

  onClose() {
    this.isOpen = false;
  }

  toggleUserSelection(userId: number) {
    const idx = this.listSelected.indexOf(userId);
    if (idx > -1) {
      this.listSelected.splice(idx, 1); // retire si déjà sélectionné
    } else {
      this.listSelected.push(userId); // ajoute si non sélectionné
    }
  }

  onSubmit() {
    if (!this.groupe) return;
    this.erreur=undefined;
    const payload: UserGroupeIn = { userIds: this.listSelected };
    this.groupsAccessApi.addUsers(this.groupe.id, payload).subscribe({
      next: (res) => {
        this.onClose();
        this.snackBar.open('Ajout avec succès ✅', 'Fermer', {
          duration: 3000
        });
      },
      error: (err) => {
        this.erreur=`Erreur : ${err.error || err.message}`;
      }
    });
  }
}
