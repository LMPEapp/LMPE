import { Component, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { MessageOut } from '../../../Models/Message.model';
import { CommonModule } from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../Models/user.model';
import { AuthService } from '../../../service/Auth/auth';
import { MyRelativeDatePipe } from '../../../Helper/DatePipe/relative-date-pipe';
import { AvatarComponent } from "../../../ExternComposent/avatar/avatar";
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MessageReactionAccessApi } from '../../../service/AccessAPi/MessageReactionAccessApi/message-reaction-access-api';
import { MessageReactionIn, MessageReactionOut } from '../../../Models/MessageReaction.model';
import { ActivatedRoute } from '@angular/router';
import { MessageSignalRService } from '../../../service/SignalR/MessageSignalRService/message-signal-rservice';
import { Subscription } from 'rxjs';
import Autolinker from 'autolinker';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-message',
  templateUrl: './message-component.html',
  styleUrls: ['./message-component.scss'],
  standalone: true,
  imports: [
    MyRelativeDatePipe,
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    AvatarComponent,
  ]
})
export class MessageComponent implements OnDestroy {
  @Input() message!: MessageOut;
  @Input() currentUserId?: number;

  @Output() update = new EventEmitter<MessageOut>();
  @Output() delete = new EventEmitter<MessageOut>();
  conversationId: number;

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  private pressTimer: any = null;
  private lastTap = 0;
  private doubleTapTimeout: any = null;
  private pressDelay = 600; // durée du long press (ms)

  user: User | undefined;

  private deleteSub?: Subscription;
  private addSub?: Subscription;

  showEmojiPopup = false;
  showFullPicker = false;
  private localStorageKey = 'emojiUsage';

