/** status da solicitação de feedback: 0 pendente, 1 respondida */
export const STATUS_RESPONDIDA = 1;

export const getStatusLabel = (status: number) =>
  status === 0 ? 'Pendente' : status === 1 ? 'Respondido' : 'Desconhecido';

export const getStatusColor = (status: number) =>
  status === 0
    ? 'bg-warn-soft text-warn-ink'
    : status === 1
      ? 'bg-ok-soft text-ok-ink'
      : 'bg-surface-2 text-foreground';

export const truncateText = (text: string | null | undefined, maxLength = 50) => {
  if (!text) return '';
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
};
