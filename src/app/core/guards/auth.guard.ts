import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAutenticado$.pipe(
    tap(autenticado => {
      if (!autenticado) {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      }
    })
  );
}; 