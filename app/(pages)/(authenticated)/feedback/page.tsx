'use client';

import { useEffect, useState } from 'react';
import { Clock, MessageSquare, Plus } from 'lucide-react';
import { AVALIACOES, estrelasDaAvaliacao } from '@/features/feedback/avaliacao';
import RatingStars from '@/features/feedback/components/RatingStars';
import { useFeedback } from '@/features/feedback/FeedbackContext';
import { Conversa, useMeusFeedbacks } from '@/features/feedback/hooks/useMeusFeedbacks';
import Avatar from '@/shared/ui/Avatar';

const quando = (d: Date) => {
  const hoje = new Date();
  if (d.toDateString() === hoje.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === ontem.toDateString()) return 'ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const dataHora = (valor: string) =>
  new Date(valor).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·');

/** Etiqueta da avaliação: 4 e 5 estrelas viram elogio, 1 e 2 pedem atenção */
const etiqueta = (avaliacao: number) => {
  const estrelas = estrelasDaAvaliacao(avaliacao);
  const texto = AVALIACOES[estrelas - 1].label;
  if (estrelas >= 4) return ['Elogio', 'bg-ok-soft text-ok-ink'];
  if (estrelas <= 2) return [texto, 'bg-danger-soft text-danger-ink'];
  return [texto, 'bg-surface-2 text-muted'];
};

const primeiroNome = (c: Conversa) => c.com?.split(' ')[0] ?? null;

const tituloDa = (c: Conversa) => (c.pedido ? 'Pedido de feedback' : 'Feedback recebido');
const previaDa = (c: Conversa) =>
  c.feedback ? `${primeiroNome(c) ?? 'Gestor'}: ${c.feedback.mensagemFeedback}` : c.pedido ? `Você: ${c.pedido.mensagemSolicitacao}` : '';

/** Feedback com o gestor (1g): conversas à esquerda e a conversa aberta à direita. */
export default function FeedbackPage() {
  const { openFeedbackModal, registerRefresh } = useFeedback();
  const { conversas, carregando, recarregar } = useMeusFeedbacks();
  const [aberta, setAberta] = useState<string | null>(null);

  // O modal do layout cria o pedido; depois ele chama este recarregar
  useEffect(() => {
    registerRefresh(recarregar);
    return () => registerRefresh(null);
  }, [registerRefresh, recarregar]);

  const atual = conversas.find((c) => c.chave === aberta) ?? conversas[0] ?? null;
  const etiquetaAtual = atual?.feedback ? etiqueta(atual.feedback.avaliacao) : null;

  return (
    <div className="grid gap-5 lg:h-[calc(100vh-170px)] lg:min-h-[560px] lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card" aria-label="Conversas">
        <div className="flex items-center justify-between border-b border-surface-2 p-5">
          <h1 className="text-[17px] font-bold">Feedbacks</h1>
          <button
            type="button"
            onClick={openFeedbackModal}
            className="flex h-[34px] items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white hover:bg-primary-dark"
          >
            <Plus className="h-3.5 w-3.5" /> Novo
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {carregando ? (
            <p className="p-5 text-sm text-muted">Carregando…</p>
          ) : conversas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted">
              <MessageSquare className="h-6 w-6 text-subtle" />
              Você ainda não tem feedbacks. Peça um retorno ao seu gestor em “Novo”.
            </div>
          ) : (
            <ul>
              {conversas.map((c) => {
                const ativa = c.chave === atual?.chave;
                return (
                  <li key={c.chave}>
                    <button
                      type="button"
                      onClick={() => setAberta(c.chave)}
                      aria-current={ativa || undefined}
                      className={`flex w-full flex-col gap-1 border-b border-l-[3px] border-b-surface-2 px-5 py-4 text-left ${
                        ativa ? 'border-l-primary bg-primary-tint' : 'border-l-transparent hover:bg-background'
                      }`}
                    >
                      <span className="flex justify-between gap-2">
                        <b className="text-sm">{tituloDa(c)}</b>
                        <span className="shrink-0 text-xs text-muted">{quando(c.ultimaData)}</span>
                      </span>
                      <span className="truncate text-[13px] text-muted">{previaDa(c)}</span>
                      {c.pedido && !c.feedback && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-warn-ink">
                          <Clock className="h-3 w-3" /> {primeiroNome(c) ? `Aguardando ${primeiroNome(c)}` : 'Aguardando resposta'}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-card" aria-label="Conversa">
        {!atual ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted">Escolha uma conversa.</div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-surface-2 px-6 py-[18px]">
              <Avatar nome={atual.com ?? 'Gestor'} className="bg-foreground! text-white!" />
              <div className="flex flex-1 flex-col gap-px">
                <b className="text-[15px]">{tituloDa(atual)}</b>
                <span className="text-xs text-muted">com {atual.com ?? 'seu gestor'}</span>
              </div>
              {etiquetaAtual && <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${etiquetaAtual[1]}`}>{etiquetaAtual[0]}</span>}
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#fafbfd] p-6">
              {atual.pedido && (
                <div className="flex max-w-[70%] flex-col gap-1 self-end">
                  <p className="rounded-[14px] bg-primary px-4 py-3 text-sm leading-normal text-white">{atual.pedido.mensagemSolicitacao}</p>
                  <span className="self-end text-[11px] text-muted">Você · {dataHora(atual.pedido.dataSolicitacao)}</span>
                </div>
              )}
              {atual.feedback ? (
                <div className="flex max-w-[70%] flex-col gap-1 self-start">
                  <div className="flex flex-col gap-2 rounded-[14px] border border-line bg-white px-4 py-3 text-sm leading-normal">
                    <p>{atual.feedback.mensagemFeedback}</p>
                    <RatingStars avaliacao={atual.feedback.avaliacao} />
                  </div>
                  <span className="text-[11px] text-muted">
                    {atual.com ?? 'Gestor'} · {dataHora(atual.feedback.dataRealizacao)}
                  </span>
                </div>
              ) : (
                <p className="self-center rounded-full bg-warn-soft px-3 py-1.5 text-xs font-semibold text-warn-ink">
                  {atual.com ? `Aguardando a resposta de ${atual.com}` : 'Aguardando a resposta do seu gestor'}
                </p>
              )}
            </div>

            {/* A API não tem resposta dentro da conversa: o próximo passo é um novo pedido */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-2 px-6 py-4">
              <span className="text-[13px] text-muted">Quer conversar de novo sobre isso?</span>
              <button
                type="button"
                onClick={openFeedbackModal}
                className="flex h-[42px] items-center gap-2 rounded-[11px] bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark"
              >
                <MessageSquare className="h-4 w-4" /> Pedir novo feedback
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
