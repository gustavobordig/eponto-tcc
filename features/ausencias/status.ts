/** statusSolicitacao (StatusAlteracaoPonto na API): 0 pendente, 1 aprovada, 2 reprovada */
export const STATUS_PENDENTE = 0;

const STATUS: Record<number, { texto: string; cor: string }> = {
  0: { texto: 'Pendente', cor: 'bg-yellow-100 text-yellow-800' },
  1: { texto: 'Aprovada', cor: 'bg-green-100 text-green-800' },
  2: { texto: 'Reprovada', cor: 'bg-red-100 text-red-800' },
};

const DESCONHECIDO = { texto: 'Desconhecido', cor: 'bg-gray-100 text-gray-800' };

export const getStatusText = (status: number) => (STATUS[status] ?? DESCONHECIDO).texto;
export const getStatusColor = (status: number) => (STATUS[status] ?? DESCONHECIDO).cor;
export const isPendente = (status: number) => status === STATUS_PENDENTE;
