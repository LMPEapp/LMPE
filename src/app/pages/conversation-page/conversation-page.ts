import { GroupeConversation } from './../../Models/GroupeConversation.model';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/Auth/auth';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { User } from '../../Models/user.model';
import { AddUserConversation } from "./add-user-conversation/add-user-conversation";
import { MessageOut, MessageIn } from '../../Models/Message.model';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from "./message-component/message-component";
import { GroupsAccessApi } from '../../service/AccessAPi/GroupsAccessApi/groups-access-api';
import { MessageAccessApi } from '../../service/AccessAPi/MessageAccessApi/message-access-api';
import { MessageSignalRService } from '../../service/SignalR/MessageSignalRService/message-signal-rservice';

@Component({
  selector: 'app-conversation-page',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatSidenavModule,
    AddUserConversation,
    FormsModule,
    MessageComponent
],
  templateUrl: './conversation-page.html',
  styleUrl: './conversation-page.scss'
})
export class ConversationPage {

  @ViewChild(AddUserConversation) AddUserConversation!: AddUserConversation;

  GroupeConversation?:GroupeConversation;
  user: User | undefined;

  messages:MessageOut[]= [];

  constructor(private router: Router,private route: ActivatedRoute,
    public auth: AuthService,private groupsAccessApi: GroupsAccessApi,
    private MessageAccessApi:MessageAccessApi,private messageHub: MessageSignalRService) {
    this.user = auth.loginData?.user;
  }

  ngOnInit() {
    let conversationId = Number(this.route.snapshot.paramMap.get('id'));
    this.groupsAccessApi.getById(conversationId).subscribe((data)=>{
      this.GroupeConversation=data;
    })

    this.MessageAccessApi.getByGroup(conversationId).subscribe((data)=>{
      this.messages=data;
      console.log(this.messages)
    })

    this.messageHub.startConnection(localStorage.getItem('token') || '')
    .then(() => {
      this.messageHub.joinGroup(conversationId);
    });

    this.messageHub.message$.subscribe(msg => {
      if(msg){
        if (!this.messages.find(m => m.id === msg.id)) {
          // trouver l'index où l'insérer pour garder l'ordre croissant par id
          const index = this.messages.findIndex(m => m.id > msg.id);
          if (index === -1) {
            // si aucun id supérieur, on push à la fin
            this.messages.push(msg);
          } else {
            // insérer à la position correcte
            this.messages.splice(index, 0, msg);
          }
        }
      }


      console.log("Messages mis à jour:", this.messages);
    });

    this.messageHub.typingUser$.subscribe(user => {
      console.log("typingUsers "+user)
    });

    console.log('ID de la conversation:', conversationId);
    // ici tu peux appeler ton API pour récupérer les messages
  }
  ngAfterViewChecked() {
    const container = document.querySelector('.messages-wrapper');
    if (container) container.scrollTop = container.scrollHeight;
  }
  ngOnDestroy() {
    if(this.GroupeConversation){
      this.messageHub.leaveGroup(this.GroupeConversation?.id);
    }
  }


  goBack() {
    this.router.navigate(['']); // remplace par la route voulue
  }
  onGestion() {
    this.AddUserConversation.onOpen(this.GroupeConversation);
  }

  addMessage(){
    if(this.GroupeConversation){
      const lastId = this.messages.length > 0 ? this.messages[this.messages.length - 1].id : undefined;

      this.MessageAccessApi.getByGroup(this.GroupeConversation?.id, lastId).subscribe((data) => {
        this.messages.unshift(...data);
      });

    }
  }
  adjustTextarea(event: Event) {
    this.onTyping();
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // réinitialise la hauteur
    const maxHeight = 10 * 24; // environ 10 lignes (24px par ligne)
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
  }

  newMessage: string = '';

  sendMessage() {
    if (!this.newMessage.trim() || !this.GroupeConversation) return;

    const input:MessageIn = {
      userId: this.user?.id ?? 0,
      type: 'texte',
      content: this.newMessage.trim(),
    };

    this.MessageAccessApi.create(this.GroupeConversation.id, input).subscribe((msg) => {
      //this.messages.push(msg);
      this.newMessage = '';
    });
  }
  onTyping() {
    if(this.GroupeConversation && this.user){
      this.messageHub.typing(this.GroupeConversation.id, this.user?.id);
    }
  }
}
