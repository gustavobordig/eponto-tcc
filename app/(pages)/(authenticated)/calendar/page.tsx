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
import { feriasService } from '@/services/ferias';

//Utils
import { tokenUtils } from '@/utils/token';

//Components
import LoadModal from '@/app/components/molecules/LoadModal';
import Button from '@/app/components/atoms/Button';
import { FeriasModal } from '@/app/components/molecules/FeriasModal';

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
  id: number | string;
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
  const [isFeriasModalOpen, setIsFeriasModalOpen] = useState(false);

  useEffect(() => {
    const carregarCalendario = async () => {
      try {
        setLoading(true);
        
        // Buscar eventos do calendário (feriados e férias gerais)
        const dados: RespostaCalendario = await calendarioService.buscarCalendario();
        console.log("dados calendário: ", dados);
        
        const eventosFormatados = dados.dias.map((item, index) => ({
          id: index,
          title: item.dscEvento,
          start: new Date(item.datEvento),
          end: new Date(item.datEvento),
          desc: item.tipoEvento === 1 ? 'feriado' : 'ferias'
        }));

        // Buscar férias do usuário logado
        const idUsuario = tokenUtils.getId();
        if (idUsuario) {
          try {
            const feriasUsuario = await feriasService.buscarFeriasPorUsuario(parseInt(idUsuario));
            console.log("férias do usuário: ", feriasUsuario);
            
            const eventosFeriasUsuario = feriasUsuario.map((ferias, index) => ({
              id: `ferias-usuario-${index}`,
              title: `Minhas Férias - ${ferias.dscFerias}`,
              start: new Date(ferias.datIncioFerias),
              end: new Date(ferias.datFimFerias),
              desc: 'minhas-ferias'
            }));
            
            // Combinar eventos do calendário com férias do usuário
            const todosEventos = [...eventosFormatados, ...eventosFeriasUsuario];
            setEventos(todosEventos);
            console.log("todos os eventos: ", todosEventos);
          } catch (error) {
            console.error('Erro ao carregar férias do usuário:', error);
            // Se falhar ao carregar férias do usuário, usar apenas eventos do calendário
            setEventos(eventosFormatados);
          }
        } else {
          setEventos(eventosFormatados);
        }
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

  const handleSolicitarFerias = () => {
    setIsFeriasModalOpen(true);
  };

  const handleFeriasSuccess = () => {
    // Recarregar o calendário após solicitar férias
    const carregarCalendario = async () => {
      try {
        setLoading(true);
        
        // Buscar eventos do calendário (feriados e férias gerais)
        const dados: RespostaCalendario = await calendarioService.buscarCalendario();
        
        const eventosFormatados = dados.dias.map((item, index) => ({
          id: index,
          title: item.dscEvento,
          start: new Date(item.datEvento),
          end: new Date(item.datEvento),
          desc: item.tipoEvento === 1 ? 'feriado' : 'ferias'
        }));

        // Buscar férias do usuário logado
        const idUsuario = tokenUtils.getId();
        if (idUsuario) {
          try {
            const feriasUsuario = await feriasService.buscarFeriasPorUsuario(parseInt(idUsuario));
            
            const eventosFeriasUsuario = feriasUsuario.map((ferias, index) => ({
              id: `ferias-usuario-${index}`,
              title: `Minhas Férias - ${ferias.dscFerias}`,
              start: new Date(ferias.datIncioFerias),
              end: new Date(ferias.datFimFerias),
              desc: 'minhas-ferias'
            }));
            
            // Combinar eventos do calendário com férias do usuário
            const todosEventos = [...eventosFormatados, ...eventosFeriasUsuario];
            setEventos(todosEventos);
          } catch (error) {
            console.error('Erro ao carregar férias do usuário:', error);
            setEventos(eventosFormatados);
          }
        } else {
          setEventos(eventosFormatados);
        }
      } catch (error) {
        console.error('Erro ao carregar calendário:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCalendario();
  };

  return (
    <div className="h-screen p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-2rem)]">
        <div className="flex justify-start my-4">
          <div className="w-[200px]">
            <Button text="Solicitar férias" onClick={() => handleSolicitarFerias()} />
          </div>
        </div>
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

      {/* Modal de Solicitação de Férias */}
      <FeriasModal
        isOpen={isFeriasModalOpen}
        onClose={() => setIsFeriasModalOpen(false)}
        onSuccess={handleFeriasSuccess}
      />
    </div>
  );
}