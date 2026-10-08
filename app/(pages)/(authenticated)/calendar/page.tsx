'use client';

import { useState } from 'react';
import { useEventosCalendario } from '@/features/calendario/hooks/useEventosCalendario';
import CalendarioNavegavel from '@/features/calendario/components/CalendarioNavegavel';
import { FeriasModal } from '@/features/ferias/components/SolicitarFeriasModal';
import Button from '@/shared/ui/Button';
import LoadModal from '@/shared/ui/LoadModal';

export default function CalendarioPage() {
  const { eventos, loading, recarregar } = useEventosCalendario({ incluirMinhasFerias: true });
  const [isFeriasModalOpen, setIsFeriasModalOpen] = useState(false);

  if (loading) {
    return <LoadModal title="calendário" />;
  }

  return (
    <div className="h-screen p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-2rem)]">
        <div className="flex justify-start my-4">
          <div className="w-[200px]">
            <Button text="Solicitar férias" onClick={() => setIsFeriasModalOpen(true)} />
          </div>
        </div>
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
