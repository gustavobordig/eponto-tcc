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
      const response = await api.post('/api/ferias/CadastrarFerias', ferias);
      return response.data;
    } catch (error) {
      throw error;
    }
},

  // Buscar todos os períodos de férias
  buscarFerias: async () => {
    try {
      const response = await api.get('/api/ferias/ListarFerias');
      const data = response.data as ApiResponse;
      return data.listaFerias || [];
    } catch (error) {
      throw error;
    }
  },

  // Excluir um período de férias
  excluirFerias: async (id: number) => {
    try {
      const response = await api.delete(`/api/ferias/DeletarFerias/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 