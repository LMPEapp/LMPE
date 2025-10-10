import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

interface Membre {
  nom: string;
  poste: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-equipe-page',
  standalone: true,
  templateUrl: './equipe-page.html',
  styleUrls: ['./equipe-page.scss'],
  imports: [CommonModule, MatCardModule],
})
export class EquipePage {
  membres: Membre[] = [
    {
      nom: 'Michel Proesport',
      poste: 'PDG',
      description:
        "Représentant de l'entreprise à l'international, son identité reste secrète afin que LMPE reste une entreprise familiale sans chef désigné. Il chérit ses employés comme ses propres enfants et permet à l'entreprise de rayonner. Il n'impose aucune hiérarchie et leur laisse le champ libre pour créer et entreprendre.",
      image: 'assets/equipe/MichelProesport.jpg'
    },
    {
      nom: 'Augustin Gernez',
      poste: 'Directeur des achats et de la production',
      description:
        "Il manie ses différents outils avec une précision hors-pair et permet ainsi à l'entreprise de bénéficier du meilleur service possible. Ses compétences reconnues à l'international, notamment en Belgique, profitent à LMPE depuis presque 5 ans.",
      image: 'assets/equipe/AugustinGernez.jpg'
    },
    {
      nom: 'Valentin Sand',
      poste: 'Directeur commercial',
      description:
        "Le commerce n'a aucun secret pour lui. Dévoué corps et âme à l'entreprise, son sens du business apporte une réelle plus-value. Sa bonne humeur insuffle une énergie communicative.",
      image: 'assets/equipe/ValentinSand.jpg'
    },
    {
      nom: 'JFR Connard',
      poste: 'Alternant commercial',
      description:
        "Premier alternant de notre entreprise, son expérience de l'étranger nous offre un regard extérieur et nourrit notre volonté d'internationalisation. Très touché par la cause humanitaire, il apprend aux côtés de Valentin Sand.",
      image: 'assets/equipe/JFRConnard.jpg'
    },
    {
      nom: 'Matteo Maceri',
      poste: 'Directeur financier',
      description:
        "Son expérience du commerce en fait le candidat idéal pour ce poste. Grâce à lui, LMPE est une entreprise florissante et ses comptes sont surveillés de très près.",
      image: 'assets/equipe/MatteoMaceri.jpg'
    },
    {
      nom: 'Noah Benedetto',
      poste: 'Directeur logistique',
      description:
        "La logistique, il a ça dans le sang. Son rôle essentiel au bon fonctionnement de l'entreprise ne lui fait pas peur. Ses liens avec des entreprises japonaises ouvrent LMPE à l'international.",
      image: 'assets/equipe/NoahBenedetto.jpg'
    },
    {
      nom: 'Maxence Coeur',
      poste: 'Directeur du service informatique',
      description:
        "C'est simple : sans lui, pas de site internet. Il est la première interface entre vous et LMPE, et offre une expérience de navigation inoubliable. Il gère également notre intranet et de nombreux outils internes.",
      image: 'assets/equipe/MaxenceCOEUR.jpg'
    },
    {
      nom: 'Rémi Narcisse',
      poste: 'Directeur marketing et communication',
      description:
        "Il s'occupe des publicités et conçoit les packagings de nos produits. Sa créativité et son ingéniosité assurent la visibilité de LMPE et la réussite de ses campagnes.",
      image: 'assets/equipe/RémiNarcisse.jpg'
    },
    {
      nom: 'Etienne Fontbonne',
      poste: 'Directeur des ressources humaines',
      description:
        "Expatrié au Vietnam pour 6 mois, il continue de superviser l'entreprise à distance. Grâce à lui, les conditions de travail chez LMPE sont exemplaires.",
      image: 'assets/equipe/EtienneFontbonne.jpg'
    },
    {
      nom: 'Gianni Osouf',
      poste: 'Directeur juridique',
      description:
        "Un directeur juridique dévoué à son entreprise. Ses conseils assurent l'intégrité de LMPE. Passionné de tracteurs, il allie sérieux et originalité.",
      image: 'assets/equipe/GianniOsouf.jpg'
    },
    {
      nom: 'Minna Bosc',
      poste: 'Directrice service après-vente',
      description:
        "Avec la qualité de nos produits, le service après-vente est submergé de remerciements. Seule femme de l'entreprise, elle apporte une touche de bonne humeur tout en gérant son rôle à la perfection.",
      image: 'assets/equipe/MinnaBosc.jpg'
    },
  ];
}
