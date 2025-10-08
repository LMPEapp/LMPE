import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { EquipePage } from "../equipe-page/equipe-page";
import { ProvenanceDesProduitsPage } from "../provenance-des-produits-page/provenance-des-produits-page";
import { PartenairesPage } from "../partenaires-page/partenaires-page";
import { ContactPage } from "../contact-page/contact-page";
import { ActualitesPage } from "../actualites-page/actualites-page";

enum HeaderButton {
  Acceuil,
  Equipe,
  ProvenanceDesProduits,
  Partenaires,
  Contact,
  Actualites,
  Prive
}

@Component({
  selector: 'app-acceuil-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    EquipePage,
    ProvenanceDesProduitsPage,
    PartenairesPage,
    ContactPage,
    ActualitesPage
],
  templateUrl: './acceuil-page.html',
  styleUrls: ['./acceuil-page.scss']
})
export class AcceuilPage {
  HeaderButton = HeaderButton;
  PageSelected: HeaderButton = HeaderButton.Acceuil;
  isMenuOpen = false;

  constructor(private router: Router){

  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onButtonHeaderClick(button: HeaderButton) {
    this.PageSelected = button;
    switch(button) {
      case HeaderButton.Acceuil:
        console.log("Accueil cliqué");
        // Action pour l'accueil (ex: scroll ou router)
        break;

      case HeaderButton.Equipe:
        console.log("Équipe cliqué");
        // Action pour l'équipe
        break;

      case HeaderButton.ProvenanceDesProduits:
        console.log("Provenance des produits cliqué");
        // Action pour provenance
        break;

      case HeaderButton.Partenaires:
        console.log("Partenaires cliqué");
        // Action pour partenaires
        break;

      case HeaderButton.Contact:
        console.log("Contact cliqué");
        // Action pour contact
        break;

      case HeaderButton.Actualites:
        console.log("Actualités cliqué");
        // Action pour actualités
        break;

      case HeaderButton.Prive:
        this.router.navigate(['home']);
        break;
      default:
        console.warn("Bouton inconnu");

    }
    this.closeMenu();
  }
}
