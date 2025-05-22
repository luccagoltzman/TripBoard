export type TipoUsuario = 'admin' | 'colaborador';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  fotoPerfil?: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface UsuarioLogin {
  email: string;
  senha: string;
}

export interface UsuarioRegistro extends UsuarioLogin {
  nome: string;
  confirmarSenha: string;
}

export interface UsuarioResponse {
  usuario: Usuario;
  token: string;
}

export interface ResetSenha {
  email: string;
}

export interface AlterarSenha {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
} 