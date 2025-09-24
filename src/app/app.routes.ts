import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { authGuard } from './guard/Auth/auth-guard';
import { LoginComponent } from './pages/login/login';
import { AdminUser } from './pages/admin-user/admin-user';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminUser, canActivate: [authGuard] }
];
