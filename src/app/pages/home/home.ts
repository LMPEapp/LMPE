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
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  activeTab: 'stats' | 'messages' | 'agenda' | 'bulletin' = 'stats';

  constructor(private router: Router, public auth: AuthService) {}

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
}
