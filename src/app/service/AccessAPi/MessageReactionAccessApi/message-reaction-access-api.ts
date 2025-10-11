import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { MessageReactionIn, MessageReactionOut } from '../../../Models/MessageReaction.model';

@Injectable({
  providedIn: 'root'
})
export class MessageReactionAccessApi {
  private readonly controller = 'MessageReaction';

  constructor(private api: AccessApiService) {}

  /**
   * 🔹 Ajoute ou met à jour une réaction à un message
   */
  addReaction(groupId: number,input: MessageReactionIn): Observable<MessageReactionOut> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<MessageReactionOut>(`${this.controller}/groupe/${groupId}`, '', input, token);
  }

  /**
   * 🔹 Supprime une réaction
   */
  deleteReaction(groupId: number,id: number): Observable<void> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<void>(`${this.controller}/groupe/${groupId}`, id.toString(), token);
  }
}
