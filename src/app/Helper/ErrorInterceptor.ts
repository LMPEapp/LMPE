import { HttpEvent, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthAccessApiService } from '../service/AccessAPi/authAccessapi/auth-accessapi';

export function authTokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const authApi = inject(AuthAccessApiService);

  if (req.url.includes('/auth/refresh')) return next(req);

  return next(req).pipe(
    catchError(error => {
      // Si pas de token ou 401/0
      if (error.status === 401 || error.status === 0) {
        const refreshToken = localStorage.getItem('refreshToken') || '';
        if (!refreshToken) {
            // Pas de refresh token → logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            router.navigate(['/login']);
            return throwError(() => new Error('Aucun refresh token'));
        }

        // Essaye de rafraîchir le token
        return authApi.refresh({ RefreshToken: refreshToken }).pipe(
          switchMap(res => {
            // Mise à jour du localStorage
            localStorage.setItem('token', res.token);
            localStorage.setItem('refreshToken', res.refreshToken);
            if (res.user) localStorage.setItem('user', JSON.stringify(res.user));

            // Refaire la requête originale avec le nouveau token
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.token}` }
            });
            return next(newReq);
          }),
          catchError(() => {
            // Si refresh échoue → logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            router.navigate(['/login']);
            return throwError(() => new Error('Token invalide'));
          })
        );
      }

      // Autres erreurs → on laisse passer
      return throwError(() => error);
    })
  );
}
