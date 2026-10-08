import api from './api';
import { ApiResponse } from '@/types/api';

export interface FeedbackData {
  idFeedback: number;
  idUsuarioFeedback: number;
  idSolicitacaoFeedback: number;
  dataRealizacao: string;
  mensagemFeedback: string;
  avaliacao: number;
}

export type FeedbackInsertData = FeedbackData;

export interface SolicitacaoData {
  idSolicitacaoFeedback: number;
  idUsuarioSolicitacao: number;
  nomeUsuarioSolicitacao: string;
  idResponsavelFeedback: number;
  nomeResponsavelFeedback: string;
  /** 0 pendente, 1 respondida */
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
  // Feedbacks
  createFeedback: async (feedbackData: Omit<FeedbackInsertData, 'idFeedback'>) =>
    (await api.post<FeedbackResponse>('/api/Feedback/InserirFeedback', feedbackData)).data,

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

  // Marca a solicitação como respondida depois de inserir o feedback
  updateSolicitacaoStatus: async (id: number, status: number) =>
    (await api.put<SolicitacaoResponse>(`/api/Feedback/AtualizarSolicitacao/${id}`, { status })).data,
};
