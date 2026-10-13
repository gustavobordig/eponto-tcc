'use client';

import FilaSolicitacoes from '@/features/solicitacoes/components/admin/FilaSolicitacoes';

export default function SolicitacoesAusenciaPage() {
  return <FilaSolicitacoes titulo="Ausências" tipos={['atestado', 'folga', 'outro']} />;
}
