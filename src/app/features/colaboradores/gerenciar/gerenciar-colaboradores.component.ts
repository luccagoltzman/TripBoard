import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { RoteiroService } from '@core/services/roteiro.service';
import { NotificacaoService } from '@core/services/notificacao.service';
import { Roteiro } from '@core/models/roteiro.model';
import { Colaborador } from '@core/models/colaborador.model';

@Component({
  selector: 'app-gerenciar-colaboradores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './gerenciar-colaboradores.component.html',
  styleUrls: ['./gerenciar-colaboradores.component.scss']
})
export class GerenciarColaboradoresComponent implements OnInit {
  roteiro: Roteiro | null = null;
  colaboradores: Colaborador[] = [];
  conviteForm!: FormGroup;
  formSubmitted = false;
  carregando = false;
  enviandoConvite = false;
  removendoColaborador = false;
  roteiroId: number | string = '';
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roteiroService: RoteiroService,
    private notificacaoService: NotificacaoService
  ) {}
  
  ngOnInit(): void {
    this.inicializarFormulario();
    this.carregarDados();
  }
  
  inicializarFormulario(): void {
    this.conviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      podeEditar: [true],
      podeGerenciarColaboradores: [false]
    });
  }
  
  get f() {
    return this.conviteForm.controls;
  }
  
  carregarDados(): void {
    this.carregando = true;
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roteiroId = id;
        this.roteiroService.obterRoteiro(this.roteiroId)
          .pipe(finalize(() => this.carregando = false))
          .subscribe({
            next: (response) => {
              if (response.success && response.data) {
                this.roteiro = response.data;
                this.colaboradores = response.data.colaboradores || [];
              } else {
                this.notificacaoService.exibirErro(response.message || 'Erro ao carregar dados do roteiro');
                this.voltar();
              }
            },
            error: (error) => {
              this.notificacaoService.exibirErro(
                error?.error?.message || 'Não foi possível carregar os dados do roteiro'
              );
              this.voltar();
            }
          });
      } else {
        this.notificacaoService.exibirErro('ID do roteiro não especificado');
        this.voltar();
      }
    });
  }
  
  convidarColaborador(): void {
    this.formSubmitted = true;
    
    if (this.conviteForm.invalid) {
      return;
    }
    
    this.enviandoConvite = true;
    
    const email = this.f['email'].value;
    const permissoes = {
      podeEditar: this.f['podeEditar'].value,
      podeGerenciarColaboradores: this.f['podeGerenciarColaboradores'].value
    };
    
    this.roteiroService.convidarColaborador(this.roteiroId, email, permissoes)
      .pipe(finalize(() => this.enviandoConvite = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacaoService.exibirSucesso(`Convite enviado para ${email}`);
            this.conviteForm.reset();
            this.formSubmitted = false;
            this.inicializarFormulario();
            this.carregarDados();
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao enviar convite');
          }
        },
        error: (error) => {
          this.notificacaoService.exibirErro(
            error?.error?.message || 'Não foi possível enviar o convite. Tente novamente.'
          );
        }
      });
  }
  
  removerColaborador(colaborador: Colaborador): void {
    if (!colaborador.id) {
      this.notificacaoService.exibirErro('ID do colaborador não encontrado');
      return;
    }

    if (confirm(`Tem certeza que deseja remover ${colaborador.usuario?.nome || 'este colaborador'} do roteiro?`)) {
      this.removendoColaborador = true;
      
      this.roteiroService.removerColaborador(this.roteiroId, colaborador.id)
        .pipe(finalize(() => this.removendoColaborador = false))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificacaoService.exibirSucesso('Colaborador removido com sucesso');
              this.carregarDados();
            } else {
              this.notificacaoService.exibirErro(response.message || 'Erro ao remover colaborador');
            }
          },
          error: (error) => {
            this.notificacaoService.exibirErro(
              error?.error?.message || 'Não foi possível remover o colaborador. Tente novamente.'
            );
          }
        });
    }
  }
  
  voltar(): void {
    this.router.navigate(['/roteiro', this.roteiroId]);
  }
} 