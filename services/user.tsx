import api from './api';

export interface UserData {
  idUsuario: number;
  nome: string;
  dataNascimento: string;
  senha: string;
  email: string;
  telefone: number;
  idCargo: number;
  idJornada: number;
  indAtivo: number;
  teste: string;
}

interface UserResponse {
  sucesso: boolean;
  mensagem: string | null;
  usuario: UserData | null;
  usuarios: UserData[] | null;
}

export const userService = {
  create: async (userData: UserData): Promise<UserResponse> => {
    try {
      const response = await api.post<UserResponse>('/api/Usuario/Inserir', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: number): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>(`/api/Usuario/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (userData: UserData): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>('/api/Usuario/Atualizar', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAll: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>('/api/Usuario/Listar');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/api/Usuario/Deletar/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 