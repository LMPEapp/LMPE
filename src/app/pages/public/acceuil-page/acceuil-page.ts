import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipePage } from "../equipe-page/equipe-page";
import { PartenairesPage } from "../partenaires-page/partenaires-page";
import { ContactPage } from "../contact-page/contact-page";
import { ActualitesPage } from "../actualites-page/actualites-page";
import { NosProduitsPage } from "../nos-produits-page/nos-produits-page";
import { MatCard, MatCardModule } from "@angular/material/card";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

enum HeaderButton {
  Acceuil,
  Equipe,
  NosProduits,
  Partenaires,
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
    PartenairesPage,
    ContactPage,
    ActualitesPage,
    NosProduitsPage,
    MatCard,
    MatCardModule,
    MatProgressSpinner
],
  templateUrl: './acceuil-page.html',
  styleUrls: ['./acceuil-page.scss']
})
export class AcceuilPage {
  HeaderButton = HeaderButton;
  PageSelected: HeaderButton = HeaderButton.Acceuil;
  isMenuOpen = false;

  constructor(private router: Router, private route: ActivatedRoute){}

  ngOnInit(): void {
    // 🔹 Vérifie si un fragment est présent dans l’URL
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        // Trouve l’enum correspondant (ex: 'Partenaires' → HeaderButton.Partenaires)
        const found = Object.keys(HeaderButton)
          .filter(k => isNaN(Number(k))) // garde seulement les noms, pas les valeurs numériques
          .find(k => k.toLowerCase() === fragment.toLowerCase());

        if (found) {
          this.PageSelected = (HeaderButton as any)[found];
          console.log("Fragment détecté :", fragment, "→ PageSelected =", this.PageSelected);
        }
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onButtonHeaderClick(button: HeaderButton) {
    this.PageSelected = button;
    this.router.navigate([], { fragment: HeaderButton[button] });
    switch(button) {
      case HeaderButton.Acceuil:
        console.log("Accueil cliqué");
        break;

      case HeaderButton.Equipe:
        console.log("Équipe cliqué");
        break;

      case HeaderButton.NosProduits:
        console.log("NosProduits");
        break;

      case HeaderButton.Partenaires:
        console.log("Partenaires cliqué");
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
