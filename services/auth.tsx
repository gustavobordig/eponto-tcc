import api from './api';
import { AxiosError } from 'axios';
import { tokenUtils } from '@/utils/token';

interface LoginPayload {
  email: string;
  senha: string;
}

interface LoginResponse {
  token: string;
  idUsuario: number;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}

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
  async realizarLogin(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('api/login/realizarLogin', payload);
      
      if (response.data.token) {
        tokenUtils.setToken(response.data.token);
        tokenUtils.setId(response.data.idUsuario.toString());
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao realizar login. Tente novamente mais tarde.');
    }
  },

  async alterarSenha(payload: AlterarSenhaPayload): Promise<void> {
    try {
      await api.get(`api/login/AlteraSenhaLogin`, {
        params: {
          senha: payload.senha,
          email: payload.email
        }
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao alterar senha. Tente novamente mais tarde.');
    }
  },

  async validarCodigoRecuperacao(payload: ValidarCodigoPayload): Promise<void> {
    try {
      await api.get(`api/login/ValidaCodigoRecuperacao`, {
        params: {
          codigo: payload.codigo,
          email: payload.email
        }
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao validar código de recuperação. Tente novamente mais tarde.');
    }
  },

  async recuperarSenha(payload: RecuperarSenhaPayload): Promise<void> {
    try {
      await api.get(`api/login/RecuperarSenha`, {
        params: {
          email: payload.email
        }
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao solicitar recuperação de senha. Tente novamente mais tarde.');
    }
  }
}; 