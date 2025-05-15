import { Usuario } from './usuario.model';

export interface Colaborador {
  id?: number | string;
  roteiroId: number | string;
  usuarioId: number | string;
  usuario?: Usuario;
  podeEditar: boolean;
  podeGerenciarColaboradores: boolean;
  dataConvite?: Date;
  dataAceitacao?: Date;
  status: 'pendente' | 'aceito' | 'recusado';
} 