import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCard } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MyLocalDatePipe } from "../../../Helper/myLocalDate/my-local-date-pipe";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-week-selector',
  templateUrl: './week-selector.html',
  styleUrls: ['./week-selector.scss'],
  imports: [
    MatCard,
    MatIconModule,
    MyLocalDatePipe,
    CommonModule,
    MatButtonModule,
  ]
})
export class WeekSelectorComponent {
  @Input() currentMonday!: Date;
  @Input() currentSunday!: Date;
  @Input() isCurrentWeek!: boolean;

  @Output() prevWeek = new EventEmitter<void>();
  @Output() nextWeek = new EventEmitter<void>();
  @Output() setToday = new EventEmitter<void>();
}
