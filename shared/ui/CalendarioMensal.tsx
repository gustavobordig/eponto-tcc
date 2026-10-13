'use client';

import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventoCalendario } from '@/shared/ui/Calendario';

type Visao = 'mes' | 'semana' | 'lista';

/** Cor do evento pelo tipo (campo desc) */
export const COR_EVENTO: Record<string, { chip: string; ponto: string }> = {
  feriado: { chip: 'bg-danger-soft text-danger-ink', ponto: 'bg-danger' },
  ferias: { chip: 'bg-ok-soft text-ok-ink', ponto: 'bg-ok' },
  'minhas-ferias': { chip: 'bg-ferias-soft text-ferias', ponto: 'bg-ferias' },
  comunicado: { chip: 'bg-primary-soft text-primary', ponto: 'bg-primary' },
};
const corDe = (desc: string) => COR_EVENTO[desc] ?? COR_EVENTO.comunicado;

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const doDia = (eventos: EventoCalendario[], dia: Date) => eventos.filter((e) => e.start <= dia && dia < e.end);

/**
 * Calendário do redesign (1e): mês em grade, semana ou lista. Substitui o
 * react-big-calendar nas telas do funcionário.
 */
export default function CalendarioMensal({
  eventos,
  data,
  onDataChange,
}: {
  eventos: EventoCalendario[];
  data: Date;
  onDataChange: (data: Date) => void;
}) {
  const [visao, setVisao] = useState<Visao>('mes');
  const hoje = new Date();

  const dias = useMemo(() => {
    const inicio = visao === 'semana' ? startOfWeek(data) : startOfWeek(startOfMonth(data));
    const fim = visao === 'semana' ? endOfWeek(data) : endOfWeek(endOfMonth(data));
    const lista: Date[] = [];
    for (let d = inicio; d <= fim; d = addDays(d, 1)) lista.push(d);
    return lista;
  }, [data, visao]);

  const doMes = useMemo(
    () =>
      eventos
        .filter((e) => e.start <= endOfMonth(data) && e.end > startOfMonth(data))
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [eventos, data]
  );

  const mover = (passo: number) => onDataChange(visao === 'semana' ? addWeeks(data, passo) : addMonths(data, passo));
  const titulo = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' ');

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-2xl font-bold capitalize tracking-tight">{titulo}</h1>
        <button type="button" onClick={() => onDataChange(new Date())} className="h-9 rounded-lg border border-line px-3.5 text-[13px] font-semibold hover:bg-background">
          Hoje
        </button>
        <div className="flex gap-1">
          <button type="button" onClick={() => mover(-1)} aria-label="Anterior" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line hover:bg-background">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => mover(1)} aria-label="Próximo" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line hover:bg-background">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex rounded-[9px] bg-[#f1f2f6] p-[3px] text-[13px] font-semibold" role="tablist" aria-label="Visualização">
          {([['mes', 'Mês'], ['semana', 'Semana'], ['lista', 'Lista']] as const).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={visao === valor}
              onClick={() => setVisao(valor)}
              className={`rounded-[7px] px-3.5 py-[7px] ${visao === valor ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,.08)]' : 'text-muted hover:text-foreground'}`}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      {visao === 'lista' ? (
        doMes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-strong py-10 text-center text-sm text-muted">Nada neste mês.</p>
        ) : (
          <ul className="divide-y divide-surface-2">
            {doMes.map((e) => {
              const fim = addDays(e.end, -1);
              return (
                <li key={`${e.id}-${e.start.toISOString()}`} className="flex items-center gap-4 py-3">
                  <span className="w-28 shrink-0 font-mono text-sm text-muted">
                    {format(e.start, 'dd/MM')}
                    {!isSameDay(fim, e.start) && ` – ${format(fim, 'dd/MM')}`}
                  </span>
                  <span className={`rounded-[5px] px-2 py-1 text-xs font-semibold ${corDe(e.desc).chip}`}>{e.title}</span>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <div>
          <div className="grid grid-cols-7 text-xs font-bold uppercase tracking-[.4px] text-muted">
            {DIAS_SEMANA.map((d) => (
              <span key={d} className="px-2.5 pb-2">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-t border-surface-2">
            {dias.map((dia) => {
              const fora = visao === 'mes' && !isSameMonth(dia, data);
              const fimDeSemana = dia.getDay() === 0 || dia.getDay() === 6;
              const ehHoje = isSameDay(dia, hoje);
              const evs = fora ? [] : doDia(eventos, dia);
              return (
                <div
                  key={dia.toISOString()}
                  className={`flex min-w-0 flex-col gap-1 border-b border-r border-surface-2 p-1.5 sm:p-2 ${visao === 'semana' ? 'h-60' : 'h-20 sm:h-[104px]'} ${fora ? 'bg-[#fafbfd]' : fimDeSemana ? 'bg-[#fcfcfe]' : 'bg-white'}`}
                >
                  <span
                    className={`flex h-[26px] min-w-[26px] items-center justify-center self-start rounded-full px-1.5 text-[13px] font-semibold ${ehHoje ? 'bg-primary text-white' : fora ? 'text-[#a5aabd]' : ''}`}
                    aria-current={ehHoje ? 'date' : undefined}
                  >
                    {format(dia, 'dd')}
                  </span>
                  {evs.slice(0, visao === 'semana' ? 8 : 2).map((e) => (
                    <span key={e.id} title={e.title} className={`truncate rounded-[5px] px-1.5 py-[3px] text-[11px] font-semibold ${corDe(e.desc).chip}`}>
                      {e.title}
                    </span>
                  ))}
                  {visao === 'mes' && evs.length > 2 && <span className="px-1 text-[11px] text-muted">+{evs.length - 2}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
