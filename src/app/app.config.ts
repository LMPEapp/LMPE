import { importProvidersFrom, LOCALE_ID, isDevMode } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideServiceWorker } from '@angular/service-worker';
import { authTokenInterceptor } from './Helper/ErrorInterceptor';

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
    provideHttpClient(
      withInterceptors([authTokenInterceptor]),
    ),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ]
};
