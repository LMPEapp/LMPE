import { inject, Injectable, signal } from '@angular/core';
import { LoginRequestOut } from '../../Models/auth.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthAccessApiService } from '../AccessAPi/authAccessapi/auth-accessapi';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(false);
  private _loginData: LoginRequestOut | null = null;
  public redirectUrl: string | null = null;

  private router = inject(Router);

  constructor(private authApi: AuthAccessApiService) {}

  get isLoggedIn() {
    return this._isLoggedIn();
  }

  get loginData(): LoginRequestOut | null {
    return this._loginData;
  }

  login(data: LoginRequestOut) {
    this._loginData = data;
    this._isLoggedIn.set(true);
    localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  }

  logout() {
    this._isLoggedIn.set(false);
    this._loginData = null;
    this.redirectUrl = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Appel API pour valider le token et générer un nouveau token
  validateToken(): Observable<LoginRequestOut> {
    return this.authApi.validate().pipe(
      tap(res => {
        if (res.token) {
          this._loginData = res;
          this._isLoggedIn.set(true);
          localStorage.setItem('token', res.token);
          if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
        } else {
          this.logout();
        }
      }),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Token invalide'));
      })
    );
  }
}

