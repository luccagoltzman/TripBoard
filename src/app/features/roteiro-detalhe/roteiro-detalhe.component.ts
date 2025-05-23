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
import { ApiResponse } from '@core/models/api-response.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CompartilharRoteiroComponent } from '../roteiro/compartilhar/compartilhar-roteiro.component';

// Interface para reconhecer temporariamente os formatos do Laravel
interface RoteiroApi extends Roteiro {
  data_inicio?: string | Date;
  data_fim?: string | Date;
  user_id?: number | string;
}

// Interface estendida para Atividade com campos adicionais necessários
interface AtividadeExtendida extends Atividade {
  concluida: boolean;
}

@Component({
  selector: 'app-roteiro-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './roteiro-detalhe.component.html',
  styleUrls: ['./roteiro-detalhe.component.scss']
})
export class RoteiroDetalheComponent implements OnInit {
  roteiro: RoteiroApi | null = null;
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
    private fb: FormBuilder,
    private dialog: MatDialog
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
    
    // Usar o router para detectar quando o componente é re-acessado 
    // (por exemplo, quando voltamos do dashboard)
    this.route.params.subscribe(() => {
      this.carregarRoteiro();
    });
  }
  
  carregarRoteiro(): void {
    this.loading = true;
    this.error = '';
    this.diasViagem = []; // Limpar dias existentes
    
    const roteiroId = this.route.snapshot.paramMap.get('id');
    
    if (!roteiroId) {
      this.error = 'ID do roteiro não especificado';
      this.loading = false;
      return;
    }
    
    console.log('Carregando roteiro com ID:', roteiroId);
    
    this.roteiroService.obterRoteiro(roteiroId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          console.log('Resposta do backend (obterRoteiro):', response);
          
          if (response.success && response.data) {
            this.roteiro = response.data;
            
            // Processar as atividades do roteiro, se existirem
            if (this.roteiro.atividades && this.roteiro.atividades.length > 0) {
              console.log('Atividades recebidas do backend:', this.roteiro.atividades);
              this.processarAtividades(this.roteiro.atividades);
            } else {
              console.log('Nenhuma atividade encontrada no roteiro');
              // Carregar atividades separadamente se não vieram com o roteiro
              this.carregarAtividades(roteiroId);
            }
            
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
          console.error('Erro ao carregar roteiro:', error);
          this.error = error?.error?.message || 'Não foi possível carregar o roteiro. Tente novamente.';
        }
      });
  }
  
  // Método adicional para carregar atividades separadamente
  carregarAtividades(roteiroId: string): void {
    console.log('Carregando atividades separadamente para o roteiro:', roteiroId);
    
    this.roteiroService.listarAtividades(roteiroId).subscribe({
      next: (response: ApiResponse<Atividade[]>) => {
        console.log('Resposta do backend (listarAtividades):', response);
        
        if (response.success && response.data) {
          if (!this.roteiro) return;
          
          // Atualizar as atividades do roteiro
          this.roteiro.atividades = response.data;
          
          // Processar as atividades se houver
          if (Array.isArray(response.data)) {
            this.processarAtividades(response.data);
          }
          
          // Regenerar dias para garantir que as atividades estejam nos dias corretos
          this.gerarDiasViagem();
        }
      },
      error: (error: any) => {
        console.error('Erro ao carregar atividades:', error);
      }
    });
  }
  
  gerarDiasViagem(): void {
    if (!this.roteiro) return;
    
    console.log('Roteiro para gerar dias:', this.roteiro);
    
    // Verificar se temos os campos de data no formato esperado
    const dataInicio = this.roteiro.dataInicio || this.roteiro.data_inicio;
    const dataFim = this.roteiro.dataFim || this.roteiro.data_fim;
    
    if (!dataInicio || !dataFim) {
      console.error('Datas de início ou fim não encontradas no roteiro:', this.roteiro);
      return;
    }
    
    const dataInicioObj = new Date(dataInicio);
    const dataFimObj = new Date(dataFim);
    
    console.log('Gerando dias entre:', dataInicioObj, 'e', dataFimObj);
    
    const dias: Date[] = [];
    let currentDate = new Date(dataInicioObj);
    
    while (currentDate <= dataFimObj) {
      dias.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.diasViagem = dias;
    console.log('Dias de viagem gerados:', this.diasViagem);
  }
  
  formatarData(data: Date | string | undefined): string {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  formatarDiaSemana(data: Date | string | undefined): string {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].trim();
  }
  
  calcularDuracao(): number {
    if (!this.roteiro) return 0;
    
    // Verificar se temos os campos de data no formato esperado
    const dataInicio = this.roteiro.dataInicio || this.roteiro.data_inicio;
    const dataFim = this.roteiro.dataFim || this.roteiro.data_fim;
    
    if (!dataInicio || !dataFim) return 0;
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTempo = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) + 1;
  }
  
  getAtividadesDia(diaIndex: number): Atividade[] {
    if (!this.roteiro || !this.roteiro.atividades) return [];
    
    // Normalizar a data do dia para comparação sem considerar o horário
    const diaViagem = this.diasViagem[diaIndex];
    if (!diaViagem) return [];
    
    const diaViagemNormalizado = new Date(
      diaViagem.getFullYear(),
      diaViagem.getMonth(),
      diaViagem.getDate(),
      0, 0, 0, 0
    );
    
    console.log(`Verificando atividades para dia: ${diaViagemNormalizado.toISOString().split('T')[0]}`);
    
    // Filtra atividades para o dia especificado
    const atividadesDoDia = this.roteiro.atividades.filter(atividade => {
      const dataAtividade = this.obterDataAtividade(atividade);
      if (!dataAtividade) return false;
      
      // Comparar apenas a data, ignorando o horário
      const mesmoAno = dataAtividade.getFullYear() === diaViagemNormalizado.getFullYear();
      const mesmoMes = dataAtividade.getMonth() === diaViagemNormalizado.getMonth();
      const mesmoDia = dataAtividade.getDate() === diaViagemNormalizado.getDate();
      
      const pertenceAoDia = mesmoAno && mesmoMes && mesmoDia;
      
      if (pertenceAoDia) {
        console.log(`Atividade "${atividade.titulo}" pertence ao dia ${diaViagemNormalizado.toISOString().split('T')[0]}`);
      }
      
      return pertenceAoDia;
    });
    
    // Ordenar por horário
    return atividadesDoDia.sort((a, b) => {
      const horarioA = a.horario || this.extrairHorario((a as any).data_hora_inicio) || '';
      const horarioB = b.horario || this.extrairHorario((b as any).data_hora_inicio) || '';
      
      if (!horarioA && !horarioB) return 0;
      if (!horarioA) return 1;
      if (!horarioB) return -1;
      return horarioA.localeCompare(horarioB);
    });
  }
  
  // Método auxiliar para obter a data de uma atividade (lidando com diferentes formatos)
  private obterDataAtividade(atividade: any): Date | null {
    // Verificar se temos um objeto de atividade válido
    if (!atividade) return null;
    
    let dataAtividade: Date | null = null;
    
    // Caso 1: Atividade já tem campo data como Date
    if (atividade.data instanceof Date) {
      dataAtividade = new Date(atividade.data);
    } 
    // Caso 2: Atividade tem o campo data como string
    else if (typeof atividade.data === 'string') {
      dataAtividade = new Date(atividade.data);
    }
    // Caso 3: Atividade no formato do backend com data_hora_inicio
    else if (atividade.data_hora_inicio) {
      dataAtividade = new Date(atividade.data_hora_inicio);
    }
    
    // Se não conseguiu determinar a data
    if (!dataAtividade) {
      console.warn('Não foi possível determinar a data da atividade:', atividade);
      return null;
    }
    
    // Normalizar a data para comparação (remover a parte do horário)
    // Isso evita problemas com fuso horário ao comparar datas
    const dataNormalizada = new Date(
      dataAtividade.getFullYear(),
      dataAtividade.getMonth(),
      dataAtividade.getDate(), 
      0, 0, 0, 0
    );
    
    return dataNormalizada;
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
    if (!this.roteiro?.atividades) return;
    
    const atividadeAdaptada: AtividadeExtendida = {
      ...atividade,
      concluida: false // valor padrão para o campo concluida
    };
    
    this.roteiro.atividades.push(atividadeAdaptada);
  }
  
  // Método auxiliar para extrair o horário de uma string de data e hora
  private extrairHorario(dataHora: string | undefined): string | undefined {
    if (!dataHora) return undefined;
    
    try {
      // Tenta extrair a parte do horário de uma string no formato YYYY-MM-DD HH:MM:SS
      const partes = dataHora.split(' ');
      if (partes.length >= 2) {
        const horarioParts = partes[1].split(':');
        if (horarioParts.length >= 2) {
          return `${horarioParts[0]}:${horarioParts[1]}`;
        }
      }
      return undefined;
    } catch (e) {
      console.error('Erro ao extrair horário:', e);
      return undefined;
    }
  }
  
  removerAtividade(atividade: Atividade): void {
    if (confirm('Tem certeza que deseja remover esta atividade?')) {
      if (!atividade.id) {
        this.notificacaoService.exibirErro('ID da atividade não encontrado');
        return;
      }
      
      const roteiroId = this.roteiro?.id;
      
      this.roteiroService.removerAtividade(atividade.id, roteiroId)
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
            console.error('Erro ao remover atividade:', error);
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
  
  // Converte as atividades do formato do backend para o formato do frontend
  private processarAtividades(atividades: Atividade[]): void {
    if (!Array.isArray(atividades)) return;
    
    const atividadesProcessadas: AtividadeExtendida[] = atividades.map(atividade => ({
      ...atividade,
      concluida: false // valor padrão para o campo concluida
    }));
    
    if (this.roteiro) {
      this.roteiro.atividades = atividadesProcessadas;
    }
  }

  abrirModalCompartilhar(): void {
    if (!this.roteiro) return;

    this.dialog.open(CompartilharRoteiroComponent, {
      data: {
        roteiroId: this.roteiro.id,
        roteiroTitulo: this.roteiro.titulo || this.roteiro.nome
      },
      width: '500px',
      height: '600px',
      panelClass: 'compartilhar-dialog-container'
    });
  }
} 