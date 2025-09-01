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
      const response = await api.post('/api/feriado/CadastrarFerias', ferias);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar todos os períodos de férias
  buscarFerias: async () => {
    try {
      const response = await api.get('/api/Ferias/ListarFerias');
      const data = response.data as ApiResponse;
      return data.listaFerias || [];
    } catch (error) {
      throw error;
    }
  },

  // Buscar férias por usuário específico
  buscarFeriasPorUsuario: async (idUsuario: number) => {
    try {
      const response = await api.get('/api/Ferias/ListarFerias', {
        params: { idUsuario }
      });
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

  //Solicitar férias
  solicitarFerias: async (ferias: Ferias) => {
    try {
      const response = await api.post('/api/Ferias/CadastrarSolicitacaoFerias', ferias);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar todas as solcitacoes de ferias
  buscarSolicitacoes: async () => {
    try {
      const response = await api.get('/api/Ferias/ListarSolicitacoesFerias');
      const data = response.data;
      return data.listarSolicitacoesFerias || [];
    } catch (error) {
      throw error;
    }
  },

  // Atualizar status da solicitação de férias
  atualizarStatusSolicitacao: async (idSolicitacao: number, indSituacao: number) => {
    try {
      const response = await api.post('/api/Ferias/AtualizaSolicitacaoFerias', null, {
        params: {
          idSolicitacao,
          indSituacao
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};