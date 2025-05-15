import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-7 col-lg-6">
          <div class="card shadow mt-5">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="mb-0">Crie sua conta</h2>
                <p class="text-muted">Planeje viagens com amigos e família</p>
              </div>
              
              <div *ngIf="success" class="alert alert-success mb-4" role="alert">
                <div class="d-flex align-items-center">
                  <i class="material-icons me-2">check_circle</i>
                  <div>
                    <strong>Conta criada com sucesso!</strong> Redirecionando para o dashboard...
                  </div>
                </div>
              </div>
              
              <form [formGroup]="registroForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="nome" class="form-label">Nome completo</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="nome" 
                    formControlName="nome" 
                    [ngClass]="{'is-invalid': submitted && f['nome'].errors}" 
                    placeholder="Seu nome completo"
                  >
                  <div *ngIf="submitted && f['nome'].errors" class="invalid-feedback">
                    <div *ngIf="f['nome'].errors['required']">Nome é obrigatório</div>
                  </div>
                </div>
                
                <div class="mb-3">
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
                
                <div class="mb-3">
                  <label for="senha" class="form-label">Senha</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="senha" 
                    formControlName="senha" 
                    [ngClass]="{'is-invalid': submitted && f['senha'].errors}" 
                    placeholder="Crie uma senha forte"
                  >
                  <div *ngIf="submitted && f['senha'].errors" class="invalid-feedback">
                    <div *ngIf="f['senha'].errors['required']">Senha é obrigatória</div>
                    <div *ngIf="f['senha'].errors['minlength']">Senha deve ter pelo menos 6 caracteres</div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <label for="confirmarSenha" class="form-label">Confirme a senha</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmarSenha" 
                    formControlName="confirmarSenha" 
                    [ngClass]="{'is-invalid': submitted && f['confirmarSenha'].errors}" 
                    placeholder="Confirme sua senha"
                  >
                  <div *ngIf="submitted && f['confirmarSenha'].errors" class="invalid-feedback">
                    <div *ngIf="f['confirmarSenha'].errors['required']">Confirmação de senha é obrigatória</div>
                    <div *ngIf="f['confirmarSenha'].errors['mustMatch']">As senhas não conferem</div>
                  </div>
                </div>
                
                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg" 
                    [disabled]="loading || success"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Criar conta
                  </button>
                </div>
                
                <div *ngIf="error" class="alert alert-danger mt-3">
                  {{ error }}
                </div>
              </form>
            </div>
            
            <div class="card-footer bg-light py-3 text-center">
              <p class="mb-0">Já tem uma conta? <a routerLink="/auth/login" class="text-decoration-none">Faça login</a></p>
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
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  loading = false;
  submitted = false;
  success = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registroForm = this.formBuilder.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, {
      validators: this.mustMatch('senha', 'confirmarSenha')
    });
  }
  
  ngOnInit(): void {
    // Verificar se o usuário já está autenticado
    this.authService.isAutenticado$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  // Getter para acesso fácil aos campos do formulário
  get f() { return this.registroForm.controls; }

  // Validador personalizado para verificar se as senhas conferem
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    // Parar se o formulário for inválido
    if (this.registroForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.registrar(this.registroForm.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Registro response:', response);
          
          if (response.success) {
            this.success = true;
            
            // Aguardar um momento antes de redirecionar para mostrar mensagem de sucesso
            setTimeout(() => {
              console.log('Redirecting to dashboard after registration');
              
              // Forçar um refresh para garantir que a página seja carregada com os dados do usuário
              window.location.href = '/dashboard';
            }, 1500);
          } else {
            this.error = response.message || 'Falha no registro';
          }
        },
        error: (error) => {
          console.error('Registro error:', error);
          this.error = error?.error?.message || 'Erro ao tentar criar conta. Tente novamente.';
        }
      });
  }
} 