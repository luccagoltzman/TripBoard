import { Usuario } from './usuario.model';
import { Atividade } from './atividade.model';
import { Colaborador } from './colaborador.model';

export interface Roteiro {
  id: number | string;
  nome: string;
  destino: string;
  dataInicio: Date;
  dataFim: Date;
  descricao?: string;
  imagem?: string;
  criadorId: number | string;
  criador?: Usuario;
  colaboradores?: Colaborador[];
  atividades?: Atividade[];
  privado?: boolean;
  
  // Propriedades para controle de UI
  editavel?: boolean;
  compartilhavel?: boolean;
}

export interface DiaRoteiro {
  id: number;
  data: Date;
  roteiroId: number;
  atividades: Atividade[];
  notasDia?: string;
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