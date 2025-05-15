import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiPaginatedResponse, ApiResponse } from '../models/api-response.model';
import { Roteiro, DiaRoteiro, Comentario, Sugestao } from '../models/roteiro.model';
import { Atividade } from '../models/atividade.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoteiroService {
  private apiUrl = `${environment.apiUrl}/roteiros`;

  constructor(private http: HttpClient) {}

  listarRoteiros(pagina: number = 1, tamanhoPagina: number = 10): Observable<ApiPaginatedResponse<Roteiro>> {
    const params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', tamanhoPagina.toString());
    
    return this.http.get<any>(this.apiUrl, { params })
      .pipe(
        map(response => {
          console.log('Resposta original da API:', response);
          
          // Adapta cada roteiro para ter os campos no formato correto do frontend
          const adaptarRoteiro = (roteiro: any) => {
            // Caso roteiro não seja um objeto, retornar o valor original
            if (!roteiro || typeof roteiro !== 'object') return roteiro;
            
            const roteiroAdaptado: any = {
              ...roteiro,
              // Mapeia campos específicos
              dataInicio: roteiro.data_inicio || roteiro.dataInicio,
              dataFim: roteiro.data_fim || roteiro.dataFim,
              criadorId: roteiro.user_id || roteiro.criadorId
            };
            
            // Remove os campos originais para não duplicar
            if (roteiro.data_inicio) delete roteiroAdaptado.data_inicio;
            if (roteiro.data_fim) delete roteiroAdaptado.data_fim;
            if (roteiro.user_id) delete roteiroAdaptado.user_id;
            
            return roteiroAdaptado;
          };
          
          // Adaptar a resposta do Laravel para o formato esperado pelo frontend
          if (!response.hasOwnProperty('success')) {
            // É a resposta direta do Laravel, adaptar
            const dataItems = Array.isArray(response.data) 
              ? response.data.map(adaptarRoteiro) 
              : [];
              
            const adaptedResponse = {
              success: true,
              message: 'Roteiros obtidos com sucesso',
              data: {
                items: dataItems,
                total: response.total || 0,
                pagina: response.current_page || 1,
                tamanhoPagina: response.per_page || 10,
                totalPaginas: response.last_page || 1
              }
            };
            console.log('Resposta adaptada:', adaptedResponse);
            return adaptedResponse;
          } else if (response.success && response.data && Array.isArray(response.data.items)) {
            // Já está no formato esperado mas precisa adaptar cada roteiro
            response.data.items = response.data.items.map(adaptarRoteiro);
            return response;
          }
          
          return response;
        })
      );
  }

  obterRoteiro(id: number | string): Observable<ApiResponse<Roteiro>> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          console.log('Resposta original do obterRoteiro:', response);
          
          // Se tiver sucesso mas os campos estiverem em formato do Laravel
          if (response.success && response.data) {
            // Mapear os campos do Laravel para o formato esperado pelo frontend
            const roteiro = response.data;
            
            // Cria uma nova versão do objeto com os campos adaptados
            const roteiroAdaptado: any = {
              ...roteiro,
              // Mapeia campos específicos
              dataInicio: roteiro.data_inicio || roteiro.dataInicio,
              dataFim: roteiro.data_fim || roteiro.dataFim,
              criadorId: roteiro.user_id || roteiro.criadorId
            };
            
            // Remove os campos originais para não duplicar
            if (roteiro.data_inicio) delete roteiroAdaptado.data_inicio;
            if (roteiro.data_fim) delete roteiroAdaptado.data_fim;
            if (roteiro.user_id) delete roteiroAdaptado.user_id;
            
            console.log('Roteiro adaptado:', roteiroAdaptado);
            
            return {
              success: response.success,
              message: response.message || 'Roteiro obtido com sucesso',
              data: roteiroAdaptado
            };
          }
          
          return response;
        })
      );
  }

  criarRoteiro(roteiro: Partial<Roteiro>): Observable<ApiResponse<Roteiro>> {
    return this.http.post<ApiResponse<Roteiro>>(this.apiUrl, roteiro);
  }

  atualizarRoteiro(id: number | string, roteiro: Partial<Roteiro>): Observable<ApiResponse<Roteiro>> {
    return this.http.put<ApiResponse<Roteiro>>(`${this.apiUrl}/${id}`, roteiro);
  }

  excluirRoteiro(id: number | string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  obterDiasRoteiro(roteiroId: number): Observable<ApiResponse<DiaRoteiro[]>> {
    return this.http.get<ApiResponse<DiaRoteiro[]>>(`${this.apiUrl}/${roteiroId}/dias`);
  }

  obterDiaRoteiro(roteiroId: number, diaId: number): Observable<ApiResponse<DiaRoteiro>> {
    return this.http.get<ApiResponse<DiaRoteiro>>(`${this.apiUrl}/${roteiroId}/dias/${diaId}`);
  }

  criarDiaRoteiro(roteiroId: number, dia: Partial<DiaRoteiro>): Observable<ApiResponse<DiaRoteiro>> {
    return this.http.post<ApiResponse<DiaRoteiro>>(`${this.apiUrl}/${roteiroId}/dias`, dia);
  }

  atualizarDiaRoteiro(roteiroId: number, diaId: number, dia: Partial<DiaRoteiro>): Observable<ApiResponse<DiaRoteiro>> {
    return this.http.put<ApiResponse<DiaRoteiro>>(`${this.apiUrl}/${roteiroId}/dias/${diaId}`, dia);
  }

  excluirDiaRoteiro(roteiroId: number, diaId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${roteiroId}/dias/${diaId}`);
  }

  criarAtividade(atividade: Partial<Atividade>): Observable<ApiResponse<Atividade>> {
    if (!atividade.roteiroId) {
      throw new Error('roteiroId é obrigatório para criar uma atividade');
    }
    
    // Adaptar os campos para o formato esperado pelo Laravel
    const dataAtividade = new Date(atividade.data as Date);
    
    // Criar uma cópia do objeto para não modificar o original
    const atividadeParaEnviar: any = {
      ...atividade,
      // Converter ID do roteiro para o formato do Laravel
      roteiro_id: atividade.roteiroId,
      // Converter para o formato esperado pelo Laravel
      data_hora_inicio: this.formatarDataHoraParaAPI(dataAtividade, atividade.horario || '00:00'),
      // Assegurar que temos um título
      titulo: atividade.titulo || 'Nova atividade',
      // Outros campos podem precisar ser adaptados aqui
      nome: atividade.titulo || 'Nova atividade',
      descricao: atividade.descricao || '',
      local: atividade.local || ''
      // Removido o campo status para testar se o backend aceita
    };
    
    // Remover campos que não são esperados pelo backend
    delete atividadeParaEnviar.data;
    delete atividadeParaEnviar.horario;
    delete atividadeParaEnviar.roteiroId;
    if (atividadeParaEnviar.status) delete atividadeParaEnviar.status;
    
    console.log('Enviando atividade para o backend:', atividadeParaEnviar);
    
    return this.http.post<ApiResponse<Atividade>>(`${this.apiUrl}/${atividade.roteiroId}/atividades`, atividadeParaEnviar);
  }
  
  atualizarAtividade(atividade: Partial<Atividade>): Observable<ApiResponse<Atividade>> {
    if (!atividade.roteiroId || !atividade.id) {
      throw new Error('roteiroId e id são obrigatórios para atualizar uma atividade');
    }
    
    // Adaptar os campos para o formato esperado pelo Laravel
    const dataAtividade = new Date(atividade.data as Date);
    
    // Criar uma cópia do objeto para não modificar o original
    const atividadeParaEnviar: any = {
      ...atividade,
      // Converter ID do roteiro para o formato do Laravel
      roteiro_id: atividade.roteiroId,
      // Converter para o formato esperado pelo Laravel
      data_hora_inicio: this.formatarDataHoraParaAPI(dataAtividade, atividade.horario || '00:00'),
      // Assegurar que temos um título
      titulo: atividade.titulo || 'Atividade atualizada',
      // Outros campos podem precisar ser adaptados aqui
      nome: atividade.titulo || 'Atividade atualizada',
      descricao: atividade.descricao || '',
      local: atividade.local || ''
      // Removido o campo status para testar se o backend aceita
    };
    
    // Remover campos que não são esperados pelo backend
    delete atividadeParaEnviar.data;
    delete atividadeParaEnviar.horario;
    delete atividadeParaEnviar.roteiroId;
    if (atividadeParaEnviar.status) delete atividadeParaEnviar.status;
    
    console.log('Enviando atualização de atividade para o backend:', atividadeParaEnviar);
    
    return this.http.put<ApiResponse<Atividade>>(
      `${this.apiUrl}/${atividade.roteiroId}/atividades/${atividade.id}`, 
      atividadeParaEnviar
    );
  }
  
  // Método auxiliar para formatar data e hora para o formato esperado pela API
  private formatarDataHoraParaAPI(data: Date, horario: string): string {
    // Cria uma nova data com a data fornecida
    const dataLocal = new Date(data);
    
    // Definir horas e minutos baseado no horário fornecido
    let hora = 12; // Meio-dia por padrão para evitar problemas de fuso
    let minuto = 0;
    
    if (horario) {
      const partes = horario.split(':');
      if (partes.length >= 1) {
        hora = parseInt(partes[0], 10) || 12;
      }
      if (partes.length >= 2) {
        minuto = parseInt(partes[1], 10) || 0;
      }
    }
    
    // Definir as horas e minutos para evitar problemas de fuso horário
    dataLocal.setHours(hora, minuto, 0, 0);
    
    // Ajustar para compensar fuso horário se necessário
    // Adicionar 12 horas para garantir que a data não mude quando convertida para UTC
    // Isso é importante principalmente quando horário não é informado
    if (hora < 12 && !horario) {
      dataLocal.setHours(12, 0, 0, 0);
    }
    
    // Formatar para YYYY-MM-DD HH:MM:SS
    const ano = dataLocal.getFullYear();
    const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
    const dia = String(dataLocal.getDate()).padStart(2, '0');
    const horaFormatada = String(dataLocal.getHours()).padStart(2, '0');
    const minutoFormatado = String(dataLocal.getMinutes()).padStart(2, '0');
    
    const dataFormatada = `${ano}-${mes}-${dia} ${horaFormatada}:${minutoFormatado}:00`;
    console.log(`Data original: ${data}, Horário: ${horario}, Data formatada: ${dataFormatada}`);
    
    return dataFormatada;
  }

  removerAtividade(id: number | string, roteiroId?: number | string): Observable<ApiResponse<boolean>> {
    // Se temos o roteiroId, usamos a rota aninhada (mais provável de estar configurada no Laravel)
    if (roteiroId) {
      return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${roteiroId}/atividades/${id}`);
    }
    
    // Fallback para a rota direta de atividades
    return this.http.delete<ApiResponse<boolean>>(`${environment.apiUrl}/atividades/${id}`);
  }

  criarComentario(atividadeId: number, comentario: Partial<Comentario>): Observable<ApiResponse<Comentario>> {
    return this.http.post<ApiResponse<Comentario>>(`${environment.apiUrl}/atividades/${atividadeId}/comentarios`, comentario);
  }

  listarComentarios(atividadeId: number): Observable<ApiResponse<Comentario[]>> {
    return this.http.get<ApiResponse<Comentario[]>>(`${environment.apiUrl}/atividades/${atividadeId}/comentarios`);
  }

  excluirComentario(comentarioId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/comentarios/${comentarioId}`);
  }

  criarSugestao(sugestao: Partial<Sugestao>): Observable<ApiResponse<Sugestao>> {
    return this.http.post<ApiResponse<Sugestao>>(`${environment.apiUrl}/sugestoes`, sugestao);
  }

  listarSugestoes(roteiroId: number): Observable<ApiResponse<Sugestao[]>> {
    return this.http.get<ApiResponse<Sugestao[]>>(`${environment.apiUrl}/roteiros/${roteiroId}/sugestoes`);
  }

  aprovarSugestao(sugestaoId: number): Observable<ApiResponse<Sugestao>> {
    return this.http.put<ApiResponse<Sugestao>>(`${environment.apiUrl}/sugestoes/${sugestaoId}/aprovar`, {});
  }

  rejeitarSugestao(sugestaoId: number): Observable<ApiResponse<Sugestao>> {
    return this.http.put<ApiResponse<Sugestao>>(`${environment.apiUrl}/sugestoes/${sugestaoId}/rejeitar`, {});
  }

  compartilharRoteiro(roteiroId: number, email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${roteiroId}/compartilhar`, { email });
  }

  gerarPdf(roteiroId: number | string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${roteiroId}/pdf`, { responseType: 'blob' });
  }

  convidarColaborador(roteiroId: number | string, email: string, permissoes: { podeEditar: boolean, podeGerenciarColaboradores: boolean }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${roteiroId}/colaboradores/convidar`,
      { email, ...permissoes }
    );
  }

  removerColaborador(roteiroId: number | string, colaboradorId: number | string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.apiUrl}/${roteiroId}/colaboradores/${colaboradorId}`
    );
  }

  listarGastos(roteiroId: number | string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${roteiroId}/gastos`);
  }

  adicionarGasto(roteiroId: number | string, gasto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${roteiroId}/gastos`, gasto);
  }

  // Listar todas as atividades de um roteiro
  listarAtividades(roteiroId: number | string): Observable<ApiResponse<Atividade[]>> {
    return this.http.get<any>(`${this.apiUrl}/${roteiroId}/atividades`)
      .pipe(
        map(response => {
          console.log('Resposta original de listarAtividades:', response);
          
          // Verificar se a resposta já está no formato esperado
          if (response.hasOwnProperty('success')) {
            // Processar as atividades se elas existirem
            if (response.success && response.data && Array.isArray(response.data)) {
              // Adaptar cada atividade para o formato esperado pelo frontend
              response.data = response.data.map((atividade: any) => {
                return {
                  ...atividade,
                  data: atividade.data_hora_inicio ? new Date(atividade.data_hora_inicio) : null,
                  horario: this.extrairHorario(atividade.data_hora_inicio) || '',
                  titulo: atividade.titulo || atividade.nome || 'Sem título',
                  roteiroId: atividade.roteiro_id || atividade.roteiroId || roteiroId
                };
              });
            }
            return response;
          }
          
          // Adaptar a resposta para o formato esperado (caso seja resposta direta do Laravel)
          return {
            success: true,
            message: 'Atividades obtidas com sucesso',
            data: Array.isArray(response) ? response.map((atividade: any) => {
              return {
                ...atividade,
                data: atividade.data_hora_inicio ? new Date(atividade.data_hora_inicio) : null,
                horario: this.extrairHorario(atividade.data_hora_inicio) || '',
                titulo: atividade.titulo || atividade.nome || 'Sem título',
                roteiroId: atividade.roteiro_id || atividade.roteiroId || roteiroId
              };
            }) : []
          };
        })
      );
  }
  
  // Extrair horário de uma string de data e hora
  private extrairHorario(dataHora: string): string | null {
    if (!dataHora) return null;
    
    try {
      // Tenta extrair a parte do horário de uma string no formato YYYY-MM-DD HH:MM:SS
      const partes = dataHora.split(' ');
      if (partes.length >= 2) {
        const horarioParts = partes[1].split(':');
        if (horarioParts.length >= 2) {
          return `${horarioParts[0]}:${horarioParts[1]}`;
        }
      }
      return null;
    } catch (e) {
      console.error('Erro ao extrair horário:', e);
      return null;
    }
  }
} 