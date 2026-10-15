'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { Plane } from 'lucide-react';
import { useEventosCalendario } from '@/features/calendario/hooks/useEventosCalendario';
import { comunicadoService } from '@/features/comunicados/api';
import { feriasService } from '@/features/ferias/api';
import { FeriasModal } from '@/features/ferias/components/SolicitarFeriasModal';
import { tokenUtils } from '@/shared/lib/token';
import { diaInteiro, EventoCalendario } from '@/shared/ui/Calendario';
import CalendarioMensal, { COR_EVENTO } from '@/shared/ui/CalendarioMensal';
import Cartao from '@/shared/ui/Cartao';
import DetalheEventoModal from '@/shared/ui/DetalheEventoModal';

/** Dias de férias por período aquisitivo (CLT) */
const DIAS_POR_PERIODO = 30;

const diaCurto = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', '');

export default function CalendarioPage() {
  const { eventos, recarregar } = useEventosCalendario({ incluirMinhasFerias: true });
  const [comunicados, setComunicados] = useState<EventoCalendario[]>([]);
  const [saldoFerias, setSaldoFerias] = useState<number | null>(null);
  const [data, setData] = useState(() => new Date());
  const [isFeriasModalOpen, setIsFeriasModalOpen] = useState(false);
  const [aberto, setAberto] = useState<EventoCalendario | null>(null);

  useEffect(() => {
    comunicadoService
      .listar()
      .then((r) =>
        setComunicados(
          (r.listaComunicados ?? []).map((c) => ({
            id: `comunicado-${c.idComunicado}`,
            title: c.tituloComunicado,
            // No calendário, o comunicado aparece no dia em que começa a ser exibido
            ...diaInteiro(new Date(c.datInicioExibicao)),
            desc: 'comunicado',
            descricao: c.dscComunicado,
          }))
        )
      )
      .catch((error) => console.error('Erro ao buscar comunicados:', error));

    const idUsuario = tokenUtils.getId();
    if (idUsuario) {
      feriasService.saldo(Number(idUsuario)).then(setSaldoFerias).catch(() => setSaldoFerias(null));
    }
  }, []);

  const todos = useMemo(() => [...eventos, ...comunicados], [eventos, comunicados]);

  const nesteMes = useMemo(
    () =>
      todos
        .filter((e) => e.start <= endOfMonth(data) && e.end > startOfMonth(data))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .map((e) => {
          const fim = addDays(e.end, -1);
          const dias = differenceInCalendarDays(e.end, e.start);
          const quando = isSameDay(fim, e.start) ? diaCurto(e.start) : `${format(e.start, 'dd')} a ${format(fim, 'dd/MM')} · ${dias} dias`;
          const tipo = { feriado: 'Feriado', ferias: 'Férias da empresa', comunicado: 'Comunicado' }[e.desc];
          return { evento: e, chave: `${e.id}-${e.start.getTime()}`, titulo: e.title, detalhe: tipo ? `${tipo} · ${quando}` : quando, cor: (COR_EVENTO[e.desc] ?? COR_EVENTO.comunicado).ponto };
        }),
    [todos, data]
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <CalendarioMensal eventos={todos} data={data} onDataChange={setData} onEventoClick={setAberto} />

      <aside className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setIsFeriasModalOpen(true)}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary-dark"
        >
          <Plane className="h-[17px] w-[17px]" /> Solicitar férias
        </button>

        <Cartao titulo="Saldo de férias" className="gap-3.5 p-5">
          {saldoFerias === null ? (
            <p className="text-sm text-muted">Sem saldo cadastrado. Fale com o RH.</p>
          ) : (
            <>
              <p className="flex items-baseline gap-1.5">
                <span className="font-mono text-[32px] font-semibold">{saldoFerias}</span>
                <span className="text-sm text-muted">{saldoFerias === 1 ? 'dia disponível' : 'dias disponíveis'}</span>
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (saldoFerias / DIAS_POR_PERIODO) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted">De {DIAS_POR_PERIODO} dias por período aquisitivo.</p>
            </>
          )}
        </Cartao>

        <Cartao titulo="Neste mês" className="gap-3.5 p-5">
          {nesteMes.length === 0 ? (
            <p className="text-sm text-muted">Nada programado.</p>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {nesteMes.map((item) => (
                <li key={item.chave}>
                  <button
                    type="button"
                    onClick={() => setAberto(item.evento)}
                    className="-mx-2 flex w-[calc(100%+1rem)] items-start gap-2.5 rounded-lg px-2 py-1 text-left hover:bg-background"
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-[2px] ${item.cor}`} aria-hidden />
                    <span className="flex min-w-0 flex-col gap-px">
                      <b className="truncate text-[13px]">{item.titulo}</b>
                      <span className="text-xs text-muted">{item.detalhe}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </aside>

      <DetalheEventoModal evento={aberto} onClose={() => setAberto(null)} />
      <FeriasModal isOpen={isFeriasModalOpen} onClose={() => setIsFeriasModalOpen(false)} onSuccess={recarregar} />
    </div>
  );
}
