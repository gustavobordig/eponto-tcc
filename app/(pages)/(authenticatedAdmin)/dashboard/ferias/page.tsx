'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Components
import Table from '@/app/components/atoms/Table';
import LoadingText from '@/app/components/atoms/LoadingText';
import Container from '@/app/components/atoms/container';
import ExcludeModal from '@/app/components/atoms/ExcludeModal';
import ConfirmationModal from '@/app/components/atoms/ConfirmationModal';

// Services
import { feriasService } from '@/services/ferias';

// Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';

// Types
import { Column } from '@/types';

// Custom Styles
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
  dscObservacao: string;
  datInicioFerias: string;
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
  const [solicitacao, setSolicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feriasToDelete, setFeriasToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Estados para modais de aprovação/reprovação
  const [isAprovarModalOpen, setIsAprovarModalOpen] = useState(false);
  const [isReprovarModalOpen, setIsReprovarModalOpen] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [eventosCalendario, setEventosCalendario] = useState<EventoCalendario[]>([]);

  const columns: Column[] = [
    { key: 'dscFerias', label: 'Descrição' },
    { key: 'datInicioFerias', label: 'Data Início', type: 'date' },
    { key: 'datFimFerias', label: 'Data Fim', type: 'date' },
  ];

  const columnsSolicitacoes: Column[] = [
    { key: 'nomeUsuario', label: 'Nome do usuário' },
    { key: 'dscObservacao', label: 'Descrição da Solicitação' },
    { key: 'datInicioFerias', label: 'Data de Início', type: 'date' },
    { key: 'datFimFerias', label: 'Data Final', type: 'date' },
    { key: 'datSolicitacaoFerias', label: 'Data da Solicitação', type: 'datetime' },
    { 
      key: 'indSituacao', 
      label: 'Status', 
      type: 'custom',
      render: (item: any) => {
        const status = item.indSituacao;
        let statusText = '';
        let statusClass = '';
        
        switch (status) {
          case 0:
            statusText = 'Pendente';
            statusClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 1:
            statusText = 'Aprovado';
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 2:
            statusText = 'Reprovado';
            statusClass = 'bg-red-100 text-red-800';
            break;
          default:
            statusText = 'Pendente';
            statusClass = 'bg-yellow-100 text-yellow-800';
        }
        
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
            {statusText}
          </span>
        );
      }
    }
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

  const fetchSolicitacoes = async () => {
    try {
      const response = await feriasService.buscarSolicitacoes();
      setSolicitacoes(response);
    } catch (error) {
      showErrorToast('Erro ao carregar solicitação de férias');
      console.error('Erro ao carregar solicitação de férias:', error);
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFerias();
    fetchSolicitacoes();
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

  const handleAprovarClick = (solicitacao: any) => {
    setSolicitacaoSelecionada(solicitacao);
    setIsAprovarModalOpen(true);
  };

  const handleReprovarClick = (solicitacao: any) => {
    setSolicitacaoSelecionada(solicitacao);
    setIsReprovarModalOpen(true);
  };

  const handleAprovarConfirm = async () => {
    if (!solicitacaoSelecionada?.idSolicFerias) {
      showErrorToast('ID da solicitação não encontrado');
      return;
    }

    setActionLoading(true);
    try {
      await feriasService.atualizarStatusSolicitacao(solicitacaoSelecionada.idSolicFerias, 1);
      showSuccessToast('Férias aprovadas com sucesso!');
      fetchSolicitacoes();
      setIsAprovarModalOpen(false);
      setSolicitacaoSelecionada(null);
    } catch (error) {
      showErrorToast('Erro ao aprovar férias. Tente novamente.');
      console.error('Erro ao aprovar férias:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReprovarConfirm = async () => {
    if (!solicitacaoSelecionada?.idSolicFerias) {
      showErrorToast('ID da solicitação não encontrado');
      return;
    }

    setActionLoading(true);
    try {
      await feriasService.atualizarStatusSolicitacao(solicitacaoSelecionada.idSolicFerias, 2);
      showSuccessToast('Férias reprovadas com sucesso!');
      fetchSolicitacoes();
      setIsReprovarModalOpen(false);
      setSolicitacaoSelecionada(null);
    } catch (error) {
      showErrorToast('Erro ao reprovar férias. Tente novamente.');
      console.error('Erro ao reprovar férias:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAction = () => {
    setIsAprovarModalOpen(false);
    setIsReprovarModalOpen(false);
    setSolicitacaoSelecionada(null);
  };

  if (loading) {
    return <LoadingText title="Férias" />;
  }

  return (
    <Container className="py-8">
      {/* Botões de alternância de visualização */}
      <div className="flex justify-end mb-4 gap-2">
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
      </div>

      <div className="flex flex-col gap-4">
        {/* Visualização em Tabela - Férias */}
        {view === 'table' && (
          <Table
            data={ferias}
            title="Férias"
            columns={columns}
            handleDeleteClick={handleDeleteClick}
            addItemHref="/adicionar-ferias"
          />
        )}

        {/* Visualização em Tabela - Solicitações de Férias */}
        {view === 'table' && (
                     <Table
             data={solicitacao}
             title="Solicitações de Férias"
             columns={columnsSolicitacoes}
                         handleEdit={(item: any) => {
               // Renderização personalizada das ações para solicitações
               const status = item.indSituacao;
               const isPendente = status === 0 || status === undefined;
               
               return (
                 <div className="flex space-x-2">
                   {isPendente && (
                     <>
                       <button
                         onClick={() => handleAprovarClick(item)}
                         className="text-green-600 hover:text-green-900 font-medium"
                       >
                         Aprovar
                       </button>
                       <button
                         onClick={() => handleReprovarClick(item)}
                         className="text-red-600 hover:text-red-900 font-medium"
                       >
                         Reprovar
                       </button>
                     </>
                   )}
                 </div>
               );
             }}
          />
        )}
      </div>

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
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
              noEventsInRange: 'Não existem férias para este período',
              showMore: (total) => `+ ${total} eventos`,
              date: 'Data',
              time: 'Hora',
              event: 'Evento'
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

      {/* Modal de confirmação de aprovação */}
      <ConfirmationModal
        isOpen={isAprovarModalOpen}
        title="Confirmar Aprovação"
        message="Tem certeza que deseja aprovar esta solicitação de férias?"
        confirmText="Aprovar"
        cancelText="Cancelar"
        onConfirm={handleAprovarConfirm}
        onCancel={handleCancelAction}
        loading={actionLoading}
        confirmButtonColor="bg-green-600 hover:bg-green-700"
      >
        {solicitacaoSelecionada && (
          <div className="text-sm">
            <p><strong>Funcionário:</strong> {solicitacaoSelecionada.nomeUsuario}</p>
            <p><strong>Período:</strong> {new Date(solicitacaoSelecionada.datInicioFerias).toLocaleDateString('pt-BR')} a {new Date(solicitacaoSelecionada.datFimFerias).toLocaleDateString('pt-BR')}</p>
            <p><strong>Descrição:</strong> {solicitacaoSelecionada.dscObservacao}</p>
          </div>
        )}
      </ConfirmationModal>

      {/* Modal de confirmação de reprovação */}
      <ConfirmationModal
        isOpen={isReprovarModalOpen}
        title="Confirmar Reprovação"
        message="Tem certeza que deseja reprovar esta solicitação de férias?"
        confirmText="Reprovar"
        cancelText="Cancelar"
        onConfirm={handleReprovarConfirm}
        onCancel={handleCancelAction}
        loading={actionLoading}
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      >
        {solicitacaoSelecionada && (
          <div className="text-sm">
            <p><strong>Funcionário:</strong> {solicitacaoSelecionada.nomeUsuario}</p>
            <p><strong>Período:</strong> {new Date(solicitacaoSelecionada.datInicioFerias).toLocaleDateString('pt-BR')} a {new Date(solicitacaoSelecionada.datFimFerias).toLocaleDateString('pt-BR')}</p>
            <p><strong>Descrição:</strong> {solicitacaoSelecionada.dscObservacao}</p>
          </div>
        )}
      </ConfirmationModal>
    </Container>
  );
}
