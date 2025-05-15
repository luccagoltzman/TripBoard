import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiPaginatedResponse, ApiResponse } from '../models/api-response.model';
import { Roteiro, DiaRoteiro, Comentario, Sugestao } from '../models/roteiro.model';
import { Atividade } from '../models/atividade.model';

@Injectable({
  providedIn: 'root'
})
export class RoteiroService {
  private apiUrl = `${environment.apiUrl}/roteiros`;

  constructor(private http: HttpClient) {}

  listarRoteiros(pagina: number = 1, tamanhoPagina: number = 10): Observable<ApiPaginatedResponse<Roteiro>> {
    const params = new HttpParams()
      .set('page', pagina.toString())
      .set('pageSize', tamanhoPagina.toString());
    
    return this.http.get<ApiPaginatedResponse<Roteiro>>(this.apiUrl, { params });
  }

  obterRoteiro(id: number | string): Observable<ApiResponse<Roteiro>> {
    return this.http.get<ApiResponse<Roteiro>>(`${this.apiUrl}/${id}`);
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
    return this.http.post<ApiResponse<Atividade>>(`${this.apiUrl}/${atividade.roteiroId}/atividades`, atividade);
  }

  atualizarAtividade(atividade: Partial<Atividade>): Observable<ApiResponse<Atividade>> {
    if (!atividade.roteiroId || !atividade.id) {
      throw new Error('roteiroId e id são obrigatórios para atualizar uma atividade');
    }
    return this.http.put<ApiResponse<Atividade>>(
      `${this.apiUrl}/${atividade.roteiroId}/atividades/${atividade.id}`, 
      atividade
    );
  }

  removerAtividade(id: number | string): Observable<ApiResponse<boolean>> {
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
} 