import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

export interface Ferias {
  idFerias?: number;
  dscObservacao?: string;
  dscFerias?: string;
  datInicioFerias?: string;
  // A API usa esse nome (com o erro de digitação) no cadastro e na listagem
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
  /** Comentário de quem aprovou ou reprovou */
  observacaoResposta?: string | null;
}

export interface SaldoFerias {
  idUsuario: number;
  qtdSaldo: number;
  nomeUsuario: string;
}

type SaldoFeriasResponse = ApiResponse<{ listaSaldoFerias?: SaldoFerias[] | null }>;

type FeriasResponse = ApiResponse<{ listaFerias?: Ferias[] | null }>;
type SolicitacoesFeriasResponse = ApiResponse<{ listarSolicitacoesFerias?: SolicitacaoFerias[] | null }>;

export const feriasService = {
  // Antes ia para /api/feriado/CadastrarFerias, que não existe na API
  cadastrarFerias: async (ferias: Ferias) =>
    (await api.post<ApiResponse>('/api/Ferias/CadastrarFerias', ferias)).data,

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

  /** Dias de férias disponíveis do usuário (null se não houver saldo cadastrado) */
  saldo: async (idUsuario: number) => {
    const { data } = await api.get<SaldoFeriasResponse>('/api/Ferias/RetornaSaldoFerias', { params: { idUsuario } });
    return data.listaSaldoFerias?.[0]?.qtdSaldo ?? null;
  },

  buscarSolicitacoesPorUsuario: async (idUsuario: number) => {
    const { data } = await api.get<SolicitacoesFeriasResponse>('/api/Ferias/ListarSolicitacoesFerias', { params: { idUsuario } });
    return data.listarSolicitacoesFerias || [];
  },

  buscarSolicitacoes: async () => {
    const { data } = await api.get<SolicitacoesFeriasResponse>('/api/Ferias/ListarSolicitacoesFerias');
    return data.listarSolicitacoesFerias || [];
  },

  atualizarStatusSolicitacao: async (idSolicitacao: number, indSituacao: number, comentario?: string) =>
    (await api.post<ApiResponse>('/api/Ferias/AtualizaSolicitacaoFerias', null, {
      params: { idSolicitacao, indSituacao, ...(comentario ? { comentario } : {}) },
    })).data,
};
