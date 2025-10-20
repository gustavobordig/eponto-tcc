'use client';

import { useEffect, useState } from 'react';
import { listAdjustmentRequests, validateAdjustmentRequest } from '@/services/timeRecordAdjustment';
import { userService } from '@/services/user';
import TimeComparisonModal from './TimeComparisonModal';
import ConfirmModal from './ConfirmModal';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import ActionButton from '@/app/components/atoms/ActionButton';
import StatusBadge from '@/app/components/atoms/StatusBadge';
import StatsCard from '@/app/components/atoms/StatsCard';
import { TimeRecordAdjustment, ItemRegistro } from '@/services/timeRecordAdjustment';

export default function AjustesPontoContent() {
  const [solicitacoes, setSolicitacoes] = useState<TimeRecordAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<TimeRecordAdjustment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [solicitanteNome, setSolicitanteNome] = useState<string>('');
  const [registrosOriginais, setRegistrosOriginais] = useState<ItemRegistro[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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

  const fetchSolicitanteNome = async (idSolicitante: number) => {
    try {
      const response = await userService.getById(idSolicitante);
      if (response.sucesso && response.usuario) {
        setSolicitanteNome(response.usuario.nome);
      } else {
        setSolicitanteNome('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar nome do solicitante:', error);
      setSolicitanteNome('Erro ao carregar nome');
    }
  };

  const fetchRegistrosOriginais = async (solicitacao: TimeRecordAdjustment) => {
    try {
      // TODO: Implementar API real para buscar registros originais
      // Simulando registros originais diferentes dos solicitados
      const registrosSimulados: ItemRegistro[] = solicitacao.itens.map((item, index) => {
        const dataOriginal = new Date(item.horaRegistro);
        
        // Cria diferenças mais realistas baseadas no tipo de registro
        let variacaoMinutos = 0;
        if (item.idTipoRegistroPonto === 1) { // Entrada
          variacaoMinutos = -(15 + (index * 10)); // Atraso na entrada original
        } else { // Saída
          variacaoMinutos = (20 + (index * 5)); // Saída mais cedo no original
        }
        
        const novaData = new Date(dataOriginal.getTime() + (variacaoMinutos * 60000));
        
        return {
          horaRegistro: novaData.toISOString(),
          idTipoRegistroPonto: item.idTipoRegistroPonto
        };
      });
      
      setRegistrosOriginais(registrosSimulados);
    } catch (error) {
      console.error('Erro ao buscar registros originais:', error);
      setRegistrosOriginais([]);
    }
  };

  const handleViewComparison = async (solicitacao: TimeRecordAdjustment) => {
    setSelectedSolicitacao(solicitacao);
    setIsComparisonModalOpen(true);
    await Promise.all([
      fetchSolicitanteNome(solicitacao.idSolicitante),
      fetchRegistrosOriginais(solicitacao)
    ]);
  };

  const handleApprove = (solicitacao: TimeRecordAdjustment) => {
    setSelectedSolicitacao(solicitacao);
    setPendingAction('approve');
    setIsConfirmModalOpen(true);
  };

  const handleReject = (solicitacao: TimeRecordAdjustment) => {
    setSelectedSolicitacao(solicitacao);
    setPendingAction('reject');
    setIsConfirmModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsComparisonModalOpen(false);
    setIsConfirmModalOpen(false);
    setSelectedSolicitacao(null);
    setSelectedStatus(0);
    setSolicitanteNome('');
    setRegistrosOriginais([]);
    setPendingAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedSolicitacao || !pendingAction) return;

    setUpdateLoading(true);
    const status = pendingAction === 'approve' ? 1 : 2;
    setSelectedStatus(status);

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

  const formatarRegistros = (registros: ItemRegistro[]) => {
    return registros.map(registro => ({
      hora: formatarHora(registro.horaRegistro),
      tipo: registro.idTipoRegistroPonto === 1 ? 'Entrada' : 'Saída'
    }));
  };

  const calcularDiferenca = (horaOriginal: string, horaSolicitada: string) => {
    if (horaOriginal === "Não definida" || horaSolicitada === "Não definida") {
      return "N/A";
    }
    
    const [h1, m1] = horaOriginal.split(':').map(Number);
    const [h2, m2] = horaSolicitada.split(':').map(Number);
    
    const minutos1 = h1 * 60 + m1;
    const minutos2 = h2 * 60 + m2;
    const diferenca = minutos2 - minutos1;
    
    if (diferenca === 0) return "Sem alteração";
    
    const horas = Math.abs(diferenca) / 60;
    const mins = Math.abs(diferenca) % 60;
    
    const sinal = diferenca > 0 ? '+' : '-';
    const tempo = horas > 0 ? `${Math.floor(horas)}h ${mins}min` : `${mins}min`;
    
    return `${sinal}${tempo}`;
  };

  const getStatusType = (status: number): 'pending' | 'approved' | 'rejected' => {
    switch (status) {
      case 0:
        return 'pending';
      case 1:
        return 'approved';
      case 2:
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getFilteredSolicitacoes = () => {
    if (statusFilter === 'all') return solicitacoes;
    
    return solicitacoes.filter(solicitacao => {
      switch (statusFilter) {
        case 'pending':
          return solicitacao.statusSolicitacao === 0;
        case 'approved':
          return solicitacao.statusSolicitacao === 1;
        case 'rejected':
          return solicitacao.statusSolicitacao === 2;
        default:
          return true;
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando solicitações de ajuste de ponto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solicitações de Ajuste de Ponto</h2>
          <p className="text-gray-600">Avalie e aprove solicitações de ajuste de registro de ponto</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {solicitacoes.length} solicitações
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg ${
            statusFilter === 'pending' ? 'ring-2 ring-yellow-400 shadow-lg' : ''
          }`}
        >
          <StatsCard
            title="Pendentes"
            count={solicitacoes.filter(s => s.statusSolicitacao === 0).length}
            type="pending"
          />
        </div>
        <div 
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg ${
            statusFilter === 'approved' ? 'ring-2 ring-green-400 shadow-lg' : ''
          }`}
        >
          <StatsCard
            title="Aprovadas"
            count={solicitacoes.filter(s => s.statusSolicitacao === 1).length}
            type="approved"
          />
        </div>
        <div 
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg ${
            statusFilter === 'rejected' ? 'ring-2 ring-red-400 shadow-lg' : ''
          }`}
        >
          <StatsCard
            title="Reprovadas"
            count={solicitacoes.filter(s => s.statusSolicitacao === 2).length}
            type="rejected"
          />
        </div>
      </div>

      {/* Filtro Ativo */}
      {statusFilter !== 'all' && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filtro ativo:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              statusFilter === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {statusFilter === 'pending' ? 'Pendentes' :
               statusFilter === 'approved' ? 'Aprovadas' : 'Reprovadas'}
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('all')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {/* Tabela */}
      {getFilteredSolicitacoes().length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma solicitação encontrada
          </h3>
          <p className="text-gray-500">
            Não há solicitações de ajuste de ponto no momento.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Alteração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Justificativa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredSolicitacoes().map((solicitacao, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarData(solicitacao.dataRegistroAlteracao)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {solicitacao.justificativa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={getStatusType(solicitacao.statusSolicitacao)} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      {solicitacao.itens.map((registro: ItemRegistro, i: number) => (
                        <div key={i} className="text-sm">
                          {formatarHora(registro.horaRegistro)} - 
                          {registro.idTipoRegistroPonto === 1 ? ' Entrada' : ' Saída'}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <ActionButton
                        type="view"
                        onClick={() => handleViewComparison(solicitacao)}
                      />
                      {solicitacao.statusSolicitacao === 0 && (
                        <>
                          <ActionButton
                            type="approve"
                            onClick={() => handleApprove(solicitacao)}
                          />
                          <ActionButton
                            type="reject"
                            onClick={() => handleReject(solicitacao)}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* Modal de Comparação Visual */}
      <TimeComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={handleCloseModal}
        selectedSolicitacao={selectedSolicitacao}
        registrosOriginais={registrosOriginais}
        onApprove={() => {
          setSelectedStatus(1);
          handleUpdateStatus();
        }}
        onReject={() => {
          setSelectedStatus(2);
          handleUpdateStatus();
        }}
        loading={updateLoading}
      />

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        selectedSolicitacao={selectedSolicitacao}
        action={pendingAction}
        loading={updateLoading}
      />
    </div>
  );
}
