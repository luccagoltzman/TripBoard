import { Usuario } from './usuario.model';

export interface Roteiro {
  id: number;
  nome: string;
  destino: string;
  dataInicio: Date;
  dataFim: Date;
  criadorId: number;
  criador?: Usuario;
  colaboradores?: Usuario[];
  descricao?: string;
  imagem?: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface DiaRoteiro {
  id: number;
  data: Date;
  roteiroId: number;
  atividades: Atividade[];
  notasDia?: string;
}

export interface Atividade {
  id: number;
  titulo: string;
  descricao: string;
  local: string;
  horario: string;
  sugestao: boolean;
  criadoPor: number;
  criador?: Usuario;
  diaDaViagemId: number;
  importante?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface Comentario {
  id: number;
  texto: string;
  autorId: number;
  autor?: Usuario;
  atividadeId: number;
  dataCriacao: Date;
}

export interface Gasto {
  id: number;
  roteiroId: number;
  categoria: string;
  descricao: string;
  valor: number;
  dataPrevista?: Date;
  criadoPor: number;
  criador?: Usuario;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface Sugestao {
  id: number;
  tipo: 'adicionar' | 'editar' | 'remover';
  entidadeId?: number;
  entidadeTipo: 'atividade' | 'gasto';
  sugeridoPor: number;
  autor?: Usuario;
  dadosNovos: any;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  roteiroId: number;
  dataCriacao: Date;
} 