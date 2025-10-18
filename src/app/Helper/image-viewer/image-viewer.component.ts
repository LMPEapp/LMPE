import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'] 
})
export class ImageViewerComponent {
  @Input() imageUrl: string = '';
  isOpen = false;

  open() {
    this.isOpen = true;
  }

  close(event?: Event) {
    if(event) event.stopPropagation(); // empêche la propagation si clic sur le bouton
    this.isOpen = false;
  }
}
