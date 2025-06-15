import api from './api';

interface JornadaTrabalho {
  nomeJornada: string;
  qtdHorasDiarias: number;
}

export const jornadaTrabalhoService = {
  // Inserir nova jornada de trabalho
  inserir: async (jornada: JornadaTrabalho) => {
    try {
      const response = await api.post('/api/JornadaTrabalho/Inserir', jornada);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar jornada por ID
  buscarPorId: async (id: number) => {
    try {
      const response = await api.get(`/api/JornadaTrabalho/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar todas as jornadas
  listar: async () => {
    try {
      const response = await api.get('/api/JornadaTrabalho/Listar');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar jornada existente
  atualizar: async (id: number, jornada: JornadaTrabalho) => {
    try {
      const response = await api.put(`/api/JornadaTrabalho/Atualizar/${id}`, jornada);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Deletar jornada
  deletar: async (id: number) => {
    try {
      const response = await api.put(`/api/JornadaTrabalho/Deletar/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 