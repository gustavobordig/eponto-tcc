import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { SolicitacaoAusencia } from '@/features/ausencias/api';
import { SolicitacaoFerias } from '@/features/ferias/api';
import { SolicitacaoAlteracao } from '@/features/ponto/api';
import { ETAPAS_DO_DIA } from '@/features/ponto/etapas';
import { Situacao, situacaoDoStatus } from '@/shared/ui/StatusPill';

export type TipoPedido = 'ajuste' | 'atestado' | 'folga' | 'outro' | 'ferias';

/** Pedido do funcionário ao RH, de qualquer tipo, num formato só para a lista. */
export interface Pedido {
  chave: string;
  tipo: TipoPedido;
  titulo: string;
  detalhe: string;
  enviadoEm: Date | null;
  situacao: Situacao;
  anexo?: string;
  observacao?: string;
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
    tipo,
    titulo: TITULO[tipo],
    detalhe: [periodo(inicio, fim), s.linkArquivo ? 'com anexo' : observacao].filter(Boolean).join(' · '),
    enviadoEm: data(s.dataSolicitacao),
    situacao: situacaoDoStatus(s.statusSolicitacao),
    anexo: s.linkArquivo,
    observacao,
  };
}

export function deAjuste(s: SolicitacaoAlteracao): Pedido {
  const dia = ddmm(new Date(s.dataRegistroAlteracao));
  const itens = s.itens
    .map((i) => `${ETAPAS_DO_DIA.find((e) => e.tipo === i.idTipoRegistroPonto)?.label ?? 'Marcação'} ${format(new Date(i.horaRegistro), 'HH:mm')}`)
    .join(', ');
  return {
    chave: `ajuste-${s.idSolicitacao}`,
    tipo: 'ajuste',
    titulo: TITULO.ajuste,
    detalhe: itens ? `${dia} · ${itens}` : dia,
    enviadoEm: data(s.dataSolicitacao),
    situacao: situacaoDoStatus(s.statusSolicitacao),
    observacao: s.justificativa,
  };
}

export function deFerias(s: SolicitacaoFerias): Pedido {
  const inicio = new Date(s.datInicioFerias);
  const fim = new Date(s.datFimFerias);
  const dias = differenceInCalendarDays(addDays(fim, 1), inicio);
  return {
    chave: `ferias-${s.idSolicFerias}`,
    tipo: 'ferias',
    titulo: TITULO.ferias,
    detalhe: `${periodo(inicio, fim)} · ${dias} ${dias === 1 ? 'dia' : 'dias'}`,
    enviadoEm: data(s.datSolicitacaoFerias),
    situacao: situacaoDoStatus(s.indSituacao),
    observacao: s.dscObservacao,
  };
}
