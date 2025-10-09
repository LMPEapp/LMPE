import { Component } from '@angular/core';
import { MatDivider } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-contact-page',
  imports: [MatDivider, MatIconModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss'
})
export class ContactPage {

}
