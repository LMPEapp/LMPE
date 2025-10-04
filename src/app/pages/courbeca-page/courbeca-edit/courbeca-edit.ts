import { User } from './../../../Models/user.model';
import { Component, EventEmitter, Output } from '@angular/core';
import { CourbeCA, CourbeCAIn } from '../../../Models/Courbeca.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../service/Auth/auth';
import { toLocalDate } from '../../../Helper/date-utils';
import { MatCard, MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-courbeca-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TextFieldModule
  ],
  templateUrl: './courbeca-edit.html',
  styleUrl: './courbeca-edit.scss'
})
export class CourbecaEdit {
  public isOpen = false;
  courbeCA?: CourbeCA;
  user: User | undefined;

  @Output() submitForm = new EventEmitter<CourbeCAIn>();

  form: FormGroup;

  constructor(private fb: FormBuilder, public auth: AuthService) {
    this.form = this.fb.group({
      amount: ['', [Validators.required]],
      datePoint: [null, Validators.required],
    });
    this.user = auth.loginData?.user;
  }

  onOpen(cc?: CourbeCA) {
    this.isOpen = true;
    this.courbeCA = cc;
    if(this.courbeCA){
      this.courbeCA.datePoint=toLocalDate(this.courbeCA.datePoint);
    }

    this.init();
  }

  onClose() {
    this.isOpen = false;
  }

  init() {
    if (this.courbeCA) {
      // Mode édition : on met juste à jour les valeurs
      this.form.patchValue({
        amount: this.courbeCA.amount,
        datePoint: this.courbeCA.datePoint,
      });
    } else {
      // Mode création : reset
      this.form.reset({
        amount: "",
        datePoint: null,
      });
    }
  }

  onSubmit() {
    if (!this.form.valid) return;

    const { amount, datePoint } = this.form.value;


    if(this.user){
      let courbeCA: CourbeCAIn = {
        userId: this.user.id,
        amount,
        datePoint
      };

      this.submitForm.emit(courbeCA);
      this.onClose();
    }
  }
}
