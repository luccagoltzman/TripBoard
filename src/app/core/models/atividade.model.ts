import { Usuario } from './usuario.model';

export interface Atividade {
  id?: number | string;
  titulo: string;
  descricao?: string;
  data: Date;
  horario?: string;
  local?: string;
  roteiroId?: number | string;
  usuarioId?: number | string;
  criador?: Usuario;
  aprovada?: boolean;
  sugestao?: boolean;
  importante?: boolean;
} 