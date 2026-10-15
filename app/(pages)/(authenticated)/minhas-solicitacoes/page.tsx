'use client';

import { useMemo, useState } from 'react';
import { CalendarOff, Clock, LucideIcon, Paperclip, Plane, Plus, Stethoscope, MessageSquare } from 'lucide-react';
import { useAreaFuncionario } from '@/app/(pages)/(authenticated)/_components/AreaFuncionario';
import NovaAusencia from '@/features/ausencias/components/NovaAusencia';
import { TipoPedido } from '@/features/solicitacoes/pedidos';
import StatusPill, { Situacao } from '@/shared/ui/StatusPill';

const ICONE: Record<TipoPedido, LucideIcon> = {
  ajuste: Clock,
  atestado: Stethoscope,
  folga: CalendarOff,
  outro: CalendarOff,
  ferias: Plane,
};

type Filtro = 'todas' | 'analise' | 'aprovada' | 'reprovada';

const quando = (d: Date | null) => {
  if (!d) return '—';
  const hoje = new Date();
  if (d.toDateString() === hoje.toDateString()) return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

/** Solicitações (1f): ausências, ajustes de ponto e férias enviados ao RH, com o novo pedido ao lado. */
export default function MinhasSolicitacoesPage() {
  const { pedidos: meus } = useAreaFuncionario();
  const { pedidos, carregando, falhou, recarregar } = meus;
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [formAberto, setFormAberto] = useState(true);

  const contagem = useMemo(() => {
    const por = (s: Situacao) => pedidos.filter((p) => p.situacao === s).length;
    return { todas: pedidos.length, analise: por('analise'), aprovada: por('aprovada'), reprovada: por('reprovada') };
  }, [pedidos]);

  const visiveis = filtro === 'todas' ? pedidos : pedidos.filter((p) => p.situacao === filtro);

  const filtros: [Filtro, string][] = [
    ['todas', 'Todas'],
    ['analise', 'Em análise'],
    ['aprovada', 'Aprovadas'],
    ['reprovada', 'Reprovadas'],
  ];

  return (
    <div className={`grid grid-cols-1 items-start gap-5 ${formAberto ? 'lg:grid-cols-[minmax(0,1fr)_400px]' : ''}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold tracking-tight">Solicitações</h1>
            <p className="text-sm text-muted">Ausências, ajustes de ponto e férias que você enviou ao RH</p>
          </div>
          {!formAberto && (
            <button
              type="button"
              onClick={() => setFormAberto(true)}
              className="flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" /> Nova ausência
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 text-[13px] font-semibold" role="tablist" aria-label="Filtrar por situação">
          {filtros.map(([valor, rotulo]) => {
            const n = contagem[valor];
            return (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={`rounded-full px-3.5 py-[7px] ${filtro === valor ? 'bg-foreground text-background' : 'border border-line bg-surface hover:border-foreground/30'}`}
              >
                {rotulo}
                {n > 0 && (valor === 'todas' || valor === 'analise') ? ` · ${n}` : ''}
              </button>
            );
          })}
        </div>

        {falhou && (
          <p className="rounded-[10px] bg-warn-soft px-3.5 py-3 text-[13px] text-warn-ink">
            Não foi possível carregar todos os seus pedidos. Alguns podem não aparecer.
          </p>
        )}

        <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
          {carregando ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Carregando solicitações…</p>
          ) : visiveis.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              {pedidos.length === 0 ? 'Você ainda não enviou nenhum pedido.' : 'Nenhum pedido com essa situação.'}
            </p>
          ) : (
            <ul>
              {visiveis.map((p) => {
                const Icone = ICONE[p.tipo];
                return (
                  <li key={p.chave} className="flex items-center gap-4 border-b border-surface-2 px-5 py-[18px] last:border-b-0">
                    <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] bg-primary-soft text-primary">
                      <Icone className="h-[19px] w-[19px]" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <b className="text-sm">{p.titulo}</b>
                      <span className="truncate text-[13px] text-muted" title={p.observacao}>{p.detalhe}</span>
                      {p.resposta && (
                        <span className="mt-1 flex items-start gap-1.5 text-[13px] text-ink-2">
                          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
                          <span className="line-clamp-2">
                            <span className="sr-only">Resposta do RH: </span>
                            {p.resposta}
                          </span>
                        </span>
                      )}
                    </div>
                    {p.anexo && (
                      <a href={p.anexo} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-xs font-semibold text-primary hover:underline sm:flex">
                        <Paperclip className="h-3.5 w-3.5" /> Anexo
                      </a>
                    )}
                    <span className="hidden w-[110px] text-xs text-muted sm:block">{quando(p.enviadoEm)}</span>
                    <StatusPill situacao={p.situacao} className="w-24" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {formAberto && (
        <div className="lg:sticky lg:top-32">
          <NovaAusencia onEnviado={recarregar} onFechar={() => setFormAberto(false)} />
        </div>
      )}
    </div>
  );
}
