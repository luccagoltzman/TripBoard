import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoteiroService } from '@app/core/services/roteiro.service';
import { AuthService } from '@app/core/services/auth.service';
import { Atividade, DiaRoteiro, Roteiro, Sugestao } from '@app/core/models/roteiro.model';
import { Usuario } from '@app/core/models/usuario.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-roteiro-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
          <a class="navbar-brand" routerLink="/dashboard">TripBoard</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard">Meus Roteiros</a>
              </li>
            </ul>
            <div class="d-flex align-items-center">
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

      <!-- Loading -->
      <div *ngIf="loading" class="container text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-2">Carregando roteiro...</p>
      </div>

      <!-- Erro -->
      <div *ngIf="error && !loading" class="container my-5">
        <div class="alert alert-danger">
          {{ error }}
          <button (click)="carregarRoteiro()" class="btn btn-sm btn-outline-danger ms-3">Tentar novamente</button>
        </div>
      </div>

      <!-- Conteúdo do Roteiro -->
      <div *ngIf="roteiro && !loading" class="container my-4">
        <!-- Cabeçalho -->
        <div class="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 class="mb-1">{{ roteiro.nome }}</h1>
            <p class="text-muted">
              <i class="material-icons align-middle" style="font-size: 18px;">place</i> 
              {{ roteiro.destino }}
              <span class="mx-2">•</span>
              <i class="material-icons align-middle" style="font-size: 18px;">calendar_today</i>
              {{ formatarData(roteiro.dataInicio) }} - {{ formatarData(roteiro.dataFim) }}
              <span class="mx-2">•</span>
              <span class="badge bg-primary">{{ calcularDuracao() }} dias</span>
            </p>
            <p *ngIf="roteiro.descricao" class="mb-0">{{ roteiro.descricao }}</p>
          </div>
          <div class="d-flex">
            <a [routerLink]="['/gastos', roteiro.id]" class="btn btn-outline-primary me-2">
              <i class="material-icons align-middle">payments</i> Gastos
            </a>
            <a [routerLink]="['/compartilhar', roteiro.id]" class="btn btn-outline-secondary">
              <i class="material-icons align-middle">share</i> Compartilhar
            </a>
          </div>
        </div>

        <!-- Dias do Roteiro -->
        <div *ngIf="diasRoteiro.length === 0" class="text-center bg-light p-5 rounded-3">
          <i class="material-icons" style="font-size: 64px; color: var(--primary-color);">calendar_month</i>
          <h4 class="mt-3 mb-2">Roteiro vazio</h4>
          <p class="text-muted mb-4">Adicione dias ao seu roteiro para começar a planejar sua viagem</p>
          <button (click)="abrirModalCriarDia()" class="btn btn-primary px-4">Adicionar Dia</button>
        </div>

        <div *ngIf="diasRoteiro.length > 0" class="row">
          <!-- Menu lateral com os dias -->
          <div class="col-md-3 mb-4">
            <div class="list-group sticky-top" style="top: 20px;">
              <a 
                *ngFor="let dia of diasRoteiro; let i = index" 
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                [class.active]="diaAtivo === i"
                (click)="selecionarDia(i)"
              >
                <div>
                  <span>Dia {{ i + 1 }}</span>
                  <small class="d-block text-muted">{{ formatarData(dia.data) }}</small>
                </div>
                <span *ngIf="dia.atividades.length > 0" class="badge bg-primary rounded-pill">{{ dia.atividades.length }}</span>
              </a>
              <button 
                (click)="abrirModalCriarDia()" 
                class="btn btn-outline-primary mt-2"
              >
                <i class="material-icons align-middle">add</i> Adicionar Dia
              </button>
            </div>
          </div>

          <!-- Detalhes do dia selecionado -->
          <div class="col-md-9">
            <div *ngIf="diasRoteiro.length > 0 && diaAtivo >= 0" class="card shadow-sm">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <span>Dia {{ diaAtivo + 1 }} - {{ formatarData(diasRoteiro[diaAtivo].data) }}</span>
                  <small *ngIf="diasRoteiro[diaAtivo].notasDia" class="text-muted ms-2">{{ diasRoteiro[diaAtivo].notasDia }}</small>
                </h5>
                <div class="btn-group">
                  <button (click)="abrirModalEditarDia()" class="btn btn-sm btn-outline-secondary">
                    <i class="material-icons">edit</i>
                  </button>
                  <button (click)="abrirModalCriarAtividade()" class="btn btn-sm btn-primary">
                    <i class="material-icons">add</i> Atividade
                  </button>
                </div>
              </div>

              <div class="card-body p-0">
                <!-- Lista de atividades -->
                <div *ngIf="diasRoteiro[diaAtivo].atividades.length === 0" class="text-center py-5">
                  <p class="text-muted mb-0">Sem atividades para este dia. Adicione uma!</p>
                </div>

                <ul *ngIf="diasRoteiro[diaAtivo].atividades.length > 0" class="list-group list-group-flush">
                  <li *ngFor="let atividade of diasRoteiro[diaAtivo].atividades" class="list-group-item activity-item">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1 d-flex align-items-center">
                          <span *ngIf="atividade.importante" class="badge bg-warning me-2">Importante</span>
                          {{ atividade.titulo }}
                        </h6>
                        <p *ngIf="atividade.horario" class="small text-muted mb-1">
                          <i class="material-icons align-middle" style="font-size: 16px;">schedule</i>
                          {{ atividade.horario }}
                        </p>
                        <p *ngIf="atividade.local" class="small text-muted mb-1">
                          <i class="material-icons align-middle" style="font-size: 16px;">place</i>
                          {{ atividade.local }}
                        </p>
                        <p *ngIf="atividade.descricao" class="mb-1">{{ atividade.descricao }}</p>
                      </div>
                      <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" (click)="abrirModalComentarios(atividade)">
                          <i class="material-icons">chat</i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" (click)="abrirModalEditarAtividade(atividade)">
                          <i class="material-icons">edit</i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" (click)="abrirModalExcluirAtividade(atividade)">
                          <i class="material-icons">delete</i>
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de adicionar atividade -->
    <div class="modal fade" id="modalAtividade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modoEdicaoAtividade ? 'Editar Atividade' : 'Nova Atividade' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="atividadeForm">
              <div class="mb-3">
                <label for="titulo" class="form-label">Título*</label>
                <input type="text" class="form-control" id="titulo" formControlName="titulo">
                <div *ngIf="submittedAtividade && fa.titulo.errors" class="invalid-feedback d-block">
                  <div *ngIf="fa.titulo.errors.required">Título é obrigatório</div>
                </div>
              </div>

              <div class="mb-3">
                <label for="horario" class="form-label">Horário</label>
                <input type="text" class="form-control" id="horario" formControlName="horario" placeholder="Ex: 14:30">
              </div>

              <div class="mb-3">
                <label for="local" class="form-label">Local</label>
                <input type="text" class="form-control" id="local" formControlName="local">
              </div>

              <div class="mb-3">
                <label for="descricao" class="form-label">Descrição</label>
                <textarea class="form-control" id="descricao" formControlName="descricao" rows="3"></textarea>
              </div>

              <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" id="importante" formControlName="importante">
                <label class="form-check-label" for="importante">Marcar como importante</label>
              </div>
              
              <div *ngIf="errorAtividade" class="alert alert-danger">
                {{ errorAtividade }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              [disabled]="loadingAtividade"
              (click)="salvarAtividade()"
            >
              <span *ngIf="loadingAtividade" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Salvar
            </button>
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
    
    .list-group-item.active {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .activity-item {
      transition: background-color 0.2s;
    }
    
    .activity-item:hover {
      background-color: var(--bg-light);
    }
    
    .card-header {
      background-color: #f8f9fa;
    }
  `]
})
export class RoteiroDetalheComponent implements OnInit {
  roteiro: Roteiro | null = null;
  diasRoteiro: DiaRoteiro[] = [];
  diaAtivo: number = -1;
  loading: boolean = true;
  error: string = '';
  usuario: Usuario | null = null;

  // Form para atividade
  atividadeForm: FormGroup;
  loadingAtividade: boolean = false;
  submittedAtividade: boolean = false;
  errorAtividade: string = '';
  atividadeAtual: Atividade | null = null;
  modoEdicaoAtividade: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roteiroService: RoteiroService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.atividadeForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      horario: [''],
      local: [''],
      descricao: [''],
      importante: [false]
    });
  }

  ngOnInit(): void {
    // Obter o usuário logado
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });

    // Obter o ID do roteiro da URL
    const roteiroId = this.route.snapshot.paramMap.get('id');
    if (roteiroId) {
      this.carregarRoteiro(Number(roteiroId));
    } else {
      this.error = 'ID do roteiro não especificado.';
      this.loading = false;
    }
  }

  get fa() { return this.atividadeForm.controls; }

  carregarRoteiro(roteiroId?: number): void {
    this.loading = true;
    this.error = '';
    
    const id = roteiroId || Number(this.route.snapshot.paramMap.get('id'));

    this.roteiroService.obterRoteiro(id)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.roteiro = response.data;
            this.carregarDiasRoteiro(id);
          } else {
            this.error = response.message || 'Erro ao carregar roteiro';
            this.loading = false;
          }
        },
        error: (error) => {
          this.error = error?.error?.message || 'Não foi possível carregar o roteiro. Tente novamente.';
          this.loading = false;
        }
      });
  }

  carregarDiasRoteiro(roteiroId: number): void {
    this.roteiroService.obterDiasRoteiro(roteiroId)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.diasRoteiro = response.data;
            
            // Ordenar os dias por data
            this.diasRoteiro.sort((a, b) => {
              return new Date(a.data).getTime() - new Date(b.data).getTime();
            });
            
            // Se houver dias, selecionar o primeiro por padrão
            if (this.diasRoteiro.length > 0) {
              this.diaAtivo = 0;
            }
          } else {
            this.error = response.message || 'Erro ao carregar dias do roteiro';
          }
        },
        error: (error) => {
          this.error = error?.error?.message || 'Não foi possível carregar os dias do roteiro. Tente novamente.';
        }
      });
  }

  formatarData(data: Date): string {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  calcularDuracao(): number {
    if (!this.roteiro || !this.roteiro.dataInicio || !this.roteiro.dataFim) return 0;
    const inicio = new Date(this.roteiro.dataInicio);
    const fim = new Date(this.roteiro.dataFim);
    const diffTempo = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia final
  }

  selecionarDia(index: number): void {
    this.diaAtivo = index;
  }

  // Métodos para manipulação dos modais
  abrirModalCriarDia(): void {
    // Lógica para abrir o modal de criar dia
    console.log('Abrir modal para criar dia');
  }

  abrirModalEditarDia(): void {
    // Lógica para abrir o modal de editar dia
    console.log('Abrir modal para editar dia');
  }

  abrirModalCriarAtividade(): void {
    this.modoEdicaoAtividade = false;
    this.atividadeAtual = null;
    this.submittedAtividade = false;
    this.errorAtividade = '';
    
    this.atividadeForm.reset({
      titulo: '',
      horario: '',
      local: '',
      descricao: '',
      importante: false
    });
    
    // Abrir o modal
    const modal = document.getElementById('modalAtividade');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  abrirModalEditarAtividade(atividade: Atividade): void {
    this.modoEdicaoAtividade = true;
    this.atividadeAtual = atividade;
    this.submittedAtividade = false;
    this.errorAtividade = '';
    
    this.atividadeForm.patchValue({
      titulo: atividade.titulo,
      horario: atividade.horario,
      local: atividade.local,
      descricao: atividade.descricao,
      importante: atividade.importante
    });
    
    // Abrir o modal
    const modal = document.getElementById('modalAtividade');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  abrirModalExcluirAtividade(atividade: Atividade): void {
    // Lógica para abrir o modal de excluir atividade
    console.log('Abrir modal para excluir atividade', atividade);
  }

  abrirModalComentarios(atividade: Atividade): void {
    // Lógica para abrir o modal de comentários
    console.log('Abrir modal de comentários para atividade', atividade);
  }

  salvarAtividade(): void {
    this.submittedAtividade = true;
    this.errorAtividade = '';

    if (this.atividadeForm.invalid) {
      return;
    }

    this.loadingAtividade = true;

    if (this.roteiro && this.diaAtivo >= 0) {
      const diaId = this.diasRoteiro[this.diaAtivo].id;
      const roteiroId = this.roteiro.id;
      
      const dadosAtividade = {
        ...this.atividadeForm.value,
        diaDaViagemId: diaId,
        sugestao: false
      };

      if (this.modoEdicaoAtividade && this.atividadeAtual) {
        // Editar atividade existente
        this.roteiroService.atualizarAtividade(roteiroId, diaId, this.atividadeAtual.id, dadosAtividade)
          .pipe(
            finalize(() => {
              this.loadingAtividade = false;
            })
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                // Fechar o modal
                const modal = document.getElementById('modalAtividade');
                if (modal) {
                  const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
                  bootstrapModal.hide();
                }
                
                // Atualizar a lista de atividades
                this.carregarDiasRoteiro(roteiroId);
              } else {
                this.errorAtividade = response.message || 'Erro ao atualizar atividade';
              }
            },
            error: (error) => {
              this.errorAtividade = error?.error?.message || 'Não foi possível atualizar a atividade. Tente novamente.';
            }
          });
      } else {
        // Criar nova atividade
        this.roteiroService.criarAtividade(roteiroId, diaId, dadosAtividade)
          .pipe(
            finalize(() => {
              this.loadingAtividade = false;
            })
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                // Fechar o modal
                const modal = document.getElementById('modalAtividade');
                if (modal) {
                  const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
                  bootstrapModal.hide();
                }
                
                // Atualizar a lista de atividades
                this.carregarDiasRoteiro(roteiroId);
              } else {
                this.errorAtividade = response.message || 'Erro ao criar atividade';
              }
            },
            error: (error) => {
              this.errorAtividade = error?.error?.message || 'Não foi possível criar a atividade. Tente novamente.';
            }
          });
      }
    }
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    window.location.href = '/auth/login';
  }
} 