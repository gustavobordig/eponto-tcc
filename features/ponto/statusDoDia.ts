import { PontoMarcado } from '@/features/ponto/hooks/usePontosDoDia';

export type SituacaoDoDia = 'nao-iniciado' | 'trabalhando' | 'almoco' | 'encerrado';

export interface StatusDoDia {
  situacao: SituacaoDoDia;
  /** "Trabalhando desde 08:02" */
  texto: string;
  /** Minutos trabalhados hoje até `agora` */
  minutosTrabalhados: number;
}

const emMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Situação do dia a partir das marcações: trabalhando, em almoço ou encerrado,
 * e as horas trabalhadas (entrada→almoço + volta→saída, contando até agora o
 * trecho em aberto).
 */
export function statusDoDia(marcados: PontoMarcado[], agora: Date): StatusDoDia {
  const hora = (tipo: number) => marcados.find((m) => m.etapa.tipo === tipo)?.hora;
  const [entrada, almoco, volta, saida] = [1, 2, 3, 4].map(hora);
  const minutoAtual = agora.getHours() * 60 + agora.getMinutes();

  const trecho = (inicio?: string, fim?: string) =>
    inicio ? Math.max(0, (fim ? emMinutos(fim) : minutoAtual) - emMinutos(inicio)) : 0;
  // Sem o início do almoço, o primeiro trecho vai até a saída (ou até agora)
  const primeiroTrecho = entrada ? trecho(entrada, almoco ?? saida) : 0;
  const total = primeiroTrecho + (volta ? trecho(volta, saida) : 0);

  if (saida) return { situacao: 'encerrado', texto: `Expediente encerrado às ${saida}`, minutosTrabalhados: total };
  if (almoco && !volta) return { situacao: 'almoco', texto: `Em almoço desde ${almoco}`, minutosTrabalhados: total };
  if (entrada) return { situacao: 'trabalhando', texto: `Trabalhando desde ${entrada}`, minutosTrabalhados: total };
  return { situacao: 'nao-iniciado', texto: 'Ponto não iniciado', minutosTrabalhados: 0 };
}

/** 205 → "3h25" */
export const horasCurtas = (minutos: number) => `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
