import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { Produit } from '../../../Models/Produit.model';
import { PanierAchat } from "./panier-achat/panier-achat";

@Component({
  selector: 'app-nos-produits-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule, PanierAchat],
  templateUrl: './nos-produits-page.html',
  styleUrls: ['./nos-produits-page.scss']
})
export class NosProduitsPage {
  produits: Produit[] = [
    {
      id: 1,
      nom: 'Mozzarella au sperme (lot de 3)',
      description: 'La mozzarella au sperme , fondante et moelleuse, est faite pour accompagner toutes sortes de plat cuisiné. Le meilleur de notre sperme concentré pour le meilleur de nos fromages.',
      image: 'assets/Produit/1.png',
      prix: 4.99,
      quantite: 0
    },
    {
      id: 2,
      nom: 'Yaourt au smegma (lot de 6)',
      description: 'Ultra protéiné, plein de vitamines et peu calorifique, le yaourt au smegma est le meilleur allié des sportifs. Son goût original et sa texture si particulière en font un produit d’exception qu’il vous faut goûter au moins une fois',
      image: 'assets/Produit/2.png',
      prix: 7.99,
      quantite: 0
    },
    {
      id: 3,
      nom: 'Barre au chocolat au caca et au sperme (lot de 3)',
      description: 'Protéinée, délicieuse, croquante et fondante, c’est la barre au chocolat qu’il vous faut absolument ! Notre sperme et notre caca sont de la meilleure qualité possible et offre une expérience en bouche inoubliable. Testez la dès maintenant !Les seuls animaux que j’aime bien : 🙈🙉🙊🐶🦧🦍🐢',
      image: 'assets/Produit/3.jpg',
      prix: 9.99,
      quantite: 0
    }
  ];

  provenances = [
    {
      description: 'Notre sperme est produit localement par nos employés et des spermeurs engagés et sélectionnés selon des critères bien définits. Il est garanti sans MST ni IST et à obtenu le prix de la meilleure qualité de sperme en 2024 lors du concours du "Bon Spermeur 2024", certifié par des experts du domaine et des goûteurs professionnels. L’alimentation de nos employés est surveillée et pratiquent une activité sportive primordiale pour garantir une qualité de sperme sans précédent. Le stockage de notre sperme se fait en respectant toutes les consignes de qualité et de respect de la chaîne du froid pour ne pas détériorer le produit. Tous nos produits sont d’origine France.',
      image: 'assets/Provenance/1.jpg'
    },
    {
      description: 'Le caca utilisé dans notre bar au chocolat au sperme et au caca est aussi d’origine locale et est produit en France dans sa totalité. Notre caca est lui aussi certifié par des experts et nous garantissons un produit le plus pur possible avec le moins de traitement. Nos entrepôts de caca garantissent une conservation parfaite.',
      image: 'assets/Provenance/2.jpg'
    }
  ];

  @ViewChild(PanierAchat) PanierAchat!: PanierAchat;


  get totalPanier(): number {
    return this.produits.reduce((sum, p) => sum + p.quantite, 0);
  }

  ajouter(produit: Produit) {
    produit.quantite++;
  }

  retirer(produit: Produit) {
    if (produit.quantite > 0) produit.quantite--;
  }

  ouvrirPanier() {
    const produitsSelectionnes = this.produits.filter(p => p.quantite > 0);
    this.PanierAchat.open(produitsSelectionnes);
  }

  onCommandeTerminee() {
    this.produits.forEach(p => p.quantite = 0);
  }


}
