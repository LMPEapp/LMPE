import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AgendaIn, AgendaOut } from '../../../Models/Agenda.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { toLocalDate } from '../../../Helper/date-utils';
import { ValidationDialogComponent } from "../../../ExternComposent/validation-dialog/validation-dialog";
import { User } from '../../../Models/user.model';
import { AuthService } from '../../../service/Auth/auth';

@Component({
  selector: 'app-agenda-edition',
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
    TextFieldModule,
    ValidationDialogComponent
],
  templateUrl: './agenda-edition.html',
  styleUrl: './agenda-edition.scss'
})
export class AgendaEdition {

  @ViewChild(ValidationDialogComponent) alert!: ValidationDialogComponent;

  public isOpen = false;
  agenda?: AgendaOut;
  user: User | undefined;

  @Output() submitForm = new EventEmitter<AgendaIn>();
  @Output() delete = new EventEmitter<number>();

  form: FormGroup;

  constructor(private fb: FormBuilder, public auth: AuthService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', []],
      startDate: [null, Validators.required],
      startTime: [null, Validators.required],
      endDate: [null, Validators.required],
      endTime: [null, Validators.required],
      isPublic: [false, [Validators.required]]
    },{ validators: this.endDateAfterStartValidator });
    this.user = auth.loginData?.user;
  }

  isMineOrAdmin(): boolean {
    return this.agenda?.createdBy === this.user?.id || this.user?.isAdmin == true;
  }

  onOpen(ag?: AgendaOut) {
    this.isOpen = true;
    this.agenda = ag;
    if(this.agenda){
      this.agenda.endDate=toLocalDate(this.agenda.endDate);
      this.agenda.startDate=toLocalDate(this.agenda.startDate)
    }

    this.init();
  }

  onClose() {
    this.isOpen = false;
  }

  onDelete() {
    this.alert.open(
      'Supprimer l’élément',
      'Êtes-vous sûr de vouloir supprimer cet élément ?',
      false
    );
  }

  init() {
    if (this.agenda) {
      // Mode édition : on met juste à jour les valeurs
      this.form.patchValue({
        title: this.agenda.title,
        description: this.agenda.description,
        startDate: new Date(this.agenda.startDate),
        startTime: this.agenda.startDate ? this.formatTime(new Date(this.agenda.startDate)) : null,
        endDate: new Date(this.agenda.endDate),
        endTime: this.agenda.endDate ? this.formatTime(new Date(this.agenda.endDate)) : null,
        isPublic: this.agenda.isPublic
      });
    } else {
      // Mode création : reset
      this.form.reset({
        title: '',
        description: '',
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        isPublic: false
      });
    }
  }


  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  endDateAfterStartValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const startTime = control.get('startTime')?.value;
    const endDate = control.get('endDate')?.value;
    const endTime = control.get('endTime')?.value;

    if (!startDate || !startTime || !endDate || !endTime) return null;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const start = new Date(startDate);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(endDate);
    end.setHours(endH, endM, 0, 0);

    if (end <= start) {
      // On met l'erreur sur le form group
      return { endBeforeStart: true };
    } else {
      return null;
    }
  }


  roundTime(controlName: string) {
    const control = this.form.get(controlName);
    if (!control) return;

    const val: string = control.value;
    if (!val) return;

    const [h, m] = val.split(':').map(Number);

    let roundedMinutes: number;
    let newHour = h;

    // Cas spécial pour dépasser 23:45
    if (h === 23 && m >= 45) {
      roundedMinutes = 59;
      newHour = 23;
    } else if (m < 15) {
      roundedMinutes = 0;
    } else if (m < 45) {
      roundedMinutes = 30;
    } else {
      roundedMinutes = 0;
      newHour = (h + 1) % 24;
    }

    const newVal = `${newHour.toString().padStart(2,'0')}:${roundedMinutes.toString().padStart(2,'0')}`;

    if (newVal !== val) {
      control.setValue(newVal);
    }
  }



  onSubmit() {
    if (!this.form.valid) return;

    const { title, description, startDate, startTime, endDate, endTime, isPublic } = this.form.value;

    // Fonction pour combiner date + heure
    const combineDateTime = (date: Date, time: string): Date => {
      const d = date ?? new Date();          // si date null -> maintenant
      const [hours, minutes] = (time ?? "00:00").split(':').map(Number);
      const newDate = new Date(d);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    }


    const agendaData: AgendaIn = {
      title,
      description,
      startDate: combineDateTime(startDate, startTime),
      endDate: combineDateTime(endDate, endTime),
      isPublic
    };

    this.submitForm.emit(agendaData);
    this.onClose();
  }

  onAlertClosed(result: boolean) {
    if (result === true) {
      this.delete.emit(this.agenda?.id);
      this.onClose();
    } else {
      console.log('Annulé ou fermé');
    }
  }

}
