import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { Usuario, UsuarioLogin, UsuarioRegistro, UsuarioResponse, AlterarSenha } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getUsuarioArmazenado());
  public usuario$ = this.usuarioSubject.asObservable();
  public isAutenticado$ = this.usuario$.pipe(
    map(usuario => !!usuario)
  );

  constructor(private http: HttpClient) {}

  login(credenciais: UsuarioLogin): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.post<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/login`, credenciais)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.armazenarSessao(response.data);
          }
        })
      );
  }

  registrar(dados: UsuarioRegistro): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.post<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/registrar`, dados)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.armazenarSessao(response.data);
          }
        })
      );
  }

  recuperarSenha(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/recuperar-senha`, { email });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }

  verificarToken(): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/verificar`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.usuarioSubject.next(response.data);
        } else {
          this.logout();
        }
      })
    );
  }

  atualizarPerfil(dadosUsuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/perfil`, dadosUsuario).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.atualizarUsuario(response.data);
        }
      })
    );
  }

  alterarSenha(dados: AlterarSenha): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/alterar-senha`, dados);
  }

  atualizarUsuario(novosDados: Usuario): void {
    this.usuarioSubject.next(novosDados);
    localStorage.setItem('usuario', JSON.stringify(novosDados));
  }

  private armazenarSessao(dados: UsuarioResponse): void {
    localStorage.setItem('auth_token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));
    this.usuarioSubject.next(dados.usuario);
  }

  private getUsuarioArmazenado(): Usuario | null {
    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      try {
        return JSON.parse(usuarioJson);
      } catch (error) {
        console.error('Erro ao fazer parse do JSON do usuário armazenado', error);
        return null;
      }
    }
    return null;
  }
} 