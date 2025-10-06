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
  buscarCalendario: async (ano?: number, idUsuario?: number): Promise<RespostaCalendario> => {
    try {
      let url = '/api/Calendario/BuscaCalendario';
      const params = new URLSearchParams();
      
      if (ano) {
        params.append('ano', ano.toString());
      }
      
      if (idUsuario) {
        params.append('idUsuario', idUsuario.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      throw error;
    }
  }
}; 