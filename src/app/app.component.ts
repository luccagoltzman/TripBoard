import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'TripBoard';
  private tokenCheckSubscription?: Subscription;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // Verificar o token a cada 5 minutos
    this.tokenCheckSubscription = interval(300000).subscribe(() => {
      console.log('Verificando token de autenticação...');
      this.authService.verificarTokenExpirado();
    });
    
    // Verificar imediatamente na inicialização do app
    this.authService.verificarTokenExpirado();
  }
  
  ngOnDestroy(): void {
    if (this.tokenCheckSubscription) {
      this.tokenCheckSubscription.unsubscribe();
    }
  }
} 