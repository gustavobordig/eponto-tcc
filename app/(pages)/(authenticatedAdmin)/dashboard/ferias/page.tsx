'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, List, Plus } from 'lucide-react';
import { Ferias } from '@/features/ferias/api';
import { useFeriasAdmin } from '@/features/ferias/hooks/useFeriasAdmin';
import { feriasParaEventos } from '@/features/ferias/lib/eventos';
import Calendario from '@/shared/ui/Calendario';
import ExcludeModal from '@/shared/ui/ExcludeModal';
import LoadingText from '@/shared/ui/LoadingText';
import Table from '@/shared/ui/Table';
import { Column } from '@/shared/types/ui';
import { showErrorToast } from '@/shared/lib/toast';
import { formatDate } from '@/shared/lib/format';

const colunasFerias: Column<Ferias>[] = [
  { key: 'dscFerias', label: 'Descrição', render: (item) => <b className="text-sm">{item.dscFerias}</b> },
  // A listagem devolve datIncioFerias (sic)
  { key: 'datIncioFerias', label: 'Início', render: (item) => formatDate(item.datIncioFerias ?? item.datInicioFerias) },
  { key: 'datFimFerias', label: 'Fim', type: 'date' },
];

export default function FeriasPage() {
  const { ferias, loading, excluir } = useFeriasAdmin();
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const eventos = useMemo(() => feriasParaEventos(ferias), [ferias]);

  const [feriasParaExcluir, setFeriasParaExcluir] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const confirmarExclusao = async () => {
    if (feriasParaExcluir === null) return;
    setExcluindo(true);
    await excluir(feriasParaExcluir);
    setExcluindo(false);
    setFeriasParaExcluir(null);
  };

  if (loading) {
    return <LoadingText title="Férias" />;
  }

  const alternador = (
    <div role="tablist" aria-label="Visualização" className="flex rounded-[9px] bg-[#e6e8ef] p-[3px] text-[13px] font-semibold">
      {([
        ['table', 'Lista', List],
        ['calendar', 'Calendário', CalendarDays],
      ] as const).map(([valor, rotulo, Icone]) => (
        <button
          key={valor}
          type="button"
          role="tab"
          aria-selected={view === valor}
          onClick={() => setView(valor)}
          className={`flex items-center gap-1.5 rounded-[7px] px-3.5 py-[7px] ${
            view === valor ? 'bg-white text-foreground shadow-[0_1px_2px_rgba(0,0,0,.08)]' : 'text-muted hover:text-foreground'
          }`}
        >
          <Icone className="h-4 w-4" />
          {rotulo}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold tracking-tight">Férias da empresa</h1>
          <p className="text-sm text-muted">
            Recessos e férias coletivas. Os pedidos de férias dos funcionários ficam em{' '}
            <Link href="/dashboard/solicitacoes" className="font-semibold text-primary hover:underline">
              Solicitações
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {alternador}
          <Link
            href="/adicionar-ferias"
            className="flex h-11 items-center gap-2 rounded-[10px] bg-primary px-[18px] text-sm font-bold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Cadastrar férias
          </Link>
        </div>
      </div>

      {view === 'table' ? (
        <Table
          data={ferias}
          title="Férias da empresa"
          semCabecalho
          columns={colunasFerias}
          handleDeleteClick={(item) =>
            item.idFerias === undefined
              ? showErrorToast('ID das férias não encontrado')
              : setFeriasParaExcluir(item.idFerias)
          }
        />
      ) : (
        <div className="h-[calc(100vh-12rem)] rounded-2xl bg-white p-4 shadow-card">
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
    </div>
  );
}
