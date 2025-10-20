import api from './api';

export interface FeedbackData {
  idFeedback: number;
  idUsuarioFeedback: number;
  idSolicitacaoFeedback: number;
  dataRealizacao: string;
  mensagemFeedback: string;
  avaliacao: number;
}

export interface SolicitacaoData {
  idSolicitacaoFeedback: number;
  idUsuarioSolicitacao: number;
  nomeUsuarioSolicitacao: string;
  idResponsavelFeedback: number;
  nomeResponsavelFeedback: string;
  status: number;
  dataSolicitacao: string;
  mensagemSolicitacao: string;
}

export interface FeedbackInsertData {
  idFeedback: number;
  idUsuarioFeedback: number;
  idAutorFeedback: number;
  idSolicitacaoFeedback?: number;
  mensagemFeedback: string;
  avaliacao: number;
}

interface FeedbackResponse {
  sucesso: boolean;
  mensagem: string | null;
  feedback: FeedbackData | null;
  feedbacks: FeedbackData[] | null;
}

interface SolicitacaoResponse {
  sucesso: boolean;
  mensagem: string | null;
  solicitacao: SolicitacaoData | null;
  solicitacoes: SolicitacaoData[] | null;
  solicitacoesFeedback: SolicitacaoData[] | null;
  feedback: SolicitacaoData | null;
  feedbacks: SolicitacaoData[] | null;
}

export const feedbackService = {
  // ===== OPERAÇÕES DE FEEDBACK =====
  
  createFeedback: async (feedbackData: Omit<FeedbackInsertData, 'idFeedback'>): Promise<FeedbackResponse> => {
    try {
      const response = await api.post<FeedbackResponse>('/api/Feedback/InserirFeedback', feedbackData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllFeedbacks: async (): Promise<FeedbackResponse> => {
    try {
      const response = await api.get<FeedbackResponse>('/api/Feedback/ListarFeedback');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFeedbackById: async (id: number): Promise<FeedbackResponse> => {
    try {
      const response = await api.get<FeedbackResponse>(`/api/Feedback/ListarFeedback/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteFeedback: async (id: number): Promise<FeedbackResponse> => {
    try {
      const response = await api.delete<FeedbackResponse>(`/api/Feedback/Deletar/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== OPERAÇÕES DE SOLICITAÇÃO =====
  
  createSolicitacao: async (solicitacaoData: Omit<SolicitacaoData, 'idSolicitacaoFeedback' | 'dataSolicitacao'>): Promise<SolicitacaoResponse> => {
    try {
      const response = await api.post<SolicitacaoResponse>('/api/Feedback/InserirSolicitacao', solicitacaoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllSolicitacoes: async (): Promise<SolicitacaoResponse> => {
    try {
      const response = await api.get<SolicitacaoResponse>('/api/Feedback/ListarSolicitacao');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSolicitacaoById: async (id: number): Promise<SolicitacaoResponse> => {
    try {
      const response = await api.get<SolicitacaoResponse>(`/api/Feedback/ListarSolicitacao/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSolicitacao: async (id: number, solicitacaoData: Partial<SolicitacaoData>): Promise<SolicitacaoResponse> => {
    try {
      const response = await api.put<SolicitacaoResponse>(`/api/Feedback/AtualizarSolicitacao/${id}`, solicitacaoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSolicitacoesByUsuario: async (idUsuario: number): Promise<SolicitacaoResponse> => {
    try {
      const response = await api.get<SolicitacaoResponse>(`/api/Feedback/ListarSolicitacoesUsuario/${idUsuario}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Método para atualizar status da solicitação para "Respondido" após inserir feedback
  updateSolicitacaoStatus: async (id: number, status: number): Promise<SolicitacaoResponse> => {
    try {
      const response = await api.put<SolicitacaoResponse>(`/api/Feedback/AtualizarSolicitacao/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 