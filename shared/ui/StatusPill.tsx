/** Situação de pedidos (0 em análise, 1 aprovada, 2 reprovada) e de cadastros (ativo/inativo). */
export type Situacao = 'analise' | 'aprovada' | 'reprovada' | 'ativo' | 'inativo';

const ESTILO: Record<Situacao, [string, string]> = {
  analise: ['Em análise', 'bg-warn-soft text-warn-ink'],
  aprovada: ['Aprovada', 'bg-ok-soft text-ok-ink'],
  reprovada: ['Reprovada', 'bg-danger-soft text-danger-ink'],
  ativo: ['Ativo', 'bg-ok-soft text-ok-ink'],
  inativo: ['Inativo', 'bg-surface-2 text-muted'],
};

/** Status 0/1/2 das solicitações da API */
export const situacaoDoStatus = (status: number): Situacao => (status === 1 ? 'aprovada' : status === 2 ? 'reprovada' : 'analise');

export default function StatusPill({ situacao, texto, className = '' }: { situacao: Situacao; texto?: string; className?: string }) {
  const [padrao, classe] = ESTILO[situacao];
  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${classe} ${className}`}>
      {texto ?? padrao}
    </span>
  );
}
