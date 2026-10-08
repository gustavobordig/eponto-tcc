import { useCallback, useEffect, useState } from 'react';
import { solicitacaoAusenciaService, SolicitacaoAusencia } from '@/features/ausencias/api';
import { userService } from '@/features/usuarios/api';
import { showErrorToast } from '@/shared/lib/toast';

export interface SolicitacaoComUsuario extends SolicitacaoAusencia {
  nomeUsuario?: string;
}

/** Todas as solicitações de ausência, com o nome de quem pediu (painel admin). */
export function useSolicitacoesAusencia() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoComUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const [response, usuarios] = await Promise.all([
        solicitacaoAusenciaService.listarSolicitacoes(),
        // Uma chamada para todos os nomes, e não uma por solicitação
        userService.getAll().catch(() => null),
      ]);

      if (!response.sucesso) {
        showErrorToast(response.mensagem || 'Erro ao carregar solicitações');
        return;
      }

      const nomes = new Map(usuarios?.usuarios?.map((u) => [u.idUsuario, u.nome]) ?? []);
      setSolicitacoes(
        (response.solicitacoes ?? []).map((s) => ({
          ...s,
          nomeUsuario: nomes.get(s.idUsuario) ?? 'Usuário não encontrado',
        }))
      );
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
