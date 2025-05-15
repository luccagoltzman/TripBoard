import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');
  
  // Log para depuração
  console.log('Interceptor processando requisição para:', req.url);
  
  if (token && token !== 'undefined' && token !== 'null') {
    // Log para depuração (remover em produção)
    console.log('Adicionando token à requisição:', req.url);
    
    // Clonar o request com o token no header Authorization
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else if (!req.url.includes('/auth/')) {
    // Se não temos token e não é uma rota de autenticação, isso pode ser um problema
    console.warn('Requisição a rota protegida sem token:', req.url);
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Verificar se é um erro de autenticação (401)
      if (error.status === 401) {
        console.error('Erro de autenticação (401):', error);
        // Limpar dados de autenticação
        localStorage.removeItem('auth_token');
        localStorage.removeItem('usuario');
        
        // Redirecionar para login se não for uma requisição de login
        if (!req.url.includes('/auth/login')) {
          console.log('Redirecionando para login devido a erro de autenticação');
          router.navigate(['/auth/login']);
        }
      }
      
      return throwError(() => error);
    })
  );
}; 