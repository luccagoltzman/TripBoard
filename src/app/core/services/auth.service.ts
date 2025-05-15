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
    return this.http.post<any>(`${this.apiUrl}/login`, credenciais)
      .pipe(
        map(response => {
          // Adaptar a resposta do Laravel para o formato esperado pelo front
          let adaptedResponse: ApiResponse<UsuarioResponse>;

          // Verifica se a resposta já está no formato esperado
          if (response.hasOwnProperty('success')) {
            adaptedResponse = response;
          } else {
            // Adapta a resposta do Laravel
            adaptedResponse = {
              success: true,
              message: 'Login realizado com sucesso',
              data: {
                token: response.access_token || '',
                usuario: response.user || null
              }
            };
          }
          
          console.log('Resposta adaptada:', adaptedResponse);
          
          if (adaptedResponse.success && adaptedResponse.data) {
            this.armazenarSessao(adaptedResponse.data);
          }
          
          return adaptedResponse;
        })
      );
  }

  registrar(dados: UsuarioRegistro): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.post<any>(`${this.apiUrl}/registrar`, dados)
      .pipe(
        map(response => {
          // Adaptar a resposta do Laravel para o formato esperado pelo front
          let adaptedResponse: ApiResponse<UsuarioResponse>;

          // Verifica se a resposta já está no formato esperado
          if (response.hasOwnProperty('success')) {
            adaptedResponse = response;
          } else {
            // Adapta a resposta do Laravel
            adaptedResponse = {
              success: true,
              message: 'Registro realizado com sucesso',
              data: {
                token: response.access_token || '',
                usuario: response.user || null
              }
            };
          }
          
          console.log('Resposta adaptada (registro):', adaptedResponse);
          
          if (adaptedResponse.success && adaptedResponse.data) {
            this.armazenarSessao(adaptedResponse.data);
          }
          
          return adaptedResponse;
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
    return this.http.post<ApiResponse<Usuario>>(`${this.apiUrl}/perfil`, dadosUsuario).pipe(
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

  private armazenarSessao(dados: any): void {
    console.log('Armazenando sessão:', dados);
    
    if (!dados) {
      console.error('Dados da sessão inválidos');
      return;
    }
    
    // Adapta a estrutura de resposta do Laravel para o formato esperado pelo frontend
    let token = '';
    let usuario = null;
    
    // Verifica o formato da resposta e adapta
    if (dados.access_token) {
      // Formato do Laravel Sanctum
      token = dados.access_token;
      usuario = dados.user || null;
    } else if (dados.token) {
      // Formato esperado pelo frontend
      token = dados.token;
      usuario = dados.usuario || null;
    }
    
    console.log('Token processado:', token);
    console.log('Usuário processado:', usuario);
    
    // Armazena o token
    if (token) {
      // Limpar qualquer token antigo
      localStorage.removeItem('auth_token');
      // Armazenar o novo token
      localStorage.setItem('auth_token', token);
      console.log('Token armazenado com sucesso:', token);
    } else {
      console.warn('Token ausente nos dados de resposta');
    }
    
    // Armazena os dados do usuário
    if (usuario && typeof usuario === 'object') {
      // Limpar dados antigos
      localStorage.removeItem('usuario');
      
      const usuarioJson = JSON.stringify(usuario);
      console.log('Armazenando usuário:', usuarioJson);
      localStorage.setItem('usuario', usuarioJson);
      this.usuarioSubject.next(usuario);
    } else {
      console.error('Dados de usuário inválidos na resposta:', usuario);
    }
  }

  // Verificar se o token expirou (executar periodicamente)
  verificarTokenExpirado(): boolean {
    const token = localStorage.getItem('auth_token');
    
    if (!token || token === 'undefined' || token === 'null') {
      console.warn('Token ausente ou inválido');
      this.logout();
      return true;
    }
    
    // Tentar decodificar o token (JWT)
    try {
      // Esta é uma verificação simples baseada na estrutura JWT
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Formato de token inválido');
        return true;
      }
      
      // Decodificar a parte de payload do token
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Verificar se tem expiração
      if (payload.exp) {
        const expiracaoMs = payload.exp * 1000; // Converter para milissegundos
        const agora = new Date().getTime();
        
        if (agora >= expiracaoMs) {
          console.warn('Token expirado');
          this.logout();
          return true;
        }
      }
      
      return false;
    } catch (e) {
      console.error('Erro ao verificar token:', e);
      return false;
    }
  }

  private getUsuarioArmazenado(): Usuario | null {
    const usuarioJson = localStorage.getItem('usuario');
    
    if (!usuarioJson || usuarioJson === 'undefined' || usuarioJson === 'null') {
      return null;
    }
    
    try {
      const usuario = JSON.parse(usuarioJson);
      if (usuario && typeof usuario === 'object') {
        return usuario;
      } else {
        localStorage.removeItem('usuario');
        return null;
      }
    } catch (error) {
      console.error('Erro ao fazer parse do JSON do usuário armazenado', error);
      localStorage.removeItem('usuario');
      return null;
    }
  }
} 