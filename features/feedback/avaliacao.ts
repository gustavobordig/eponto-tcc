/**
 * Na API a avaliação é o enum FeedbackAvaliacao: 0 Péssimo … 4 Excelente.
 * Na tela ela aparece como 1 a 5 estrelas.
 */
export const AVALIACOES = [
  { estrelas: 1, label: 'Péssimo' },
  { estrelas: 2, label: 'Ruim' },
  { estrelas: 3, label: 'Regular' },
  { estrelas: 4, label: 'Bom' },
  { estrelas: 5, label: 'Excelente' },
];

export const estrelasDaAvaliacao = (avaliacao: number) => Math.min(5, Math.max(1, avaliacao + 1));
export const avaliacaoDasEstrelas = (estrelas: number) => estrelas - 1;
