import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow mt-5">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="mb-0">Recuperar Senha</h2>
                <p class="text-muted">Enviaremos um link para redefinir sua senha</p>
              </div>
              
              <div *ngIf="success" class="alert alert-success mb-4" role="alert">
                <div class="d-flex align-items-center">
                  <i class="material-icons me-2">check_circle</i>
                  <div>
                    <strong>Email enviado!</strong> Verifique sua caixa de entrada para redefinir sua senha.
                  </div>
                </div>
              </div>
              
              <form *ngIf="!success" [formGroup]="recuperarForm" (ngSubmit)="onSubmit()">
                <div class="mb-4">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    formControlName="email" 
                    [ngClass]="{'is-invalid': submitted && f['email'].errors}" 
                    placeholder="seu@email.com"
                  >
                  <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                    <div *ngIf="f['email'].errors['required']">Email é obrigatório</div>
                    <div *ngIf="f['email'].errors['email']">Email inválido</div>
                  </div>
                </div>
                
                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg" 
                    [disabled]="loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enviar link
                  </button>
                </div>
                
                <div *ngIf="error" class="alert alert-danger mt-3">
                  {{ error }}
                </div>
              </form>
              
              <div *ngIf="success" class="d-grid mt-3">
                <button 
                  type="button" 
                  class="btn btn-outline-primary" 
                  routerLink="/auth/login"
                >
                  Voltar para o login
                </button>
              </div>
            </div>
            
            <div class="card-footer bg-light py-3 text-center">
              <p class="mb-0">Lembrou sua senha? <a routerLink="/auth/login" class="text-decoration-none">Faça login</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--bg-light);
      padding: 40px 0;
    }
    
    .card {
      border-radius: 10px;
      border: none;
    }
    
    h2 {
      color: var(--primary-color);
      font-weight: 600;
    }
    
    .btn-primary {
      padding: 12px;
      font-weight: 500;
    }
    
    .material-icons {
      font-size: 24px;
    }
  `]
})
export class RecuperarSenhaComponent {
  recuperarForm: FormGroup;
  loading = false;
  submitted = false;
  success = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.recuperarForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Getter para acesso fácil aos campos do formulário
  get f() { return this.recuperarForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    // Parar se o formulário for inválido
    if (this.recuperarForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.recuperarSenha(this.recuperarForm.value.email)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = true;
          } else {
            this.error = response.message || 'Falha ao solicitar recuperação de senha';
          }
        },
        error: (error) => {
          this.error = error?.error?.message || 'Erro ao tentar recuperar senha. Tente novamente.';
        }
      });
  }
} 