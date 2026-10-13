import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { solicitacaoAusenciaService } from '@/features/ausencias/api';
import { feriasService } from '@/features/ferias/api';
import { registroPontoService } from '@/features/ponto/api';
import { deAjuste, deAusencia, deFerias, Pedido } from '@/features/solicitacoes/pedidos';
import { tokenUtils } from '@/shared/lib/token';

/**
 * Ausências, ajustes de ponto e férias do usuário logado, do mais recente ao
 * mais antigo. Se uma das listas falhar, mostra as outras.
 */
export function useMeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    const id = Number(tokenUtils.getId());
    if (!id) {
      setCarregando(false);
      return;
    }
    const [ausencias, ajustes, ferias] = await Promise.allSettled([
      solicitacaoAusenciaService.obterSolicitacoesPorUsuario(id),
      registroPontoService.listarMinhasSolicitacoes(id),
      feriasService.buscarSolicitacoesPorUsuario(id),
    ]);
    const lista: Pedido[] = [
      ...(ausencias.status === 'fulfilled' ? (ausencias.value.solicitacoes ?? []).map(deAusencia) : []),
      ...(ajustes.status === 'fulfilled' ? (ajustes.value.solicitacoes ?? []).map(deAjuste) : []),
      ...(ferias.status === 'fulfilled' ? ferias.value.map(deFerias) : []),
    ];
    lista.sort((a, b) => (b.enviadoEm?.getTime() ?? 0) - (a.enviadoEm?.getTime() ?? 0));
    setPedidos(lista);
    // Algumas rotas respondem 404 quando a lista está vazia
    setFalhou([ausencias, ajustes, ferias].some((r) => r.status === 'rejected' && !(isAxiosError(r.reason) && r.reason.response?.status === 404)));
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const emAnalise = pedidos.filter((p) => p.situacao === 'analise').length;
  return { pedidos, carregando, falhou, emAnalise, recarregar: carregar };
}
