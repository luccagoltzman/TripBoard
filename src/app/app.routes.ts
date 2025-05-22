import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/novo-roteiro',
    loadComponent: () => import('./features/dashboard/novo-roteiro/novo-roteiro.component').then(m => m.NovoRoteiroComponent),
    canActivate: [authGuard]
  },
  {
    path: 'roteiro/:id',
    loadComponent: () => import('./features/roteiro-detalhe/roteiro-detalhe.component').then(m => m.RoteiroDetalheComponent),
    canActivate: [authGuard]
  },
  {
    path: 'roteiro/:id/editar',
    loadComponent: () => import('./features/roteiro/editar-roteiro/editar-roteiro.component').then(m => m.EditarRoteiroComponent),
    canActivate: [authGuard]
  },
  {
    path: 'roteiro/:id/colaboradores',
    loadComponent: () => import('./features/colaboradores/gerenciar/gerenciar-colaboradores.component').then(m => m.GerenciarColaboradoresComponent),
    canActivate: [authGuard]
  },
  {
    path: 'roteiro/:id/gastos',
    loadComponent: () => import('./features/gastos/gerenciar/gerenciar-gastos.component').then(m => m.GerenciarGastosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/usuario/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
]; 