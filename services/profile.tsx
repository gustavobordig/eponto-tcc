import api from './api';

export interface ProfileData {
  idPerfil: number;
  dscPerfil: string;
  indAcessoAdmin: number;
  indPermiteCadastrar: number;
  indPermiteEditar: number;
  indPermiteDeletar: number;
  indPermiteRegularSolicitacoes: number;
}

export interface ProfileUserLink {
  idUsuario: number;
  ListaIdPerfis: number[];
}

interface ProfileResponse {
  sucesso: boolean;
  mensagem: string;
  perfil?: ProfileData | null;
  perfis?: ProfileData[] | null;
  listaPerfis?: ProfileData[] | null;
}

export const profileService = {
  create: async (profileData: Omit<ProfileData, 'idPerfil'>): Promise<ProfileResponse> => {
    try {
      const response = await api.post<ProfileResponse>('/api/Perfil/CadastrarPerfil', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAll: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get<ProfileResponse>('/api/Perfil/ListarPerfis');
      // Mapear listaPerfis para perfis para manter compatibilidade
      const data = response.data;
      if (data.listaPerfis) {
        data.perfis = data.listaPerfis;
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (idPerfil: number): Promise<ProfileResponse> => {
    try {
      const response = await api.get<ProfileResponse>(`/api/Perfil/ListarPerfil?idPerfil=${idPerfil}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (profileData: ProfileData): Promise<ProfileResponse> => {
    try {
      const response = await api.put<ProfileResponse>('/api/Perfil/EditarPerfil', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (idPerfil: number): Promise<ProfileResponse> => {
    try {
      const response = await api.delete<ProfileResponse>(`/api/Perfil/RemoverPerfil/${idPerfil}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  linkUserToProfile: async (linkData: { idUsuario: number; idPerfil: number }): Promise<ProfileResponse> => {
    try {
      const payload = {
        idUsuario: linkData.idUsuario,
        ListaIdPerfis: [linkData.idPerfil]
      };
      const response = await api.post<ProfileResponse>('/api/Perfil/CadastrarVinculoPerfilUsuario', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
