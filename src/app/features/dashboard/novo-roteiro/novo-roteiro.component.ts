import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoteiroService } from '@app/core/services/roteiro.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-novo-roteiro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white py-3">
              <h5 class="mb-0">Criar Novo Roteiro</h5>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="roteiroForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="nome" class="form-label">Nome do Roteiro*</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="nome" 
                    formControlName="nome"
                    [ngClass]="{'is-invalid': submitted && f.nome.errors}"
                    placeholder="Ex.: Férias em Maceió"
                  >
                  <div *ngIf="submitted && f.nome.errors" class="invalid-feedback">
                    <div *ngIf="f.nome.errors.required">Nome do roteiro é obrigatório</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="destino" class="form-label">Destino*</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="destino" 
                    formControlName="destino"
                    [ngClass]="{'is-invalid': submitted && f.destino.errors}"
                    placeholder="Ex.: Maceió, Alagoas"
                  >
                  <div *ngIf="submitted && f.destino.errors" class="invalid-feedback">
                    <div *ngIf="f.destino.errors.required">Destino é obrigatório</div>
                  </div>
                </div>
                
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="dataInicio" class="form-label">Data de Início*</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="dataInicio" 
                      formControlName="dataInicio"
                      [ngClass]="{'is-invalid': submitted && f.dataInicio.errors}"
                    >
                    <div *ngIf="submitted && f.dataInicio.errors" class="invalid-feedback">
                      <div *ngIf="f.dataInicio.errors.required">Data de início é obrigatória</div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="dataFim" class="form-label">Data de Fim*</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="dataFim" 
                      formControlName="dataFim"
                      [ngClass]="{'is-invalid': submitted && f.dataFim.errors}"
                    >
                    <div *ngIf="submitted && f.dataFim.errors" class="invalid-feedback">
                      <div *ngIf="f.dataFim.errors.required">Data de fim é obrigatória</div>
                      <div *ngIf="f.dataFim.errors.dataInvalida">Data de fim deve ser após a data de início</div>
                    </div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <label for="descricao" class="form-label">Descrição (opcional)</label>
                  <textarea 
                    class="form-control" 
                    id="descricao" 
                    formControlName="descricao"
                    rows="3"
                    placeholder="Uma breve descrição sobre esta viagem..."
                  ></textarea>
                </div>

                <div *ngIf="error" class="alert alert-danger mb-4">
                  {{ error }}
                </div>
                
                <div class="d-flex justify-content-between">
                  <a routerLink="/dashboard" class="btn btn-outline-secondary">Cancelar</a>
                  <button 
                    type="submit" 
                    class="btn btn-primary px-4" 
                    [disabled]="loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Criar Roteiro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 500;
    }
    
    .card-header {
      background-color: var(--primary-color) !important;
    }
  `]
})
export class NovoRoteiroComponent {
  roteiroForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private roteiroService: RoteiroService
  ) {
    this.roteiroForm = this.formBuilder.group({
      nome: ['', Validators.required],
      destino: ['', Validators.required],
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      descricao: ['']
    }, {
      validators: this.validarDatas
    });
  }

  // Getter para fácil acesso aos campos
  get f() { return this.roteiroForm.controls; }

  // Validador personalizado para garantir que dataFim é após dataInicio
  validarDatas(formGroup: FormGroup) {
    const inicio = formGroup.get('dataInicio')?.value;
    const fim = formGroup.get('dataFim')?.value;

    if (inicio && fim) {
      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);

      if (dataFim < dataInicio) {
        formGroup.get('dataFim')?.setErrors({ dataInvalida: true });
      }
    }
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    // Parar se o formulário for inválido
    if (this.roteiroForm.invalid) {
      return;
    }

    this.loading = true;
    this.roteiroService.criarRoteiro(this.roteiroForm.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.router.navigate(['/roteiro', response.data.id]);
          } else {
            this.error = response.message || 'Erro ao criar roteiro';
          }
        },
        error: (error) => {
          this.error = error?.error?.message || 'Não foi possível criar o roteiro. Tente novamente.';
        }
      });
  }
} 