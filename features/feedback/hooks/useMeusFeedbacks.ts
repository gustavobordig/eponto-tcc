import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { feedbackService, FeedbackData, SolicitacaoData } from '@/features/feedback/api';
import { tokenUtils } from '@/shared/lib/token';

export interface Conversa {
  chave: string;
  /** Com quem é a conversa (o gestor); null quando a API não manda o nome */
  com: string | null;
  /** Pedido feito pelo usuário (quando a conversa começou por ele) */
  pedido: SolicitacaoData | null;
  /** Feedback recebido (resposta ao pedido ou espontâneo) */
  feedback: FeedbackData | null;
  ultimaData: Date;
}

/**
 * Pedidos de feedback e feedbacks recebidos pelo usuário logado, juntos como
 * conversas: cada pedido com a resposta dele, e os feedbacks espontâneos.
 */
export function useMeusFeedbacks() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const id = Number(tokenUtils.getId());
    if (!id) return setCarregando(false);
    // A API responde 404 quando a lista está vazia
    const vazio404 = (e: unknown) => {
      if (isAxiosError(e) && e.response?.status === 404) return null;
      throw e;
    };
    try {
      const [rp, rf] = await Promise.all([
        feedbackService.getSolicitacoesByUsuario(id).catch(vazio404),
        feedbackService.getFeedbacksByUsuario(id).catch(vazio404),
      ]);
      const pedidos = rp?.solicitacoesFeedback ?? [];
      const feedbacks = rf?.feedbacks ?? [];

      const lista: Conversa[] = pedidos.map((p) => {
        const resposta = feedbacks.find((f) => f.idSolicitacaoFeedback === p.idSolicitacaoFeedback) ?? null;
        return {
          chave: `pedido-${p.idSolicitacaoFeedback}`,
          com: resposta?.nomeAutorFeedback || p.nomeResponsavelFeedback || null,
          pedido: p,
          feedback: resposta,
          ultimaData: new Date(resposta?.dataRealizacao ?? p.dataSolicitacao),
        };
      });
      for (const f of feedbacks) {
        if (f.idSolicitacaoFeedback && pedidos.some((p) => p.idSolicitacaoFeedback === f.idSolicitacaoFeedback)) continue;
        lista.push({
          chave: `feedback-${f.idFeedback}`,
          com: f.nomeAutorFeedback || null,
          pedido: null,
          feedback: f,
          ultimaData: new Date(f.dataRealizacao),
        });
      }
      lista.sort((a, b) => b.ultimaData.getTime() - a.ultimaData.getTime());
      setConversas(lista);
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { conversas, carregando, recarregar: carregar };
}
