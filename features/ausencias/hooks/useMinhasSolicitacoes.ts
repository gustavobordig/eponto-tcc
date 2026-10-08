import { useCallback, useEffect, useState } from 'react';
import { solicitacaoAusenciaService, SolicitacaoAusencia } from '@/features/ausencias/api';
import { showErrorToast } from '@/shared/lib/toast';
import { tokenUtils } from '@/shared/lib/token';

/** Solicitações de ausência do usuário logado. */
export function useMinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAusencia[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    const userId = tokenUtils.getId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await solicitacaoAusenciaService.obterSolicitacoesPorUsuario(Number(userId));
      if (response.sucesso) {
        setSolicitacoes(response.solicitacoes ?? []);
      } else {
        showErrorToast(response.mensagem || 'Erro ao carregar solicitações');
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      showErrorToast('Erro ao carregar solicitações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { solicitacoes, loading, recarregar: carregar };
}
