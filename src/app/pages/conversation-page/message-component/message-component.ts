import { Component, Input } from '@angular/core';
import { MessageOut } from '../../../Models/Message.model';
import { MyLocalDatePipe } from "../../../Helper/myLocalDate/my-local-date-pipe";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-message',
  templateUrl: './message-component.html',
  styleUrls: ['./message-component.scss'],
  standalone: true,
  imports: [MyLocalDatePipe,CommonModule]
})
export class MessageComponent {
  @Input() message!: MessageOut;
  @Input() currentUserId?: number;

  get isMine(): boolean {
    return this.message?.userId === this.currentUserId;
  }
}
