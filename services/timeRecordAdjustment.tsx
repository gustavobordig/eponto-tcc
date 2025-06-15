import api from './api';

export interface ItemRegistro {
  horaRegistro: string;
  idTipoRegistroPonto: number;
}

export interface TimeRecordAdjustment {
  idSolicitacao: number;
  id: number;
  idSolicitante: number;
  justificativa: string;
  statusSolicitacao: number;
  dataRegistroAlteracao: string;
  itens: ItemRegistro[];
}

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  solicitacoes: TimeRecordAdjustment[];
}

export const listAdjustmentRequests = async () => {
  try {
    const response = await api.get('/api/RegistroPonto/ListarSolicitacoesAlteracao');
    const data = response.data as ApiResponse;
    return data;
  } catch (error) {
    console.error('Erro ao buscar solicitações de alteração:', error);
    throw error;
  }
};

export const getAdjustmentRequest = async (id: number) => {
  try {
    const response = await api.get(`/api/RegistroPonto/ObterSolicitacaoAlteracao/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar solicitação de alteração:', error);
    throw error;
  }
};

export const validateAdjustmentRequest = async (id: number, status: number) => {
  try {
    const response = await api.post(`/api/RegistroPonto/ValidarSolicitacao/${id}`, {
      aprovado: status === 1
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao validar solicitação de alteração:', error);
    throw error;
  }
};

export const createAdjustmentRequest = async (payload: Omit<TimeRecordAdjustment, 'id' | 'status'>) => {
  try {
    const response = await api.post('/api/RegistroPonto/SolicitarAlteracao', payload);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar solicitação de alteração:', error);
    throw error;
  }
};

export const updateAdjustmentRequest = async (id: number, status: number, observacao?: string) => {
  try {
    const response = await api.post(`/api/RegistroPonto/AtualizarSolicitacaoAlteracao/${id}`, {
      status,
      observacao
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar solicitação de alteração:', error);
    throw error;
  }
}; 