import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { RoteiroService } from '@app/core/services/roteiro.service';
import { AuthService } from '@app/core/services/auth.service';
import { Roteiro } from '@app/core/models/roteiro.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="dashboard-container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
          <a class="navbar-brand" routerLink="/dashboard">TripBoard</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link active" routerLink="/dashboard">Meus Roteiros</a>
              </li>
            </ul>
            <div class="d-flex align-items-center">
              <span class="text-white me-3">Olá, {{ nomeUsuario }}</span>
              <div class="dropdown">
                <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                  <i class="material-icons">account_circle</i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" routerLink="/perfil">Meu Perfil</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#" (click)="logout($event)">Sair</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="container my-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="mb-0">Meus Roteiros</h1>
          <a routerLink="/dashboard/novo-roteiro" class="btn btn-primary">
            <i class="material-icons align-middle me-1">add</i> Novo Roteiro
          </a>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <p class="mt-2">Carregando seus roteiros...</p>
        </div>

        <div *ngIf="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div *ngIf="!loading && roteiros.length === 0" class="text-center py-5 bg-light rounded-3">
          <div class="py-5">
            <i class="material-icons" style="font-size: 64px; color: var(--primary-color);">map</i>
            <h3 class="mt-3">Você ainda não tem roteiros</h3>
            <p class="text-muted mb-4">Comece criando seu primeiro roteiro de viagem</p>
            <a routerLink="/dashboard/novo-roteiro" class="btn btn-primary px-4 py-2">
              Criar Roteiro
            </a>
          </div>
        </div>

        <div *ngIf="!loading && roteiros.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div class="col" *ngFor="let roteiro of roteiros">
            <div class="card h-100 shadow-sm">
              <div class="card-img-top bg-light position-relative" style="height: 160px;">
                <img *ngIf="roteiro.imagem" [src]="roteiro.imagem" class="card-img-top" style="height: 100%; object-fit: cover;" alt="{{ roteiro.destino }}">
                <div *ngIf="!roteiro.imagem" class="d-flex justify-content-center align-items-center h-100">
                  <i class="material-icons" style="font-size: 48px; color: var(--text-light);">travel_explore</i>
                </div>
                <div class="position-absolute bottom-0 start-0 p-3 text-white" style="background: linear-gradient(transparent, rgba(0,0,0,0.7));">
                  <h5 class="card-title mb-0">{{ roteiro.nome }}</h5>
                  <p class="card-text small">{{ roteiro.destino }}</p>
                </div>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p class="mb-0 text-muted">
                      <i class="material-icons align-middle" style="font-size: 18px;">calendar_today</i>
                      {{ formatarData(roteiro.dataInicio) }} - {{ formatarData(roteiro.dataFim) }}
                    </p>
                  </div>
                  <span class="badge rounded-pill bg-primary">{{ calcularDuracao(roteiro) }} dias</span>
                </div>
                <p class="card-text" *ngIf="roteiro.descricao">{{ roteiro.descricao | slice:0:80 }}{{ roteiro.descricao.length > 80 ? '...' : '' }}</p>
              </div>
              <div class="card-footer bg-white border-top-0">
                <div class="d-grid gap-2">
                  <a [routerLink]="['/roteiro', roteiro.id]" class="btn btn-outline-primary">Ver Roteiro</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .navbar-brand {
      font-weight: 600;
      font-size: 1.4rem;
    }
    
    .material-icons {
      vertical-align: middle;
    }
    
    h1 {
      color: var(--primary-color);
      font-weight: 600;
    }
    
    .card {
      overflow: hidden;
      transition: transform 0.2s;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
  `]
})
export class DashboardComponent implements OnInit {
  roteiros: Roteiro[] = [];
  loading: boolean = true;
  error: string = '';
  nomeUsuario: string = '';
  
  constructor(
    private roteiroService: RoteiroService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarRoteiros();
  }
  
  carregarDadosUsuario(): void {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario && usuario.nome) {
        // Obter o primeiro nome
        const nomePartes = usuario.nome.split(' ');
        this.nomeUsuario = nomePartes.length > 0 ? nomePartes[0] : 'Usuário';
      } else {
        // Valor padrão se o nome do usuário não estiver disponível
        this.nomeUsuario = 'Usuário';
      }
    });
  }
  
  carregarRoteiros(): void {
    this.loading = true;
    this.error = '';
    
    this.roteiroService.listarRoteiros()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          console.log('Resposta completa do serviço:', response);
          
          if (response.success && response.data) {
            if (Array.isArray(response.data)) {
              // Se a resposta já é um array
              this.roteiros = response.data;
            } else if (response.data.items && Array.isArray(response.data.items)) {
              // Se a resposta tem a estrutura de paginação
              this.roteiros = response.data.items;
            } else {
              console.error('Formato de dados inesperado:', response.data);
              this.error = 'Erro ao processar dados dos roteiros';
              this.roteiros = [];
            }
            console.log('Roteiros carregados:', this.roteiros);
          } else {
            this.error = response.message || 'Erro ao carregar roteiros';
            this.roteiros = [];
          }
        },
        error: (error) => {
          console.error('Erro ao carregar roteiros:', error);
          this.error = error?.error?.message || 'Não foi possível carregar seus roteiros. Tente novamente.';
          this.roteiros = [];
        }
      });
  }
  
  formatarData(data: Date | string | undefined): string {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  calcularDuracao(roteiro: Roteiro): number {
    if (!roteiro) return 0;
    
    // Verificar ambos os formatos de data (frontend e backend)
    const dataInicio = roteiro.dataInicio || (roteiro as any).data_inicio;
    const dataFim = roteiro.dataFim || (roteiro as any).data_fim;
    
    if (!dataInicio || !dataFim) return 0;
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTempo = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia final
  }
  
  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    window.location.href = '/auth/login';
  }
} 