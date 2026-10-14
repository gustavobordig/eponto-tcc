'use client';

import { useMemo, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, Inbox, Paperclip, X } from 'lucide-react';
import { useFilaAprovacao, usePessoas } from '@/features/solicitacoes/hooks/useFilaAprovacao';
import { Pedido, TipoPedido } from '@/features/solicitacoes/pedidos';
import Avatar from '@/shared/ui/Avatar';
import LoadingText from '@/shared/ui/LoadingText';
import StatusPill from '@/shared/ui/StatusPill';

type Aba = 'analise' | 'aprovada' | 'reprovada';

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: 'analise', rotulo: 'Pendentes' },
  { valor: 'aprovada', rotulo: 'Aprovadas' },
  { valor: 'reprovada', rotulo: 'Reprovadas' },
];

const ROTULO_TIPO: Record<TipoPedido, string> = {
  ajuste: 'Ajuste de ponto',
  atestado: 'Atestado',
  folga: 'Folga',
  outro: 'Ausência',
  ferias: 'Férias',
};

const COR_TIPO: Record<TipoPedido, string> = {
  ajuste: 'bg-primary-soft text-primary',
  atestado: 'bg-primary-soft text-primary',
  folga: 'bg-primary-soft text-primary',
  outro: 'bg-primary-soft text-primary',
  ferias: 'bg-ferias-soft text-ferias',
};

/** "hoje, 09:14", "ontem, 17:40" ou "09/10" */
/** Pedido com quem pediu */
type PedidoNaFila = Pedido & { nome: string; cargo: string };

const quando = (d: Date | null, completo = false) => {
  if (!d) return '';
  const h = format(d, 'HH:mm');
  if (isToday(d)) return h === '00:00' ? 'hoje' : `hoje, ${h}`;
  if (isYesterday(d)) return h === '00:00' ? 'ontem' : `ontem, ${h}`;
  return completo ? `em ${format(d, 'dd/MM')}` : format(d, 'dd/MM');
};

