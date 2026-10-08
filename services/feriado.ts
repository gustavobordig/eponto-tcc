import api from './api';
import { ApiResponse } from '@/types/api';

export interface Feriado {
  idFeriado?: number;
  dscFeriado: string;
  datFeriado: string;
  indTipoFeriado: number;
}

export type FeriadoResponse = ApiResponse<{ listaFeriados?: Feriado[] | null }>;

export const feriadoService = {
  // Também é usado para editar: a API não tem rota de atualização
  cadastrarFeriado: async (feriado: Feriado) =>
    (await api.post<ApiResponse>('/api/feriado/CadastrarFeriado', feriado)).data,

  buscarFeriados: async () => {
    const { data } = await api.get<FeriadoResponse>('/api/feriado/ListarFeriados');
    return data.listaFeriados || [];
  },

  excluirFeriado: async (id: number) =>
    (await api.delete<ApiResponse>(`/api/feriado/DeletarFeriado/${id}`)).data,
};
