import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { Gasto } from '../models/roteiro.model';

@Injectable({
  providedIn: 'root'
})
export class GastosService {
  private apiUrl = `${environment.apiUrl}/gastos`;

  constructor(private http: HttpClient) {}

  listarGastos(roteiroId: string | number): Observable<ApiResponse<Gasto[]>> {
    return this.http.get<ApiResponse<Gasto[]>>(`${this.apiUrl}/roteiro/${roteiroId}`);
  }

  obterGasto(id: number): Observable<ApiResponse<Gasto>> {
    return this.http.get<ApiResponse<Gasto>>(`${this.apiUrl}/${id}`);
  }

  adicionarGasto(gasto: Partial<Gasto>): Observable<ApiResponse<Gasto>> {
    return this.http.post<ApiResponse<Gasto>>(this.apiUrl, gasto);
  }

  atualizarGasto(gasto: Partial<Gasto>): Observable<ApiResponse<Gasto>> {
    if (!gasto.id) {
      throw new Error('ID do gasto é obrigatório para atualização');
    }
    return this.http.put<ApiResponse<Gasto>>(`${this.apiUrl}/${gasto.id}`, gasto);
  }

  removerGasto(id: string | number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  obterResumoGastos(roteiroId: number | string): Observable<ApiResponse<{ 
    total: number;
    porCategoria: {
      categoria: string;
      valor: number;
      percentual: number;
    }[];
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/roteiro/${roteiroId}/resumo`);
  }
} 