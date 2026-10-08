import api from './api';
import { ApiResponse } from '@/types/api';

export interface Cargo {
  idCargo: number;
  nomeCargo: string;
  salario: string;
  formacaoMinima: string;
  indAtivo: number;
}

export type CargoResponse = ApiResponse<{
  cargo?: Cargo | null;
  cargos?: Cargo[] | null;
}>;

export const cargoService = {
  listar: async () => (await api.get<CargoResponse>('/api/Cargo/Listar')).data,

  buscarPorId: async (idCargo: number) =>
    (await api.get<CargoResponse>(`/api/Cargo/Buscar/${idCargo}`)).data,

  inserir: async (cargo: Cargo) => (await api.post<CargoResponse>('/api/Cargo/Inserir', cargo)).data,

  atualizar: async (cargo: Cargo) =>
    (await api.put<CargoResponse>(`/api/Cargo/Atualizar/${cargo.idCargo}`, cargo)).data,

  deletar: async (idCargo: number) =>
    (await api.put<CargoResponse>(`/api/Cargo/Deletar/${idCargo}`)).data,
};
