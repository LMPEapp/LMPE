import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// Enregistre la locale FR
registerLocaleData(localeFr);

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

export const appConfig = {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes)),
    provideHttpClient(),
    provideAnimations(), // nécessaire pour MatDatepicker
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
};
