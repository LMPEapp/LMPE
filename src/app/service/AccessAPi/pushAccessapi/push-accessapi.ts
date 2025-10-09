import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { PushSubscriptionDto } from '../../../Models/push.model';

@Injectable({
  providedIn: 'root'
})
export class PushAccessapi {
  private readonly controller = 'push';

  constructor(private api: AccessApiService) {}

  // Enregistrer un abonnement push
  register(dto: PushSubscriptionDto): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<null>(this.controller, 'register', dto, token);
  }
}
