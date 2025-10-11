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

@Component({
  selector: 'app-message',
  templateUrl: './message-component.html',
  styleUrls: ['./message-component.scss'],
  standalone: true,
  imports: [MyRelativeDatePipe, CommonModule, MatMenuModule, MatButtonModule, MatIconModule, AvatarComponent]
})
export class MessageComponent implements OnDestroy {
  @Input() message!: MessageOut;
  @Input() currentUserId?: number;

  @Output() update = new EventEmitter<MessageOut>();
  @Output() delete = new EventEmitter<MessageOut>();

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly pressDelay = 500; // ms

  user: User | undefined;

  constructor(public auth: AuthService,private clipboard: Clipboard,
    private snackBar: MatSnackBar) {
      this.user = auth.loginData?.user;
    }

  get isMine(): boolean {
    return this.message?.userId === this.currentUserId;
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

  // Start long-press detection
  startPress(event: Event) {
    if (!this.isMine && !this.user?.isAdmin) return;
    // évite certains comportements natifs (sélection, etc.)
    try { (event as Event).preventDefault(); } catch { /* ignore */ }

    this.cancelPress();
    this.pressTimer = setTimeout(() => {
      // ouvre le menu si présent
      this.menuTrigger?.openMenu();
    }, this.pressDelay);
  }

  // End / cancel
  endPress() {
    this.cancelPress();
  }

  cancelPress() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.cancelPress();
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

}
