import { format } from 'date-fns';
import { RegistroPonto } from '@/features/ponto/api';
import { ETAPAS_DO_DIA, minutosDeAtraso } from '@/features/ponto/etapas';
import { EventoCalendario } from '@/shared/ui/Calendario';

export type SituacaoDia = 'ok' | 'atraso' | 'sem-registro' | 'folga' | 'hoje' | 'futuro';

export interface DiaPontualidade {
  dia: number;
  situacao: SituacaoDia;
}

/** Atraso de mais de 10 minutos na entrada ou na volta do almoço */
const TOLERANCIA_MIN = 10;

/**
 * Situação de cada dia do mês: no horário, com atraso, sem registro, folga
 * (fim de semana, feriado ou férias), hoje ou ainda por vir.
 */
export function pontualidadeDoMes(registros: RegistroPonto[], eventos: EventoCalendario[], hoje = new Date()): DiaPontualidade[] {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const porDia = new Map<string, RegistroPonto[]>();
  for (const r of registros) {
    const chave = r.dataRegistro.split('T')[0];
    porDia.set(chave, [...(porDia.get(chave) ?? []), r]);
  }

  return Array.from({ length: diasNoMes }, (_, i) => {
    const data = new Date(ano, mes, i + 1);
    const dia = i + 1;
    const fimDeSemana = data.getDay() === 0 || data.getDay() === 6;
    // O fim dos eventos é exclusivo (ver diaInteiro)
    const temEvento = eventos.some((e) => e.start <= data && data < e.end);

    if (fimDeSemana || temEvento) return { dia, situacao: 'folga' };
    if (dia === hoje.getDate()) return { dia, situacao: 'hoje' };
    if (dia > hoje.getDate()) return { dia, situacao: 'futuro' };

    const doDia = porDia.get(format(data, 'yyyy-MM-dd')) ?? [];
    if (doDia.length === 0) return { dia, situacao: 'sem-registro' };

    const atrasou = ETAPAS_DO_DIA.some((etapa) => {
      const r = doDia.find((x) => x.idTipoRegistroPonto === etapa.tipo);
      return r && minutosDeAtraso(etapa, format(new Date(r.horaRegistro), 'HH:mm')) > TOLERANCIA_MIN;
    });
    return { dia, situacao: atrasou ? 'atraso' : 'ok' };
  });
}
