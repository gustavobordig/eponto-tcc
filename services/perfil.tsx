import api from './api';

export interface Perfil {
  idPerfil: number;
  nomePerfil: string;
  descricaoPerfil: string;
  indAtivo: number;
}

export interface PerfilInsert {
  nomePerfil: string;
  descricaoPerfil: string;
  indAtivo: number;
}

export interface VinculoPerfilUsuario {
  idPerfil: number;
  idUsuario: number;
}

interface PerfilResponse {
  sucesso: boolean;
  mensagem: string | null;
  perfil?: Perfil;
  perfis?: Perfil[];
}

interface ResultadoResponse {
  sucesso: boolean;
  mensagem: string | null;
}

export const perfilService = {
  // Cadastrar novo perfil
  cadastrarPerfil: async (perfil: PerfilInsert): Promise<ResultadoResponse> => {
    try {
      const response = await api.post<ResultadoResponse>('/api/Perfil/CadastrarPerfil', perfil);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar todos os perfis
  listarPerfis: async (): Promise<PerfilResponse> => {
    try {
      const response = await api.get<PerfilResponse>('/api/Perfil/ListarPerfis');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar perfil por ID
  listarPerfilPorId: async (idPerfil: number): Promise<PerfilResponse> => {
    try {
      const response = await api.get<PerfilResponse>(`/api/Perfil/ListarPerfil?idPerfil=${idPerfil}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Editar perfil
  editarPerfil: async (perfil: Perfil): Promise<ResultadoResponse> => {
    try {
      const response = await api.put<ResultadoResponse>('/api/Perfil/EditarPerfil', perfil);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remover perfil
  removerPerfil: async (idPerfil: number): Promise<ResultadoResponse> => {
    try {
      const response = await api.delete<ResultadoResponse>(`/api/Perfil/RemoverPerfil/${idPerfil}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cadastrar vínculo perfil-usuário
  cadastrarVinculoPerfilUsuario: async (vinculo: VinculoPerfilUsuario): Promise<ResultadoResponse> => {
    try {
      const response = await api.post<ResultadoResponse>('/api/Perfil/CadastrarVinculoPerfilUsuario', vinculo);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
