import { Component } from '@angular/core';
import { AuthService } from '../../service/Auth/auth';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ MatButtonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login();
    const redirect = this.auth.redirectUrl || '/';
    this.router.navigate([redirect]);
    this.auth.redirectUrl = null;
  }
}
