import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../service/Auth/auth';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.validateToken().pipe(
    map(() => true), // Token valide → accès autorisé
    catchError(() => {
      auth.redirectUrl = state.url;
      router.navigate(['/login']);
      return of(false); // Token invalide → redirection login
    })
  );
};

