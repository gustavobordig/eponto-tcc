import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

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
  fotoPerfil?: string;
  /** Chefe direto (hierarquia) */
  idChefe?: number | null;
}

/** Pessoa na lista de quem pode receber um pedido de feedback */
export interface PessoaResumo {
  idUsuario: number;
  nome: string;
  idChefe?: number | null;
}

/** /api/Usuario/Contrato/{id}: dados do contrato, liberado para o próprio funcionário */
export interface ContratoUsuario {
  idUsuario: number;
  nome: string;
  indAtivo: number;
  dataCadastro: string;
  dataNascimento: string;
  email: string;
  telefone: number;
  fotoPerfil?: string | null;
  nomeCargo: string;
  salario: number;
  qtdHorasDiarias: number;
}

export type ContratoResponse = ApiResponse<{ contrato: ContratoUsuario | null }>;

export type UserResponse = ApiResponse<{
  usuario: UserData | null;
  usuarios: UserData[] | null;
}>;

export const userService = {
  create: async (userData: UserData) =>
    (await api.post<UserResponse>('/api/Usuario/Inserir', userData)).data,

  getById: async (id: number) => (await api.get<UserResponse>(`/api/Usuario/${id}`)).data,

  /** Todas as pessoas (id, nome e chefe), liberado para qualquer usuário logado */
  pessoas: async () =>
    (await api.get<ApiResponse<{ usuarios: PessoaResumo[] | null }>>('/api/Usuario/Hierarquia')).data.usuarios ?? [],

  update: async (userData: UserData) =>
    (await api.put<UserResponse>(`/api/Usuario/Atualizar/${userData.idUsuario}`, userData)).data,

  getContrato: async (id: number) => (await api.get<ContratoResponse>(`/api/Usuario/Contrato/${id}`)).data,

  getAll: async () => (await api.get<UserResponse>('/api/Usuario/Listar')).data,

  delete: async (userId: number) =>
    (await api.put<UserResponse>(`/api/Usuario/Deletar/${userId}`)).data,
};
