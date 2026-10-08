import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

export interface JornadaTrabalho {
  idJornada?: number;
  nomeJornada: string;
  qtdHorasDiarias: number;
  indAtivo?: number;
}

export type JornadaTrabalhoResponse = ApiResponse<{
  jornada?: JornadaTrabalho | null;
  jornadas?: JornadaTrabalho[] | null;
}>;

export const jornadaTrabalhoService = {
  inserir: async (jornada: JornadaTrabalho) =>
    (await api.post<JornadaTrabalhoResponse>('/api/JornadaTrabalho/Inserir', jornada)).data,

  buscarPorId: async (id: number) =>
    (await api.get<JornadaTrabalhoResponse>(`/api/JornadaTrabalho/${id}`)).data,

  listar: async () => (await api.get<JornadaTrabalhoResponse>('/api/JornadaTrabalho/Listar')).data,

  atualizar: async (id: number, jornada: JornadaTrabalho) =>
    (await api.put<JornadaTrabalhoResponse>(`/api/JornadaTrabalho/Atualizar/${id}`, jornada)).data,

  deletar: async (id: number) =>
    (await api.put<JornadaTrabalhoResponse>(`/api/JornadaTrabalho/Deletar/${id}`)).data,
};
