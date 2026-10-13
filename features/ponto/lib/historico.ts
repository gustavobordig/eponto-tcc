import { format } from 'date-fns';
import { RegistroPonto } from '@/features/ponto/api';
import { ETAPAS_DO_DIA, minutosDeAtraso } from '@/features/ponto/etapas';
import { EventoCalendario } from '@/shared/ui/Calendario';

/** Atraso de mais de 10 minutos na entrada ou na volta do almoço */
export const TOLERANCIA_MIN = 10;

export interface MarcacaoDoDia {
  tipo: number;
  /** HH:mm, ou null se não marcou */
  hora: string | null;
  idRegistro: number | null;
  atraso: boolean;
}

export interface DiaDoHistorico {
  data: Date;
  /** yyyy-MM-dd */
  chave: string;
  marcacoes: MarcacaoDoDia[];
  /** Minutos trabalhados (só trechos com início e fim) */
  trabalhado: number | null;
  /** Saldo do dia em minutos, quando o banco de horas já calculou */
  saldo: number | null;
  /** Feriado ou férias */
  evento: string | null;
  /** Dia útil passado com alguma marcação faltando */
  incompleto: boolean;
}

const emMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Dias do mês para o histórico, do mais recente ao mais antigo: os que têm
 * marcação e os dias úteis passados sem nenhuma (que pedem ajuste).
 */
export function diasDoHistorico(
  mes: Date,
  registros: RegistroPonto[],
  saldos: Map<string, number>,
  eventos: EventoCalendario[],
  hoje = new Date()
): DiaDoHistorico[] {
  const ano = mes.getFullYear();
  const m = mes.getMonth();
  const ultimoDia = ano === hoje.getFullYear() && m === hoje.getMonth() ? hoje.getDate() : new Date(ano, m + 1, 0).getDate();
  if (new Date(ano, m, 1) > hoje) return [];

  const porDia = new Map<string, RegistroPonto[]>();
  for (const r of registros) {
    const chave = r.dataRegistro.split('T')[0];
    porDia.set(chave, [...(porDia.get(chave) ?? []), r]);
  }

  const dias: DiaDoHistorico[] = [];
  for (let d = ultimoDia; d >= 1; d--) {
    const data = new Date(ano, m, d);
    const chave = format(data, 'yyyy-MM-dd');
    const doDia = porDia.get(chave) ?? [];
    const fimDeSemana = data.getDay() === 0 || data.getDay() === 6;
    // O fim dos eventos é exclusivo (ver diaInteiro)
    const evento = eventos.find((e) => e.start <= data && data < e.end)?.title ?? null;
    const ehHoje = chave === format(hoje, 'yyyy-MM-dd');

    if (doDia.length === 0 && (fimDeSemana || (ehHoje && !evento))) continue;

    const marcacoes = ETAPAS_DO_DIA.map((etapa) => {
      const r = doDia.find((x) => x.idTipoRegistroPonto === etapa.tipo);
      const hora = r ? format(new Date(r.horaRegistro), 'HH:mm') : null;
      return { tipo: etapa.tipo, hora, idRegistro: r?.idRegistro ?? null, atraso: !!hora && minutosDeAtraso(etapa, hora) > TOLERANCIA_MIN };
    });
    const [entrada, almoco, volta, saida] = marcacoes.map((x) => x.hora);
    // Hoje, o trecho em aberto conta até agora
    const agora = ehHoje ? hoje.getHours() * 60 + hoje.getMinutes() : null;
    const trecho = (inicio: string | null, fim: string | null) => {
      const ate = fim ? emMinutos(fim) : agora;
      return inicio && ate !== null ? Math.max(0, ate - emMinutos(inicio)) : 0;
    };
    const trabalhado = doDia.length ? trecho(entrada, almoco ?? (volta ? null : saida)) + trecho(volta, saida) : null;

    dias.push({
      data,
      chave,
      marcacoes,
      trabalhado,
      saldo: saldos.get(chave) ?? null,
      evento,
      incompleto: !ehHoje && !evento && !fimDeSemana && marcacoes.some((x) => !x.hora),
    });
  }
  return dias;
}
