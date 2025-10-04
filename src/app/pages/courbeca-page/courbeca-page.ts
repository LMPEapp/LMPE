import { Component, OnInit } from '@angular/core';
import { CourbeCA } from '../../Models/Courbeca.model';
import { CourbeCAAccessApi } from '../../service/AccessAPi/CourbecaAccessapi/courbeca-accessapi';

@Component({
  selector: 'app-courbeca-page',
  templateUrl: './courbeca-page.html',
  styleUrls: ['./courbeca-page.scss']
})
export class CourbecaPage implements OnInit {

  courbes: CourbeCA[] = [];
  totalAmountLast30Days: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private caApi: CourbeCAAccessApi) { }

  ngOnInit(): void {
    this.loadLast30Days();
  }

  loadLast30Days(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    this.caApi.getAll(startDate, endDate).subscribe({
      next: (data: CourbeCA[]) => {
        this.courbes = data;

        console.log(this.courbes);

        // Calcul du total
        this.totalAmountLast30Days = this.courbes.reduce((sum, c) => sum + c.amount, 0);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les données.';
        console.error(err);
        this.isLoading = false;
      }
    });
    this.caApi.getTotalAmount(startDate, endDate).subscribe({
      next: (total: number) => {
        this.totalAmountLast30Days = total;
        console.log(this.totalAmountLast30Days);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les données.';
        console.error(err);
        this.isLoading = false;
      }
    });


  }
}
