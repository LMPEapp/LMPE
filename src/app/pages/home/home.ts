import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/Auth/auth';
import { MatListModule } from '@angular/material/list';
import { ProfilEdition } from "../user/profil-edition/profil-edition";
import { User, UserIn } from '../../Models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConversationComponent } from "../conversation-component/conversation-component";
import { UserAccessapi } from '../../service/AccessAPi/userAccessapi/user-accessapi';
import { AgendaPage } from "../agenda-page/agenda-page";
import { CourbecaPage } from "../courbeca-page/courbeca-page";
import { MessageAccessApi } from '../../service/AccessAPi/MessageAccessApi/message-access-api';
import { HomeSignalRService } from '../../service/SignalR/HomeSignalRService/home-signal-rservice';

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
    ConversationComponent,
    AgendaPage,
    CourbecaPage
],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild(ProfilEdition) ProfilEdition!: ProfilEdition;

  activeTab: 'stats' | 'messages' | 'agenda' | 'bulletin' = 'stats';

  user: User | undefined;

  CountMessageNotification: number = 0;

  constructor(private router: Router, public auth: AuthService,private userAccessapi:UserAccessapi,
    private snackBar: MatSnackBar,private route: ActivatedRoute, private MessageAccessApi:MessageAccessApi,
    private HomeHub: HomeSignalRService) {
      this.user = auth.loginData?.user;
    }

  ngOnInit() {
    const savedTab = sessionStorage.getItem('activeTab') as 'stats' | 'messages' | 'agenda' | 'bulletin' | null;
    if (savedTab) {
      this.activeTab = savedTab;
    }

    // Si fragment, priorité au fragment
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.onSelectTab(fragment as 'stats' | 'messages' | 'agenda' | 'bulletin');
      }
    });

    this.init();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('🌐 Page revenue au premier plan → Reconnexion SignalR');
        this.init();
      }
    });
  }
  ngOnDestroy() {
    if(this.user){
      this.HomeHub.leave(this.user.id);
    }

  }

  private init(){
    const state = this.HomeHub.connectionState;

    if (state === 'Connected' || state === 'Connecting' || state === 'Reconnecting') {
      console.log(`⏸️ SignalR déjà en cours (${state})`);
      return;
    }

    this.getData();
    this.initSignalR();
    this.subscibeSignalR();
  }
  getData(){
    this.MessageAccessApi.getNotificationCount().subscribe((data)=>{
      this.CountMessageNotification=data;
    })
  }

  private initSignalR(): void {
    this.HomeHub.startConnection(localStorage.getItem('token') || '')
      .then(() => {
        console.log('🔗 SignalR connecté');
        if(this.user){
          this.HomeHub.join(this.user.id);
        }
      })
      .catch(err => {
        console.error('❌ Erreur lors de la connexion SignalR', err);
      });
  }

  private subscibeSignalR(): void {
    this.HomeHub.addmessage$.subscribe(msg => {
      if (msg) {
        this.CountMessageNotification++;
      }
    });
  }
  // Navigation depuis le sidenav
  onNavigate(route: string) {
    this.router.navigate([route]);
  }

  onSelectTab(tab: 'stats' | 'messages' | 'agenda' | 'bulletin') {
    this.activeTab = tab;

    // Sauvegarder l'onglet actif pour la prochaine visite
    sessionStorage.setItem('activeTab', tab);
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
          if(err.status === 401) {
            this.auth.logout();
          }
          this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
