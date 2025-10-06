import api from './api';
import { Ferias } from '@/types';

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  listaFerias: Ferias[];
}

export const feriasService = {
  // Cadastrar um novo período de férias
  cadastrarFerias: async (ferias: Ferias) => {
    try {
      const response = await api.post('/api/Ferias/CadastrarFerias', ferias);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar todos os períodos de férias
  buscarFerias: async (idUsuario?: number) => {
    try {
      let url = '/api/Ferias/ListarFerias';
      if (idUsuario) {
        url += `?idUsuario=${idUsuario}`;
      }
      const response = await api.get(url);
      const data = response.data as ApiResponse;
      return data.listaFerias || [];
    } catch (error) {
      throw error;
    }
  },

  // Excluir um período de férias
  excluirFerias: async (id: number) => {
    try {
      const response = await api.delete(`/api/Ferias/DeletarFerias/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cadastrar solicitação de férias
  cadastrarSolicitacaoFerias: async (solicitacao: any) => {
    try {
      const response = await api.post('/api/Ferias/CadastrarSolicitacaoFerias', solicitacao);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar solicitações de férias
  listarSolicitacoesFerias: async (idUsuario?: number) => {
    try {
      let url = '/api/Ferias/ListarSolicitacoesFerias';
      if (idUsuario) {
        url += `?idUsuario=${idUsuario}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Retornar saldo de férias
  retornarSaldoFerias: async (idUsuario?: number) => {
    try {
      let url = '/api/Ferias/RetornaSaldoFerias';
      if (idUsuario) {
        url += `?idUsuario=${idUsuario}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar solicitação de férias
  atualizarSolicitacaoFerias: async (idSolicitacao?: number, indSituacao?: number) => {
    try {
      let url = '/api/Ferias/AtualizaSolicitacaoFerias';
      const params = new URLSearchParams();
      
      if (idSolicitacao) {
        params.append('idSolicitacao', idSolicitacao.toString());
      }
      
      if (indSituacao !== undefined) {
        params.append('indSituacao', indSituacao.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.post(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 