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
    TextFieldModule
  ],
  templateUrl: './agenda-edition.html',
  styleUrl: './agenda-edition.scss'
})
export class AgendaEdition {

  @ViewChild('zoneTextDescription') zoneTextDescription!: ElementRef<HTMLDivElement>;
  @ViewChild('textareaDescription') textareaDescription!: ElementRef<HTMLTextAreaElement>;

  public isOpen = false;
  agenda?: AgendaOut;
  @Output() submitForm = new EventEmitter<AgendaIn>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', []],
      startDate: [null, Validators.required],
      startTime: [null, Validators.required],
      endDate: [null, Validators.required],
      endTime: [null, Validators.required],
      isPublic: [false, [Validators.required]]
    },{ validators: this.endDateAfterStartValidator });
  }

  onOpen(ag?: AgendaOut) {
    this.isOpen = true;
    this.agenda = ag;
    this.init();
    setTimeout(()=>{
      // Récupère la hauteur de la zone div
      let hauteur = this.zoneTextDescription.nativeElement.clientHeight;

      hauteur -= 60;
      // Applique la hauteur au textarea
      this.textareaDescription.nativeElement.style.height = `${hauteur}px`;
    })
  }

  onClose() {
    this.isOpen = false;
  }

  init() {
    if (this.agenda) {
      // Mode édition (sans mots de passe obligatoires)
      this.form = this.fb.group({
        title: [this.agenda.title, [Validators.required, Validators.maxLength(255)]],
        description: [this.agenda.description, []],
        startDate: [this.agenda.startDate, Validators.required],
        startTime: [this.agenda.startDate ? this.formatTime(this.agenda.startDate) : null, Validators.required],
        endDate: [this.agenda.endDate, Validators.required],
        endTime: [this.agenda.endDate ? this.formatTime(this.agenda.endDate) : null, Validators.required],
        isPublic: [this.agenda.isPublic, [Validators.required]]
      },{ validators: this.endDateAfterStartValidator });
    } else {
      // Mode création (avec mot de passe + confirm)
      this.form = this.fb.group({
        title: ['', [Validators.required, Validators.maxLength(255)]],
        description: ['', []],
        startDate: [null, Validators.required],
        startTime: [null, Validators.required],
        endDate: [null, Validators.required],
        endTime: [null, Validators.required],
        isPublic: [false, [Validators.required]]
      },{ validators: this.endDateAfterStartValidator });
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

    if(end <= start){
      control.get('endTime')?.setErrors({ endBeforeStart: true });
      return { endBeforeStart: true };
    }
    return null;
  }

  roundTime(controlName: string) {
    const control = this.form.get(controlName);
    if (!control) return;

    const val: string = control.value;
    if (!val) return;

    const [h, m] = val.split(':').map(Number);

    let roundedMinutes: number;
    let newHour = h;

    if (m < 15) roundedMinutes = 0;
    else if (m < 45) roundedMinutes = 30;
    else {
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


}
