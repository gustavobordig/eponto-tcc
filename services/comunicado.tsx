import api from './api';

export interface Comunicado {
  idComunicado: number;
  titulo: string;
  mensagem: string;
  dataComunicado: string;
  idUsuario: number;
  indAtivo: number;
}

export interface ComunicadoInsert {
  titulo: string;
  mensagem: string;
  idUsuario: number;
}

interface ComunicadoResponse {
  sucesso: boolean;
  mensagem: string | null;
  comunicado?: Comunicado;
  listaComunicados?: Comunicado[];
}

export const comunicadoService = {
  // Cadastrar novo comunicado
  cadastrarComunicado: async (comunicado: ComunicadoInsert): Promise<ComunicadoResponse> => {
    try {
      const response = await api.post<ComunicadoResponse>('/api/Comunicado/CadastrarComunicado', comunicado);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Deletar comunicado
  deletarComunicado: async (idComunicado: number): Promise<ComunicadoResponse> => {
    try {
      const response = await api.delete<ComunicadoResponse>(`/api/Comunicado/DeletarComunicado?idComunicado=${idComunicado}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar todos os comunicados
  listarComunicados: async (): Promise<ComunicadoResponse> => {
    try {
      const response = await api.get<ComunicadoResponse>('/api/Comunicado/ListarComunicados');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
