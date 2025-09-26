import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { MessageOut } from '../../../Models/Message.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageSignalRService {

  private hubConnection!: signalR.HubConnection;

  // Observable pour le dernier message reçu et le dernier user qui tape
  public message$ = new BehaviorSubject<MessageOut | null>(null);
  public typingUser$ = new BehaviorSubject<number | null>(null);

  constructor() { }

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
      this.message$.next(message); // on ne garde que le dernier message
    });

    this.hubConnection.on('UserTyping', (userId: number) => {
      this.typingUser$.next(userId);
      // Supprimer l'utilisateur après 2 secondes
    });
  }

  joinGroup(groupId: number) {
    this.hubConnection.invoke('JoinGroup', groupId)
      .catch(err => console.error(err));
  }

  leaveGroup(groupId: number) {
    this.typingUser$.next(null);
    this.message$.next(null);
    this.hubConnection.invoke('LeaveGroup', groupId)
      .catch(err => console.error(err));
  }

  typing(groupId: number, userId: number) {
    this.hubConnection.invoke('Typing', groupId, userId)
      .catch(err => console.error(err));
  }

  sendMessageToGroup(groupId: number, message: MessageOut) {
    this.hubConnection.invoke('SendMessageToGroup', groupId, message)
      .catch(err => console.error(err));
  }
}
