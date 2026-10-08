import api from '@/shared/lib/api';
import { ApiResponse } from '@/shared/types/api';

/** Payload de cadastro. indTipoFeriado: 1 integral, 2 meio período */
export interface Feriado {
  dscFeriado: string;
  datFeriado: string;
  indTipoFeriado: number;
}

/** Como a listagem devolve: o tipo vem como texto ("Feriado Integral" / "Feriado Meio Periodo") */
export interface FeriadoListado {
  idFeriado: number;
  dscFeriado: string;
  datFeriado: string;
  dscTipoFeriado: string;
}

export type FeriadoResponse = ApiResponse<{ listaFeriados?: FeriadoListado[] | null }>;

export const tipoDoFeriado = (dscTipoFeriado: string | undefined) => (/meio/i.test(dscTipoFeriado ?? '') ? 2 : 1);
export const labelDoTipo = (indTipoFeriado: number) => (indTipoFeriado === 2 ? 'Meio Período' : 'Integral');

export const feriadoService = {
  cadastrarFeriado: async (feriado: Feriado) =>
    (await api.post<ApiResponse>('/api/feriado/CadastrarFeriado', feriado)).data,

  buscarFeriados: async () => {
    const { data } = await api.get<FeriadoResponse>('/api/feriado/ListarFeriados');
    return data.listaFeriados || [];
  },

  excluirFeriado: async (id: number) =>
    (await api.delete<ApiResponse>(`/api/feriado/DeletarFeriado/${id}`)).data,

  /**
   * A API não tem rota de atualização. Antes a edição chamava o cadastro e
   * criava um feriado duplicado; agora cadastra o novo e exclui o antigo.
   */
  atualizarFeriado: async (idFeriado: number, feriado: Feriado) => {
    await feriadoService.cadastrarFeriado(feriado);
    await feriadoService.excluirFeriado(idFeriado);
  },
};
