import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { MessageOut } from '../../../Models/Message.model';
import { environment } from '../../../../environments/environment';
import { User } from '../../../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class HomeSignalRService {
  private hubConnection!: signalR.HubConnection;

  // Observable pour le dernier message reçu et le dernier user qui tape
  public addmessage$ = new BehaviorSubject<MessageOut | null>(null);

  constructor() { }

  get connectionState(): string | undefined {
    return this.hubConnection?.state;
  }

  startConnection(token?: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/messageHub`, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();

    return this.hubConnection.start()
      .then(() => {
        console.log('Message Hub Connected');
        this.registerEvents();
      })
      .catch(err => console.error('Error connecting Message Hub', err));
  }

  private registerEvents() {
    this.hubConnection.on('ReceiveMessage', (message: MessageOut) => {
      this.addmessage$.next(message); // on ne garde que le dernier message
    });
  }

  join(UserId: number) {
    this.hubConnection.invoke('JoinMessageUser', UserId)
      .catch(err => console.error(err));
  }

  leave(UserId: number) {
    this.addmessage$.next(null);
    this.hubConnection.invoke('LeaveMessageUser', UserId)
      .catch(err => console.error(err))
      .finally(() => {
      if (this.hubConnection) {
        this.hubConnection.stop()
          .then(() => console.log('🔌 Hub SignalR stoppé proprement'))
          .catch(err => console.error('Erreur lors de l’arrêt du hub', err));
      }
    });
  }
}
