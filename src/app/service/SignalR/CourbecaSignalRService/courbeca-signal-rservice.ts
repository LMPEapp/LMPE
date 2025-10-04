import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { CourbeCA } from '../../../Models/Courbeca.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourbecaSignalRService {
  private hubConnection!: signalR.HubConnection;

  public Created$ = new BehaviorSubject<CourbeCA | null>(null);
  public Deleted$ = new BehaviorSubject<number | null>(null);

  constructor() { }

  startConnection(token?: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/courbecaHub`, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();

    return this.hubConnection.start()
      .then(() => {
        console.log('Agenda Hub Connected');
        this.registerEvents();
      })
      .catch(err => console.error('Error connecting Agenda Hub', err));
  }

  private registerEvents() {
    this.hubConnection.on('CourbecaCreated', (agenda: CourbeCA) => {
      this.Created$.next(agenda);
    });

    this.hubConnection.on('CourbecaDeleted', (agendaId: number) => {
      this.Deleted$.next(agendaId);
    });
  }

  JoinCourbeca() {
    this.hubConnection.invoke('JoinCourbeca')
      .catch(err => console.error(err));
  }

  LeaveCourbeca() {
    this.resetSubjects();
    this.hubConnection.invoke('LeaveCourbeca')
      .catch(err => console.error(err));
  }

  private resetSubjects() {
    this.Created$.next(null);
    this.Deleted$.next(null);
  }
}
