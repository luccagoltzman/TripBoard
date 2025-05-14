import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'recuperar-senha',
    loadComponent: () => import('./recuperar-senha/recuperar-senha.component').then(m => m.RecuperarSenhaComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
]; 