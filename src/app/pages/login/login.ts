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
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  hidePassword = true;
  errorMessage = '';
  loginForm: FormGroup;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private AuthAccessApiService: AuthAccessApiService,
    private router: Router,
    private pushApi: PushAccessapi
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.AuthAccessApiService.login(this.loginForm.value).subscribe({
      next: (data) => {
        this.auth.login(data);
        const redirect = this.auth.redirectUrl || '/home';
        this.router.navigate([redirect]);
        this.auth.redirectUrl = null;

        // -----------------------------
        // Demander la permission pour les notifications
        // -----------------------------
        if ('Notification' in window && 'serviceWorker' in navigator) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              navigator.serviceWorker.ready.then(swReg => {
                swReg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: this.urlBase64ToUint8Array('BH3IbEl1dPjulBkExkqNjA4QpojoTr2H5XSBvB4KNAKtIjd1_TKIroxO7lFcmDTbmSoZrN-BXNSX0pzY-OOaeg8')
                }).then(sub => {

                  // ⚡ Création correcte du DTO en TypeScript
                  if (data.user && data.user.id) {
                    const dto: PushSubscriptionDto = {
                      userId: data.user.id, 
                      subscription: {
                        endpoint: sub.endpoint,
                        keys: {
                          p256dh: sub.getKey('p256dh') 
                            ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))) 
                            : '',
                          auth: sub.getKey('auth') 
                            ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))) 
                            : ''
                        }
                      }
                    };
                    this.pushApi.register(dto).subscribe({
                      next: () => console.log('Push enregistré pour l’utilisateur'),
                      error: err => console.error('Erreur push:', err)
                    });
                  }

                  // Envoi au serveur
                  
                }).catch(err => console.error('Erreur abonnement push:', err));
              });
            } else {
              console.warn('Permission notifications refusée');
            }
          });
        }
      },
      error: (err) => {
        if(err.status === 401) {
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
