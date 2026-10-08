import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';
import { tokenUtils } from '@/shared/lib/token';
import { perfilFromToken } from '@/shared/lib/session';

interface Credenciais {
  email: string;
  senha: string;
}

export interface PerfilUsuario {
  idPerfil: number;
  dscPerfil: string;
}

/** 1ª etapa: confere e-mail e senha e devolve os perfis do usuário (sem token). */
export type LoginResponse = ApiResponse<{ perfisUsuario: PerfilUsuario[] | null }>;

/** 2ª etapa: entra com um dos perfis; o JWT traz a role (Admin ou User). */
export type AutenticarResponse = ApiResponse<{ idUsuario: number; token: string }>;

interface ValidarCodigoPayload {
  email: string;
  codigo: string;
}

export const authService = {
  async realizarLogin(credenciais: Credenciais) {
    const { data } = await api.post<LoginResponse>('api/login/RealizarLogin', credenciais);
    return data.perfisUsuario ?? [];
  },

  async autenticarPerfil(credenciais: Credenciais, idPerfil: number) {
    const { data } = await api.post<AutenticarResponse>('api/login/AutenticarPerfil', {
      ...credenciais,
      idPerfil,
    });
    if (!data.token) {
      throw new Error(data.mensagem || 'A API não devolveu o token de acesso.');
    }
    tokenUtils.setSession({
      token: data.token,
      id: data.idUsuario.toString(),
      perfil: perfilFromToken(data.token) ?? 'funcionario',
    });
    return data;
  },

  async alterarSenha(payload: Credenciais) {
    await api.post<ApiResponse>('api/login/AlteraSenhaLogin', payload);
  },

  async validarCodigoRecuperacao(payload: ValidarCodigoPayload) {
    await api.post<ApiResponse>('api/login/ValidaCodigoRecuperacao', payload);
  },

  async recuperarSenha(payload: { email: string }) {
    await api.post<ApiResponse>('api/login/RecuperarSenha', payload);
  },
};
