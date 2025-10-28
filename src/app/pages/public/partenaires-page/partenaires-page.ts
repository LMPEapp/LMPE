import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partenaires-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partenaires-page.html',
  styleUrls: ['./partenaires-page.scss']
})
export class PartenairesPage {
  partenaires = [
    {
      nom: '尾田 栄一郎 "Eiichirō Oda" (Japon)',
      description: `Grand maître mangaka, sa fantaisie et son enthousiasme pour nos produits nous ont valus sa collaboration et son investissement dans l'entreprise.\n
      漫画界の巨匠である彼は、私たちの商品への想像力と熱意によって、会社への協力と投資を引き出しました`,
      images: [
        'assets/Partenaires/Eiichirō1.png',
        'assets/Partenaires/Eiichirō2.jpg'
      ],
      index: 0,
    }, 
        {
      nom: '田中さん "Mme Tanaka" (Japon)',
      description: `Doyenne du Japon et même du monde, du haut de ses 115 ans cela faisait longtemps qu'elle n'avait pas eu sa dose de sperme, c'est pourquoi elle a investi dans LMPE avec panache.\n
      申し訳ありませんが、その内容は不適切なため翻訳できません。`,
      images: [
        'assets/Partenaires/Tanaka1.jpg',
        'assets/Partenaires/Tanaka2.jpg'
      ],
      index: 0,
    },
    {
      nom: 'VinTinh Trùng (Vietnam)',
      description: `Leader de la production de sperme au Vietnam, VinTinh Trùng est un véritable pionnier dans le domaine. Leurs produits sont synonymes d'authenticité et mélange savoir-faire et culture. Leur spécialité est le sperme dynamique, un sperme particulièrement dynamique, bruyant et qui ne s'arrête jamais.\n
      Là nhà dẫn đầu trong sản xuất tinh trùng tại Việt Nam, VinTinh Trùng thực sự là một người tiên phong trong lĩnh vực này. Sản phẩm của họ đại diện cho sự xác thực và kết hợp khéo léo giữa kỹ năng và văn hóa. Chuyên môn của họ là tinh trùng năng động, một loại tinh trùng đặc biệt năng động, sôi nổi và không bao giờ ngừng.`,
      images: [
        'assets/Partenaires/vietnam1.jpg',
        'assets/Partenaires/vietnam2.jpg',
        'assets/Partenaires/vietnam3.jpg',
        'assets/Partenaires/vietnam4.jpg'
      ],
      index: 0,
    }
  ];

  autoScrollInterval: any;

  constructor() {
    this.startAutoScroll();
  }

  startAutoScroll() {
    this.stopAutoScroll(); // pour éviter les doublons
    this.autoScrollInterval = setInterval(() => {
      this.partenaires.forEach(p => {
        p.index = (p.index + 1) % p.images.length;
      });
    }, 4000);
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  suivant(p: any) {
    p.index = (p.index + 1) % p.images.length;
    this.restartAutoScroll();
  }

  precedent(p: any) {
    p.index = (p.index - 1 + p.images.length) % p.images.length;
    this.restartAutoScroll();
  }

  restartAutoScroll() {
    this.stopAutoScroll();
    this.startAutoScroll();
  }
}
