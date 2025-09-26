import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { HttpHeaders } from '@angular/common/http';
import { LoginRequest, LoginRequestOut, ChangePasswordRequest } from '../../../Models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthAccessApiService {
  private readonly controller = 'auth';

  constructor(private api: AccessApiService) {}

  login(data: LoginRequest): Observable<LoginRequestOut> {
    return this.api.post<LoginRequestOut>(this.controller, 'login', data).pipe(
      tap((res) => {
        localStorage.setItem('token', JSON.stringify(res.user));
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }
  validate(): Observable<LoginRequestOut> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<LoginRequestOut>(this.controller, 'validate', {}, token);
  }
  changePassword(data:ChangePasswordRequest): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<null>(this.controller, 'change-password', data, token);
  }
}