  // liste complète d'emojis
  allEmojis = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','🥲','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
    '😋','😛','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔',
    '😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕',
    '😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓',
    '😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺',
    '😸','😹','😻','😼','😽','🙀','😿','😾','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮',
    '🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗',
    '🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖',
    '🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘',
    '🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮',
    '🐕‍🦺','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔',
    '🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑',
    '🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳',
    '🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🫔','🌮','🌯','🫱','🥗','🥘','🍲','🫕',
    '🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🫓','🥠','🥡','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🍡','🍧',
    '🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🧂','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃',
    '🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥣','🥡','🥢','🧇','🧈'
  ];


  sortEmojisOther: string[] = [];
  quickEmojis: string[] = [];
  popupTop = 0;
  popupLeft = 0;
  popupWidth = 300;  // largeur approximative du popup
  popupHeight = 250; // hauteur approximative
  margin = 8;

  private autolinker = new Autolinker({
    urls: true,
    email: true,
    phone: true,
    stripPrefix: true,
    truncate: { length: 40, location: 'smart' },
    className: 'url-link',
  });


  constructor(public auth: AuthService,private clipboard: Clipboard,
    private snackBar: MatSnackBar, private reactionAccessApi: MessageReactionAccessApi,
    private route: ActivatedRoute, private messageHub: MessageSignalRService) {
      this.user = auth.loginData?.user;
      this.conversationId = Number(this.route.snapshot.paramMap.get('id'));
    }

  get isMine(): boolean {
    return this.message?.userId === this.currentUserId;
  }

  ngOnInit(): void {
    this.subscibeSignalR();
  }

  updateEmojis() {
    const usage = JSON.parse(localStorage.getItem(this.localStorageKey) || '{}');

    // trier tous les emojis par utilisation
    const sorted = [...this.allEmojis].sort((a, b) => (usage[b] || 0) - (usage[a] || 0));

    this.quickEmojis = sorted.slice(0, 5);
    this.sortEmojisOther = sorted.slice(5);
  }


  formatMessageContent(content: string): SafeHtml {
    const linkedText = this.autolinker.link(content);
    return linkedText;
  }

  private subscibeSignalR(): void {
    this.cleanSignalRSubscriptions();

    this.addSub = this.messageHub.addreaction$.subscribe(msg => {
      if (msg && msg.messageId == this.message.id) {
        const index = this.message.reactions.findIndex(m => m.id == msg.id);
        if (index === -1) {
          this.message.reactions.push(msg);
        } else {
          this.message.reactions.splice(index, 1, msg);
        }
      }
    });

    this.deleteSub = this.messageHub.deletereaction$.subscribe(id => {
      if (!id) return;
      this.message.reactions = this.message.reactions.filter(m => m.id !== id);
    });
  }
  private cleanSignalRSubscriptions(): void {
    this.addSub?.unsubscribe();
    this.deleteSub?.unsubscribe();
  }

  onCopier(): void {
    if (this.message.type === 'texte' && this.message.content) {
      this.clipboard.copy(this.message.content);
      this.snackBar.open('Texte copié ✅', 'Fermer', { duration: 2000 });
    }
  }


  onUpdate() {
    this.update.emit(this.message);
  }

  onDelete() {
    this.delete.emit(this.message);
  }

  onPointerDown(event: PointerEvent) {
    // ⚠️ Si l'utilisateur clique sur un lien, on laisse le comportement normal
    const target = event.target as HTMLElement;
    if (target.closest('a')) return; // ✅ autoriser les liens

    // sinon, on empêche le comportement par défaut
    event.preventDefault();
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTap;

    // 🔹 Si double tap détecté (< 300ms entre deux taps)
    if (timeSinceLastTap > 0 && timeSinceLastTap < 300) {
      clearTimeout(this.doubleTapTimeout);
      this.cancelPress();
      this.onDoubleTap(event);
    } else {
      // 🔹 Sinon, on prépare un long press
      this.cancelPress();
      this.pressTimer = setTimeout(() => {
        this.onLongPress(event);
      }, this.pressDelay);

      // 🔹 Et on prévoit que si c’est pas un double tap → simple tap
      this.doubleTapTimeout = setTimeout(() => {
        this.onSingleTap(event);
      }, 300);
    }

    this.lastTap = now;
  }

  onPointerUp() {
    this.cancelPress();
  }

  cancelPress() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  // 🟢 Simple tap
  onSingleTap(event: PointerEvent) {
    console.log('👆 Simple tap détecté');
    // ton code ici
  }

  setPosition(event: PointerEvent){
    const clientX = event.clientX;
    const clientY = event.clientY;

    // limiter la position pour ne pas dépasser l'écran
    this.popupLeft = Math.min(window.innerWidth - this.popupWidth - this.margin, Math.max(this.margin, clientX));
    this.popupTop = Math.min(window.innerHeight - this.popupHeight - this.margin, Math.max(this.margin, clientY));
  }
  // 🟢 Double tap
  onDoubleTap(event: PointerEvent) {
    this.setPosition(event);
    this.openEmojiPopup();
  }

  openEmojiPopup() {
    this.updateEmojis();
    this.showEmojiPopup = true;
    this.showFullPicker = false;

    // focus sur le popup pour détecter blur
    setTimeout(() => {
      const popup = document.querySelector('.emoji-popup') as HTMLElement;
      popup?.focus();
    }, 0);
  }

  closeEmojiPopup() {
    this.showEmojiPopup = false;
    this.showFullPicker = false;
  }


  addReaction(emoji: string) {
    // mise à jour localStorage
    const usage = JSON.parse(localStorage.getItem(this.localStorageKey) || '{}');
    usage[emoji] = (usage[emoji] || 0) + 1;
    localStorage.setItem(this.localStorageKey, JSON.stringify(usage));

    // appel API
    const reactionIn: MessageReactionIn = {
      messageId: this.message.id,
      userId: this.user!.id,
      emoji
    };
    this.reactionAccessApi.addReaction(this.conversationId, reactionIn).subscribe({
      next: id => {
        console.log('Réaction ajoutée', emoji);
        this.closeEmojiPopup();
      },
      error: err => console.error('Erreur ajout réaction', err)
    });
  }

  // ouverture sélecteur complet
  openFullEmojiPicker() {
    this.showFullPicker = true;
  }

  // 🟢 Long press
  onLongPress(event: PointerEvent) {
    // ouvre ton menu contextuel
    if (this.menuTrigger) {
      this.menuTrigger.openMenu();
    }
  }

  ngOnDestroy(): void {
    this.cancelPress();
    this.cleanSignalRSubscriptions();
  }

  getUrl():string{
    return environment.apiUrl+"/uploads/messages/"+this.message.content;
  }
  downloadFile() {
    const url = this.getUrl(); // URL du fichier
    const fileName = this.message.content || 'fichier';

    // Crée un élément <a> temporaire
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // nom du fichier
    document.body.appendChild(a);
    a.click();               // déclenche le téléchargement
    document.body.removeChild(a);
  }

  onReactionClick(reaction: MessageReactionOut) {

    if(reaction.userId==this.user?.id){
      this.reactionAccessApi.deleteReaction(this.conversationId, reaction.id).subscribe({
        next: id => console.log('Réaction supprimé avec id', id),
        error: err => console.error('Erreur supprimé réaction', err)
      });
    }

  }

}
