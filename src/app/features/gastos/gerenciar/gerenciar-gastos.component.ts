import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { RoteiroService } from '@core/services/roteiro.service';
import { GastosService } from '@core/services/gastos.service';
import { NotificacaoService } from '@core/services/notificacao.service';
import { Roteiro, Gasto } from '@core/models/roteiro.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-gerenciar-gastos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './gerenciar-gastos.component.html',
  styleUrls: ['./gerenciar-gastos.component.scss']
})
export class GerenciarGastosComponent implements OnInit {
  roteiro: Roteiro | null = null;
  gastos: Gasto[] = [];
  gastoForm!: FormGroup;
  formSubmitted = false;
  carregando = false;
  salvandoGasto = false;
  roteiroId: string = '';
  totalGastos = 0;
  gastoEmEdicao: Gasto | null = null;
  
  // Categorias padrão para gastos de viagem
  categorias = [
    'Hospedagem',
    'Transporte',
    'Alimentação',
    'Passeios',
    'Compras',
    'Seguro',
    'Documentação',
    'Outros'
  ];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roteiroService: RoteiroService,
    private gastosService: GastosService,
    private notificacaoService: NotificacaoService
  ) {}
  
  ngOnInit(): void {
    this.inicializarFormulario();
    this.carregarDados();
  }
  
  inicializarFormulario(gasto?: Gasto): void {
    const hoje = this.formatarDataParaInput(new Date());
    
    this.gastoForm = this.fb.group({
      id: [gasto?.id || null],
      categoria: [gasto?.categoria || '', Validators.required],
      descricao: [gasto?.descricao || '', Validators.required],
      valor: [gasto?.valor || '', [Validators.required, Validators.min(0.01)]],
      dataPrevista: [gasto?.dataPrevista ? this.formatarDataParaInput(new Date(gasto.dataPrevista)) : hoje]
    });
    
    this.gastoEmEdicao = gasto || null;
  }
  
  formatarDataParaInput(data: Date): string {
    return data.toISOString().split('T')[0];
  }
  
  get f() {
    return this.gastoForm.controls;
  }
  
  carregarDados(): void {
    this.carregando = true;
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roteiroId = id;
        
        // Carregar informações do roteiro
        this.roteiroService.obterRoteiro(id)
          .subscribe({
            next: (response: ApiResponse<Roteiro>) => {
              if (response.success && response.data) {
                this.roteiro = response.data;
              } else {
                this.notificacaoService.exibirErro(response.message || 'Erro ao carregar dados do roteiro');
                this.voltar();
              }
            },
            error: (error: any) => {
              this.notificacaoService.exibirErro(
                error?.error?.message || 'Não foi possível carregar os dados do roteiro'
              );
              this.voltar();
            }
          });
        
        // Carregar gastos
        this.carregarGastos();
      } else {
        this.notificacaoService.exibirErro('ID do roteiro não especificado');
        this.voltar();
      }
    });
  }
  
  carregarGastos(): void {
    this.gastosService.listarGastos(this.roteiroId)
      .pipe(finalize(() => this.carregando = false))
      .subscribe({
        next: (response: ApiResponse<Gasto[]>) => {
          if (response.success && response.data) {
            this.gastos = response.data;
            this.calcularTotalGastos();
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao carregar gastos');
          }
        },
        error: (error: any) => {
          this.notificacaoService.exibirErro(
            error?.error?.message || 'Não foi possível carregar os gastos. Tente novamente.'
          );
        }
      });
  }
  
  calcularTotalGastos(): void {
    this.totalGastos = this.gastos.reduce((total, gasto) => total + gasto.valor, 0);
  }
  
  getGastosPorCategoria(): { categoria: string, total: number, percentual: number }[] {
    const gastosPorCategoria = this.gastos.reduce((acc, gasto) => {
      const categoria = gasto.categoria;
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      acc[categoria] += gasto.valor;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(gastosPorCategoria).map(([categoria, total]) => ({
      categoria,
      total,
      percentual: (total / this.totalGastos) * 100
    })).sort((a, b) => b.total - a.total);
  }
  
  salvarGasto(): void {
    this.formSubmitted = true;
    
    if (this.gastoForm.invalid) {
      return;
    }
    
    this.salvandoGasto = true;
    
    const gastoData: Partial<Gasto> = {
      ...this.gastoForm.value,
      roteiroId: this.roteiroId
    };
    
    const operacao = this.gastoEmEdicao
      ? this.gastosService.atualizarGasto(gastoData)
      : this.gastosService.adicionarGasto(gastoData);
    
    operacao
      .pipe(finalize(() => this.salvandoGasto = false))
      .subscribe({
        next: (response: ApiResponse<Gasto>) => {
          if (response.success) {
            this.notificacaoService.exibirSucesso(
              this.gastoEmEdicao ? 'Gasto atualizado com sucesso!' : 'Gasto adicionado com sucesso!'
            );
            this.formSubmitted = false;
            this.inicializarFormulario();
            this.carregarGastos();
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao salvar gasto');
          }
        },
        error: (error: any) => {
          this.notificacaoService.exibirErro(
            error?.error?.message || 'Não foi possível salvar o gasto. Tente novamente.'
          );
        }
      });
  }
  
  editarGasto(gasto: Gasto): void {
    this.inicializarFormulario(gasto);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  removerGasto(gasto: Gasto): void {
    if (confirm('Tem certeza que deseja remover este gasto?')) {
      this.gastosService.removerGasto(String(gasto.id))
        .subscribe({
          next: (response: ApiResponse<any>) => {
            if (response.success) {
              this.notificacaoService.exibirSucesso('Gasto removido com sucesso');
              this.carregarGastos();
            } else {
              this.notificacaoService.exibirErro(response.message || 'Erro ao remover gasto');
            }
          },
          error: (error: any) => {
            this.notificacaoService.exibirErro(
              error?.error?.message || 'Não foi possível remover o gasto. Tente novamente.'
            );
          }
        });
    }
  }
  
  cancelarEdicao(): void {
    this.gastoEmEdicao = null;
    this.inicializarFormulario();
    this.formSubmitted = false;
  }
  
  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  
  formatarData(data: Date | undefined): string {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  }
  
  voltar(): void {
    this.router.navigate(['/roteiro', this.roteiroId]);
  }
} 