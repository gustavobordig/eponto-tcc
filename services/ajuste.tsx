import api from './api';

export const ajusteService = async (payload: any) => {
  try {
    const response = await api.post('/api/RegistroPonto/CriarSolicitacaoAlteracao', payload);
    
    return response.data;
  } catch (error) {
    console.error('Error inserting time record:', error);
    throw error;
  }
};