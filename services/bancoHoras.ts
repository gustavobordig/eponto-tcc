import { isAxiosError } from 'axios';
import api from './api';
import { ApiResponse } from '@/types/api';

export interface BancoHoras {
  idBancoHoras: number;
  idUsuario: number;
  horasTrabalhadas: string;
  saldo: string;
}

export interface SaldoDiario {
  idSaldoDiarioBancoHoras: number;
  idUsuario: number;
  saldoDiario: string;
  dataReferencia: string;
}

export type BancoHorasResponse = ApiResponse<{
  saldosDiarios: SaldoDiario[] | null;
  bancoHoras: BancoHoras[] | null;
}>;

export const bancoHorasService = {
  obterSaldosDiarios: async (userId: number) =>
    (await api.get<BancoHorasResponse>(`/api/BancoHoras/SaldosDiarios/${userId}`)).data,

  // Não lança: a home mostra o card vazio quando não há saldo
  obterSaldoAtual: async (userId: number): Promise<BancoHorasResponse> => {
    try {
      const { data } = await api.get<BancoHorasResponse>(`/api/BancoHoras/Atual/${userId}`);
      if (!data?.sucesso) throw new Error(data?.mensagem || 'Erro ao buscar saldo de horas');
      return data;
    } catch (error) {
      const mensagem = isAxiosError(error)
        ? error.response?.data?.message ?? error.message
        : error instanceof Error
          ? error.message
          : 'Erro ao buscar saldo de horas';
      console.error('Erro ao obter saldo atual:', error);
      return { sucesso: false, mensagem, saldosDiarios: null, bancoHoras: null };
    }
  },
};
