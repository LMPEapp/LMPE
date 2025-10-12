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
import { AuthService } from '../../../service/Auth/auth';
import { UserAccessapi } from '../../../service/AccessAPi/userAccessapi/user-accessapi';
import { AvatarComponent } from "../../../ExternComposent/avatar/avatar";
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

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


  public apiBase: string;

  form: FormGroup;
  userLocal?: User;
  previewUrl?: string;
  selectedFile?: File;

  constructor(private fb: FormBuilder, public auth: AuthService, private userApi:UserAccessapi, private snackBar: MatSnackBar, ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      pseudo: ['', [Validators.required, Validators.maxLength(50)]],
      urlImage: ['', Validators.maxLength(255)],
      isAdmin: [false]
    });
    this.userLocal = auth.loginData?.user;
    this.apiBase = environment.apiUrl;
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
    this.previewUrl = undefined;
    this.selectedFile = undefined;
    if (this.user) {
      // Mode édition (sans mots de passe obligatoires)
      this.form = this.fb.group({
        email: [this.user.email, [Validators.required, Validators.email, Validators.maxLength(255)]],
        pseudo: [this.user.pseudo, [Validators.required, Validators.maxLength(50)]],
        urlImage: ['', Validators.maxLength(255)],
        isAdmin: [this.user.isAdmin]
      });
      this.previewUrl = `${this.apiBase}/uploads/users/${this.user.urlImage}`;
    } else {
      // Mode création (avec mot de passe + confirm)
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        pseudo: ['', [Validators.required, Validators.maxLength(50)]],
        urlImage: ['', Validators.maxLength(255)],
        isAdmin: [false],
        passwordHash: ['', Validators.required],
        confirmPassword: ['', Validators.required]
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format non autorisé !');
      return;
    }

    this.selectedFile = file;

    // Prévisualisation en direct
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.form.valid) {
      const userData: UserIn = this.form.value;
      userData.passwordHash = userData.passwordHash ?? "";
      this.submitForm.emit(userData);

      if (this.selectedFile && this.user) {
        this.userApi.uploadImage(this.user.id, this.selectedFile).subscribe({
          next: res => {
            console.log('Image uploadée:', res.url);
            this.form.patchValue({ urlImage: res.url });
          },
          error: err => {
            console.error(err);
            this.snackBar.open(`Erreur : ${err.error || err.message}`, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
      this.onClose();
    }
  }

  onPasswordChanged() {
    this.changePasswordDialog.open(this.user);
  }
}