function TipoPill({ tipo, className = '' }: { tipo: TipoPedido; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${COR_TIPO[tipo]} ${className}`}>
      {ROTULO_TIPO[tipo]}
    </span>
  );
}

interface Props {
  titulo: string;
  /** Só estes tipos (ex.: a tela de ajustes de ponto) */
  tipos?: TipoPedido[];
}

/**
 * Fila de aprovação do RH (1i): o pedido selecionado aparece em destaque com
 * os dados e a justificativa; os demais ficam numa lista com aprovar/reprovar.
 */
export default function FilaSolicitacoes({ titulo, tipos }: Props) {
  const fila = useFilaAprovacao();
  const { carregando, falhou, decidir } = fila;
  const pessoas = usePessoas();
  const pedidos = useMemo<PedidoNaFila[]>(
    () => fila.pedidos.map((p) => ({ ...p, nome: pessoas.get(p.idUsuario)?.nome ?? 'Funcionário', cargo: pessoas.get(p.idUsuario)?.cargo ?? '' })),
    [fila.pedidos, pessoas]
  );
  const [aba, setAba] = useState<Aba>('analise');
  const [tipo, setTipo] = useState<TipoPedido | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [respondendo, setRespondendo] = useState<string | null>(null);

  const daTela = useMemo(() => pedidos.filter((p) => !tipos || tipos.includes(p.tipo)), [pedidos, tipos]);
  const daAba = useMemo(() => daTela.filter((p) => p.situacao === aba), [daTela, aba]);
  const visiveis = useMemo(() => daAba.filter((p) => !tipo || p.tipo === tipo), [daAba, tipo]);
  const contagemTipos = useMemo(() => {
    const mapa = new Map<TipoPedido, number>();
    daAba.forEach((p) => mapa.set(p.tipo, (mapa.get(p.tipo) ?? 0) + 1));
    return [...mapa.entries()];
  }, [daAba]);
  const pendentes = daTela.filter((p) => p.situacao === 'analise').length;

  const destaque = visiveis.find((p) => p.chave === selecionado) ?? visiveis[0];
  const resto = visiveis.filter((p) => p !== destaque);

  const responder = async (pedido: PedidoNaFila, aprovar: boolean) => {
    setRespondendo(pedido.chave);
    await decidir(pedido, aprovar);
    setRespondendo(null);
  };

  if (carregando) return <LoadingText title="solicitações" />;

  const trocarAba = (valor: Aba) => {
    setAba(valor);
    setTipo(null);
    setSelecionado(null);
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold tracking-tight">{titulo}</h1>
          <p className="text-sm text-muted">
            {pendentes === 0
              ? 'Nenhum pedido aguardando sua decisão'
              : `${pendentes} ${pendentes === 1 ? 'pedido aguardando' : 'pedidos aguardando'} sua decisão`}
          </p>
        </div>
        <div role="tablist" aria-label="Situação" className="flex rounded-[9px] bg-surface-2 p-[3px] text-[13px] font-semibold">
          {ABAS.map((a) => (
            <button
              key={a.valor}
              type="button"
              role="tab"
              aria-selected={aba === a.valor}
              onClick={() => trocarAba(a.valor)}
              className={`rounded-[7px] px-3.5 py-[7px] ${aba === a.valor ? 'bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,.08)]' : 'text-muted hover:text-foreground'}`}
            >
              {a.rotulo}
            </button>
          ))}
        </div>
      </div>

      {contagemTipos.length > 1 && (
        <div className="flex flex-wrap gap-1.5 text-[13px] font-semibold">
          <button
            type="button"
            onClick={() => setTipo(null)}
            aria-pressed={tipo === null}
            className={`rounded-full px-3.5 py-[7px] ${tipo === null ? 'bg-foreground text-background' : 'border border-line bg-surface hover:border-line-strong'}`}
          >
            Todos os tipos
          </button>
          {contagemTipos.map(([t, n]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              aria-pressed={tipo === t}
              className={`rounded-full px-3.5 py-[7px] ${tipo === t ? 'bg-foreground text-background' : 'border border-line bg-surface hover:border-line-strong'}`}
            >
              {ROTULO_TIPO[t]} · {n}
            </button>
          ))}
        </div>
      )}

      {falhou && (
        <p className="rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn-ink">
          Algumas solicitações não carregaram. A lista pode estar incompleta.
        </p>
      )}

      {!destaque ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <Inbox className="h-8 w-8 text-subtle" />
          <p className="font-semibold">
            {aba === 'analise' ? 'Tudo em dia' : aba === 'aprovada' ? 'Nenhum pedido aprovado' : 'Nenhum pedido reprovado'}
          </p>
          {aba === 'analise' && <p className="text-sm text-muted">Não há pedidos esperando sua decisão.</p>}
        </div>
      ) : (
        <>
          <article
            aria-label={`Pedido de ${destaque.nome}`}
            className="flex flex-col gap-[18px] rounded-2xl border-[1.5px] border-primary bg-surface px-5 py-5 sm:px-6"
          >
            <div className="flex flex-wrap items-center gap-3.5">
              <Avatar nome={destaque.nome} tamanho="md" className="!h-11 !w-11" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <b className="text-[15px]">{destaque.nome}</b>
                <span className="text-[13px] text-muted">
                  {[destaque.cargo, destaque.enviadoEm && `enviado ${quando(destaque.enviadoEm, true)}`].filter(Boolean).join(' · ')}
                </span>
              </div>
              <TipoPill tipo={destaque.tipo} />
            </div>

            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {destaque.campos.map((c, i) => (
                <div key={`${c.rotulo}-${i}`} className="flex flex-col gap-[3px] rounded-[10px] bg-primary-tint px-3.5 py-3">
                  <dt className="text-xs text-muted">{c.rotulo}</dt>
                  <dd className={`text-[15px] font-bold ${c.hora ? 'font-mono text-primary' : ''}`}>{c.valor}</dd>
                </div>
              ))}
            </dl>

            {destaque.observacao && (
              <p className="border-l-2 border-line pl-3.5 text-sm leading-relaxed text-ink-2">“{destaque.observacao}”</p>
            )}

            {destaque.anexo && (
              <a
                href={destaque.anexo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-2 rounded-[10px] border border-line px-3.5 py-2 text-sm font-semibold text-primary hover:bg-primary-tint"
              >
                <Paperclip className="h-4 w-4" />
                Ver anexo
              </a>
            )}

            {destaque.situacao === 'analise' ? (
              <div className="flex flex-wrap justify-end gap-2.5">
                <button
                  type="button"
                  disabled={respondendo !== null}
                  onClick={() => responder(destaque, false)}
                  className="flex h-11 items-center gap-1.5 rounded-[10px] border border-line bg-surface px-[18px] text-sm font-bold text-danger hover:bg-danger-soft disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Reprovar
                </button>
                <button
                  type="button"
                  disabled={respondendo !== null}
                  onClick={() => responder(destaque, true)}
                  className="flex h-11 items-center gap-1.5 rounded-[10px] bg-primary px-5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {respondendo === destaque.chave ? 'Enviando…' : 'Aprovar'}
                </button>
              </div>
            ) : (
              <StatusPill situacao={destaque.situacao} className="w-fit" />
            )}
          </article>

          {resto.length > 0 && (
            <ul className="overflow-hidden rounded-2xl bg-surface shadow-card">
              {resto.map((p) => (
                <li key={p.chave} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-surface-2 px-4 py-4 last:border-b-0 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setSelecionado(p.chave)}
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3.5 gap-y-2 rounded-lg text-left md:flex-nowrap"
                  >
                    <span className="flex min-w-0 items-center gap-3.5 md:w-[240px] md:shrink-0">
                      <Avatar nome={p.nome} tamanho="md" className="!bg-surface-2 !text-ink-2" />
                      <span className="flex min-w-0 flex-col gap-px">
                        <b className="truncate text-sm">{p.nome}</b>
                        <span className="truncate text-xs text-muted">{p.cargo}</span>
                      </span>
                    </span>
                    <TipoPill tipo={p.tipo} className="md:w-[118px]" />
                    <span className="order-last w-full text-[13px] text-ink-2 md:order-none md:w-auto md:min-w-0 md:flex-1 md:truncate">{p.detalhe}</span>
                    <span className="text-xs text-muted md:w-20">{quando(p.enviadoEm)}</span>
                  </button>
                  {p.situacao === 'analise' ? (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={respondendo !== null}
                        onClick={() => responder(p, false)}
                        aria-label={`Reprovar pedido de ${p.nome}`}
                        title="Reprovar"
                        className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-line bg-surface text-danger hover:bg-danger-soft disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={respondendo !== null}
                        onClick={() => responder(p, true)}
                        aria-label={`Aprovar pedido de ${p.nome}`}
                        title="Aprovar"
                        className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <StatusPill situacao={p.situacao} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
