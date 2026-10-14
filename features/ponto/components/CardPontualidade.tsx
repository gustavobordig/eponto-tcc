'use client';

import { useMemo } from 'react';
import { RegistroPonto } from '@/features/ponto/api';
import { pontualidadeDoMes, SituacaoDia } from '@/features/ponto/lib/pontualidade';
import { EventoCalendario } from '@/shared/ui/Calendario';
import Cartao from '@/shared/ui/Cartao';

const ESTILO: Record<SituacaoDia, string> = {
  ok: 'bg-ok text-white',
  atraso: 'bg-warn text-white',
  'sem-registro': 'bg-danger-soft text-danger-ink',
  folga: 'bg-surface-2 text-subtle',
  hoje: 'bg-primary-soft text-primary ring-1 ring-primary/30',
  futuro: 'bg-surface-2 text-subtle',
};

const LEGENDA: [string, string][] = [
  ['bg-ok', 'No horário'],
  ['bg-warn', 'Atraso'],
  ['bg-danger-soft', 'Sem registro'],
  ['bg-surface-2', 'Folga / feriado'],
];

/** Mapa do mês: cada dia útil colorido pela pontualidade. */
export default function CardPontualidade({ registros, eventos }: { registros: RegistroPonto[]; eventos: EventoCalendario[] }) {
  const dias = useMemo(() => pontualidadeDoMes(registros, eventos), [registros, eventos]);
  const noHorario = dias.filter((d) => d.situacao === 'ok').length;
  const trabalhados = dias.filter((d) => d.situacao === 'ok' || d.situacao === 'atraso').length;
  const mes = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <Cartao
      titulo={`Pontualidade · ${mes}`}
      acao={trabalhados > 0 && <span className="text-[13px] text-muted">{noHorario} de {trabalhados} dias no horário</span>}
    >
      <ol className="grid grid-cols-7 gap-1.5">
        {dias.map(({ dia, situacao }) => (
          <li
            key={dia}
            className={`flex aspect-[1.6] items-center justify-center rounded-md text-[11px] font-semibold ${ESTILO[situacao]}`}
          >
            {dia}
          </li>
        ))}
      </ol>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {LEGENDA.map(([cor, texto]) => (
          <li key={texto} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-[3px] ${cor}`} aria-hidden />
            {texto}
          </li>
        ))}
      </ul>
    </Cartao>
  );
}
