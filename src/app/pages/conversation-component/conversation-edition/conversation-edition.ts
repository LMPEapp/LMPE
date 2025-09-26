import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChangePasswordDialogComponent } from '../../../ExternComposent/change-password-dialog/change-password-dialog';
import { GroupeConversation, GroupeConversationIn } from '../../../Models/GroupeConversation.model';

@Component({
  selector: 'app-conversation-edition',
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './conversation-edition.html',
  styleUrl: './conversation-edition.scss'
})
export class ConversationEdition {

  public isOpen = false;
  groupe?: GroupeConversation;
  @Output() submitForm = new EventEmitter<GroupeConversationIn>();

  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      Name: ['', [Validators.required]]
    });
  }

  onOpen(groupe?: GroupeConversation) {
    this.isOpen = true;
    this.groupe = groupe;
    this.init();
  }

  onClose() {
    this.isOpen = false;
  }

  onSubmit() {
    if (this.form.valid) {
      const groupeData: GroupeConversationIn = this.form.value;
      this.submitForm.emit(groupeData);
      this.onClose();
    }
  }

  init() {
    if (this.groupe) {
      // Mode édition (sans mots de passe obligatoires)
      this.form = this.fb.group({
        Name: [this.groupe.name, [Validators.required]]
      });
    } else {
      // Mode création (avec mot de passe + confirm)
      this.form = this.fb.group({
        Name: ['', [Validators.required]]
      });
    }

  }


}
