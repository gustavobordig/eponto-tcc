import { useCallback, useEffect, useState } from 'react';
import { Ferias, feriasService } from '@/features/ferias/api';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';

/** Férias da empresa (painel admin). Os pedidos dos funcionários ficam na fila de solicitações. */
export function useFeriasAdmin() {
  const [ferias, setFerias] = useState<Ferias[]>([]);
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

  useEffect(() => {
    fetchFerias();
  }, [fetchFerias]);

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

  return { ferias, loading, excluir };
}
