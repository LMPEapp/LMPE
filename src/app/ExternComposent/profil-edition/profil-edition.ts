import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { User, UserIn } from '../../Models/user.model';
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profil-edition',
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './profil-edition.html',
  styleUrl: './profil-edition.scss'
})
export class ProfilEdition {
  public isOpen=false;
  user?: User; // si défini, mode edit
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

  onOpen(user?: User){
    this.isOpen=true;
    this.user=user;
    this.init();
  }
  onClose(){
    this.isOpen=false;
  }
  init(){
    if (this.user) {
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        pseudo: ['', Validators.required],
        urlImage: [''],
        isAdmin: [false]
      });
      // Pré-remplir le formulaire en mode édition
      this.form.patchValue({
        email: this.user.email,
        pseudo: this.user.pseudo,
        passwordHash:"",
        urlImage: "",
        isAdmin: this.user.isAdmin
      });
    }else{
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        pseudo: ['', Validators.required],
        passwordHash: ['', Validators.required],
        urlImage: [''],
        isAdmin: [false]
      });
      this.form.patchValue({
        email: "",
        pseudo: "",
        passwordHash:"",
        urlImage: "",
        isAdmin: false
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const userData: UserIn = this.form.value;
      userData.passwordHash = userData.passwordHash ?? "";
      this.submitForm.emit(userData);
      this.onClose();
    }
  }
}
