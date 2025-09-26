import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthAccessApiService } from '../../AccessAPi/authAccessapi/auth-accessapi';
import { ChangePasswordRequest } from '../../Models/auth.model';
import { User } from '../../Models/user.model';
import { AuthService } from '../../service/Auth/auth';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.html',
  styleUrls: ['./change-password-dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ]
})
export class ChangePasswordDialogComponent {
  public isOpen = false;
  form: FormGroup;
  userChangePWD: User | undefined;
  user: User | undefined;
  apiError:string |undefined;

  constructor(
    private fb: FormBuilder,
    private authApi: AuthAccessApiService,
    public auth: AuthService
  ) {
    this.form = this.fb.group({});
    this.user = auth.loginData?.user;
  }

  open(userSelect: User | undefined) {
    this.userChangePWD = userSelect;
    this.isOpen = true;

    if (!userSelect) return;

    if (this.user?.isAdmin) {
      // Admin → pas besoin d'ancien mot de passe
      this.form = this.fb.group({
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator });
    } else {
      // Pas admin → oldPassword obligatoire
      this.form = this.fb.group({
        oldPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator });
    }
  }

  onClose() {
    this.isOpen = false;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (pass && confirm && pass !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (!this.userChangePWD || this.form.invalid) return;

    const { oldPassword, newPassword } = this.form.value;

    const data: ChangePasswordRequest = {
      UserId: this.userChangePWD.id,
      OldPassword: this.userChangePWD.isAdmin ? "" : oldPassword,
      NewPassword: newPassword
    };

    this.apiError = undefined; // reset avant appel

    this.authApi.changePassword(data).subscribe({
      next: () => {
        this.isOpen = false;
      },
      error: (err) => {
        console.error(err);
        this.apiError = err.error?.message || err.error || "Erreur inconnue";
      }
    });
  }

}
