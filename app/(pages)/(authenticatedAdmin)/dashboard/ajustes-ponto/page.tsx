'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/atoms/container';
import { listAdjustmentRequests, validateAdjustmentRequest } from '@/services/timeRecordAdjustment';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';

//Components
import Table from '@/app/components/atoms/Table';

//Types
import { Column } from '@/types';

interface ItemRegistro {
  horaRegistro: string;
  idTipoRegistroPonto: number;
}

interface SolicitacaoAjuste {
  id: number;
  idSolicitante: number;
  justificativa: string;
  statusSolicitacao: number;
  dataRegistroAlteracao: string;
  itens: ItemRegistro[];
}

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  solicitacaoAjustePontoModel: SolicitacaoAjuste | null;
  solicitacoes: SolicitacaoAjuste[];
}

export default function AjustesPontoPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAjuste[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoAjuste | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [updateLoading, setUpdateLoading] = useState(false);

  const columns: Column[] = [
    { key: 'idSolicitante', label: 'ID Solicitante' },
    { key: 'dataRegistroAlteracao', label: 'Data Alteração', type: 'date' },
    { key: 'justificativa', label: 'Justificativa' },
    { key: 'statusSolicitacao', label: 'Status', type: 'status' },
    { 
      key: 'itens', 
      label: 'Registros',
      type: 'custom',
      render: (item: SolicitacaoAjuste) => (
        <div>
          {item.itens.map((registro, i) => (
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
      const response = await listAdjustmentRequests() as ApiResponse;
      setSolicitacoes(response.solicitacoes || []);
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

  const handleViewDetails = async (index: number) => {
    setSelectedSolicitacao(solicitacoes[index]);
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
    try {
      await validateAdjustmentRequest(selectedSolicitacao.idSolicitante, selectedStatus);
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

      <Table
        data={solicitacoes}
        columns={columns}
        title="Solicitações de Ajuste de Ponto"
      />

      {/* Modal de Detalhes */}
      {isDetailModalOpen && selectedSolicitacao && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes da Solicitação</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-black">ID Solicitante: {selectedSolicitacao.idSolicitante}</p>
                <p className="text-sm font-medium text-black">Data Alteração: {formatarData(selectedSolicitacao.dataRegistroAlteracao)}</p>
                <p className="text-sm font-medium text-black">Justificativa: {selectedSolicitacao.justificativa}</p>
                <p className="text-sm font-medium text-black">Status: {getStatusText(selectedSolicitacao.statusSolicitacao)}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-black">Registros:</p>
                  {selectedSolicitacao.itens.map((item, index) => (
                    <div key={index} className="ml-4">
                      <p className="text-sm text-black">
                        {formatarHora(item.horaRegistro)} - 
                        {item.idTipoRegistroPonto === 1 ? ' Entrada' : ' Saída'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSolicitacao.statusSolicitacao === 0 && (
                <>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-black">
                      Ação
                    </label>
                    <select
                      id="status"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    >
                      <option value={0}>Selecione uma ação</option>
                      <option value={1}>Aprovar</option>
                      <option value={2}>Reprovar</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      text="Confirmar"
                      backgroundColor="bg-indigo-600"
                      textColor="text-white"
                      onClick={handleUpdateStatus}
                      disabled={updateLoading || selectedStatus === 0}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end mt-4">
                <Button
                  text="Fechar"
                  backgroundColor="bg-gray-600"
                  textColor="text-white"
                  onClick={handleCloseModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
} 