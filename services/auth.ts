import api from './api';
import { ApiResponse } from '@/types/api';
import { tokenUtils } from '@/utils/token';
import { isAdminEmail, normalizePerfil, Perfil, perfilFromToken } from '@/lib/session';

interface LoginPayload {
  email: string;
  senha: string;
}

export type LoginResponse = ApiResponse<{
  token: string;
  idUsuario: number;
  /** Ainda não existe na API; ver docs/arquitetura.md (fase 3) */
  perfil?: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}>;

interface AlterarSenhaPayload {
  email: string;
  senha: string;
}

interface ValidarCodigoPayload {
  email: string;
  codigo: string;
}

interface RecuperarSenhaPayload {
  email: string;
}

// Ordem: campo do login, claim do JWT e, por enquanto, a lista de e-mails do .env
function resolverPerfil(data: LoginResponse, email: string): Perfil {
  return (
    normalizePerfil(data.perfil) ??
    perfilFromToken(data.token) ??
    (isAdminEmail(email) ? 'admin' : 'funcionario')
  );
}

export const authService = {
  async realizarLogin(payload: LoginPayload) {
    const { data } = await api.post<LoginResponse>('api/login/realizarLogin', payload);
    if (data.token) {
      tokenUtils.setSession({
        token: data.token,
        id: data.idUsuario.toString(),
        perfil: resolverPerfil(data, payload.email),
      });
    }
    return data;
  },

  async alterarSenha(payload: AlterarSenhaPayload) {
    await api.post<ApiResponse>('api/login/AlteraSenhaLogin', payload);
  },

  async validarCodigoRecuperacao(payload: ValidarCodigoPayload) {
    await api.post<ApiResponse>('api/login/ValidaCodigoRecuperacao', payload);
  },

  async recuperarSenha(payload: RecuperarSenhaPayload) {
    await api.post<ApiResponse>('api/login/RecuperarSenha', payload);
  },
};
