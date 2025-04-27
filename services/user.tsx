import api from './api';

interface UserData {
  nome: string;
  data_Nascimento: string;
  senha: string;
  email: string;
  telefone: number;
  id_Cargo: number;
  id_Jornada: number;
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
}; 