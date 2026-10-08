import { Ferias } from '@/features/ferias/api';
import { EventoCalendario } from '@/shared/ui/Calendario';

/** Cada período de férias vira início, último dia e a faixa entre eles. */
export function feriasParaEventos(lista: Ferias[]): EventoCalendario[] {
  const datasPorDescricao = lista.reduce((acc: Record<string, Date[]>, item) => {
    const inicio = item.datInicioFerias ?? item.datIncioFerias;
    if (!inicio || !item.datFimFerias) return acc;
    const chave = item.dscFerias || item.dscObservacao || `Férias ${item.idFerias ?? ''}`.trim();
    acc[chave] = [...(acc[chave] ?? []), new Date(inicio), new Date(item.datFimFerias)];
    return acc;
  }, {});

  return Object.entries(datasPorDescricao).flatMap(([descricao, datas]) => {
    const ordenadas = [...datas].sort((a, b) => a.getTime() - b.getTime());
    const inicio = ordenadas[0];
    const fim = ordenadas[ordenadas.length - 1];
    const eventos: EventoCalendario[] = [
      { id: `${descricao}-inicio`, title: `Início - ${descricao}`, start: inicio, end: inicio, desc: 'ferias' },
      { id: `${descricao}-fim`, title: `Último dia - ${descricao}`, start: fim, end: fim, desc: 'ferias' },
    ];
    if (inicio.getTime() !== fim.getTime()) {
      eventos.push({ id: `${descricao}-periodo`, title: '', start: inicio, end: fim, desc: 'ferias' });
    }
    return eventos;
  });
}
