import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SolicitacaoAusencia } from '@/features/ausencias/api';
import { SolicitacaoFerias } from '@/features/ferias/api';
import { SolicitacaoAlteracao } from '@/features/ponto/api';
import { ETAPAS_DO_DIA } from '@/features/ponto/etapas';
import { Situacao, situacaoDoStatus } from '@/shared/ui/StatusPill';

export type TipoPedido = 'ajuste' | 'atestado' | 'folga' | 'outro' | 'ferias';

/** Rota da API que responde o pedido */
export type OrigemPedido = 'ajuste' | 'ausencia' | 'ferias';

/** Dado do pedido em destaque no painel RH ("Dia: Sex, 09/10") */
export interface CampoPedido {
  rotulo: string;
  valor: string;
  /** Horário, em fonte mono */
  hora?: boolean;
}

/** Pedido do funcionário ao RH, de qualquer tipo, num formato só para a lista. */
export interface Pedido {
  chave: string;
  id: number;
  origem: OrigemPedido;
  idUsuario: number;
  tipo: TipoPedido;
  titulo: string;
  detalhe: string;
  enviadoEm: Date | null;
  situacao: Situacao;
  anexo?: string;
  observacao?: string;
  /** Comentário de quem aprovou ou reprovou */
  resposta?: string;
  campos: CampoPedido[];
}

/**
 * A API de ausências não tem campo de tipo: ele vai no começo da mensagem,
 * como "[Folga] motivo". Pedidos antigos, sem o prefixo, contam como atestado
 * se tiverem anexo.
 */
const PREFIXO = /^\[(Atestado|Folga|Outro)\]\s*/;

export const TIPOS_AUSENCIA = { atestado: 'Atestado', folga: 'Folga', outro: 'Outro' } as const;
export type TipoAusencia = keyof typeof TIPOS_AUSENCIA;

export const mensagemComTipo = (tipo: TipoAusencia, observacao: string) => `[${TIPOS_AUSENCIA[tipo]}] ${observacao}`.trim();

const TITULO: Record<TipoPedido, string> = {
  ajuste: 'Ajuste de ponto',
  atestado: 'Atestado médico',
  folga: 'Folga',
  outro: 'Ausência',
  ferias: 'Férias',
};

const data = (valor?: string | null) => (valor ? new Date(valor) : null);
const ddmm = (d: Date) => format(d, 'dd/MM');
/** "Sex, 09/10" */
const diaDaSemana = (d: Date) => {
  const dia = format(d, 'EEEE', { locale: ptBR }).slice(0, 3);
  return `${dia[0].toUpperCase()}${dia.slice(1)}, ${ddmm(d)}`;
};
const qtdDias = (inicio: Date, fim: Date) => {
  const dias = differenceInCalendarDays(addDays(fim, 1), inicio);
  return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
};
/** A API devolve 0001-01-01 quando a hora não foi informada */
const hora = (valor: string) => (valor.startsWith('0001-01-01') ? '—' : format(new Date(valor), 'HH:mm'));
const periodo = (inicio: Date, fim: Date) =>
  format(inicio, 'yyyy-MM-dd') === format(fim, 'yyyy-MM-dd')
    ? ddmm(inicio)
    : `${format(inicio, 'dd')}${inicio.getMonth() === fim.getMonth() ? '' : `/${format(inicio, 'MM')}`} a ${ddmm(fim)}`;

export function deAusencia(s: SolicitacaoAusencia): Pedido {
  const rotulo = PREFIXO.exec(s.mensagemSolicitacao ?? '')?.[1];
  const tipo: TipoPedido = rotulo ? (rotulo.toLowerCase() as TipoAusencia) : s.linkArquivo ? 'atestado' : 'outro';
  const inicio = new Date(s.dataInicioAusencia);
  const fim = new Date(s.dataFimAusencia);
  const observacao = (s.mensagemSolicitacao ?? '').replace(PREFIXO, '');
  return {
    chave: `ausencia-${s.idSolicitacaoAusencia}`,
    id: s.idSolicitacaoAusencia,
    origem: 'ausencia',
    idUsuario: s.idUsuario,
    tipo,
    titulo: TITULO[tipo],
    detalhe: [periodo(inicio, fim), s.linkArquivo ? 'com anexo' : observacao].filter(Boolean).join(' · '),
    enviadoEm: data(s.dataSolicitacao),
    situacao: situacaoDoStatus(s.statusSolicitacao),
    anexo: s.linkArquivo,
    observacao,
    resposta: s.observacaoResposta ?? undefined,
    campos: [
      { rotulo: 'Início', valor: diaDaSemana(inicio) },
      { rotulo: 'Fim', valor: diaDaSemana(fim) },
      { rotulo: 'Duração', valor: qtdDias(inicio, fim) },
      { rotulo: 'Anexo', valor: s.linkArquivo ? 'Sim' : 'Não' },
    ],
  };
}

export function deAjuste(s: SolicitacaoAlteracao): Pedido {
  const dia = ddmm(new Date(s.dataRegistroAlteracao));
  const etapa = (tipo: number) => ETAPAS_DO_DIA.find((e) => e.tipo === tipo)?.label ?? 'Marcação';
  const itens = s.itens.map((i) => `${etapa(i.idTipoRegistroPonto)} ${hora(i.horaRegistro)}`).join(', ');
  return {
    chave: `ajuste-${s.idSolicitacao}`,
    id: s.idSolicitacao,
    origem: 'ajuste',
    idUsuario: s.idSolicitante,
    tipo: 'ajuste',
    titulo: TITULO.ajuste,
    detalhe: itens ? `${dia} · ${itens}` : dia,
    enviadoEm: data(s.dataSolicitacao),
    situacao: situacaoDoStatus(s.statusSolicitacao),
    observacao: s.justificativa,
    resposta: s.observacaoResposta ?? undefined,
    campos: [
      { rotulo: 'Dia', valor: diaDaSemana(new Date(s.dataRegistroAlteracao)) },
      ...s.itens.map((i) => ({ rotulo: etapa(i.idTipoRegistroPonto), valor: hora(i.horaRegistro), hora: true })),
    ],
  };
}

export function deFerias(s: SolicitacaoFerias): Pedido {
  const inicio = new Date(s.datInicioFerias);
  const fim = new Date(s.datFimFerias);
  return {
    chave: `ferias-${s.idSolicFerias}`,
    id: s.idSolicFerias,
    origem: 'ferias',
    idUsuario: s.idUsuario,
    tipo: 'ferias',
    titulo: TITULO.ferias,
    detalhe: `${periodo(inicio, fim)} · ${qtdDias(inicio, fim)}`,
    enviadoEm: data(s.datSolicitacaoFerias),
    situacao: situacaoDoStatus(s.indSituacao),
    observacao: s.dscObservacao,
    resposta: s.observacaoResposta ?? undefined,
    campos: [
      { rotulo: 'Início', valor: diaDaSemana(inicio) },
      { rotulo: 'Fim', valor: diaDaSemana(fim) },
      { rotulo: 'Duração', valor: qtdDias(inicio, fim) },
    ],
  };
}
