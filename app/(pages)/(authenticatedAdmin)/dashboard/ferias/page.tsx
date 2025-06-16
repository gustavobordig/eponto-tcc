'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feriasToDelete, setFeriasToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [eventosCalendario, setEventosCalendario] = useState<EventoCalendario[]>([]);

  const columns: Column[] = [
    { key: 'dscFerias', label: 'Descrição' },
    { key: 'datIncioFerias', label: 'Data Início', type: 'date' },
    { key: 'datFimFerias', label: 'Data Fim', type: 'date' },
    { key: 'idUsuario', label: 'ID Usuário' }
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
        title: `Início - ${descricao}`,
        start: dataInicio,
        end: dataInicio,
        desc: 'ferias'
      });

      // Evento de fim
      eventos.push({
        id: `${descricao}-fim`,
        title: `Último dia - ${descricao}`,
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
      showErrorToast('Erro ao carregar férias');
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
      showErrorToast('ID das férias não encontrado');
      return;
    }
    setFeriasToDelete(ferias.idFerias);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feriasToDelete) {
      showErrorToast('ID das férias não encontrado');
      setIsDeleteModalOpen(false);
      setFeriasToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await feriasService.excluirFerias(feriasToDelete);
      showSuccessToast('Férias excluídas com sucesso!');
      fetchFerias();
    } catch (error) {
      showErrorToast('Erro ao excluir férias. Tente novamente.');
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
    return <LoadingText title="férias" />
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
          title="Férias"
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
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              noEventsInRange: "Não existem férias para este período",
              showMore: (total) => `+ ${total} eventos`,
              date: "Data",
              time: "Hora",
              event: "Evento"
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
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir estas férias? Esta ação não pode ser desfeita."
          onCancel={handleCancelDelete}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </Container>
  );
} 