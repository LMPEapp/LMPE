import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

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
  @Input() size = 50;

  avatarUrl?: string;

  // cache partagé entre toutes les instances
  private static cache = new Map<string, string>();

  constructor(private cd: ChangeDetectorRef){}

  ngOnChanges(changes: SimpleChanges) {
    if (!this.url) {
      this.avatarUrl = undefined;
      return;
    }

    // si déjà chargé, on prend la version en cache
    if (AvatarComponent.cache.has(this.url)) {
      this.avatarUrl = AvatarComponent.cache.get(this.url);
      return;
    }

    const img = new Image();
    img.src = this.url;
    img.onload = () => {
      AvatarComponent.cache.set(this.url!, this.url!);
      this.avatarUrl = this.url;
      this.cd.markForCheck();
    };
    img.onerror = () => {
      this.avatarUrl = undefined;
      this.cd.markForCheck();
    };
  }

  onError() {
    this.avatarUrl = undefined;
    this.cd.markForCheck();
  }
}

