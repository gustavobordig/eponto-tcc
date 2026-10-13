import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

export interface Comunicado {
  idComunicado: number;
  tituloComunicado: string;
  dscComunicado: string;
  datInicioExibicao: string;
  datFimExibicao: string;
}

export type ComunicadosResponse = ApiResponse<{ listaComunicados: Comunicado[] | null }>;

export const comunicadoService = {
  listar: async () => (await api.get<ComunicadosResponse>('/api/Comunicado/ListarComunicados')).data,
};
