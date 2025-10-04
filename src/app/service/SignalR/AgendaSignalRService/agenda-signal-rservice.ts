import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AgendaOut } from '../../../Models/Agenda.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaSignalRService {

  private hubConnection!: signalR.HubConnection;

  public agendaCreated$ = new BehaviorSubject<AgendaOut | null>(null);
  public agendaUpdated$ = new BehaviorSubject<AgendaOut | null>(null);
  public agendaDeleted$ = new BehaviorSubject<number | null>(null);

  constructor() { }

  startConnection(token?: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/agendaHub`, {
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
    this.hubConnection.on('AgendaCreated', (agenda: AgendaOut) => {
      this.agendaCreated$.next(agenda);
    });

    this.hubConnection.on('AgendaUpdated', (agenda: AgendaOut) => {
      this.agendaUpdated$.next(agenda);
    });

    this.hubConnection.on('AgendaDeleted', (agendaId: number) => {
      this.agendaDeleted$.next(agendaId);
    });
  }

  joinAgendasGlobal() {
    this.hubConnection.invoke('JoinAgendasGlobal')
      .catch(err => console.error(err));
  }

  leaveAgendasGlobal() {
    this.resetSubjects();
    this.hubConnection.invoke('LeaveAgendasGlobal')
      .catch(err => console.error(err));
  }

  joinAgenda(agendaId: number) {
    this.hubConnection.invoke('JoinAgenda', agendaId)
      .catch(err => console.error(err));
  }

  leaveAgenda(agendaId: number) {
    this.resetSubjects();
    this.hubConnection.invoke('LeaveAgenda', agendaId)
      .catch(err => console.error(err));
  }

  private resetSubjects() {
    this.agendaCreated$.next(null);
    this.agendaUpdated$.next(null);
    this.agendaDeleted$.next(null);
  }
}
