import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../service/Auth/auth';
import { User, UserIn } from '../../Models/user.model';
import { UserAccessapi } from '../../service/AccessAPi/userAccessapi/user-accessapi';
import { MessageAccessApi } from '../../service/AccessAPi/MessageAccessApi/message-access-api';
import { HomeSignalRService } from '../../service/SignalR/HomeSignalRService/home-signal-rservice';

import { ProfilEdition } from "../user/profil-edition/profil-edition";
import { ConversationComponent } from "../conversation-component/conversation-component";
import { AgendaPage } from "../agenda-page/agenda-page";
import { CourbecaPage } from "../courbeca-page/courbeca-page";
import { Subscription } from 'rxjs';
import { AvatarComponent } from "../../ExternComposent/avatar/avatar";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
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
    CourbecaPage,
    AvatarComponent
]
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild(ProfilEdition) ProfilEdition!: ProfilEdition;

  activeTab: 'stats' | 'messages' | 'agenda' | 'bulletin' = 'stats';
  user?: User;
  CountMessageNotification: number = 0;

  private visibilityHandler?: () => void;
  private messageSub?: Subscription;

  constructor(
    private router: Router,
    public auth: AuthService,
    private userAccessapi: UserAccessapi,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private messageAccessApi: MessageAccessApi,
    private homeHub: HomeSignalRService
  ) {
    this.user = auth.loginData?.user;
  }

  ngOnInit(): void {
    // ✅ Restaurer l'onglet actif
    const savedTab = sessionStorage.getItem('activeTab') as 'stats' | 'messages' | 'agenda' | 'bulletin' | null;
    if (savedTab) this.activeTab = savedTab;

    // ✅ Fragment dans l’URL → priorité
    this.route.fragment.subscribe(fragment => {
      if (fragment) this.onSelectTab(fragment as any);
    });

    this.init();

    // ✅ Reconnexion SignalR quand la page redevient visible
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        console.log('🌐 Page revenue au premier plan → Reconnexion SignalR');
        this.closeNotification();
        this.loadNotifications();
        this.ensureSignalRConnected();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    this.messageSub?.unsubscribe();

    if (this.user) {
      this.homeHub.leave(this.user.id);
    }

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  /** 🔄 Initialisation principale */
  private init(): void {
    this.closeNotification();
    this.loadNotifications();
    this.subscribeSignalR();
    this.ensureSignalRConnected();
  }

  private closeNotification(){
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.getNotifications) {
          // Ferme toutes les notifications affichées
          reg.getNotifications().then(notifications => {
            notifications.forEach(n => n.close());
          });
        }
      });
    }
  }

  /** 🧠 Chargement du nombre de notifications */
  private loadNotifications(): void {
    this.messageAccessApi.getNotificationCount().subscribe({
      next: data => this.CountMessageNotification = data,
      error: err => {
        if (err.status === 401) this.auth.logout();
        console.error('Erreur de chargement notifications', err);
      }
    });
  }

  /** 🔗 Connexion SignalR propre */
  private async ensureSignalRConnected(): Promise<void> {
    const state = this.homeHub.connectionState;

    if (state === 'Connected' || state === 'Connecting' || state === 'Reconnecting') {
      console.log(`⏸️ SignalR déjà actif (${state})`);
      return;
    }

    console.log('🚀 Démarrage SignalR...');
    await this.homeHub.startConnection(localStorage.getItem('token') || '');
    if (this.user) this.homeHub.join(this.user.id);
  }

  /** 👂 Écoute des événements SignalR */
  private subscribeSignalR(): void {
    this.messageSub?.unsubscribe();

    this.messageSub = this.homeHub.addmessage$.subscribe(msg => {
      if (msg) this.CountMessageNotification++;
    });
  }

  /** 🧭 Navigation via le menu */
  onNavigate(route: string): void {
    this.router.navigate([route]);
  }

  /** 🧩 Changement d’onglet */
  onSelectTab(tab: 'stats' | 'messages' | 'agenda' | 'bulletin'): void {
    this.activeTab = tab;
    sessionStorage.setItem('activeTab', tab);
  }

  /** 🚪 Déconnexion complète */
  onLogout(): void {
    this.logoutAsync();
    this.auth.logout();
  }

  private async logoutAsync(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('🔕 Ancienne subscription supprimée !');
    }
  }

  /** 👤 Edition du profil */
  onProfil(): void {
    this.sidenav.close();
    this.ProfilEdition.onOpen(this.user);
  }

  handleUserSubmit(userData: UserIn): void {
    if (!this.user) return;

    this.userAccessapi.update(this.user.id, userData).subscribe({
      next: () => {
        this.snackBar.open('Utilisateur modifié avec succès ✅', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        if (err.status === 401) this.auth.logout();
        this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
