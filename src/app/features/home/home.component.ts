import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-3">Planeje viagens em grupo sem complicações</h1>
            <p class="lead mb-4">TripBoard é a plataforma colaborativa que permite a você e seus amigos organizarem roteiros de viagem juntos, em tempo real.</p>
            <div class="d-grid gap-2 d-md-flex">
              <a routerLink="/auth/registro" class="btn btn-light btn-lg px-4 me-md-2">Comece Grátis</a>
              <a routerLink="/auth/login" class="btn btn-outline-light btn-lg px-4">Entrar</a>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <img src="assets/images/hero-image.svg" alt="Planejar viagem" class="img-fluid rounded-3 shadow-lg" />
          </div>
        </div>
      </div>
    </header>

    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Por que o TripBoard?</h2>
          <p class="lead text-muted">Recursos pensados para tornar o planejamento de viagens em grupo uma experiência agradável</p>
        </div>

        <div class="row g-4">
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-primary bg-gradient text-white rounded-circle mb-3">
                  <i class="material-icons">edit_calendar</i>
                </div>
                <h5 class="card-title">Roteiros Colaborativos</h5>
                <p class="card-text">Todos podem visualizar e sugerir mudanças no roteiro, com controle total para o administrador.</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-primary bg-gradient text-white rounded-circle mb-3">
                  <i class="material-icons">chat</i>
                </div>
                <h5 class="card-title">Discussões Integradas</h5>
                <p class="card-text">Comente em cada atividade do roteiro sem precisar de outros aplicativos para conversar.</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-primary bg-gradient text-white rounded-circle mb-3">
                  <i class="material-icons">payments</i>
                </div>
                <h5 class="card-title">Gestão de Gastos</h5>
                <p class="card-text">Tenha uma visão clara de quanto sua viagem vai custar com estimativas colaborativas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5 bg-light">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <img src="assets/images/app-preview.svg" alt="TripBoard em ação" class="img-fluid rounded-3 shadow" />
          </div>
          <div class="col-lg-6">
            <h2 class="fw-bold mb-3">Como funciona</h2>
            <ul class="list-unstyled">
              <li class="d-flex mb-4">
                <div class="step-icon bg-primary text-white rounded-circle me-3">1</div>
                <div>
                  <h5>Crie seu roteiro</h5>
                  <p class="text-muted">Defina destino, datas e adicione os primeiros dias do seu roteiro.</p>
                </div>
              </li>
              <li class="d-flex mb-4">
                <div class="step-icon bg-primary text-white rounded-circle me-3">2</div>
                <div>
                  <h5>Convide os viajantes</h5>
                  <p class="text-muted">Compartilhe o link com amigos e família para colaborarem.</p>
                </div>
              </li>
              <li class="d-flex mb-4">
                <div class="step-icon bg-primary text-white rounded-circle me-3">3</div>
                <div>
                  <h5>Planeje juntos</h5>
                  <p class="text-muted">Discutam, sugiram e aprovem atividades para cada dia da viagem.</p>
                </div>
              </li>
            </ul>
            <a routerLink="/auth/registro" class="btn btn-primary px-4 py-2">Começar agora</a>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-dark text-white py-4">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h5>TripBoard</h5>
            <p class="small">Uma plataforma para tornar o planejamento de viagens em grupo mais fácil e divertido.</p>
          </div>
          <div class="col-md-3">
            <h6>Links</h6>
            <ul class="list-unstyled">
              <li><a routerLink="/auth/registro" class="text-decoration-none link-light">Cadastro</a></li>
              <li><a routerLink="/auth/login" class="text-decoration-none link-light">Login</a></li>
            </ul>
          </div>
          <div class="col-md-3">
            <h6>Contato</h6>
            <p class="small">contato@tripboard.com</p>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-12 text-center">
            <p class="small mb-0">&copy; 2025 TripBoard. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .feature-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      font-size: 2rem;
    }
    
    .step-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    header {
      background-color: var(--primary-color);
      background-image: linear-gradient(135deg, var(--primary-color) 0%, #2c387e 100%);
    }
    
    header h1, header p {
      color: #fff;
    }
    
    .card {
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-10px);
    }
  `]
})
export class HomeComponent {} 