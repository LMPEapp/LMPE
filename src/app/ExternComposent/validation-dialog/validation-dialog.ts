import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export interface ValidationDialogData {
  title?: string;
  message?: string;
  singleButton?: boolean;
  encapsulation: ViewEncapsulation.None // true => bouton OK seulement
}

@Component({
  selector: 'app-validation-dialog',
  templateUrl: './validation-dialog.html',
  styleUrls: ['./validation-dialog.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class ValidationDialogComponent {
  public isOpen = false;

  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr ?';
  @Input() singleButton: boolean = false; // true = juste OK

  @Output() closed = new EventEmitter<boolean>();

  open(title?: string, message?: string, singleButton?: boolean) {
    if (title) this.title = title;
    if (message) this.message = message;
    if (singleButton !== undefined) this.singleButton = singleButton;
    this.isOpen = true;
  }

  close(result: boolean) {
    this.isOpen = false;
    this.closed.emit(result);
  }
}
