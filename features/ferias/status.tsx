/** indSituacao da solicitação de férias: 0 pendente, 1 aprovada, 2 reprovada */
export const SITUACAO = { pendente: 0, aprovada: 1, reprovada: 2 } as const;

const ESTILO: Record<number, { texto: string; classe: string }> = {
  1: { texto: 'Aprovado', classe: 'bg-green-100 text-green-800' },
  2: { texto: 'Reprovado', classe: 'bg-red-100 text-red-800' },
};
const PENDENTE = { texto: 'Pendente', classe: 'bg-yellow-100 text-yellow-800' };

export const isPendente = (situacao: number | undefined) =>
  situacao === undefined || situacao === SITUACAO.pendente;

export function SituacaoBadge({ situacao }: { situacao: number }) {
  const { texto, classe } = ESTILO[situacao] ?? PENDENTE;
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classe}`}>{texto}</span>
  );
}
