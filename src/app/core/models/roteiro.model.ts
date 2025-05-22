import { Usuario } from './usuario.model';
import { Colaborador as ColaboradorBase } from './colaborador.model';
import { Atividade as AtividadeBase } from './atividade.model';

export interface Roteiro {
  id: string;
  titulo: string;
  nome?: string;
  descricao: string;
  dataInicio: Date;
  dataFim: Date;
  destino: string;
  status: 'ativo' | 'pendente' | 'concluido' | 'planejamento' | 'confirmado' | 'em_andamento';
  progresso: number;
  orcamento: number;
  orcamento_total?: number;
  gastoTotal: number;
  imagemCapa: string;
  imagem?: string;
  privado: boolean;
  colaboradores: ColaboradorBase[];
  proximasAtividades: AtividadeBase[];
  documentos: Documento[];
  diasRestantes: number;
  editavel?: boolean;
  compartilhavel?: boolean;
  criadorId?: string;
  criador?: Usuario;
  atividades?: AtividadeBase[];
}

export interface DiaRoteiro {
  id: number;
  data: Date;
  roteiroId: number;
  atividades: AtividadeBase[];
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

export interface Documento {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  url: string;
  icone: string;
} 