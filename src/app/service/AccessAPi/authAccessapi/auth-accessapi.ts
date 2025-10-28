import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { LoginRequest, LoginRequestOut, ChangePasswordRequest, RefreshTokenIN } from '../../../Models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthAccessApiService {
  private readonly controller = 'auth';

  constructor(private api: AccessApiService) {}

  login(data: LoginRequest): Observable<LoginRequestOut> {
    return this.api.post<LoginRequestOut>(this.controller, 'login', data);
  }
  refresh(data: RefreshTokenIN): Observable<LoginRequestOut> {
    return this.api.post<LoginRequestOut>(this.controller, 'refresh', data);
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
