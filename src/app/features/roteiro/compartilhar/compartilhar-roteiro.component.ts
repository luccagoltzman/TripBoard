import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RoteiroService } from '@core/services/roteiro.service';
import { NotificacaoService } from '@core/services/notificacao.service';
import { finalize } from 'rxjs';

interface CompartilharDialogData {
  roteiroId: number;
  roteiroTitulo: string;
}

@Component({
  selector: 'app-compartilhar-roteiro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './compartilhar-roteiro.component.html',
  styleUrls: ['./compartilhar-roteiro.component.scss']
})
export class CompartilharRoteiroComponent {
  compartilharForm: FormGroup;
  enviando = false;
  linkCompartilhamento: string;

  redesSociais = [
    { id: 'whatsapp', nome: 'WhatsApp', icone: 'whatsapp' },
    { id: 'telegram', nome: 'Telegram', icone: 'telegram' },
    { id: 'facebook', nome: 'Facebook', icone: 'facebook' },
    { id: 'twitter', nome: 'Twitter', icone: 'share' }
  ];

  permissoes = [
    { valor: 'visualizar', label: 'Visualizar' },
    { valor: 'editar', label: 'Editar' },
    { valor: 'admin', label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompartilharRoteiroComponent>,
    private roteiroService: RoteiroService,
    private notificacaoService: NotificacaoService,
    @Inject(MAT_DIALOG_DATA) public data: CompartilharDialogData
  ) {
    this.compartilharForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      permissao: ['visualizar', [Validators.required]]
    });

    this.linkCompartilhamento = `${window.location.origin}/roteiro/${this.data.roteiroId}`;
  }

  copiarLink(): void {
    navigator.clipboard.writeText(this.linkCompartilhamento).then(() => {
      this.notificacaoService.exibirSucesso('Link copiado!');
    });
  }

  compartilharRedeSocial(redeSocial: string): void {
    const titulo = encodeURIComponent(this.data.roteiroTitulo);
    const url = encodeURIComponent(this.linkCompartilhamento);
    let link = '';

    switch (redeSocial) {
      case 'whatsapp':
        link = `https://api.whatsapp.com/send?text=${titulo}%20-%20${url}`;
        break;
      case 'telegram':
        link = `https://t.me/share/url?url=${url}&text=${titulo}`;
        break;
      case 'facebook':
        link = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        link = `https://twitter.com/intent/tweet?text=${titulo}&url=${url}`;
        break;
    }

    if (link) {
      window.open(link, '_blank');
    }
  }

  compartilhar(): void {
    if (this.compartilharForm.invalid) {
      return;
    }

    this.enviando = true;
    const dados = this.compartilharForm.value;
    const roteiroId = typeof this.data.roteiroId === 'string' ? parseInt(this.data.roteiroId) : this.data.roteiroId;

    this.roteiroService.compartilharRoteiro(roteiroId, dados.email)
      .pipe(finalize(() => this.enviando = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacaoService.exibirSucesso('Convite enviado com sucesso!');
            this.dialogRef.close(true);
          } else {
            this.notificacaoService.exibirErro(response.message || 'Erro ao compartilhar roteiro');
          }
        },
        error: (error) => {
          this.notificacaoService.exibirErro(
            error?.error?.message || 'Não foi possível compartilhar o roteiro'
          );
        }
      });
  }

  fechar(): void {
    this.dialogRef.close();
  }

  get f() {
    return this.compartilharForm.controls;
  }
} 