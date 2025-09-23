import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public isLoggedIn = signal(false);
  public redirectUrl: string | null = null;

  login() {
    this.isLoggedIn.set(true);
  }

  logout() {
    this.isLoggedIn.set(false);
    this.redirectUrl = null;
  }
}
