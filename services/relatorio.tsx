import api from './api';

interface RelatorioHorasExtrasParams {
  datInicio: string;
  datFim: string;
  IdCargo?: number;
  IdUsuario?: number;
}

export interface RelatorioItem {
  nomeUsuario: string;
  saldoHoras: string;
  cargo: string;
  jornadaTrabalho: string;
  horasTrabalhadasTotal: string | null;
}

export interface RelatorioResponse {
  sucesso: boolean;
  mensagem: string;
  listaItens?: RelatorioItem[];
}

export const relatorioService = {
  // Gerar relatório de horas extras
  relatorioHorasExtras: async (params: RelatorioHorasExtrasParams): Promise<RelatorioResponse> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('datInicio', params.datInicio);
      queryParams.append('datFim', params.datFim);
      
      if (params.IdCargo !== undefined) {
        queryParams.append('IdCargo', params.IdCargo.toString());
      }
      
      if (params.IdUsuario !== undefined) {
        queryParams.append('IdUsuario', params.IdUsuario.toString());
      }

      const response = await api.get(`/api/Relatorio/RelatorioHorasExtras?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de horas extras:', error);
      throw error;
    }
  }
};
