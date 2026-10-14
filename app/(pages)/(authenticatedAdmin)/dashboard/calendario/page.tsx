'use client';

import { useEventosCalendario } from '@/features/calendario/hooks/useEventosCalendario';
import CalendarioNavegavel from '@/features/calendario/components/CalendarioNavegavel';
import LoadModal from '@/shared/ui/LoadModal';
import LegendaCalendario from '@/features/calendario/components/LegendaCalendario';

export default function CalendarioAdminPage() {
  const { eventos, loading } = useEventosCalendario();

  if (loading) {
    return <LoadModal title="calendário" />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
      <LegendaCalendario semMinhasFerias />
      <div className="h-[calc(100vh-14rem)] min-h-[32rem] rounded-2xl bg-surface p-4 shadow-sm">
        <CalendarioNavegavel eventos={eventos} />
      </div>
    </div>
  );
}
