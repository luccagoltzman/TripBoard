import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'roteiros',
    loadChildren: () => import('./features/roteiros/roteiros.routes').then(m => m.ROTEIROS_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'roteiro/:id',
    loadComponent: () => import('./features/roteiro-detalhe/roteiro-detalhe.component').then(m => m.RoteiroDetalheComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'gastos/:roteiroId',
    loadComponent: () => import('./features/gastos/gastos.component').then(m => m.GastosComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'compartilhar/:roteiroId',
    loadComponent: () => import('./features/compartilhar/compartilhar.component').then(m => m.CompartilharComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
]; 