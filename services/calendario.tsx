import api from './api';

interface DiaEvento {
  datEvento: string;
  dscEvento: string;
  saldoHorasDiario: number;
  tipoEvento: number;
}

interface RespostaCalendario {
  sucesso: boolean;
  mensagem: string | null;
  dias: DiaEvento[];
}

export const calendarioService = {
  buscarCalendario: async (): Promise<RespostaCalendario> => {
    try {
      const response = await api.get('/api/Calendario/BuscaCalendario');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      throw error;
    }
  }
}; 