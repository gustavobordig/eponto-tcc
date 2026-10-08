'use client';

import { useMemo, useState } from 'react';
import { Ferias, SolicitacaoFerias } from '@/features/ferias/api';
import { useFeriasAdmin } from '@/features/ferias/hooks/useFeriasAdmin';
import { feriasParaEventos } from '@/features/ferias/lib/eventos';
import { isPendente, SituacaoBadge } from '@/features/ferias/status';
import DecisaoSolicitacaoModal from '@/features/ferias/components/admin/DecisaoSolicitacaoModal';
import Calendario from '@/shared/ui/Calendario';
import Container from '@/shared/ui/Container';
import ExcludeModal from '@/shared/ui/ExcludeModal';
import LoadingText from '@/shared/ui/LoadingText';
import Table from '@/shared/ui/Table';
import { Column } from '@/shared/types/ui';
import { showErrorToast } from '@/shared/lib/toast';
import { formatDate } from '@/shared/lib/format';

const colunasFerias: Column<Ferias>[] = [
  { key: 'dscFerias', label: 'Descrição' },
  // A listagem devolve datIncioFerias (sic)
  { key: 'datIncioFerias', label: 'Data Início', render: (item) => formatDate(item.datIncioFerias ?? item.datInicioFerias) },
  { key: 'datFimFerias', label: 'Data Fim', type: 'date' },
];

const colunasSolicitacoes: Column<SolicitacaoFerias>[] = [
  { key: 'nomeUsuario', label: 'Nome do usuário' },
  { key: 'dscObservacao', label: 'Descrição da Solicitação' },
  { key: 'datInicioFerias', label: 'Data de Início', type: 'date' },
  { key: 'datFimFerias', label: 'Data Final', type: 'date' },
  { key: 'datSolicitacaoFerias', label: 'Data da Solicitação', type: 'datetime' },
  { key: 'indSituacao', label: 'Status', type: 'custom', render: (item) => <SituacaoBadge situacao={item.indSituacao} /> },
];

export default function FeriasPage() {
  const { ferias, solicitacoes, loading, excluir, decidir } = useFeriasAdmin();
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const eventos = useMemo(() => feriasParaEventos(ferias), [ferias]);

  const [feriasParaExcluir, setFeriasParaExcluir] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [decisao, setDecisao] = useState<{ solicitacao: SolicitacaoFerias; aprovar: boolean } | null>(null);
  const [decidindo, setDecidindo] = useState(false);

  const confirmarExclusao = async () => {
    if (feriasParaExcluir === null) return;
    setExcluindo(true);
    await excluir(feriasParaExcluir);
    setExcluindo(false);
    setFeriasParaExcluir(null);
  };

  const confirmarDecisao = async () => {
    if (!decisao) return;
    setDecidindo(true);
    const ok = await decidir(decisao.solicitacao, decisao.aprovar);
    setDecidindo(false);
    if (ok) setDecisao(null);
  };

  if (loading) {
    return <LoadingText title="Férias" />;
  }

  const botaoView = (valor: typeof view, label: string) => (
    <button
      onClick={() => setView(valor)}
      className={`px-4 py-2 rounded-md ${
        view === valor ? 'bg-[#002085] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Container className="py-8">
      <div className="flex justify-end mb-4 gap-2">
        {botaoView('table', 'Tabela')}
        {botaoView('calendar', 'Calendário')}
      </div>

      {view === 'table' ? (
        <div className="flex flex-col gap-4">
          <Table
            data={ferias}
            title="Férias"
            columns={colunasFerias}
            handleDeleteClick={(item) =>
              item.idFerias === undefined
                ? showErrorToast('ID das férias não encontrado')
                : setFeriasParaExcluir(item.idFerias)
            }
            addItemHref="/adicionar-ferias"
          />
          <Table
            data={solicitacoes}
            title="Solicitações de Férias"
            columns={colunasSolicitacoes}
            renderActions={(item) =>
              isPendente(item.indSituacao) ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDecisao({ solicitacao: item, aprovar: true })}
                    className="text-green-600 hover:text-green-900 font-medium"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => setDecisao({ solicitacao: item, aprovar: false })}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    Reprovar
                  </button>
                </div>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-12rem)]">
          <Calendario
            events={eventos}
            mensagemVazio="Não existem férias para este período"
            eventPropGetter={(event) => ({ className: event.desc })}
          />
        </div>
      )}

      {feriasParaExcluir !== null && (
        <ExcludeModal
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir estas férias? Esta ação não pode ser desfeita."
          onCancel={() => setFeriasParaExcluir(null)}
          onConfirm={confirmarExclusao}
          loading={excluindo}
        />
      )}

      <DecisaoSolicitacaoModal
        solicitacao={decisao?.solicitacao ?? null}
        aprovar={decisao?.aprovar ?? true}
        loading={decidindo}
        onConfirm={confirmarDecisao}
        onCancel={() => setDecisao(null)}
      />
    </Container>
  );
}
