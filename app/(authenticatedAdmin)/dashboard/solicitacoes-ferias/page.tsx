'use client';

import { useState, useEffect } from 'react';
import { feriasService } from '@/services/ferias';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';
import Table from '@/app/components/atoms/Table';
import ConfirmationModal from '@/app/components/atoms/ConfirmationModal';

interface SolicitacaoFerias {
  idSolicitacao: number;
  idUsuario: number;
  nomeUsuario: string;
  dataInicio: string;
  dataFim: string;
  status: number;
  observacoes?: string;
}

export default function SolicitacoesFeriasPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoFerias[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoFerias | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    loadSolicitacoes();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);
      const response = await feriasService.listarSolicitacoesFerias();
      if (response.sucesso && response.solicitacoes) {
        setSolicitacoes(response.solicitacoes);
      }
    } catch (error) {
      showErrorToast('Erro ao carregar solicitações de férias');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedSolicitacao || !actionType) return;
    
    try {
      const indSituacao = actionType === 'approve' ? 1 : 2; // 1 = Aprovado, 2 = Rejeitado
      const response = await feriasService.atualizarSolicitacaoFerias(
        selectedSolicitacao.idSolicitacao,
        indSituacao
      );
      
      if (response.sucesso) {
        showSuccessToast(`Solicitação ${actionType === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`);
        setShowModal(false);
        setSelectedSolicitacao(null);
        setActionType(null);
        loadSolicitacoes();
      } else {
        showErrorToast(response.mensagem || `Erro ao ${actionType === 'approve' ? 'aprovar' : 'rejeitar'} solicitação`);
      }
    } catch (error) {
      showErrorToast(`Erro ao ${actionType === 'approve' ? 'aprovar' : 'rejeitar'} solicitação`);
    }
  };

  const openActionModal = (solicitacao: SolicitacaoFerias, type: 'approve' | 'reject') => {
    setSelectedSolicitacao(solicitacao);
    setActionType(type);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Pendente';
      case 1: return 'Aprovado';
      case 2: return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-yellow-600';
      case 1: return 'text-green-600';
      case 2: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const tableHeaders = ['Funcionário', 'Data Início', 'Data Fim', 'Status', 'Ações'];
  const tableData = solicitacoes.map(solicitacao => [
    solicitacao.nomeUsuario,
    formatDate(solicitacao.dataInicio),
    formatDate(solicitacao.dataFim),
    <span key={solicitacao.idSolicitacao} className={getStatusColor(solicitacao.status)}>
      {getStatusLabel(solicitacao.status)}
    </span>,
    <div key={solicitacao.idSolicitacao} className="flex gap-2">
      {solicitacao.status === 0 && (
        <>
          <Button
            variant="success"
            size="sm"
            onClick={() => openActionModal(solicitacao, 'approve')}
          >
            Aprovar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => openActionModal(solicitacao, 'reject')}
          >
            Rejeitar
          </Button>
        </>
      )}
    </div>
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando solicitações de férias...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Solicitações de Férias</h1>
      </div>

      <Table headers={tableHeaders} data={tableData} />

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleAction}
        title={actionType === 'approve' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
        message={`Tem certeza que deseja ${actionType === 'approve' ? 'aprovar' : 'rejeitar'} esta solicitação de férias?`}
        confirmText={actionType === 'approve' ? 'Aprovar' : 'Rejeitar'}
        variant={actionType === 'approve' ? 'success' : 'danger'}
      />
    </div>
  );
}
