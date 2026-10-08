import { useCallback, useEffect, useState } from 'react';
import { calendarioService } from '@/features/calendario/api';
import { feriasService } from '@/features/ferias/api';
import { tokenUtils } from '@/shared/lib/token';
import { EventoCalendario } from '@/shared/ui/Calendario';

/**
 * Feriados e férias gerais do calendário. Com `incluirMinhasFerias`, junta as
 * férias do usuário logado (se essa parte falhar, mostra só o calendário).
 */
export function useEventosCalendario({ incluirMinhasFerias = false } = {}) {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const dados = await calendarioService.buscarCalendario();
      const eventosCalendario: EventoCalendario[] = dados.dias.map((item, index) => ({
        id: index,
        title: item.dscEvento,
        start: new Date(item.datEvento),
        end: new Date(item.datEvento),
        desc: item.tipoEvento === 1 ? 'feriado' : 'ferias',
      }));

      const idUsuario = tokenUtils.getId();
      if (!incluirMinhasFerias || !idUsuario) {
        setEventos(eventosCalendario);
        return;
      }

      try {
        const minhasFerias = await feriasService.buscarFeriasPorUsuario(Number(idUsuario));
        setEventos([
          ...eventosCalendario,
          ...minhasFerias.map((ferias, index) => ({
            id: `ferias-usuario-${index}`,
            title: `Minhas Férias - ${ferias.dscFerias}`,
            start: new Date(ferias.datIncioFerias ?? ferias.datInicioFerias ?? ''),
            end: new Date(ferias.datFimFerias),
            desc: 'minhas-ferias',
          })),
        ]);
      } catch (error) {
        console.error('Erro ao carregar férias do usuário:', error);
        setEventos(eventosCalendario);
      }
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
    } finally {
      setLoading(false);
    }
  }, [incluirMinhasFerias]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { eventos, loading, recarregar: carregar };
}
