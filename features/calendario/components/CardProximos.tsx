'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { comunicadoService, Comunicado } from '@/features/comunicados/api';
import { EventoCalendario } from '@/shared/ui/Calendario';
import Cartao from '@/shared/ui/Cartao';

interface Item {
  chave: string;
  data: Date;
  titulo: string;
  detalhe: string;
  cor: string;
}

const COR = {
  feriado: 'bg-danger-soft text-danger-ink',
  ferias: 'bg-ok-soft text-ok-ink',
  'minhas-ferias': 'bg-ferias-soft text-ferias',
  comunicado: 'bg-primary-soft text-primary',
} as const;

const diaMes = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

/** Os próximos três eventos: feriados, férias (da empresa e suas) e comunicados do RH. */
export default function CardProximos({ eventos }: { eventos: EventoCalendario[] }) {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);

  useEffect(() => {
    comunicadoService
      .listar()
      .then((r) => setComunicados(r.listaComunicados ?? []))
      .catch((error) => console.error('Erro ao buscar comunicados:', error));
  }, []);

  const itens = useMemo(() => {
    const hoje = startOfDay(new Date());
    const doCalendario: Item[] = eventos
      .filter((e) => e.end > hoje)
      .map((e) => {
        const fim = addDays(e.end, -1);
        const periodo = fim > e.start ? `${diaMes(e.start)} a ${diaMes(fim)}` : diaMes(e.start);
        if (e.desc === 'minhas-ferias') {
          return { chave: `mf-${e.id}`, data: e.start, titulo: 'Suas férias', detalhe: periodo, cor: COR['minhas-ferias'] };
        }
        if (e.desc === 'feriado') {
          return { chave: `fe-${e.id}`, data: e.start, titulo: e.title, detalhe: 'Feriado', cor: COR.feriado };
        }
        return { chave: `fc-${e.id}`, data: e.start, titulo: e.title, detalhe: `Férias da empresa · ${periodo}`, cor: COR.ferias };
      });
    const doRh: Item[] = comunicados
      .filter((c) => new Date(c.datFimExibicao) >= hoje)
      .map((c) => ({
        chave: `co-${c.idComunicado}`,
        data: new Date(c.datInicioExibicao),
        titulo: c.tituloComunicado,
        detalhe: `Comunicado do RH · ${c.dscComunicado}`,
        cor: COR.comunicado,
      }));
    // Comunicados já em exibição aparecem com a data de hoje
    return [...doCalendario, ...doRh]
      .map((i) => ({ ...i, data: i.data < hoje ? hoje : i.data }))
      .sort((a, b) => a.data.getTime() - b.data.getTime())
      .slice(0, 3);
  }, [eventos, comunicados]);

  return (
    <Cartao titulo="Próximos" acao={{ href: '/calendar', texto: 'Calendário' }}>
      {itens.length === 0 ? (
        <p className="text-sm text-muted">Nada programado por enquanto.</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {itens.map((item) => (
            <li key={item.chave} className="flex items-center gap-3">
              <span className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] leading-none ${item.cor}`}>
                <b className="text-base">{String(item.data.getDate()).padStart(2, '0')}</b>
                <span className="text-[10px] font-semibold uppercase">
                  {item.data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <b className="truncate text-sm">{item.titulo}</b>
                <span className="truncate text-xs text-muted">{item.detalhe}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  );
}
