'use client';

import { useEventosCalendario } from '@/features/calendario/hooks/useEventosCalendario';
import CalendarioNavegavel from '@/features/calendario/components/CalendarioNavegavel';
import LoadModal from '@/shared/ui/LoadModal';

export default function CalendarioAdminPage() {
  const { eventos, loading } = useEventosCalendario();

  if (loading) {
    return <LoadModal title="calendário" />;
  }

  return (
    <div className="h-screen p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-2rem)]">
        <CalendarioNavegavel eventos={eventos} />
      </div>
    </div>
  );
}
