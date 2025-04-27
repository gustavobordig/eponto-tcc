import api from './api';

interface TimeRecordPayload {
  id_Usuario: number;
  hora_Registro: string;
  data_Registro: string;
  id_Tipo_Registro_Ponto: number;
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