'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { solicitacaoAusenciaService } from '@/features/ausencias/api';
import { cargoService } from '@/features/cargos/api';
import { feriasService } from '@/features/ferias/api';
import { registroPontoService } from '@/features/ponto/api';
import { deAjuste, deAusencia, deFerias, Pedido } from '@/features/solicitacoes/pedidos';
import { userService } from '@/features/usuarios/api';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';

interface FilaAprovacao {
  pedidos: Pedido[];
  carregando: boolean;
  falhou: boolean;
  /** Pendentes por rota: alimenta os contadores do menu */
  pendentes: { total: number; ajustes: number };
  decidir: (pedido: Pedido, aprovar: boolean) => Promise<boolean>;
  recarregar: () => Promise<void>;
}

const Contexto = createContext<FilaAprovacao | null>(null);

const MENSAGEM: Record<Pedido['origem'], [string, string]> = {
  ajuste: ['Ajuste aprovado', 'Ajuste reprovado'],
  ausencia: ['Ausência aprovada', 'Ausência reprovada'],
  ferias: ['Férias aprovadas', 'Férias reprovadas'],
};

/**
 * Ajustes de ponto, ausências e férias de todos os funcionários numa fila só.
 * Fica no layout do painel para o menu e as telas usarem a mesma busca.
 */
export function FilaAprovacaoProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  const recarregar = useCallback(async () => {
    const [ajustes, ausencias, ferias] = await Promise.allSettled([
      registroPontoService.listarSolicitacoesAlteracao(),
      solicitacaoAusenciaService.listarSolicitacoes(),
      feriasService.buscarSolicitacoes(),
    ]);

    const lista: Pedido[] = [
      ...(ajustes.status === 'fulfilled' ? (ajustes.value.solicitacoes ?? []).map(deAjuste) : []),
      ...(ausencias.status === 'fulfilled' ? (ausencias.value.solicitacoes ?? []).map(deAusencia) : []),
      ...(ferias.status === 'fulfilled' ? ferias.value.map(deFerias) : []),
    ];
    lista.sort((a, b) => (b.enviadoEm?.getTime() ?? 0) - (a.enviadoEm?.getTime() ?? 0));
    setPedidos(lista);
    // Algumas rotas respondem 404 quando a lista está vazia
    setFalhou(
      [ajustes, ausencias, ferias].some((r) => r.status === 'rejected' && !(isAxiosError(r.reason) && r.reason.response?.status === 404))
    );
    setCarregando(false);
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const decidir = useCallback(
    async (pedido: Pedido, aprovar: boolean) => {
      try {
        if (pedido.origem === 'ajuste') await registroPontoService.validarSolicitacao(pedido.id, aprovar);
        else if (pedido.origem === 'ausencia') {
          const resposta = await solicitacaoAusenciaService.responderSolicitacao(pedido.id, aprovar);
          if (!resposta.sucesso) throw new Error(resposta.mensagem ?? 'Falha ao responder');
        } else await feriasService.atualizarStatusSolicitacao(pedido.id, aprovar ? 1 : 2);
        showSuccessToast(MENSAGEM[pedido.origem][aprovar ? 0 : 1]);
        await recarregar();
        return true;
      } catch (error) {
        console.error('Erro ao responder solicitação:', error);
        showErrorToast(`Não foi possível ${aprovar ? 'aprovar' : 'reprovar'}. Tente novamente.`);
        return false;
      }
    },
    [recarregar]
  );

  const pendentes = useMemo(() => {
    const emAnalise = pedidos.filter((p) => p.situacao === 'analise');
    return { total: emAnalise.length, ajustes: emAnalise.filter((p) => p.origem === 'ajuste').length };
  }, [pedidos]);

  const valor = useMemo(
    () => ({ pedidos, carregando, falhou, pendentes, decidir, recarregar }),
    [pedidos, carregando, falhou, pendentes, decidir, recarregar]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/**
 * Nome e cargo de cada funcionário, para a tela da fila. Fica fora do
 * provider para as outras telas do painel não buscarem a lista de usuários à toa.
 */
export function usePessoas() {
  const [pessoas, setPessoas] = useState<Map<number, { nome: string; cargo: string }>>(new Map());

  useEffect(() => {
    Promise.allSettled([userService.getAll(), cargoService.listar()]).then(([usuarios, cargos]) => {
      const nomesCargos = new Map(cargos.status === 'fulfilled' ? (cargos.value.cargos ?? []).map((c) => [c.idCargo, c.nomeCargo]) : []);
      const lista = usuarios.status === 'fulfilled' ? usuarios.value.usuarios ?? [] : [];
      setPessoas(new Map(lista.map((u) => [u.idUsuario, { nome: u.nome, cargo: nomesCargos.get(u.idCargo) ?? '' }])));
    });
  }, []);

  return pessoas;
}

export function useFilaAprovacao() {
  const fila = useContext(Contexto);
  if (!fila) throw new Error('useFilaAprovacao precisa do FilaAprovacaoProvider');
  return fila;
}
