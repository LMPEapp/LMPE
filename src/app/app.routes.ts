import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { authGuard } from './guard/Auth/auth-guard';
import { LoginComponent } from './pages/login/login';
import { UsersComponent } from './pages/user/users';
import { ConversationPage } from './pages/conversation-page/conversation-page';
import { AcceuilPage } from './pages/public/acceuil-page/acceuil-page';

export const routes: Routes = [
  { path: '', component: AcceuilPage },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'conversation/:id', component: ConversationPage, canActivate: [authGuard] },
];
