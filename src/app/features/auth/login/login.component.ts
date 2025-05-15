import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow mt-5">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="mb-0">TripBoard</h2>
                <p class="text-muted">Entre na sua conta</p>
              </div>
              
              <div *ngIf="success" class="alert alert-success mb-4" role="alert">
                <div class="d-flex align-items-center">
                  <i class="material-icons me-2">check_circle</i>
                  <div>
                    <strong>Login realizado com sucesso!</strong> Redirecionando...
                  </div>
                </div>
              </div>
              
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
                
                <div class="mb-4">
                  <div class="d-flex justify-content-between">
                    <label for="password" class="form-label">Senha</label>
                    <a routerLink="/auth/recuperar-senha" class="text-decoration-none small">Esqueceu a senha?</a>
                  </div>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    formControlName="senha" 
                    [ngClass]="{'is-invalid': submitted && f['senha'].errors}" 
                    placeholder="••••••••"
                  >
                  <div *ngIf="submitted && f['senha'].errors" class="invalid-feedback">
                    <div *ngIf="f['senha'].errors['required']">Senha é obrigatória</div>
                  </div>
                </div>
                
                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg" 
                    [disabled]="loading || success"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Entrar
                  </button>
                </div>
                
                <div *ngIf="error" class="alert alert-danger mt-3">
                  {{ error }}
                </div>
              </form>
            </div>
            
            <div class="card-footer bg-light py-3 text-center">
              <p class="mb-0">Não tem uma conta? <a routerLink="/auth/registro" class="text-decoration-none">Cadastre-se</a></p>
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  success = false;
  error = '';
  returnUrl: string = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    // Obter URL de retorno dos parâmetros da rota ou usar padrão
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Verificar se o usuário já está autenticado
    this.authService.isAutenticado$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  // Getter para acesso fácil aos campos do formulário
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    // Parar se o formulário for inválido
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Login response:', response);
          
          if (response.success) {
            this.success = true;
            
            // Aguardar um momento antes de redirecionar para mostrar mensagem de sucesso
            setTimeout(() => {
              console.log('Redirecting to:', this.returnUrl);
              
              // Forçar um refresh para garantir que a página seja carregada com os dados do usuário
              window.location.href = this.returnUrl;
            }, 1500);
          } else {
            this.error = response.message || 'Falha no login';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.error = error?.error?.message || 'Erro ao tentar fazer login. Tente novamente.';
        }
      });
  }
} 