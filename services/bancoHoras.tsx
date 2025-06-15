import api from './api';

interface BancoHorasItem {
  idBancoHoras: number;
  idUsuario: number;
  horasTrabalhadas: string;
  saldo: string;
}

interface SaldoDiario {
  idSaldoDiarioBancoHoras: number;
  idUsuario: number;
  saldoDiario: string;
  dataReferencia: string;
}

interface BancoHorasResponse {
  sucesso: boolean;
  mensagem: string | null;
  saldosDiarios: SaldoDiario[] | null;
  bancoHoras: BancoHorasItem[] | null;
}

export const bancoHorasService = {
  // Processa o banco de horas para um usuário em uma data específica
  processarBancoHoras: async (userId: number, data: string): Promise<void> => {
    try {
      await api.post(`/api/BancoHoras/Processar/${userId}?data=${data}`);
    } catch (error) {
      console.error('Erro ao processar banco de horas:', error);
      throw error;
    }
  },

  // Obtém os saldos diários do banco de horas para um usuário
  obterSaldosDiarios: async (userId: number): Promise<BancoHorasResponse> => {
    try {
      const response = await api.get(`/api/BancoHoras/SaldosDiarios/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter saldos diários:', error);
      throw error;
    }
  },

  // Obtém o saldo atual do banco de horas para um usuário
  obterSaldoAtual: async (userId: number): Promise<BancoHorasResponse> => {
    try {
      if (!userId) {
        console.error('ID do usuário não fornecido');
        throw new Error('ID do usuário é obrigatório');
      }

      const response = await api.get(`/api/BancoHoras/Atual/${userId}`);
      
      console.log('Resposta completa da API:', response);
      
      if (!response.data) {
        console.error('Resposta vazia do servidor');
        throw new Error('Resposta vazia do servidor');
      }

      // Verifica se a resposta tem a estrutura esperada
      if (!response.data.sucesso) {
        console.error('Resposta indicou erro:', response.data.mensagem);
        throw new Error(response.data.mensagem || 'Erro ao buscar saldo de horas');
      }

      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado ao obter saldo atual:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Retorna um objeto de erro padronizado com mais informações
      return {
        sucesso: false,
        mensagem: error.response?.data?.message || error.message || 'Erro ao buscar saldo de horas',
        saldosDiarios: null,
        bancoHoras: null
      };
    }
  },
}; 