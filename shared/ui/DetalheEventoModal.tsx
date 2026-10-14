'use client';

import { addDays, differenceInCalendarDays, isSameDay } from 'date-fns';
import { CalendarDays, Megaphone, Plane, PartyPopper } from 'lucide-react';
import { EventoCalendario } from '@/shared/ui/Calendario';
import { COR_EVENTO } from '@/shared/ui/CalendarioMensal';
import Modal, { BotaoModal } from '@/shared/ui/Modal';

const TIPO: Record<string, { rotulo: string; icone: typeof CalendarDays }> = {
  feriado: { rotulo: 'Feriado', icone: PartyPopper },
  ferias: { rotulo: 'Férias da empresa', icone: Plane },
  'minhas-ferias': { rotulo: 'Suas férias', icone: Plane },
  comunicado: { rotulo: 'Comunicado do RH', icone: Megaphone },
};

const dataLonga = (d: Date) => {
  const texto = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  return texto[0].toUpperCase() + texto.slice(1);
};

/** Detalhes de um evento do calendário ou dos "Próximos" da home. */
export default function DetalheEventoModal({ evento, onClose }: { evento: EventoCalendario | null; onClose: () => void }) {
  if (!evento) return null;

  const tipo = TIPO[evento.desc] ?? TIPO.comunicado;
  const Icone = tipo.icone;
  // O fim é exclusivo (dia seguinte ao último)
  const ultimo = addDays(evento.end, -1);
  const dias = differenceInCalendarDays(evento.end, evento.start);
  const quando = isSameDay(ultimo, evento.start)
    ? dataLonga(evento.start)
    : `${dataLonga(evento.start)} a ${dataLonga(ultimo).toLowerCase()} · ${dias} dias`;

  return (
    <Modal
      isOpen
      onClose={onClose}
      icone={<Icone className="h-5 w-5" />}
      titulo={evento.title}
      descricao={
        <span className={`mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${(COR_EVENTO[evento.desc] ?? COR_EVENTO.comunicado).chip}`}>
          {tipo.rotulo}
        </span>
      }
      rodape={<BotaoModal variante="secundario" onClick={onClose}>Fechar</BotaoModal>}
    >
      <div className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-muted" />
          {quando}
        </p>
        {evento.descricao && <p className="whitespace-pre-line text-sm leading-relaxed text-[#2b3252]">{evento.descricao}</p>}
      </div>
    </Modal>
  );
}
