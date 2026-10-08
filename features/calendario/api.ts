import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

export interface DiaCalendario {
  datEvento: string;
  dscEvento: string;
  saldoHorasDiario: number;
  /** 1 feriado, 2 férias */
  tipoEvento: number;
}

export type CalendarioResponse = ApiResponse<{ dias: DiaCalendario[] }>;

export const calendarioService = {
  buscarCalendario: async () =>
    (await api.get<CalendarioResponse>('/api/Calendario/BuscaCalendario')).data,
};
