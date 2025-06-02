import api from './api';

interface TimeRecordAdjustment {
  id: number;
  idUsuario: number;
  idRegistroPonto: number;
  dataSolicitacao: string;
  dataAlteracao: string;
  horaAlteracao: string;
  motivo: string;
  status: string;
  observacao: string;
}

export const listAdjustmentRequests = async () => {
  try {
    const response = await api.get('/api/RegistroPonto/ListarSolicitacoesAlteracao');
    return response.data;
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

export const validateAdjustmentRequest = async (id: number) => {
  try {
    const response = await api.get(`/api/RegistroPonto/ValidarSolicitacao/${id}`);
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

export const updateAdjustmentRequest = async (id: number, status: string, observacao?: string) => {
  try {
    const response = await api.post('/api/RegistroPonto/AtualizarSolicitacaoAlteracao', {
      id,
      status,
      observacao
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar solicitação de alteração:', error);
    throw error;
  }
}; 