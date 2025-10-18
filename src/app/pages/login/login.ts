import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthAccessApiService } from '../../service/AccessAPi/authAccessapi/auth-accessapi';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../service/Auth/auth';
import { PushAccessapi } from '../../service/AccessAPi/pushAccessapi/push-accessapi';
import { PushSubscriptionDto } from '../../Models/push.model';
import { SwPush } from '@angular/service-worker';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner
],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  hidePassword = true;
  errorMessage = '';
  loginForm: FormGroup;
  readonly VAPID_PUBLIC_KEY = "BJieS9rJZ5dcmEVMOzyjjz4hh-nkIntZ7Zpx61DpirktTSjK9aHfUjw1lNuzFWCPjD-5cR1xj_unleYj3Ru7ySc";

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private AuthAccessApiService: AuthAccessApiService,
    private router: Router,
    private pushApi: PushAccessapi,
    private swPush: SwPush
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  isLoading = false;

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true; // → active le chargement

    this.AuthAccessApiService.login(this.loginForm.value).subscribe({
      next: (data) => {
        this.auth.login(data);
        const redirect = this.auth.redirectUrl || '/home';
        this.router.navigate([redirect]);
        this.auth.redirectUrl = null;

        this.swPush.requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY
        }).then(sub => {
          const dto: PushSubscriptionDto = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.getKey('p256dh')
                ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!)))
                : '',
              auth: sub.getKey('auth')
                ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!)))
                : ''
            }
          };

          this.pushApi.register(dto).subscribe({
            next: () => {console.log('Push enregistré'); this.isLoading = false;},
            error: err => {console.error('Erreur push:', err); this.isLoading = false;}
          });
        }).catch(err => console.error("Could not subscribe to notifications", err));

      },
      error: (err) => {
        this.isLoading = false; // → désactive le chargement
        if (err.status === 401) {
          this.auth.logout();
        }
        this.errorMessage = err.error || 'Connexion échouée';
      }
    });
  }


  goToHome() {
    this.router.navigate([""]);
  }


  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
