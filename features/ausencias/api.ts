import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

export interface SolicitacaoAusencia {
  idSolicitacaoAusencia: number;
  idUsuario: number;
  mensagemSolicitacao: string;
  dataInicioAusencia: string;
  dataFimAusencia: string;
  linkArquivo?: string;
  statusSolicitacao: number;
  /** Comentário de quem aprovou ou reprovou */
  observacaoResposta?: string | null;
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

export type SolicitacaoAusenciaResponse = ApiResponse<{
  solicitacao?: SolicitacaoAusencia;
  solicitacoes?: SolicitacaoAusencia[];
}>;

export const solicitacaoAusenciaService = {
  listarSolicitacoes: async () =>
    (await api.get<SolicitacaoAusenciaResponse>('/api/SolicitacaoAusencia/ListarSolicitacaoAusencia')).data,

  obterSolicitacoesPorUsuario: async (idUsuario: number) =>
    (await api.get<SolicitacaoAusenciaResponse>(
      `/api/SolicitacaoAusencia/ListarSolicitacoesAusenciaUsuario/${idUsuario}`
    )).data,

  // multipart/form-data por causa do anexo
  inserirSolicitacao: async (solicitacao: SolicitacaoAusenciaInsert) => {
    const formData = new FormData();
    formData.append('idUsuario', solicitacao.idUsuario.toString());
    if (solicitacao.mensagemSolicitacao) formData.append('mensagemSolicitacao', solicitacao.mensagemSolicitacao);
    if (solicitacao.dataInicioAusencia) formData.append('dataInicioAusencia', solicitacao.dataInicioAusencia);
    if (solicitacao.dataFimAusencia) formData.append('dataFimAusencia', solicitacao.dataFimAusencia);
    if (solicitacao.arquivo) formData.append('arquivo', solicitacao.arquivo);
    solicitacao.camposAtivos?.forEach((campo) => formData.append('camposAtivos', campo));

    const response = await api.post<SolicitacaoAusenciaResponse>(
      '/api/SolicitacaoAusencia/InserirSolicitacaoAusencia',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Aprovar ou reprovar
  responderSolicitacao: async (id: number, aprovar: boolean, comentario?: string) =>
    (await api.put<SolicitacaoAusenciaResponse>(
      `/api/SolicitacaoAusencia/ResponderSolicitacao/${id}`,
      null,
      { params: { aprovar, ...(comentario ? { comentario } : {}) } }
    )).data,
};
