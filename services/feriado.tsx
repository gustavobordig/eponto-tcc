import api from './api';

interface Feriado {
  idFeriado?: number;
  dscFeriado: string;
  datFeriado: string;
  indTipoFeriado: number;
}

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  listaFeriados: Feriado[];
}

export const feriadoService = {
  // Cadastrar um novo feriado
  cadastrarFeriado: async (feriado: Feriado) => {
    try {
      const response = await api.post('/api/feriado/CadastrarFeriado', feriado);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar todos os feriados
  buscarFeriados: async () => {
    try {
      const response = await api.get('/api/feriado/ListarFeriados');
      const data = response.data as ApiResponse;
      return data.listaFeriados || [];
    } catch (error) {
      throw error;
    }
  },

  // Excluir um feriado
  excluirFeriado: async (id: number) => {
    try {
      const response = await api.delete(`/api/feriado/DeletarFeriado/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 