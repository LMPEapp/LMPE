import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrls: ['./avatar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class AvatarComponent implements OnChanges {
  @Input() url?: string;
  @Input() alt? = 'Avatar';
  @Input() size: string | number = 50; // 👈 peut être '40%' ou 50

  avatarUrl?: string;
  public apiBase: string;

  constructor(private cd: ChangeDetectorRef) {
    this.apiBase = environment.apiUrl;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.url) {
      this.avatarUrl = undefined;
      return;
    }

    this.url = `${this.apiBase}/${this.url}`;

    const img = new Image();
    img.src = this.url;
    img.onload = () => {
      this.avatarUrl = this.url;
      this.cd.markForCheck();
    };
    img.onerror = () => {
      this.avatarUrl = undefined;
      this.cd.markForCheck();
    };
  }

  get computedSize(): string {
    return typeof this.size === 'number' ? `${this.size}px` : this.size;
  }

  onError() {
    this.avatarUrl = undefined;
    this.cd.markForCheck();
  }
}
