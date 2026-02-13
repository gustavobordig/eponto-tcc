import api from './api';
import { AxiosError } from 'axios';
import { tokenUtils } from '@/utils/token';

import { showSuccessToast } from '@/utils/toast';

interface LoginPayload {
  email: string;
  senha: string;
}

interface LoginResponse {
  sucesso: boolean;
  mensagem: string;
  perfisUsuario: Array<{
    idPerfil: number;
    dscPerfil: string;
  }>;
}

interface AutenticarPerfilPayload {
  email: string;
  senha: string;
  idPerfil: number;
}

interface AutenticarPerfilResponse {
  sucesso: boolean;
  mensagem: string;
  idUsuario: number;
  token: string;
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
      const response = await api.post<LoginResponse>('api/login/RealizarLogin', payload);
      
      if (response.data.sucesso) {
        // Salvar apenas os perfis, sem token ainda
        tokenUtils.setProfiles(response.data.perfisUsuario);
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao realizar login. Tente novamente mais tarde.');
    }
  },

  async autenticarPerfil(payload: AutenticarPerfilPayload): Promise<AutenticarPerfilResponse> {
    try {
      const response = await api.post<AutenticarPerfilResponse>('api/login/AutenticarPerfil', payload);
      
      if (response.data.sucesso) {
        tokenUtils.setToken(response.data.token);
        tokenUtils.setId(response.data.idUsuario.toString());
        
        // Buscar o role do perfil selecionado
        const profiles = tokenUtils.getProfiles();
        const selectedProfile = profiles?.find(profile => profile.idPerfil === payload.idPerfil);
        if (selectedProfile) {
          tokenUtils.setUserRole(selectedProfile.dscPerfil);
        }
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao autenticar perfil. Tente novamente mais tarde.');
    }
  },

  async alterarSenha(payload: AlterarSenhaPayload): Promise<void> {
    try {
      await api.post(`api/login/AlteraSenhaLogin`, payload);
      showSuccessToast('Senha alterada com sucesso');
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao alterar senha. Tente novamente mais tarde.');
    }
  },

  async validarCodigoRecuperacao(payload: ValidarCodigoPayload): Promise<void> {
    try {
      await api.post(`api/login/ValidaCodigoRecuperacao`, payload);
      showSuccessToast('Código validado com sucesso');
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao validar código de recuperação. Tente novamente mais tarde.');
    }
  },

  async recuperarSenha(payload: RecuperarSenhaPayload): Promise<void> {
    try {
      await api.post(`api/login/RecuperarSenha`, payload);
      showSuccessToast('Email de recuperação de senha enviado com sucesso');
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Erro ao solicitar recuperação de senha. Tente novamente mais tarde.');
    }
  }
}; 