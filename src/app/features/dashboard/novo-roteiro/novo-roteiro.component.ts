import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { RoteiroService } from '@core/services/roteiro.service';
import { NotificacaoService } from '@core/services/notificacao.service';
import { Roteiro } from '@core/models/roteiro.model';

@Component({
  selector: 'app-novo-roteiro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './novo-roteiro.component.html',
  styleUrls: ['./novo-roteiro.component.scss']
})
export class NovoRoteiroComponent implements OnInit {
  roteiroForm!: FormGroup;
  formSubmitted = false;
  salvando = false;
  
  constructor(
    private fb: FormBuilder,
    private roteiroService: RoteiroService,
    private notificacaoService: NotificacaoService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.inicializarFormulario();
  }
  
  inicializarFormulario(): void {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    
    this.roteiroForm = this.fb.group({
      nome: ['', [Validators.required]],
      destino: ['', [Validators.required]],
      dataInicio: [this.formatarDataParaInput(hoje), [Validators.required]],
      dataFim: [this.formatarDataParaInput(amanha), [Validators.required]],
      descricao: [''],
      imagem: [''],
      privado: [false],
      orcamento_total: [0, [Validators.required, Validators.min(0)]]
    }, { validators: this.validarDatas });
  }
  
  get f() {
    return this.roteiroForm.controls;
  }
  
  formatarDataParaInput(data: Date): string {
    return data.toISOString().split('T')[0];
  }
  
  validarDatas(form: FormGroup) {
    const inicio = form.get('dataInicio')?.value;
    const fim = form.get('dataFim')?.value;
    
    if (inicio && fim) {
      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);
      
      if (dataFim < dataInicio) {
        return { dataInvalida: true };
      }
    }
    
    return null;
  }
  
  criarRoteiro(): void {
    this.formSubmitted = true;
    
    if (this.roteiroForm.invalid) {
      // Rolar para o primeiro elemento com erro
      const firstElementWithError = document.querySelector('.is-invalid');
      if (firstElementWithError) {
        firstElementWithError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    this.salvando = true;
    
    // Formatar as datas para o formato que o Laravel espera (YYYY-MM-DD)
    const dataInicio = this.f['dataInicio'].value;
    const dataFim = this.f['dataFim'].value;
    
    const roteiro: Partial<Roteiro> = {
      nome: this.f['nome'].value,
      destino: this.f['destino'].value,
      dataInicio: dataInicio, // Formato YYYY-MM-DD
      dataFim: dataFim, // Formato YYYY-MM-DD
      descricao: this.f['descricao'].value || '',
      imagem: this.f['imagem'].value || '',
      privado: this.f['privado'].value,
      orcamento_total: this.f['orcamento_total'].value
    };
    
    console.log('Enviando roteiro:', roteiro);
    
    this.roteiroService.criarRoteiro(roteiro)
      .pipe(finalize(() => this.salvando = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const novoRoteiro = response.data as Roteiro;
            this.notificacaoService.exibirSucesso('Roteiro criado com sucesso!');
            this.router.navigate(['/roteiro', novoRoteiro.id]);
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao criar roteiro');
          }
        },
        error: (error) => {
          console.error('Erro ao criar roteiro:', error);
          if (error?.error?.errors) {
            // Exibir erros de validação específicos
            const errorMessages = Object.values(error.error.errors).flat();
            errorMessages.forEach((msg: any) => this.notificacaoService.exibirErro(msg));
          } else {
            this.notificacaoService.exibirErro(
              error?.error?.message || 'Não foi possível criar o roteiro. Tente novamente.'
            );
          }
        }
      });
  }
  
  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
} 