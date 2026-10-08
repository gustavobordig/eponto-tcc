import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { registroPontoService, RegistroPonto } from '@/features/ponto/api';
import { ETAPAS_DO_DIA, EtapaDoDia } from '@/features/ponto/etapas';
import { tokenUtils } from '@/shared/lib/token';

const FUSO = 'America/Sao_Paulo';

export interface PontoMarcado {
  etapa: EtapaDoDia;
  /** HH:mm */
  hora: string;
}

/** Pontos de hoje do usuário logado e o registro do próximo. */
export function usePontosDoDia() {
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    const idUsuario = tokenUtils.getId();
    if (!idUsuario) {
      setCarregando(false);
      return;
    }
    try {
      const response = await registroPontoService.listarPorUsuario(Number(idUsuario));
      const hoje = format(new Date(), 'yyyy-MM-dd');
      setRegistros((response.registros ?? []).filter((r) => r.dataRegistro.split('T')[0] === hoje));
    } catch (error) {
      console.error('Erro ao buscar os pontos do dia:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const marcados = useMemo<PontoMarcado[]>(
    () =>
      ETAPAS_DO_DIA.flatMap((etapa) => {
        const registro = registros.find((r) => r.idTipoRegistroPonto === etapa.tipo);
        return registro ? [{ etapa, hora: format(new Date(registro.horaRegistro), 'HH:mm') }] : [];
      }),
    [registros]
  );

  // Próxima etapa ainda não marcada, na ordem do dia
  const proxima = ETAPAS_DO_DIA.find((etapa) => !marcados.some((m) => m.etapa.tipo === etapa.tipo)) ?? null;

  /** Grava a próxima marcação. Antes o modal gravava todo ponto como Entrada (tipo 1). */
  const registrar = useCallback(
    async (localizacao?: string) => {
      if (!proxima) return;
      const agora = new Date();
      await registroPontoService.inserir({
        idUsuario: Number(tokenUtils.getId()),
        horaRegistro: formatInTimeZone(agora, FUSO, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
        dataRegistro: formatInTimeZone(agora, FUSO, 'yyyy-MM-dd'),
        idTipoRegistroPonto: proxima.tipo,
        localizacao,
      });
      await recarregar();
    },
    [proxima, recarregar]
  );

  return { marcados, proxima, carregando, registrar, recarregar };
}
