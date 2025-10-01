import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { User, UserIn } from '../../../Models/user.model';
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ChangePasswordDialogComponent } from '../../../ExternComposent/change-password-dialog/change-password-dialog';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profil-edition',
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    ChangePasswordDialogComponent,
    MatCardModule
  ],
  templateUrl: './profil-edition.html',
  styleUrl: './profil-edition.scss'
})
export class ProfilEdition {
  @ViewChild(ChangePasswordDialogComponent) changePasswordDialog!: ChangePasswordDialogComponent;

  public isOpen = false;
  user?: User;
  @Output() submitForm = new EventEmitter<UserIn>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pseudo: ['', Validators.required],
      urlImage: [''],
      isAdmin: [false]
    });
  }

  onOpen(user?: User) {
    this.isOpen = true;
    this.user = user;
    this.init();
  }

  onClose() {
    this.isOpen = false;
  }

  init() {
    if (this.user) {
      // Mode édition (sans mots de passe obligatoires)
      this.form = this.fb.group({
        email: [this.user.email, [Validators.required, Validators.email]],
        pseudo: [this.user.pseudo, Validators.required],
        urlImage: [''],
        isAdmin: [this.user.isAdmin]
      });
    } else {
      // Mode création (avec mot de passe + confirm)
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        pseudo: ['', Validators.required],
        passwordHash: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        urlImage: [''],
        isAdmin: [false]
      }, { validators: this.passwordMatchValidator });
    }
  }

  // Vérifie que passwordHash === confirmPassword
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('passwordHash')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.form.valid) {
      const userData: UserIn = this.form.value;
      userData.passwordHash = userData.passwordHash ?? "";
      this.submitForm.emit(userData);
      this.onClose();
    }
  }

  onPasswordChanged() {
    this.changePasswordDialog.open(this.user);
  }
}
