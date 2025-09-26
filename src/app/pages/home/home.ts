import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from '../../service/Auth/auth';
import { MatListModule } from '@angular/material/list';
import { ProfilEdition } from "../user/profil-edition/profil-edition";
import { User, UserIn } from '../../Models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConversationComponent } from "../conversation-component/conversation-component";
import { UserAccessapi } from '../../service/AccessAPi/userAccessapi/user-accessapi';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    ProfilEdition,
    ConversationComponent
],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild(ProfilEdition) ProfilEdition!: ProfilEdition;

  activeTab: 'stats' | 'messages' | 'agenda' | 'bulletin' = 'stats';

  user: User | undefined;

  constructor(private router: Router, public auth: AuthService,private userAccessapi:UserAccessapi,
    private snackBar: MatSnackBar) {
      this.user = auth.loginData?.user;
    }

  // Navigation depuis le sidenav
  onNavigate(route: string) {
    this.router.navigate([route]);
  }

  onSelectTab(tab: 'stats' | 'messages' | 'agenda' | 'bulletin') {
    this.activeTab = tab;
  }

  // Déconnexion
  onLogout() {
    this.auth.logout();
  }

  onProfil() {
    this.sidenav.close();
    this.ProfilEdition.onOpen(this.user);
  }

  handleUserSubmit(userData: UserIn) {
    if(this.user!=null){
      this.userAccessapi.update(this.user.id,userData).subscribe({
        next: (res) => {
          this.snackBar.open('Utilisateur Modifier avec succès ✅', 'Fermer', {
            duration: 3000
          });
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
}
