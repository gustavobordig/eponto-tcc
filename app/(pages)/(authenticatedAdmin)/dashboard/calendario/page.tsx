'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format } from 'date-fns';
import { parse } from 'date-fns';
import { startOfWeek } from 'date-fns';
import { getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

//Custom Styles
import '@/app/styles/calendar.scss';

//Service
import { calendarioService } from '@/services/calendario';

//Components
import LoadModal from '@/app/components/molecules/LoadModal';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Evento {
  id: number;
  title: string;
  start: Date;
  end: Date;
  desc: string;
}

interface DiaEvento {
  datEvento: string;
  dscEvento: string;
  saldoHorasDiario: number;
  tipoEvento: number;
}

interface RespostaCalendario {
  sucesso: boolean;
  mensagem: string | null;
  dias: DiaEvento[];
}

export default function Calendario() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarCalendario = async () => {
      try {
        setLoading(true);
        const dados: RespostaCalendario = await calendarioService.buscarCalendario();
        console.log("dados: ", dados);
        
        const eventosFormatados = dados.dias.map((item, index) => ({
          id: index,
          title: item.dscEvento,
          start: new Date(item.datEvento),
          end: new Date(item.datEvento),
          desc: item.tipoEvento === 1 ? 'feriado' : 'ferias'
        }));
        
        console.log("eventosFormatados: ", eventosFormatados);
        setEventos(eventosFormatados);
      } catch (error) {
        console.error('Erro ao carregar calendário:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCalendario();
  }, []);

  const eventPropGetter = (event: Evento) => {
    return {
      className: event.desc.toLowerCase()
    };
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setDate(start);
    setView('day');
  };

  const handleSelectEvent = (event: Evento) => {
    setSelectedDate(event.start);
    setDate(event.start);
    setView('day');
  };

  const dayPropGetter = (date: Date) => {
    const isSelected = selectedDate && 
      date.toDateString() === selectedDate.toDateString();
    
    return {
      className: isSelected ? 'rbc-selected-day' : '',
      style: {
        backgroundColor: isSelected ? '#e2e8f0' : 'transparent',
      }
    };
  };

  if (loading) {
    return <LoadModal title="calendário" />;
  }

  return (
    <div className="h-screen p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-2rem)]">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            noEventsInRange: "Não existe eventos para esse período",
            showMore: (total) => `+ ${total} eventos`,
            date: "Data",
            time: "Hora",
            event: "Evento"
          }}
          culture="pt-BR"
          view={view}
          onView={(newView) => setView(newView)}
          eventPropGetter={eventPropGetter}
          date={date}
          onNavigate={handleNavigate}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          dayPropGetter={dayPropGetter}
        />
      </div>
    </div>
  );
}