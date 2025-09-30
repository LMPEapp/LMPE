import { Component, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { MessageOut } from '../../../Models/Message.model';
import { MyLocalDatePipe } from "../../../Helper/myLocalDate/my-local-date-pipe";
import { CommonModule } from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../Models/user.model';
import { AuthService } from '../../../service/Auth/auth';

@Component({
  selector: 'app-message',
  templateUrl: './message-component.html',
  styleUrls: ['./message-component.scss'],
  standalone: true,
  imports: [MyLocalDatePipe, CommonModule, MatMenuModule, MatButtonModule, MatIconModule]
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

  constructor(public auth: AuthService) {
      this.user = auth.loginData?.user;
    }

  get isMine(): boolean {
    return this.message?.userId === this.currentUserId;
  }

  onUpdate() {
    this.update.emit(this.message);
  }

  onDelete() {
    this.delete.emit(this.message);
  }

  // Start long-press detection
  startPress(event: Event) {
    if (!this.isMine) return;
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
}
