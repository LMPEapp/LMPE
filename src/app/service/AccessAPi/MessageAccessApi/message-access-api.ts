import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { MessageOut, MessageIn } from '../../../Models/Message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageAccessApi {
  private readonly controller = 'message';

  constructor(private api: AccessApiService) {}

  // GET /message/groupe/{groupId}?lastMessageId=...
  getByGroup(groupId: number, lastMessageId?: number): Observable<MessageOut[]> {
    const token = localStorage.getItem('token') || '';
    const params: any = {};
    if (lastMessageId) params.lastMessageId = lastMessageId;
    return this.api.get<MessageOut[]>(`${this.controller}/groupe/${groupId}`, '', params, token);
  }

  // POST /message/groupe/{groupId}
  create(groupId: number, input: MessageIn): Observable<MessageOut> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<MessageOut>(`${this.controller}/groupe/${groupId}`, '', input, token);
  }

  // PUT /message/{messageId}
  update(messageId: number, input: MessageIn): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.put<null>(`${this.controller}/${messageId}`, '', input, token);
  }

  // DELETE /message/{messageId}
  delete(messageId: number): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(`${this.controller}/${messageId}`, '', token);
  }
}
