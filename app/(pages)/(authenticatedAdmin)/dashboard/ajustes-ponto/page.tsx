'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/atoms/container';
import { listAdjustmentRequests, validateAdjustmentRequest } from '@/services/timeRecordAdjustment';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';

//Components
import Table from '@/app/components/atoms/Table';
import EditModal from '@/app/components/atoms/EditModal';

//Types
import { Column } from '@/types';
import { TimeRecordAdjustment, ItemRegistro } from '@/services/timeRecordAdjustment';

export default function AjustesPontoPage() {
  const [solicitacoes, setSolicitacoes] = useState<TimeRecordAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<TimeRecordAdjustment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [updateLoading, setUpdateLoading] = useState(false);

  const columns: Column[] = [
    { key: 'dataRegistroAlteracao', label: 'Data Alteração', type: 'date' },
    { key: 'justificativa', label: 'Justificativa' },
    { key: 'statusSolicitacao', label: 'Status', type: 'status' },
    { 
      key: 'itens', 
      label: 'Registros',
      type: 'custom',
      render: (item: TimeRecordAdjustment) => (
        <div>
          {item.itens.map((registro: ItemRegistro, i: number) => (
            <div key={i} className="text-sm">
              {formatarHora(registro.horaRegistro)} - 
              {registro.idTipoRegistroPonto === 1 ? ' Entrada' : ' Saída'}
            </div>
          ))}
        </div>
      )
    }
  ];
  
  const fetchSolicitacoes = async () => {
    try {
      const response = await listAdjustmentRequests();
      if (response.sucesso && response.solicitacoes) {
        setSolicitacoes(response.solicitacoes);
      } else {
        setSolicitacoes([]);
        showErrorToast(response.mensagem || 'Erro ao carregar solicitações');
      }
    } catch (error) {
      showErrorToast('Erro ao carregar solicitações');
      console.error('Erro ao carregar solicitações:', error);
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const handleEdit = (solicitacao: TimeRecordAdjustment) => {
    setSelectedSolicitacao(solicitacao);
    setSelectedStatus(0);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSolicitacao(null);
    setSelectedStatus(0);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSolicitacao) return;

    setUpdateLoading(true);

    console.log("selectedSolicitacao", selectedSolicitacao);

    try {
      await validateAdjustmentRequest(selectedSolicitacao.idSolicitacao, selectedStatus);
      showSuccessToast(`Solicitação ${selectedStatus === 1 ? 'aprovada' : 'reprovada'} com sucesso!`);
      fetchSolicitacoes();
      handleCloseModal();
    } catch (error) {
      showErrorToast('Erro ao atualizar solicitação');
      console.error('Erro ao atualizar solicitação:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatarHora = (dataHora: string) => {
    if (dataHora === "0001-01-01T00:00:00") return "Não definida";
    return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (dataHora: string) => {
    if (dataHora === "0001-01-01T00:00:00") return "Não definida";
    return new Date(dataHora).toLocaleDateString('pt-BR');
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Pendente';
      case 1:
        return 'Aprovado';
      case 2:
        return 'Reprovado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Container className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando solicitações...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">

      {/* Tabela de Solicitações de Ajuste de Ponto */}
      <Table
        data={solicitacoes}
        columns={columns}
        isAjustePonto={true}
        title="Solicitações de Ajuste de Ponto"
        handleEdit={handleEdit}
      />

      {/* Modal de Detalhes */}
      {isDetailModalOpen && selectedSolicitacao && (
        <EditModal
          title="Avaliar Solicitação de Ajuste"
          fields={[
            {
              label: "ID Solicitante",
              value: selectedSolicitacao.idSolicitante.toString(),
              onChange: () => {},
              readOnly: true
            },
            {
              label: "Data Alteração",
              value: formatarData(selectedSolicitacao.dataRegistroAlteracao),
              onChange: () => {},
              readOnly: true
            },
            {
              label: "Justificativa",
              value: selectedSolicitacao.justificativa,
              onChange: () => {},
              readOnly: true
            },
            {
              label: "Status Atual",
              value: getStatusText(selectedSolicitacao.statusSolicitacao),
              onChange: () => {},
              readOnly: true
            },
            ...(selectedSolicitacao.statusSolicitacao === 0 ? [{
              label: "Decisão",
              value: selectedStatus.toString(),
              onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setSelectedStatus(Number(e.target.value)),
              type: "select" as const,
              options: [
                { value: "0", label: "Selecione uma ação" },
                { value: "1", label: "Aprovar" },
                { value: "2", label: "Reprovar" }
              ],
              required: true
            }] : [])
          ]}
          onClose={handleCloseModal}
          onConfirm={selectedSolicitacao.statusSolicitacao === 0 ? handleUpdateStatus : undefined}
          loading={updateLoading}
          confirmText={selectedSolicitacao.statusSolicitacao === 0 ? "Confirmar Decisão" : undefined}
        />
      )}
    </Container>
  );
} 