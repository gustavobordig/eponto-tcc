'use client';

import { useState } from 'react';
import { useEventosCalendario } from '@/features/calendario/hooks/useEventosCalendario';
import CalendarioNavegavel from '@/features/calendario/components/CalendarioNavegavel';
import { FeriasModal } from '@/features/ferias/components/SolicitarFeriasModal';
import LoadModal from '@/shared/ui/LoadModal';
import LegendaCalendario from '@/features/calendario/components/LegendaCalendario';

export default function CalendarioPage() {
  const { eventos, loading, recarregar } = useEventosCalendario({ incluirMinhasFerias: true });
  const [isFeriasModalOpen, setIsFeriasModalOpen] = useState(false);

  if (loading) {
    return <LoadModal title="calendário" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        <button
          type="button"
          onClick={() => setIsFeriasModalOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark"
        >
          Solicitar férias
        </button>
      </div>
      <LegendaCalendario />
      <div className="h-[calc(100vh-14rem)] min-h-[32rem] rounded-2xl bg-white p-4 shadow-sm">
        <CalendarioNavegavel eventos={eventos} />
      </div>

      <FeriasModal
        isOpen={isFeriasModalOpen}
        onClose={() => setIsFeriasModalOpen(false)}
        onSuccess={recarregar}
      />
    </div>
  );
}
