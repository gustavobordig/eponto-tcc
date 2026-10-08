import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

export interface FeedbackData {
  idFeedback: number;
  /** Quem recebe o feedback */
  idUsuarioFeedback: number;
  /** Quem escreveu (o admin que respondeu) */
  idAutorFeedback: number;
  nomeUsuarioFeedback?: string | null;
  nomeAutorFeedback?: string | null;
  idSolicitacaoFeedback: number | null;
  dataRealizacao: string;
  mensagemFeedback: string;
  /** FeedbackAvaliacao: 0 Péssimo … 4 Excelente (ver avaliacao.ts) */
  avaliacao: number;
}

export type NovoFeedback = Omit<FeedbackData, 'idFeedback' | 'nomeUsuarioFeedback' | 'nomeAutorFeedback'>;

export interface SolicitacaoData {
  idSolicitacaoFeedback: number;
  idUsuarioSolicitacao: number;
  nomeUsuarioSolicitacao: string;
  idResponsavelFeedback: number;
  nomeResponsavelFeedback: string;
  /** 0 pendente, 1 respondida (o enum StatusFeedback da API tem os nomes trocados; vale o banco) */
  status: number;
  dataSolicitacao: string;
  mensagemSolicitacao: string;
}

export type FeedbackResponse = ApiResponse<{
  feedback?: FeedbackData | null;
  feedbacks?: FeedbackData[] | null;
}>;

export type SolicitacaoResponse = ApiResponse<{
  solicitacao?: SolicitacaoData | null;
  solicitacoes?: SolicitacaoData[] | null;
  solicitacoesFeedback?: SolicitacaoData[] | null;
}>;

export const feedbackService = {
  // Feedbacks. Ao gravar com idSolicitacaoFeedback, a API já marca a solicitação como respondida.
  createFeedback: async (feedback: NovoFeedback) =>
    (await api.post<FeedbackResponse>('/api/Feedback/InserirFeedback', feedback)).data,

  getAllFeedbacks: async () =>
    (await api.get<FeedbackResponse>('/api/Feedback/ListarFeedback')).data,

  // Solicitações de feedback
  createSolicitacao: async (
    solicitacaoData: Omit<SolicitacaoData, 'idSolicitacaoFeedback' | 'dataSolicitacao'>
  ) => (await api.post<SolicitacaoResponse>('/api/Feedback/InserirSolicitacao', solicitacaoData)).data,

  getAllSolicitacoes: async () =>
    (await api.get<SolicitacaoResponse>('/api/Feedback/ListarSolicitacao')).data,

  getSolicitacoesByUsuario: async (idUsuario: number) =>
    (await api.get<SolicitacaoResponse>(`/api/Feedback/ListarSolicitacoesUsuario/${idUsuario}`)).data,
};
