'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

//Components
import Table from '@/app/components/atoms/Table';
import LoadingText from '@/app/components/atoms/LoadingText';
import Container from '@/app/components/atoms/container';
import ExcludeModal from '@/app/components/atoms/ExcludeModal';

//Services
import { feriasService } from '@/services/ferias';

//Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useLanguage } from '@/app/contexts/LanguageContext';

//Types
import { Column } from '@/types';

//Custom Styles
import '@/app/styles/calendar.scss';

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

interface Ferias {
  idFerias?: number;
  dscFerias: string;
  datIncioFerias: string;
  datFimFerias: string;
  idUsuario?: number | null;
}

interface EventoCalendario {
  id: string;
  title: string;
  start: Date;
  end: Date;
  desc: string;
}

interface ApiResponse {
  mensagem: string;
  sucesso: boolean;
  listaFerias: Ferias[];
}

export default function FeriasPage() {
  const { t } = useLanguage();
  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feriasToDelete, setFeriasToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [eventosCalendario, setEventosCalendario] = useState<EventoCalendario[]>([]);

  const columns: Column[] = [
    { key: 'dscFerias', label: t('table.description') },
    { key: 'datIncioFerias', label: t('table.start-date'), type: 'date' },
    { key: 'datFimFerias', label: t('table.end-date'), type: 'date' },
    { key: 'idUsuario', label: t('table.user-id') }
  ];

  // Função para processar os dados da API
  const processarDadosCalendario = (dias: any[]): EventoCalendario[] => {
    // Agrupar dias por descrição do evento
    const eventosAgrupados = dias.reduce((acc: Record<string, Date[]>, dia) => {
      if (dia.tipoEvento === 2) { // Apenas eventos de férias
        const chave = dia.dscEvento;
        if (!acc[chave]) {
          acc[chave] = [];
        }
        acc[chave].push(new Date(dia.datEvento));
      }
      return acc;
    }, {});

    // Criar eventos do calendário
    const eventos: EventoCalendario[] = [];
    for (const [descricao, datas] of Object.entries(eventosAgrupados)) {
      const datasOrdenadas = datas.sort((a, b) => a.getTime() - b.getTime());
      const dataInicio = datasOrdenadas[0];
      const dataFim = datasOrdenadas[datasOrdenadas.length - 1];

      // Evento de início
      eventos.push({
        id: `${descricao}-inicio`,
        title: `${t('table.vacation-start')} - ${descricao}`,
        start: dataInicio,
        end: dataInicio,
        desc: 'ferias'
      });

      // Evento de fim
      eventos.push({
        id: `${descricao}-fim`,
        title: `${t('table.vacation-end')} - ${descricao}`,
        start: dataFim,
        end: dataFim,
        desc: 'ferias'
      });

      // Evento do período completo
      if (dataInicio.getTime() !== dataFim.getTime()) {
        eventos.push({
          id: `${descricao}-periodo`,
          title: '',
          start: dataInicio,
          end: dataFim,
          desc: 'ferias'
        });
      }
    }

    return eventos;
  };

  const fetchFerias = async () => {
    try {
      const response = await feriasService.buscarFerias();
      setFerias(response);
      // Processar os dados para o calendário
      const eventos = processarDadosCalendario(response);
      setEventosCalendario(eventos);
    } catch (error) {
      showErrorToast(t('table.error-loading-vacations'));
      console.error('Erro ao carregar férias:', error);
      setFerias([]);
      setEventosCalendario([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFerias();
  }, []);

  const handleDeleteClick = (ferias: Ferias) => {
    if (ferias.idFerias === undefined) {
      showErrorToast(t('table.vacation-id-not-found'));
      return;
    }
    setFeriasToDelete(ferias.idFerias);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feriasToDelete) {
      showErrorToast(t('table.vacation-id-not-found'));
      setIsDeleteModalOpen(false);
      setFeriasToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await feriasService.excluirFerias(feriasToDelete);
      showSuccessToast(t('table.vacation-deleted-success'));
      fetchFerias();
    } catch (error) {
      showErrorToast(t('table.error-deleting-vacation'));
      console.error('Erro ao excluir férias:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setFeriasToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFeriasToDelete(null);
  };

  if (loading) {
    return <LoadingText title={t('admin.vacations').toLowerCase()} />
  }

  return (
    <Container className="py-8">
      {/* Botões de alternância de visualização */}
      {/* <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setView('table')}
          className={`px-4 py-2 rounded-md ${
            view === 'table'
              ? 'bg-[#002085] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tabela
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-md ${
            view === 'calendar'
              ? 'bg-[#002085] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Calendário
        </button>
      </div> */}

      {/* Visualização em Tabela */}
      {view === 'table' && (
        <Table
          data={ferias}
          title={t('admin.vacations')}
          columns={columns}
          handleDeleteClick={handleDeleteClick}
          addItemHref="/adicionar-ferias"
        />
      )}

      {/* Visualização em Calendário */}
      {view === 'calendar' && (
        <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-12rem)]">
          <Calendar
            localizer={localizer}
            events={eventosCalendario}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={{
              next: t('calendar.next'),
              previous: t('calendar.previous'),
              today: t('calendar.today'),
              month: t('calendar.month'),
              week: t('calendar.week'),
              day: t('calendar.day'),
              agenda: t('calendar.agenda'),
              noEventsInRange: t('calendar.no-vacations-period'),
              showMore: (total) => `+ ${total} ${t('calendar.events')}`,
              date: t('calendar.date'),
              time: t('calendar.time'),
              event: t('calendar.event')
            }}
            culture="pt-BR"
            eventPropGetter={(event) => ({
              className: event.desc
            })}
          />
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <ExcludeModal
          title={t('common.confirm') + ' ' + t('table.delete')}
          message={t('table.confirm-delete-vacation')}
          onCancel={handleCancelDelete}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </Container>
  );
} 