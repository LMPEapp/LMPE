import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { GroupeConversation, GroupeConversationIn, UserGroupeIn } from '../../Models/GroupeConversation.model';
import { User } from '../../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GroupsAccessApi {
  private readonly controller = 'groups';

  constructor(private api: AccessApiService) {}

  getAll(): Observable<GroupeConversation[]> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<GroupeConversation[]>(this.controller, '', {}, token);
  }

  getById(id: number): Observable<GroupeConversation> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<GroupeConversation>(this.controller, id.toString(), {}, token);
  }

  create(input: GroupeConversationIn): Observable<GroupeConversation> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<GroupeConversation>(this.controller, '', input, token);
  }

  update(id: number, input: GroupeConversationIn): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.put<null>(this.controller, id.toString(), input, token);
  }

  delete(id: number): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(this.controller, id.toString(), token);
  }

  addUsers(groupId: number, input: UserGroupeIn): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<null>(`${this.controller}/${groupId}/users`, '', input, token);
  }

  removeUser(groupId: number, userId: number): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(`${this.controller}/${groupId}/users`, userId.toString(), token);
  }

  getUsers(groupId: number): Observable<User[]> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<User[]>(`${this.controller}/${groupId}/users`, '', {}, token);
  }
}
