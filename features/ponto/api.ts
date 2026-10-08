import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

/** 1 entrada, 2 início do almoço, 3 fim do almoço, 4 saída */
export type TipoRegistroPonto = 1 | 2 | 3 | 4;

export interface RegistroPonto {
  idRegistro: number;
  id_Usuario: number;
  horaRegistro: string;
  dataRegistro: string;
  idTipoRegistroPonto: number;
}

export interface NovoRegistroPonto {
  idUsuario: number;
  horaRegistro: string;
  dataRegistro: string;
  idTipoRegistroPonto: number;
  localizacao?: string;
}

export interface ItemRegistro {
  idRegistro?: number;
  horaRegistro: string;
  idTipoRegistroPonto: number;
}

export interface SolicitacaoAlteracao {
  idSolicitacao: number;
  idSolicitante: number;
  justificativa: string;
  statusSolicitacao: number;
  dataRegistroAlteracao: string;
  itens: ItemRegistro[];
}

export type NovaSolicitacaoAlteracao = Omit<SolicitacaoAlteracao, 'idSolicitacao' | 'statusSolicitacao'>;

export type RegistroPontoResponse = ApiResponse<{ registros?: RegistroPonto[] | null }>;
export type SolicitacaoAlteracaoResponse = ApiResponse<{ solicitacoes?: SolicitacaoAlteracao[] | null }>;

export const registroPontoService = {
  inserir: async (registro: NovoRegistroPonto) =>
    (await api.post<ApiResponse>('/api/RegistroPonto/Inserir', registro)).data,

  listarPorUsuario: async (idUsuario: number) =>
    (await api.get<RegistroPontoResponse>('/api/RegistroPonto/ObterRegistrosUsuario', {
      params: { idUsuario },
    })).data,

  // Solicitações de alteração (ajuste de ponto)
  solicitarAlteracao: async (solicitacao: NovaSolicitacaoAlteracao) =>
    (await api.post<ApiResponse>('/api/RegistroPonto/CriarSolicitacaoAlteracao', solicitacao)).data,

  listarSolicitacoesAlteracao: async () =>
    (await api.get<SolicitacaoAlteracaoResponse>('/api/RegistroPonto/ListarSolicitacoesAlteracao')).data,

  validarSolicitacao: async (idSolicitacao: number, aprovado: boolean) =>
    (await api.post<ApiResponse>(`/api/RegistroPonto/ValidarSolicitacao/${idSolicitacao}`, { aprovado })).data,
};
