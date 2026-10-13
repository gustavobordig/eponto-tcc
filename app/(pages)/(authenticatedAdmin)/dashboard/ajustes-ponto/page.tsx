'use client';

import FilaSolicitacoes from '@/features/solicitacoes/components/admin/FilaSolicitacoes';

// Antes era uma tabela com o ID do solicitante e um select de decisão num modal
export default function AjustesPontoPage() {
  return <FilaSolicitacoes titulo="Ajustes de ponto" tipos={['ajuste']} />;
}
