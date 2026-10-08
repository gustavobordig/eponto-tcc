import { useCallback, useEffect, useState } from 'react';
import { feedbackService, FeedbackData, SolicitacaoData } from '@/features/feedback/api';
import { avaliacaoDasEstrelas } from '@/features/feedback/avaliacao';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';
import { tokenUtils } from '@/shared/lib/token';

export interface RespostaFeedback {
  mensagemFeedback: string;
  /** De 1 a 5, como na tela */
  estrelas: number;
}

/** Solicitações de feedback e feedbacks enviados (painel admin). */
export function useFeedbackAdmin() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoData[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);

  const fetchSolicitacoes = useCallback(async () => {
    try {
      const response = await feedbackService.getAllSolicitacoes();
      setSolicitacoes(response.sucesso ? response.solicitacoesFeedback ?? [] : []);
    } catch (error) {
      showErrorToast('Erro ao carregar solicitações de feedback');
      console.error('Erro ao carregar solicitações:', error);
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const response = await feedbackService.getAllFeedbacks();
      setFeedbacks(response.sucesso ? response.feedbacks ?? [] : []);
    } catch (error) {
      showErrorToast('Erro ao carregar feedbacks');
      console.error('Erro ao carregar feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setFeedbacksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitacoes();
    fetchFeedbacks();
  }, [fetchSolicitacoes, fetchFeedbacks]);

  /** Grava o feedback e marca a solicitação como respondida. Devolve se deu certo. */
  const responder = useCallback(
    async (solicitacao: SolicitacaoData, resposta: RespostaFeedback) => {
      const userId = tokenUtils.getId();
      if (!userId) {
        showErrorToast('Usuário não encontrado');
        return false;
      }

      try {
        // Antes ia o id do admin como destinatário e nenhum autor
        const response = await feedbackService.createFeedback({
          idUsuarioFeedback: solicitacao.idUsuarioSolicitacao,
          idAutorFeedback: Number(userId),
          idSolicitacaoFeedback: solicitacao.idSolicitacaoFeedback,
          dataRealizacao: new Date().toISOString(),
          mensagemFeedback: resposta.mensagemFeedback,
          avaliacao: avaliacaoDasEstrelas(resposta.estrelas),
        });

        if (!response.sucesso) {
          showErrorToast(response.mensagem || 'Erro ao enviar feedback');
          return false;
        }

        showSuccessToast('Feedback enviado com sucesso!');
        fetchSolicitacoes();
        fetchFeedbacks();
        return true;
      } catch (error) {
        console.error('Erro ao enviar feedback:', error);
        showErrorToast('Erro ao enviar feedback. Tente novamente.');
        return false;
      }
    },
    [fetchSolicitacoes, fetchFeedbacks]
  );

  return { solicitacoes, feedbacks, loading, feedbacksLoading, responder };
}
