// success-dialog.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-success-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="checkmark-wrapper">
        <div class="checkmark"></div>
      </div>
      <h2>{{ data.message }}</h2>
      <button mat-flat-button color="primary" (click)="close()">OK</button>
    </div>
  `,
  styles: [`
    .dialog-container {
      text-align: center;
      padding: 2rem;
    }
    .checkmark-wrapper {
      margin: 1rem auto;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 4px solid #4caf50;
      position: relative;
      animation: pop 0.5s ease forwards;
    }
    .checkmark {
      position: absolute;
      top: 16px;
      left: 20px;
      width: 25px;
      height: 50px;
      border-left: 4px solid #4caf50;
      border-bottom: 4px solid #4caf50;
      transform: rotate(-45deg) scale(0);
      animation: check 0.5s 0.5s forwards ease-out;
    }
    @keyframes pop {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }
    @keyframes check {
      0% { transform: rotate(-45deg) scale(0); }
      100% { transform: rotate(-45deg) scale(1); }
    }
    h2 { margin: 1rem 0; }
  `]
})
export class SuccessDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  close() {
    this.dialogRef.close();
  }
}
