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
      <!-- Navbar com efeito de vidro -->
      <nav class="navbar navbar-expand-lg sticky-top">
        <div class="container">
          <a class="navbar-brand" routerLink="/dashboard">
            <i class="material-icons">travel_explore</i> TripBoard
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link active" routerLink="/dashboard">
                  <i class="material-icons">map</i> Meus Roteiros
                </a>
              </li>
            </ul>
            <div class="d-flex align-items-center gap-3">
              <div class="user-greeting d-none d-md-block">
                <p class="mb-0">Olá, <strong>{{ nomeUsuario }}</strong></p>
                <small class="text-muted">Bem-vindo de volta</small>
              </div>
              <div class="dropdown">
                <button class="btn btn-icon" type="button" id="userDropdown" data-bs-toggle="dropdown">
                  <i class="material-icons">account_circle</i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item d-flex align-items-center" routerLink="/perfil">
                      <i class="material-icons me-2">person</i> Meu Perfil
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item d-flex align-items-center" href="#" (click)="logout($event)">
                      <i class="material-icons me-2">logout</i> Sair
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="container py-5">
        <!-- Cabeçalho da página -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div class="mb-3 mb-md-0">
            <h1 class="display-6 mb-1">Meus Roteiros</h1>
            <p class="text-muted mb-0">Gerencie e organize suas viagens</p>
          </div>
          <a routerLink="/dashboard/novo-roteiro" class="btn btn-primary">
            <i class="material-icons">add</i> Novo Roteiro
          </a>
        </div>

        <!-- Loading state -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <p class="mt-3 text-muted">Carregando seus roteiros...</p>
        </div>

        <!-- Error state -->
        <div *ngIf="error" class="alert alert-danger d-flex align-items-center">
          <i class="material-icons me-2">error_outline</i>
          <div>{{ error }}</div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && roteiros.length === 0" class="glass-container text-center p-5">
          <div class="py-5">
            <div class="mb-4">
              <i class="material-icons display-1 text-primary">map</i>
            </div>
            <h2 class="h3 mb-3">Comece sua próxima aventura</h2>
            <p class="text-muted mb-4">Crie seu primeiro roteiro de viagem e comece a planejar momentos incríveis</p>
            <a routerLink="/dashboard/novo-roteiro" class="btn btn-primary btn-lg">
              <i class="material-icons">add</i> Criar Roteiro
            </a>
          </div>
        </div>

        <!-- Grid de roteiros -->
        <div *ngIf="!loading && roteiros.length > 0" class="row g-4">
          <div class="col-12 col-md-6 col-lg-4" *ngFor="let roteiro of roteiros">
            <div class="card h-100">
              <!-- Imagem do roteiro -->
              <div class="card-img-overlay-container">
                <img *ngIf="roteiro.imagem" [src]="roteiro.imagem" 
                     class="card-img-top" alt="{{ roteiro.destino }}"
                     onError="this.src='assets/images/placeholder-trip.jpg'">
                <div *ngIf="!roteiro.imagem" class="card-img-placeholder">
                  <i class="material-icons">travel_explore</i>
                </div>
                <!-- Overlay com gradiente -->
                <div class="card-img-overlay">
                  <h5 class="card-title mb-1">{{ roteiro.nome }}</h5>
                  <p class="card-subtitle">
                    <i class="material-icons">place</i> {{ roteiro.destino }}
                  </p>
                </div>
              </div>
              
              <!-- Corpo do card -->
              <div class="card-body">
                <!-- Data e duração -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="d-flex align-items-center text-muted">
                    <i class="material-icons me-1">event</i>
                    <small>{{ formatarData(roteiro.dataInicio) }}</small>
                  </div>
                  <span class="badge bg-primary">{{ calcularDuracao(roteiro) }} dias</span>
                </div>
                
                <!-- Descrição -->
                <p class="card-text" *ngIf="roteiro.descricao">
                  {{ roteiro.descricao | slice:0:100 }}{{ roteiro.descricao.length > 100 ? '...' : '' }}
                </p>
                
                <!-- Status e ações -->
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <div class="d-flex align-items-center">
                    <span class="badge" [ngClass]="{
                      'bg-success': roteiro.status === 'confirmado',
                      'bg-warning text-dark': roteiro.status === 'planejamento',
                      'bg-info': roteiro.status === 'em_andamento'
                    }">
                      {{ roteiro.status || 'Planejamento' }}
                    </span>
                  </div>
                  <a [routerLink]="['/roteiro', roteiro.id]" class="btn btn-link text-primary">
                    Ver detalhes <i class="material-icons">arrow_forward</i>
                  </a>
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
      background-color: var(--bg-light);
    }
    
    /* Navbar */
    .navbar {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color);
      
      .navbar-brand {
        font-weight: 600;
        font-size: 1.4rem;
        color: var(--primary-color);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        i {
          font-size: 1.8rem;
        }
      }
      
      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        i {
          font-size: 1.2rem;
        }
        
        &:hover, &.active {
          background-color: rgba(var(--primary-color-rgb), 0.1);
          color: var(--primary-color);
        }
      }
    }
    
    /* Botão de perfil */
    .btn-icon {
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gradient-primary);
      color: white;
      border: none;
      
      &:hover {
        transform: translateY(-2px);
      }
      
      i {
        font-size: 24px;
      }
    }
    
    /* Cards de roteiro */
    .card {
      border: none;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
      }
    }
    
    .card-img-overlay-container {
      position: relative;
      height: 200px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .card-img-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 48px;
        color: white;
      }
    }
    
    .card-img-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: white;
      padding: 1.5rem;
      
      .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
      }
      
      .card-subtitle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.9;
        
        i {
          font-size: 1rem;
        }
      }
    }
    
    /* Badges */
    .badge {
      padding: 0.5em 1em;
      font-weight: 500;
      text-transform: capitalize;
    }
    
    /* Botões */
    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      
      i {
        font-size: 1.2rem;
      }
    }
    
    .btn-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0;
      text-decoration: none;
      
      i {
        transition: transform 0.3s ease;
      }
      
      &:hover i {
        transform: translateX(4px);
      }
    }
    
    /* Responsividade */
    @media (max-width: 768px) {
      .navbar-brand i {
        font-size: 1.5rem;
      }
      
      .card-img-overlay-container {
        height: 180px;
      }
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