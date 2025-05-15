import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoteiroService } from '@core/services/roteiro.service';
import { AuthService } from '@core/services/auth.service';
import { Roteiro } from '@core/models/roteiro.model';
import { Usuario } from '@core/models/usuario.model';
import { finalize } from 'rxjs';
import { NotificacaoService } from '@core/services/notificacao.service';
import { Atividade } from '@core/models/atividade.model';

@Component({
  selector: 'app-roteiro-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './roteiro-detalhe.component.html',
  styleUrls: ['./roteiro-detalhe.component.scss']
})
export class RoteiroDetalheComponent implements OnInit {
  roteiro: Roteiro | null = null;
  loading = true;
  error = '';
  
  // Gerenciamento de atividades
  diasViagem: Date[] = [];
  atividadeForm: FormGroup;
  formSubmitted = false;
  salvandoAtividade = false;
  atividadeEmEdicao: Atividade | null = null;
  modalAtividade: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roteiroService: RoteiroService,
    private notificacaoService: NotificacaoService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.atividadeForm = this.fb.group({
      id: [null],
      titulo: ['', Validators.required],
      diaIndex: [0],
      horario: [''],
      local: [''],
      descricao: ['']
    });
  }
  
  ngOnInit(): void {
    this.carregarRoteiro();
  }
  
  carregarRoteiro(): void {
    this.loading = true;
    this.error = '';
    
    const roteiroId = this.route.snapshot.paramMap.get('id');
    
    if (!roteiroId) {
      this.error = 'ID do roteiro não especificado';
      this.loading = false;
      return;
    }
    
    this.roteiroService.obterRoteiro(roteiroId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.roteiro = response.data;
            this.gerarDiasViagem();
            
            // Verificar permissões do usuário
            this.authService.usuario$.subscribe(usuario => {
              if (usuario && this.roteiro) {
                this.roteiro.editavel = this.podeEditar(usuario);
                this.roteiro.compartilhavel = this.podeCompartilhar(usuario);
              }
            });
          } else {
            this.error = response.message || 'Erro ao carregar roteiro';
          }
        },
        error: (error) => {
          this.error = error?.error?.message || 'Não foi possível carregar o roteiro. Tente novamente.';
        }
      });
  }
  
  gerarDiasViagem(): void {
    if (!this.roteiro || !this.roteiro.dataInicio || !this.roteiro.dataFim) return;
    
    const dataInicio = new Date(this.roteiro.dataInicio);
    const dataFim = new Date(this.roteiro.dataFim);
    
    const dias: Date[] = [];
    let currentDate = new Date(dataInicio);
    
    while (currentDate <= dataFim) {
      dias.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.diasViagem = dias;
  }
  
  formatarData(data: Date): string {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  formatarDiaSemana(data: Date): string {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].trim();
  }
  
  calcularDuracao(): number {
    if (!this.roteiro || !this.roteiro.dataInicio || !this.roteiro.dataFim) return 0;
    
    const inicio = new Date(this.roteiro.dataInicio);
    const fim = new Date(this.roteiro.dataFim);
    const diffTempo = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) + 1;
  }
  
  getAtividadesDia(diaIndex: number): Atividade[] {
    if (!this.roteiro || !this.roteiro.atividades) return [];
    
    // Filtra atividades para o dia especificado
    return this.roteiro.atividades.filter(atividade => {
      if (!atividade.data) return false;
      const dataAtividade = new Date(atividade.data);
      const diaViagem = this.diasViagem[diaIndex];
      return dataAtividade.toDateString() === diaViagem.toDateString();
    }).sort((a, b) => {
      if (!a.horario && !b.horario) return 0;
      if (!a.horario) return 1;
      if (!b.horario) return -1;
      return a.horario.localeCompare(b.horario);
    });
  }
  
  prepararNovaAtividade(diaIndex: number): void {
    this.atividadeEmEdicao = null;
    this.formSubmitted = false;
    
    this.atividadeForm.reset({
      id: null,
      titulo: '',
      diaIndex: diaIndex,
      horario: '',
      local: '',
      descricao: ''
    });
    
    // Abrir modal
    this.abrirModal();
  }
  
  editarAtividade(atividade: Atividade): void {
    this.atividadeEmEdicao = atividade;
    this.formSubmitted = false;
    
    // Encontrar o índice do dia
    const diaIndex = this.diasViagem.findIndex(
      dia => new Date(dia).toDateString() === new Date(atividade.data).toDateString()
    );
    
    this.atividadeForm.setValue({
      id: atividade.id,
      titulo: atividade.titulo,
      diaIndex: diaIndex >= 0 ? diaIndex : 0,
      horario: atividade.horario || '',
      local: atividade.local || '',
      descricao: atividade.descricao || ''
    });
    
    // Abrir modal
    this.abrirModal();
  }
  
  abrirModal(): void {
    // Verificar se o Bootstrap está disponível e usar sua API Modal
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const bootstrapModal = (window as any).bootstrap.Modal;
      this.modalAtividade = new bootstrapModal(document.getElementById('atividadeModal'));
      this.modalAtividade.show();
    } else {
      console.error('Bootstrap não está disponível. Adicione o script do bootstrap.js ao seu projeto.');
    }
  }
  
  salvarAtividade(): void {
    this.formSubmitted = true;
    
    if (this.atividadeForm.invalid) {
      return;
    }
    
    this.salvandoAtividade = true;
    const values = this.atividadeForm.value;
    const diaIndex = values.diaIndex;
    
    const atividadeData: Partial<Atividade> = {
      id: values.id,
      titulo: values.titulo,
      data: this.diasViagem[diaIndex],
      horario: values.horario,
      local: values.local,
      descricao: values.descricao,
      roteiroId: this.roteiro?.id
    };
    
    const operacao = this.atividadeEmEdicao 
      ? this.roteiroService.atualizarAtividade(atividadeData)
      : this.roteiroService.criarAtividade(atividadeData);
    
    operacao
      .pipe(finalize(() => this.salvandoAtividade = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Atualizar o roteiro local
            if (response.data) {
              this.atualizarAtividadeLocalmente(response.data);
            }
            this.notificacaoService.exibirSucesso(
              this.atividadeEmEdicao ? 'Atividade atualizada com sucesso!' : 'Atividade adicionada com sucesso!'
            );
            this.modalAtividade.hide();
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao salvar atividade');
          }
        },
        error: (error) => {
          this.notificacaoService.exibirErro(error?.error?.message || 'Não foi possível salvar a atividade. Tente novamente.');
        }
      });
  }
  
  atualizarAtividadeLocalmente(atividade: Atividade): void {
    if (!this.roteiro) return;
    
    if (!this.roteiro.atividades) {
      this.roteiro.atividades = [];
    }
    
    // Se estamos editando, remover a atividade antiga
    if (this.atividadeEmEdicao) {
      this.roteiro.atividades = this.roteiro.atividades.filter(a => a.id !== atividade.id);
    }
    
    // Adicionar a nova atividade
    this.roteiro.atividades.push(atividade);
  }
  
  removerAtividade(atividade: Atividade): void {
    if (confirm('Tem certeza que deseja remover esta atividade?')) {
      this.roteiroService.removerAtividade(atividade.id!)
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Remover do array local
              if (this.roteiro && this.roteiro.atividades) {
                this.roteiro.atividades = this.roteiro.atividades.filter(a => a.id !== atividade.id);
              }
              this.notificacaoService.exibirSucesso('Atividade removida com sucesso!');
            } else {
              this.notificacaoService.exibirErro(response.message || 'Erro ao remover atividade');
            }
          },
          error: (error) => {
            this.notificacaoService.exibirErro(error?.error?.message || 'Não foi possível remover a atividade. Tente novamente.');
          }
        });
    }
  }
  
  podeEditar(usuario: Usuario): boolean {
    if (!this.roteiro) return false;
    
    // O criador sempre pode editar
    if (this.roteiro.criadorId === usuario.id) return true;
    
    // Verificar se o usuário é colaborador com permissão de edição
    return !!this.roteiro.colaboradores?.some(
      c => c.usuarioId === usuario.id && c.podeEditar
    );
  }
  
  podeCompartilhar(usuario: Usuario): boolean {
    if (!this.roteiro) return false;
    
    // Somente o criador pode compartilhar
    return this.roteiro.criadorId === usuario.id;
  }
  
  get a() {
    return this.atividadeForm.controls;
  }
} 