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
}; 