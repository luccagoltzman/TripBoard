import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { NotificacaoService } from '@core/services/notificacao.service';
import { Usuario, AlterarSenha } from '@core/models/usuario.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  perfilForm!: FormGroup;
  senhaForm!: FormGroup;
  salvandoPerfil = false;
  salvandoSenha = false;
  submittedPerfil = false;
  submittedSenha = false;
  imagemPreview: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificacaoService: NotificacaoService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.inicializarFormularios();
      }
    });
  }
  
  inicializarFormularios(): void {
    this.perfilForm = this.fb.group({
      nome: [this.usuario?.nome || '', [Validators.required]],
      email: [this.usuario?.email || '', [Validators.required, Validators.email]],
      fotoPerfil: ['']
    });
    
    this.senhaForm = this.fb.group({
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, {
      validators: this.senhasDevemCoincidirValidator
    });
  }
  
  get pf() { 
    return this.perfilForm.controls; 
  }
  
  get sf() { 
    return this.senhaForm.controls; 
  }
  
  senhasDevemCoincidirValidator(formGroup: FormGroup) {
    const novaSenha = formGroup.get('novaSenha')?.value;
    const confirmarSenha = formGroup.get('confirmarSenha')?.value;
    
    if (novaSenha === confirmarSenha) {
      return null;
    }
    
    return { senhasNaoCoincidem: true };
  }
  
  onImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const arquivo = input.files[0];
      
      if (arquivo.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagemPreview = reader.result as string;
          this.perfilForm.patchValue({
            fotoPerfil: reader.result
          });
        };
        reader.readAsDataURL(arquivo);
      } else {
        this.notificacaoService.exibirErro('Por favor, selecione uma imagem válida.');
        input.value = '';
      }
    }
  }
  
  salvarPerfil(): void {
    this.submittedPerfil = true;
    
    if (this.perfilForm.invalid) {
      return;
    }
    
    this.salvandoPerfil = true;
    
    const dadosAtualizados = {
      ...this.usuario,
      nome: this.pf['nome'].value,
      email: this.pf['email'].value,
      fotoPerfil: this.imagemPreview || this.usuario?.fotoPerfil
    };
    
    this.authService.atualizarPerfil(dadosAtualizados)
      .pipe(finalize(() => this.salvandoPerfil = false))
      .subscribe({
        next: (response: ApiResponse<Usuario>) => {
          if (response.success) {
            this.notificacaoService.exibirSucesso('Perfil atualizado com sucesso!');
            if (response.data) {
              this.authService.atualizarUsuario(response.data);
            }
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao atualizar perfil');
          }
        },
        error: (error: any) => {
          this.notificacaoService.exibirErro(
            error?.error?.message || 'Não foi possível atualizar o perfil. Tente novamente.'
          );
        }
      });
  }
  
  alterarSenha(): void {
    this.submittedSenha = true;
    
    if (this.senhaForm.invalid) {
      return;
    }
    
    this.salvandoSenha = true;
    
    const senhaData: AlterarSenha = {
      senhaAtual: this.sf['senhaAtual'].value,
      novaSenha: this.sf['novaSenha'].value,
      confirmarSenha: this.sf['confirmarSenha'].value
    };
    
    this.authService.alterarSenha(senhaData)
      .pipe(finalize(() => this.salvandoSenha = false))
      .subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            this.notificacaoService.exibirSucesso('Senha alterada com sucesso!');
            this.senhaForm.reset();
            this.submittedSenha = false;
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao alterar senha');
          }
        },
        error: (error: any) => {
          this.notificacaoService.exibirErro(
            error?.error?.message || 'Não foi possível alterar a senha. Tente novamente.'
          );
        }
      });
  }
  
  sair(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.notificacaoService.exibirSucesso('Você saiu com sucesso!');
  }
  
  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
} 