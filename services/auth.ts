import api from './api';
import { ApiResponse } from '@/types/api';
import { tokenUtils } from '@/utils/token';

interface LoginPayload {
  email: string;
  senha: string;
}

export type LoginResponse = ApiResponse<{
  token: string;
  idUsuario: number;
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

export const authService = {
  async realizarLogin(payload: LoginPayload) {
    const { data } = await api.post<LoginResponse>('api/login/realizarLogin', payload);
    if (data.token) {
      tokenUtils.setToken(data.token);
      tokenUtils.setId(data.idUsuario.toString());
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
