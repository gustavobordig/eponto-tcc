/** statusSolicitacao: 1 pendente, 2 aprovada, 3 reprovada */
const STATUS: Record<number, { texto: string; cor: string }> = {
  1: { texto: 'Pendente', cor: 'bg-yellow-100 text-yellow-800' },
  2: { texto: 'Aprovada', cor: 'bg-green-100 text-green-800' },
  3: { texto: 'Reprovada', cor: 'bg-red-100 text-red-800' },
};

const DESCONHECIDO = { texto: 'Desconhecido', cor: 'bg-gray-100 text-gray-800' };

export const getStatusText = (status: number) => (STATUS[status] ?? DESCONHECIDO).texto;
export const getStatusColor = (status: number) => (STATUS[status] ?? DESCONHECIDO).cor;
