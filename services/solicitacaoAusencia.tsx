import api from './api';

// Interfaces baseadas na documentação da API
export interface SolicitacaoAusencia {
  idSolicitacaoAusencia: number;
  idUsuario: number;
  mensagemSolicitacao: string;
  dataInicioAusencia: string;
  dataFimAusencia: string;
  linkArquivo?: string;
  statusSolicitacao: number;
  dataSolicitacao: string;
}

export interface SolicitacaoAusenciaInsert {
  idUsuario: number;
  mensagemSolicitacao?: string;
  dataInicioAusencia?: string;
  dataFimAusencia?: string;
  arquivo?: File;
  camposAtivos?: string[];
}

export interface SolicitacaoAusenciaResponse {
  sucesso: boolean;
  mensagem: string;
  solicitacao?: SolicitacaoAusencia;
  solicitacoes?: SolicitacaoAusencia[];
}

export const solicitacaoAusenciaService = {
  // Listar todas as solicitações de ausência
  listarSolicitacoes: async (): Promise<SolicitacaoAusenciaResponse> => {
    try {
      const response = await api.get<SolicitacaoAusenciaResponse>('/api/SolicitacaoAusencia/ListarSolicitacaoAusencia');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter solicitação por ID
  obterSolicitacaoPorId: async (id: number): Promise<SolicitacaoAusenciaResponse> => {
    try {
      const response = await api.get<SolicitacaoAusenciaResponse>(`/api/SolicitacaoAusencia/ListarSolicitacaoAusencia/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter solicitações por usuário
  obterSolicitacoesPorUsuario: async (idUsuario: number): Promise<SolicitacaoAusenciaResponse> => {
    try {
      const response = await api.get<SolicitacaoAusenciaResponse>(`/api/SolicitacaoAusencia/ListarSolicitacoesAusenciaUsuario/${idUsuario}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Inserir nova solicitação de ausência (com upload de arquivo)
  inserirSolicitacao: async (solicitacaoData: SolicitacaoAusenciaInsert): Promise<SolicitacaoAusenciaResponse> => {
    try {
      const formData = new FormData();
      
      formData.append('idUsuario', solicitacaoData.idUsuario.toString());
      
      if (solicitacaoData.mensagemSolicitacao) {
        formData.append('mensagemSolicitacao', solicitacaoData.mensagemSolicitacao);
      }
      
      if (solicitacaoData.dataInicioAusencia) {
        formData.append('dataInicioAusencia', solicitacaoData.dataInicioAusencia);
      }
      
      if (solicitacaoData.dataFimAusencia) {
        formData.append('dataFimAusencia', solicitacaoData.dataFimAusencia);
      }
      
      if (solicitacaoData.arquivo) {
        formData.append('arquivo', solicitacaoData.arquivo);
      }
      
      if (solicitacaoData.camposAtivos) {
        solicitacaoData.camposAtivos.forEach(campo => {
          formData.append('camposAtivos', campo);
        });
      }

      const response = await api.post<SolicitacaoAusenciaResponse>(
        '/api/SolicitacaoAusencia/InserirSolicitacaoAusencia',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar solicitação
  atualizarSolicitacao: async (id: number, solicitacaoData: Partial<SolicitacaoAusencia>): Promise<SolicitacaoAusenciaResponse> => {
    try {
      const response = await api.put<SolicitacaoAusenciaResponse>(`/api/SolicitacaoAusencia/AtualizarSolicitacao/${id}`, solicitacaoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Excluir solicitação
  excluirSolicitacao: async (id: number): Promise<SolicitacaoAusenciaResponse> => {
    try {
      const response = await api.delete<SolicitacaoAusenciaResponse>(`/api/SolicitacaoAusencia/Deletar/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Responder solicitação (aprovar/reprovar)
  responderSolicitacao: async (id: number, aprovar: boolean): Promise<SolicitacaoAusenciaResponse> => {
    try {
      const response = await api.put<SolicitacaoAusenciaResponse>(`/api/SolicitacaoAusencia/ResponderSolicitacao/${id}?aprovar=${aprovar}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
