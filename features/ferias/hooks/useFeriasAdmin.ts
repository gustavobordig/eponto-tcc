import { useCallback, useEffect, useState } from 'react';
import { Ferias, feriasService, SolicitacaoFerias } from '@/features/ferias/api';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';

/** Férias cadastradas e solicitações de férias (painel admin). */
export function useFeriasAdmin() {
  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoFerias[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFerias = useCallback(async () => {
    try {
      setFerias(await feriasService.buscarFerias());
    } catch (error) {
      showErrorToast('Erro ao carregar férias');
      console.error('Erro ao carregar férias:', error);
      setFerias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSolicitacoes = useCallback(async () => {
    try {
      setSolicitacoes(await feriasService.buscarSolicitacoes());
    } catch (error) {
      showErrorToast('Erro ao carregar solicitação de férias');
      console.error('Erro ao carregar solicitação de férias:', error);
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFerias();
    fetchSolicitacoes();
  }, [fetchFerias, fetchSolicitacoes]);

  const excluir = useCallback(
    async (idFerias: number) => {
      try {
        await feriasService.excluirFerias(idFerias);
        showSuccessToast('Férias excluídas com sucesso!');
        fetchFerias();
      } catch (error) {
        showErrorToast('Erro ao excluir férias. Tente novamente.');
        console.error('Erro ao excluir férias:', error);
      }
    },
    [fetchFerias]
  );

  /** Aprova ou reprova. Devolve se deu certo. */
  const decidir = useCallback(
    async (solicitacao: SolicitacaoFerias, aprovar: boolean) => {
      const acao = aprovar ? 'aprovar' : 'reprovar';
      try {
        await feriasService.atualizarStatusSolicitacao(solicitacao.idSolicFerias, aprovar ? 1 : 2);
        showSuccessToast(`Férias ${aprovar ? 'aprovadas' : 'reprovadas'} com sucesso!`);
        fetchSolicitacoes();
        return true;
      } catch (error) {
        showErrorToast(`Erro ao ${acao} férias. Tente novamente.`);
        console.error(`Erro ao ${acao} férias:`, error);
        return false;
      }
    },
    [fetchSolicitacoes]
  );

  return { ferias, solicitacoes, loading, excluir, decidir };
}
