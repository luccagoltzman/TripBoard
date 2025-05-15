import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  constructor() { }

  /**
   * Exibe uma mensagem de sucesso para o usuário
   * @param mensagem Mensagem a ser exibida
   * @param duracao Duração em milissegundos (padrão: 5000ms)
   */
  exibirSucesso(mensagem: string, duracao: number = 5000): void {
    this.exibirNotificacao(mensagem, 'success', duracao);
  }

  /**
   * Exibe uma mensagem de erro para o usuário
   * @param mensagem Mensagem a ser exibida
   * @param duracao Duração em milissegundos (padrão: 5000ms)
   */
  exibirErro(mensagem: string, duracao: number = 5000): void {
    this.exibirNotificacao(mensagem, 'danger', duracao);
  }

  /**
   * Exibe uma mensagem de aviso para o usuário
   * @param mensagem Mensagem a ser exibida
   * @param duracao Duração em milissegundos (padrão: 5000ms)
   */
  exibirAviso(mensagem: string, duracao: number = 5000): void {
    this.exibirNotificacao(mensagem, 'warning', duracao);
  }

  /**
   * Exibe uma mensagem de informação para o usuário
   * @param mensagem Mensagem a ser exibida
   * @param duracao Duração em milissegundos (padrão: 5000ms)
   */
  exibirInfo(mensagem: string, duracao: number = 5000): void {
    this.exibirNotificacao(mensagem, 'info', duracao);
  }

  /**
   * Método interno para exibir notificações
   * @param mensagem Mensagem a ser exibida
   * @param tipo Tipo da notificação (success, danger, warning, info)
   * @param duracao Duração em milissegundos
   */
  private exibirNotificacao(mensagem: string, tipo: 'success' | 'danger' | 'warning' | 'info', duracao: number): void {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.classList.add('toast', 'show', `bg-${tipo}`, 'text-white');
    notificacao.setAttribute('role', 'alert');
    notificacao.setAttribute('aria-live', 'assertive');
    notificacao.setAttribute('aria-atomic', 'true');
    
    notificacao.style.position = 'fixed';
    notificacao.style.bottom = '20px';
    notificacao.style.right = '20px';
    notificacao.style.minWidth = '250px';
    notificacao.style.zIndex = '9999';
    notificacao.style.borderRadius = '4px';
    notificacao.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    
    // Criar corpo da notificação
    const notificacaoBody = document.createElement('div');
    notificacaoBody.classList.add('toast-body', 'd-flex', 'align-items-center');
    
    // Adicionar ícone apropriado
    const icone = document.createElement('i');
    icone.classList.add('material-icons', 'me-2');
    
    switch (tipo) {
      case 'success':
        icone.textContent = 'check_circle';
        break;
      case 'danger':
        icone.textContent = 'error';
        break;
      case 'warning':
        icone.textContent = 'warning';
        break;
      case 'info':
        icone.textContent = 'info';
        break;
    }
    
    notificacaoBody.appendChild(icone);
    
    // Adicionar texto da mensagem
    const textoNotificacao = document.createElement('span');
    textoNotificacao.textContent = mensagem;
    notificacaoBody.appendChild(textoNotificacao);
    
    // Adicionar botão de fechar
    const botaoFechar = document.createElement('button');
    botaoFechar.type = 'button';
    botaoFechar.classList.add('btn-close', 'btn-close-white', 'ms-auto');
    botaoFechar.setAttribute('data-bs-dismiss', 'toast');
    botaoFechar.setAttribute('aria-label', 'Fechar');
    botaoFechar.onclick = () => document.body.removeChild(notificacao);
    
    notificacaoBody.appendChild(botaoFechar);
    
    // Montar notificação final
    notificacao.appendChild(notificacaoBody);
    
    // Adicionar ao DOM
    document.body.appendChild(notificacao);
    
    // Remover após a duração especificada
    setTimeout(() => {
      if (document.body.contains(notificacao)) {
        document.body.removeChild(notificacao);
      }
    }, duracao);
  }
} 