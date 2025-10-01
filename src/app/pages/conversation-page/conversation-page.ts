import { User } from './../../Models/user.model';
import { GroupeConversation } from './../../Models/GroupeConversation.model';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/Auth/auth';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
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
  @ViewChild('messagesWrapper') messagesWrapper!: ElementRef;

  GroupeConversation?:GroupeConversation;
  user: User | undefined;

  messages:MessageOut[]= [];

  messageEdit:MessageOut|null= null;

  typingUsers: User[] = [];
  private typingTimers = new Map<number, any>();

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
      setTimeout(()=>{
        this.scrollToMessage(this.messages[this.messages.length-1].id);
      })

    })

    this.messageHub.startConnection(localStorage.getItem('token') || '')
    .then(() => {
      this.messageHub.joinGroup(conversationId);
    });

    this.messageHub.addmessage$.subscribe(msg => {
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


      console.log("Add Message:", this.messages);
    });

    this.messageHub.updatemessage$.subscribe(msg => {
      if(msg){
        const index = this.messages.findIndex(m => m.id == msg.id);
        if (index != -1) {
          this.messages[index] = msg;
        }
      }
      console.log("Update Message:", this.messages);
    });

    this.messageHub.deletemessage$.subscribe(id => {
      if(id){
        const index = this.messages.findIndex(m => m.id == id);
        if (index != -1) {
          this.messages.splice(index, 1);
        }
      }
      console.log("Delete Message:", this.messages);
    });

    this.messageHub.typingUser$.subscribe(user => {
      if (user as User && user != null) {
        this.handleUserTyping(user);
      }
    });

    console.log('ID de la conversation:', conversationId);
    // ici tu peux appeler ton API pour récupérer les messages
  }
  ngOnDestroy() {
    if(this.GroupeConversation){
      this.messageHub.leaveGroup(this.GroupeConversation?.id);
    }
  }


  private handleUserTyping(user: User) {
    // Si l'utilisateur n'est pas déjà dans la liste, on l'ajoute
    if (!this.typingUsers.find(u => u.id === user.id)) {
      this.typingUsers.push(user);
    }

    // Si un timer existait déjà pour cet utilisateur, on le supprime
    const existingTimer = this.typingTimers.get(user.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // On recrée un timer de 2s : si pas de nouvelle frappe, on le retire
    const timer = setTimeout(() => {
      this.removeTypingUser(user.id);
    }, 2000);

    this.typingTimers.set(user.id, timer);
  }

  /**
   * Supprime un user de la liste typingUsers et nettoie son timer
   */
  private removeTypingUser(userId: number) {
    this.typingUsers = this.typingUsers.filter(u => u.id !== userId);
    const timer = this.typingTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(userId);
    }
  }

  scrollToMessage(messageId: number, smooth: boolean = false) {
    const el = document.getElementById('msg-' + messageId);
    if (el) {
      el.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      });
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
      const lastId = this.messages.length > 0 ? this.messages[0].id : undefined;

      if(lastId){
        this.MessageAccessApi.getByGroup(this.GroupeConversation?.id, lastId).subscribe((data) => {
          this.messages.unshift(...data);
          setTimeout(()=>{
            this.scrollToMessage(lastId);
          })

        });
        }


    }
  }
  adjustTextarea() {
    setTimeout(()=>{
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      textarea.style.height = 'auto'; // réinitialise la hauteur
      const maxHeight = 10 * 15; // environ 10 lignes (24px par ligne)
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    })
  }

  newMessage: string = '';

  sendMessage() {
    if (!this.newMessage.trim() || !this.GroupeConversation) return;

    if(this.messageEdit==null){
      const input:MessageIn = {
        userId: this.user?.id ?? 0,
        type: 'texte',
        content: this.newMessage.trim(),
      };

      this.MessageAccessApi.create(this.GroupeConversation.id, input).subscribe((msg) => {
        this.newMessage = '';
        this.adjustTextarea();
        setTimeout(()=>{
          this.scrollToMessage(this.messages[this.messages.length-1].id,true);
        })
      });
    }
    else{
      const input:MessageIn = {
        userId: this.messageEdit?.userId,
        type: 'texte',
        content: this.newMessage.trim(),
      };

      if (!this.GroupeConversation) return;
      this.MessageAccessApi.update(this.GroupeConversation.id,this.messageEdit.id, input).subscribe((msg) => {
        this.messageEdit=null;
        this.newMessage = '';
        this.adjustTextarea();
       });
    }


  }
  onTyping() {
    if(this.GroupeConversation && this.user){
      this.messageHub.typing(this.GroupeConversation.id, this.user);
    }
    this.adjustTextarea();
  }

  onDeleteMessage(event: MessageOut) {
    if (!this.GroupeConversation) return;
    this.MessageAccessApi.delete(this.GroupeConversation.id,event.id).subscribe((msg) => { });
  }
  onUpdateMessage(event: MessageOut) {
    this.messageEdit = event;
    this.newMessage = event.content;
    this.adjustTextarea();
  }
  onScroll() {
    const element = this.messagesWrapper.nativeElement;
    if (element.scrollTop === 0) {
      this.addMessage();
    }
  }
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // ⛔ Empêche le saut de ligne normal
      this.sendMessage();     // ✅ Envoie le message
    }
  }
}
