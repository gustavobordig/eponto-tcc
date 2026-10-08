import api from './api';
import { ApiResponse } from '@/types/api';

export interface Ferias {
  idFerias?: number;
  dscObservacao?: string;
  dscFerias?: string;
  datInicioFerias?: string;
  // A listagem por usuário devolve o campo com esse nome
  datIncioFerias?: string;
  datFimFerias: string;
  idUsuario?: number | null;
}

export interface SolicitacaoFerias {
  idSolicFerias: number;
  idUsuario: number;
  nomeUsuario: string;
  dscObservacao: string;
  datInicioFerias: string;
  datFimFerias: string;
  datSolicitacaoFerias: string;
  /** 0 pendente, 1 aprovada, 2 reprovada */
  indSituacao: number;
}

type FeriasResponse = ApiResponse<{ listaFerias?: Ferias[] | null }>;
type SolicitacoesFeriasResponse = ApiResponse<{ listarSolicitacoesFerias?: SolicitacaoFerias[] | null }>;

export const feriasService = {
  cadastrarFerias: async (ferias: Ferias) =>
    (await api.post<ApiResponse>('/api/feriado/CadastrarFerias', ferias)).data,

  buscarFerias: async () => {
    const { data } = await api.get<FeriasResponse>('/api/Ferias/ListarFerias');
    return data.listaFerias || [];
  },

  buscarFeriasPorUsuario: async (idUsuario: number) => {
    const { data } = await api.get<FeriasResponse>('/api/Ferias/ListarFerias', { params: { idUsuario } });
    return data.listaFerias || [];
  },

  excluirFerias: async (id: number) =>
    (await api.delete<ApiResponse>(`/api/Ferias/DeletarFerias/${id}`)).data,

  solicitarFerias: async (ferias: Ferias) =>
    (await api.post<ApiResponse>('/api/Ferias/CadastrarSolicitacaoFerias', ferias)).data,

  buscarSolicitacoes: async () => {
    const { data } = await api.get<SolicitacoesFeriasResponse>('/api/Ferias/ListarSolicitacoesFerias');
    return data.listarSolicitacoesFerias || [];
  },

  atualizarStatusSolicitacao: async (idSolicitacao: number, indSituacao: number) =>
    (await api.post<ApiResponse>('/api/Ferias/AtualizaSolicitacaoFerias', null, {
      params: { idSolicitacao, indSituacao },
    })).data,
};
