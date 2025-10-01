import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { MessageOut } from '../../../Models/Message.model';
import { environment } from '../../../../environments/environment';
import { User } from '../../../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MessageSignalRService {

  private hubConnection!: signalR.HubConnection;

  // Observable pour le dernier message reçu et le dernier user qui tape
  public addmessage$ = new BehaviorSubject<MessageOut | null>(null);
  public deletemessage$ = new BehaviorSubject<number | null>(null);
  public updatemessage$ = new BehaviorSubject<MessageOut | null>(null);
  public typingUser$ = new BehaviorSubject<User | null>(null);

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
      this.addmessage$.next(message); // on ne garde que le dernier message
    });
    this.hubConnection.on('UpdateMessage', (message: MessageOut) => {
      this.updatemessage$.next(message); // on ne garde que le dernier message
    });
    this.hubConnection.on('DeleteMessage', (message: number) => {
      this.deletemessage$.next(message); // on ne garde que le dernier message
    });

    this.hubConnection.on('UserTyping', (user: User) => {
      this.typingUser$.next(user);
    });
  }

  joinGroup(groupId: number) {
    this.hubConnection.invoke('JoinGroup', groupId)
      .catch(err => console.error(err));
  }

  leaveGroup(groupId: number) {
    this.typingUser$.next(null);
    this.addmessage$.next(null);
    this.deletemessage$.next(null);
    this.updatemessage$.next(null);
    this.hubConnection.invoke('LeaveGroup', groupId)
      .catch(err => console.error(err));
  }

  typing(groupId: number, user: User) {
    this.hubConnection.invoke('Typing', groupId, user)
      .catch(err => console.error(err));
  }

  sendMessageToGroup(groupId: number, message: MessageOut) {
    this.hubConnection.invoke('SendMessageToGroup', groupId, message)
      .catch(err => console.error(err));
  }
}
