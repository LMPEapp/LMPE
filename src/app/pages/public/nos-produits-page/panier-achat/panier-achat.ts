import { CourbeCA, CourbeCAIn } from './../../../../Models/Courbeca.model';
import { Component, EventEmitter, Output } from '@angular/core';
import { Produit } from '../../../../Models/Produit.model';
import { MatFormField, MatInputModule, MatLabel } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CourbeCAAccessApi } from '../../../../service/AccessAPi/CourbecaAccessapi/courbeca-accessapi';
import { DateOnly } from '../../../../Helper/DateOnly';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../SuccessDialog/SuccessDialog';

@Component({
  selector: 'app-panier-achat',
  imports: [
    CommonModule,
    MatFormField,
    MatLabel,
    MatIcon,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './panier-achat.html',
  styleUrl: './panier-achat.scss'
})
export class PanierAchat {
  visible = false;
  produits: Produit[] = [];
  form: FormGroup;
  loading = false; // loader
  successMessage = '';

  @Output() commandeTerminee = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private CourbeCAAccess: CourbeCAAccessApi,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      nomComplet: ['', [Validators.required, Validators.maxLength(100)]],
      adresse: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  open(produits: Produit[]) {
    this.produits = produits;
    this.visible = true;
    this.form.reset({
      amount: "",
      description: ''
    });
  }

  close() {
    if(this.loading) return;
    this.visible = false;
    this.loading = false;
    this.successMessage = '';
  }

  get total() {
    return this.produits.reduce((acc, p) => acc + p.prix * p.quantite, 0);
  }

  commander() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const nom = this.form.value.nomComplet;
    const adresse = this.form.value.adresse;
    const date = new Date();

    // Mini-facture
    let descriptionCommande = `
      <strong style="font-size:1.1em;">Nom :</strong> ${nom}<br>
      <strong style="font-size:1.1em;">Adresse :</strong> ${adresse}<br><br>
      <strong>Détails des produits :</strong><br>
    `;

    this.produits.forEach(p => {
      descriptionCommande += `
        <span style="text-decoration: underline;">${p.nom}</span> -
        <strong>${p.quantite} × ${p.prix.toFixed(2)} €</strong> =
        <strong>${(p.quantite * p.prix).toFixed(2)} €</strong><br>
      `;
    });

    descriptionCommande += `<br><strong>Total: ${this.total.toFixed(2)} €</strong>`;


    const courbeCA: CourbeCAIn = {
      userId: null,
      amount: this.total,
      datePoint: date.toISOString(),
      datePointDateOnly: DateOnly.fromDate(date),
      description: descriptionCommande
    };

    this.CourbeCAAccess.Achat(courbeCA).subscribe({
      next: (res) => {
        this.loading=false;
        this.commandeTerminee.emit();
        this.close(); // ferme le drawer
        this.dialog.open(SuccessDialogComponent, {
          data: { message: 'Votre commande a été envoyée avec succès !' },
          disableClose: true // obligé de cliquer sur OK
        });
      },
      error: (err) => {
        this.loading=false;
        console.error(err);
        this.dialog.open(SuccessDialogComponent, {
          data: { message: 'Erreur lors de l\'envoi de la commande.' },
          disableClose: true
        });
      }
    });
  }
}
