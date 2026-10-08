'use client';

import { useState } from 'react';
import { View } from 'react-big-calendar';
import Calendario, { EventoCalendario } from '@/shared/ui/Calendario';

/** Calendário em que clicar num dia ou evento abre a visão daquele dia. */
export default function CalendarioNavegavel({ eventos }: { eventos: EventoCalendario[] }) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const abrirDia = (dia: Date) => {
    setSelectedDate(dia);
    setDate(dia);
    setView('day');
  };

  return (
    <Calendario
      events={eventos}
      view={view}
      onView={setView}
      date={date}
      onNavigate={setDate}
      selectable
      onSelectSlot={({ start }) => abrirDia(start)}
      onSelectEvent={(event) => abrirDia(event.start)}
      eventPropGetter={(event) => ({ className: event.desc.toLowerCase() })}
      dayPropGetter={(dia) => {
        const selecionado = selectedDate?.toDateString() === dia.toDateString();
        return {
          className: selecionado ? 'rbc-selected-day' : '',
          style: { backgroundColor: selecionado ? '#e2e8f0' : 'transparent' },
        };
      }}
    />
  );
}
