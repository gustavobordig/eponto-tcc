import api from './api';

interface TimeRecordPayload {
  idUsuario: number;
  horaRegistro: string;
  dataRegistro: string;
  idTipoRegistroPonto: number;
}

export const insertTimeRecord = async (payload: TimeRecordPayload) => {
  try {
    const response = await api.post('/api/RegistroPonto/Inserir', payload);
    
    return response.data;
  } catch (error) {
    console.error('Error inserting time record:', error);
    throw error;
  }
};

export const getTimeRecordHistory = async (userId: number) => {
  try {
    const response = await api.get(`/api/RegistroPonto/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time record history:', error);
    throw error;
  }
};

export const getAllTimeRecords = async () => {
  try {
    const response = await api.get('/api/RegistroPonto/Listar');
    return response.data;
  } catch (error) {
    console.error('Error fetching all time records:', error);
    throw error;
  }
};

export const getUserTimeRecords = async (userId: number) => {
  try {
    const response = await api.get(`/api/RegistroPonto/ObterRegistrosUsuario?idUsuario=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user time records:', error);
    throw error;
  }
}; 