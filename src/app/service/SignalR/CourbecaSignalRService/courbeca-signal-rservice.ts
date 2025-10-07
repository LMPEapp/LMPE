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
  public CreatedForListe$ = new BehaviorSubject<CourbeCA | null>(null);
  public Deleted$ = new BehaviorSubject<CourbeCA | null>(null);
  public DeletedForListe$ = new BehaviorSubject<CourbeCA | null>(null);

  constructor() { }

  get connectionState(): string | undefined {
    return this.hubConnection?.state;
  }

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
      this.CreatedForListe$.next(agenda);
      this.Created$.next(agenda);
    });

    this.hubConnection.on('CourbecaDeleted', (agenda: CourbeCA) => {
      this.DeletedForListe$.next(agenda);
      this.Deleted$.next(agenda);
    });
  }

  JoinCourbeca() {
    this.hubConnection.invoke('JoinCourbeca')
      .catch(err => console.error(err));
  }

  LeaveCourbeca() {
    this.resetSubjects();
    this.hubConnection.invoke('LeaveCourbeca')
      .catch(err => console.error(err))
      .finally(() => {
      if (this.hubConnection) {
        this.hubConnection.stop()
          .then(() => console.log('🔌 Hub SignalR stoppé proprement'))
          .catch(err => console.error('Erreur lors de l’arrêt du hub', err));
      }
    });
  }

  private resetSubjects() {
    this.Created$.next(null);
    this.Deleted$.next(null);
    this.CreatedForListe$.next(null);
    this.DeletedForListe$.next(null);
  }
}
