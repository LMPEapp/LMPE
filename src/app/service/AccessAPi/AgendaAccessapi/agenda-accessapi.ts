import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { User } from '../../../Models/user.model';
import { AgendaIn, AgendaOut } from '../../../Models/Agenda.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaAccessApi {
  private readonly controller = 'agenda';

  constructor(private api: AccessApiService) {}

  getAll(startDate?: Date, endDate?: Date): Observable<AgendaOut[]> {
    const token = localStorage.getItem('token') || '';
    const params: Record<string, string> = {};

    if (startDate) params['startDate'] = startDate.toISOString();
    if (endDate) params['endDate'] = endDate.toISOString();

    return this.api.get<AgendaOut[]>(this.controller, '', params, token);
  }


  getById(id: number): Observable<AgendaOut> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<AgendaOut>(this.controller, id.toString(), {}, token);
  }

  create(input: AgendaIn): Observable<AgendaOut> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<AgendaOut>(this.controller, '', input, token);
  }

  update(id: number, input: AgendaIn): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.put<null>(this.controller, id.toString(), input, token);
  }

  delete(id: number): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(this.controller, id.toString(), token);
  }

  addUsers(agendaId: number, userIds: number[]): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<null>(`${this.controller}/${agendaId}/users`, '', { userIds }, token);
  }

  removeUsers(agendaId: number, userIds: number[]): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(`${this.controller}/${agendaId}/users`, '', token, { body: { userIds } });
  }

  getUsers(agendaId: number): Observable<User[]> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<User[]>(`${this.controller}/${agendaId}/users`, '', {}, token);
  }
}
