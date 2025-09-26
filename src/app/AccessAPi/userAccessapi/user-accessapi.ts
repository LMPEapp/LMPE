import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginRequestOut } from '../../Models/auth.model';
import { AccessApiService } from '../access-api-service';
import { User, UserIn } from '../../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserAccessapi {
  private readonly controller = 'user';

    constructor(private api: AccessApiService) {}

    get(): Observable<User[]> {
      const token = localStorage.getItem('token') || '';
      return this.api.get<User[]>(this.controller, '', {}, token);
    }

    delete(id:number): Observable<null> {
      const token = localStorage.getItem('token') || '';
      return this.api.delete<null>(this.controller, id.toString(), token);
    }

    update(id:number, user:UserIn): Observable<null> {
      const token = localStorage.getItem('token') || '';
      return this.api.put<null>(this.controller, id.toString(), user, token);
    }

    create(user:UserIn): Observable<User> {
      const token = localStorage.getItem('token') || '';
      return this.api.post<User>(this.controller, "",user , token);
    }
}
