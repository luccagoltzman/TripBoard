import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Limpar dados de autenticação
        localStorage.removeItem('auth_token');
        localStorage.removeItem('usuario');
        router.navigate(['/auth/login']);
      }
      
      return throwError(() => error);
    })
  );
}; 