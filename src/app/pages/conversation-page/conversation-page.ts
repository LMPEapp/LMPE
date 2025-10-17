import { User } from './../../Models/user.model';
import { GroupeConversation } from './../../Models/GroupeConversation.model';
import { Component, ElementRef, ViewChild, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
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
import { ValidationDialogComponent } from "../../ExternComposent/validation-dialog/validation-dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Subscription } from 'rxjs';

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
    MessageComponent,
    ValidationDialogComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './conversation-page.html',
  styleUrl: './conversation-page.scss'
})
export class ConversationPage implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild(AddUserConversation) AddUserConversation!: AddUserConversation;
  @ViewChild('messagesWrapper') messagesWrapper!: ElementRef;
  @ViewChild(ValidationDialogComponent) alert!: ValidationDialogComponent;

  GroupeConversation?: GroupeConversation;
  conversationId: number;
  MessageSelectd?: number;
  user?: User;

  messages: MessageOut[] = [];
  messageEdit: MessageOut | null = null;
  messageRepondre: MessageOut | null = null;
  newMessage: string = '';

  isLoading = false;
  isLoadingSendMessage = false;
  isBottom = true;
  scrolledInitially = false;

  typingUsers: User[] = [];
  private typingTimers = new Map<number, any>();
  private visibilityHandler?: () => void;

  // Subscriptions SignalR
  private addSub?: Subscription;
  private updateSub?: Subscription;
  private deleteSub?: Subscription;
  private typingSub?: Subscription;

  selectedFile?: File;
  imagePreview?: string;
  videoPreview?: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService,
    private groupsAccessApi: GroupsAccessApi,
    private messageApi: MessageAccessApi,
    private messageHub: MessageSignalRService,
    private snackBar: MatSnackBar
  ) {
    this.user = auth.loginData?.user;
    this.conversationId = Number(this.route.snapshot.paramMap.get('id'));
  }

  // ─────────────────────────────
  // 🚀 Cycle de vie
  // ─────────────────────────────
  ngOnInit(): void {
    this.init();

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        console.log('🌐 Retour sur la page → vérification SignalR');
        this.loadData();
        this.ensureSignalRConnected();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    this.cleanSignalRSubscriptions();

    if (this.GroupeConversation) {
      this.messageHub.leaveGroup(this.GroupeConversation.id);
    }

    this.messageApi.readAll(this.conversationId).subscribe();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  ngAfterViewChecked(): void {
    if (!this.scrolledInitially && this.messages.length > 0) {
      this.scrolledInitially = true;
      setTimeout(() => this.scrollToBottom());
    }
  }

  // ─────────────────────────────
  // ⚙️ Initialisation
  // ─────────────────────────────
  private init(): void {
    this.loadData();
    this.subscibeSignalR();
    this.ensureSignalRConnected();
  }

  private async ensureSignalRConnected(): Promise<void> {
    const state = this.messageHub.connectionState;

    if (state === 'Connected' || state === 'Connecting' || state === 'Reconnecting') {
      console.log(`⏸️ SignalR déjà actif (${state})`);
      return;
    }

    console.log('🚀 Connexion SignalR...');
    try {
      await this.messageHub.startConnection(localStorage.getItem('token') || '');
      this.messageHub.joinGroup(this.conversationId);
    } catch (err) {
      console.error('❌ Erreur SignalR', err);
    }
  }

  private loadData(): void {
    this.isLoading = true;
    this.isLoadingSendMessage = false;
    this.groupsAccessApi.getById(this.conversationId).subscribe({
      next: data => {
        this.GroupeConversation = data;
        this.isLoading = false;
        this.loadMessages();
      },
      error: err => {
        this.isLoading = false;
        if (err.status === 401) this.auth.logout();
        this.snackBar.open('Erreur de chargement du groupe', 'Fermer', { duration: 3000 });
      }
    });
  }

  private loadMessages(): void {
    this.messageApi.getByGroup(this.conversationId).subscribe({
      next: data => {
        this.messages = data;
        this.scrolledInitially = false;
        console.log(this.messages)
      },
      error: err => console.error(err)
    });
  }

  // ─────────────────────────────
  // 🔗 SignalR
  // ─────────────────────────────
  private subscibeSignalR(): void {
    this.cleanSignalRSubscriptions();

    this.addSub = this.messageHub.addmessage$.subscribe(msg => {
      if (msg && !this.messages.find(m => m.id === msg.id)) {
        const index = this.messages.findIndex(m => m.id > msg.id);
        if (index === -1) {
          this.messages.push(msg);
          if (this.isBottom) setTimeout(() => this.scrollToBottom(true));
        } else {
          this.messages.splice(index, 0, msg);
        }
      }
    });

    this.updateSub = this.messageHub.updatemessage$.subscribe(msg => {
      if (!msg) return;
      const i = this.messages.findIndex(m => m.id === msg.id);
      if (i !== -1) this.messages[i] = msg;
    });

    this.deleteSub = this.messageHub.deletemessage$.subscribe(id => {
      if (!id) return;
      this.messages = this.messages.filter(m => m.id !== id);
    });

    this.typingSub = this.messageHub.typingUser$.subscribe(user => {
      if (user) this.handleUserTyping(user);
    });
  }

  private cleanSignalRSubscriptions(): void {
    this.addSub?.unsubscribe();
    this.updateSub?.unsubscribe();
    this.deleteSub?.unsubscribe();
    this.typingSub?.unsubscribe();
  }

  // ─────────────────────────────
  // ✉️ Gestion des messages
  // ─────────────────────────────
  sendMessage() {
    if (!this.newMessage.trim() || !this.GroupeConversation || this.isLoadingSendMessage) return;
    this.isLoadingSendMessage = true;
    if(this.messageEdit==null){
      const input:MessageIn = {
        userId: this.user?.id ?? 0,
        type: 'texte',
        content: this.newMessage.trim(),
        parentId: this.messageRepondre!=null?this.messageRepondre.id:null
      };

      this.messageApi.create(this.GroupeConversation.id, input).subscribe((msg) => {
        this.newMessage = '';
        this.adjustTextarea();
        setTimeout(()=>{
          this.scrollToBottom(true);
        })
        this.isLoadingSendMessage = false;
        this.messageRepondre = null;
      });
    }
    else{
      const input:MessageIn = {
        userId: this.messageEdit?.userId,
        type: 'texte',
        content: this.newMessage.trim(),
      };

      if (!this.GroupeConversation) return;
      this.messageApi.update(this.GroupeConversation.id,this.messageEdit.id, input).subscribe((msg) => {
        this.onCoseEdit();
        this.isLoadingSendMessage = false;
        this.messageRepondre = null;
       });
    }


  }

  onTyping(): void {
    if (this.GroupeConversation && this.user) {
      this.messageHub.typing(this.GroupeConversation.id, this.user);
    }
    this.adjustTextarea();
  }

  onUpdateMessage(event: MessageOut): void {
    this.messageEdit = event;
    this.newMessage = event.content;
    this.adjustTextarea();
  }

  onDeleteMessage(event: MessageOut): void {
    this.MessageSelectd = event.id;
    this.deleteorleave = "delete";
    this.alert.open('Supprimer le message', 'Confirmer la suppression ?', false);
  }
  onRepondreMessage(event: MessageOut): void {
    this.messageRepondre = event;

  }

  onCoseEdit(): void {
    this.messageEdit = null;
    this.newMessage = '';
    this.adjustTextarea();
  }

  // ─────────────────────────────
  // 🧍 Gestion des utilisateurs
  // ─────────────────────────────
  private handleUserTyping(user: User): void {
    if (!this.typingUsers.find(u => u.id === user.id)) {
      this.typingUsers.push(user);
    }

    const oldTimer = this.typingTimers.get(user.id);
    if (oldTimer) clearTimeout(oldTimer);

    const timer = setTimeout(() => this.removeTypingUser(user.id), 2000);
    this.typingTimers.set(user.id, timer);
  }

  private removeTypingUser(userId: number): void {
    this.typingUsers = this.typingUsers.filter(u => u.id !== userId);
    const timer = this.typingTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(userId);
    }
  }

  // ─────────────────────────────
  // 🧩 UI / Scroll / Textarea
  // ─────────────────────────────
  adjustTextarea(): void {
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
        const maxHeight = 10 * 15;
        textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
      }
    });
  }

  onGestion() {
    this.AddUserConversation.onOpen(this.GroupeConversation);
  }
  onScroll(): void {
    const el = this.messagesWrapper.nativeElement;
    if (el.scrollTop === 0) this.addOlderMessages();

    const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.isBottom = scrollBottom <= 200;
  }

  private addOlderMessages(): void {
    if (!this.GroupeConversation || this.messages.length === 0) return;

    const lastId = this.messages[0].id;
    this.messageApi.getByGroup(this.GroupeConversation.id, lastId).subscribe(data => {
      this.messages.unshift(...data);
      setTimeout(() => this.scrollToMessage(lastId));
    });
  }

  scrollToMessage(id: number, smooth: boolean = false): void {
    const el = document.getElementById(`msg-${id}`);
    if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  }

  scrollToBottom(smooth: boolean = false): void {
    const el = document.getElementById('msg-end');
    if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  }

  // ─────────────────────────────
  // 🧭 Divers
  // ─────────────────────────────
  goBack(): void { this.router.navigate(['home']); }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  deleteorleave?: "delete" | "leave";

  onleaveGroupe(): void {
    this.deleteorleave = "leave";
    this.alert.open('Quitter la conversation', 'Confirmer ?', false);
  }

  onAlertClosed(event: boolean): void {
    if (!event || !this.GroupeConversation || !this.user) return;

    if (this.deleteorleave === "leave") {
      this.groupsAccessApi.removeUser(this.GroupeConversation.id, this.user.id).subscribe({
        next: () => {
          this.snackBar.open('Groupe quitté ✅', 'Fermer', { duration: 3000 });
          this.goBack();
        },
        error: err => {
          if (err.status === 401) this.auth.logout();
          this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', { duration: 5000 });
        }
      });
    } else if (this.deleteorleave === "delete" && this.MessageSelectd) {
      this.messageApi.delete(this.GroupeConversation.id, this.MessageSelectd).subscribe();
    }
  }

  onFileSelected(event: Event) {
    this.messageRepondre = null;
    const input = event.target as HTMLInputElement;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;

    if (this.isImage(file)) {
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
      this.videoPreview = undefined;
    } else if (this.isVideo(file)) {
      this.videoPreview = URL.createObjectURL(file);
      this.imagePreview = undefined;
    } else {
      this.imagePreview = undefined;
      this.videoPreview = undefined;
    }
    if (this.visibilityHandler) {
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
    input.value = '';
  }

  isVideo(file: File): boolean {
    return file.type.startsWith('video/');
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  removeSelectedFile() {
    this.selectedFile = undefined;
    this.imagePreview = undefined;
  }

  sendMessageOrUpload() {
    if (this.selectedFile) {
      // ⚡ Upload fichier/image
      this.isLoadingSendMessage = true;
      this.messageApi.upload(this.conversationId, this.selectedFile).subscribe({
        next: (msg) => {
          this.selectedFile = undefined;
          this.isLoadingSendMessage = false;
          setTimeout(()=>{
            this.scrollToBottom(true);
          })
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Erreur lors de l\'upload', 'Fermer', { duration: 3000 });
          this.isLoadingSendMessage = false;
        }
      });
    } else {
      // ⚡ Envoi message texte
      this.sendMessage();
    }
  }
  onFileInputClick() {
    // désactiver temporairement
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }
}
