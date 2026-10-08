'use client';

import { Calendar, CalendarProps, dateFnsLocalizer } from 'react-big-calendar';
import { addDays, format, getDay, parse, startOfDay, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import '@/app/styles/calendar.scss';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'pt-BR': ptBR },
});

const mensagens = (vazio: string) => ({
  next: 'Próximo',
  previous: 'Anterior',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  noEventsInRange: vazio,
  showMore: (total: number) => `+ ${total} eventos`,
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
});

export interface EventoCalendario {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  /** Vira a classe CSS do evento (feriado, ferias, minhas-ferias…) */
  desc: string;
  allDay?: boolean;
}

/**
 * Período de dias inteiros, com o último dia incluído. O calendário trata o
 * fim como exclusivo: sem isso, férias de 20 a 24 apareciam até o dia 23.
 */
export const diaInteiro = (inicio: Date, fim: Date = inicio) => ({
  start: startOfDay(inicio),
  end: addDays(startOfDay(fim), 1),
  allDay: true,
});

type Props = Omit<CalendarProps<EventoCalendario>, 'localizer' | 'messages' | 'culture'> & {
  mensagemVazio?: string;
};

/** react-big-calendar em português, com os estilos do app. */
export default function Calendario({ mensagemVazio = 'Não existe eventos para esse período', ...props }: Props) {
  return (
    <Calendar<EventoCalendario>
      localizer={localizer}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '100%' }}
      culture="pt-BR"
      messages={mensagens(mensagemVazio)}
      {...props}
    />
  );
}
