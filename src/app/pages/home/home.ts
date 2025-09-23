import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {}
