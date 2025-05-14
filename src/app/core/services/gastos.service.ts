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

  listarGastos(roteiroId: number): Observable<ApiResponse<Gasto[]>> {
    return this.http.get<ApiResponse<Gasto[]>>(`${this.apiUrl}/roteiro/${roteiroId}`);
  }

  obterGasto(id: number): Observable<ApiResponse<Gasto>> {
    return this.http.get<ApiResponse<Gasto>>(`${this.apiUrl}/${id}`);
  }

  criarGasto(gasto: Partial<Gasto>): Observable<ApiResponse<Gasto>> {
    return this.http.post<ApiResponse<Gasto>>(this.apiUrl, gasto);
  }

  atualizarGasto(id: number, gasto: Partial<Gasto>): Observable<ApiResponse<Gasto>> {
    return this.http.put<ApiResponse<Gasto>>(`${this.apiUrl}/${id}`, gasto);
  }

  excluirGasto(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  obterResumoGastos(roteiroId: number): Observable<ApiResponse<{ 
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