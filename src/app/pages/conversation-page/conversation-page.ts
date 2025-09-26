import { GroupeConversation } from './../../Models/GroupeConversation.model';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/Auth/auth';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { User } from '../../Models/user.model';
import { GroupsAccessApi } from '../../AccessAPi/GroupsAccessApi/groups-access-api';
import { AddUserConversation } from "./add-user-conversation/add-user-conversation";

@Component({
  selector: 'app-conversation-page',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatSidenavModule,
    AddUserConversation
],
  templateUrl: './conversation-page.html',
  styleUrl: './conversation-page.scss'
})
export class ConversationPage {

  @ViewChild(AddUserConversation) AddUserConversation!: AddUserConversation;

  GroupeConversation?:GroupeConversation;
  user: User | undefined;

  constructor(private router: Router,private route: ActivatedRoute, public auth: AuthService,private groupsAccessApi: GroupsAccessApi) {
    this.user = auth.loginData?.user;
  }

  ngOnInit() {
    let conversationId = Number(this.route.snapshot.paramMap.get('id'));
    this.groupsAccessApi.getById(conversationId).subscribe((data)=>{
      this.GroupeConversation=data;
    })
    console.log('ID de la conversation:', conversationId);
    // ici tu peux appeler ton API pour récupérer les messages
  }

  goBack() {
    this.router.navigate(['']); // remplace par la route voulue
  }
  onGestion() {
    this.AddUserConversation.onOpen(this.GroupeConversation);
  }
}
