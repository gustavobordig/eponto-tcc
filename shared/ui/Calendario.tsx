'use client';

import { Calendar, CalendarProps, dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
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
}

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
