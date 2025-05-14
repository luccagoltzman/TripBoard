import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'novo-roteiro',
    loadComponent: () => import('./novo-roteiro/novo-roteiro.component').then(m => m.NovoRoteiroComponent)
  }
]; 