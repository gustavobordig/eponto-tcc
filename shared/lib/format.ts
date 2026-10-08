// Formatação de datas e horas usada em várias telas

/**
 * Lê um TimeSpan como o .NET serializa: "[-][dias.]hh:mm:ss[.fração]".
 * Ex.: "03:45:00" = 3h45, "1.18:00:00" = 1 dia e 18h = 42h, "-00:15:00" = -15min.
 * Devolve o total em minutos, ou null se não for um TimeSpan.
 */
export const duracaoEmMinutos = (valor: string | null | undefined): number | null => {
  const m = /^\s*(-)?(?:(\d+)\.)?(\d+):(\d{1,2})(?::(\d{1,2})(?:\.\d+)?)?\s*$/.exec(valor ?? '');
  if (!m) return null;
  const [, negativo, dias, horas, minutos] = m;
  const total = Number(dias ?? 0) * 24 * 60 + Number(horas) * 60 + Number(minutos);
  return negativo ? -total : total;
};

/** 225 → "3h 45min", 45 → "45min", 0 → "0h". Com sinal quando negativo. */
export const formatarMinutos = (totalMinutos: number): string => {
  const sinal = totalMinutos < 0 ? '-' : '';
  const abs = Math.abs(totalMinutos);
  const horas = Math.floor(abs / 60);
  const minutos = abs % 60;
  if (horas === 0 && minutos === 0) return '0h';
  if (horas === 0) return `${sinal}${minutos}min`;
  if (minutos === 0) return `${sinal}${horas}h`;
  return `${sinal}${horas}h ${minutos}min`;
};

/** Horas trabalhadas da API ("152:30:00" ou "6.08:30:00") → "152h 30min". */
export const formatHorasTrabalhadas = (horasString: string): string => {
  const minutos = duracaoEmMinutos(horasString);
  return minutos === null ? horasString || '0h' : formatarMinutos(minutos);
};

/**
 * Saldo do banco de horas → "3h 45min", "-15min"…
 * Antes "03:45:00" virava "45h" e "1.18:00:00" era lido como fração de dia.
 */
export const formatSaldo = (saldoString: string): string => {
  const minutos = duracaoEmMinutos(saldoString);
  return minutos === null ? saldoString || '0h' : formatarMinutos(minutos);
};

/**
 * Formata uma data para exibição amigável
 * @param dateValue - Valor da data (string, Date ou null/undefined)
 * @param includeTime - Se deve incluir hora na formatação
 * @returns String formatada ou '-' se a data for inválida
 */
export const formatDate = (dateValue: string | Date | null | undefined, includeTime: boolean = false): string => {
  try {
    if (!dateValue) {
      return '-';
    }

    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      return '-';
    }

    if (includeTime) {
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
}; 
/** 11999990000 → "(11) 99999-0000"; números fora do padrão voltam como vieram. */
export const formatTelefone = (valor: string | number | null | undefined): string => {
  const d = String(valor ?? '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return String(valor ?? '');
};

export const formatMoeda = (valor: string | number | null | undefined): string => {
  const n = Number(valor);
  return Number.isFinite(n) ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : String(valor ?? '');
};
