'use client';

import { useState, useEffect } from "react";
import { solicitacaoAusenciaService, SolicitacaoAusencia } from "@/services/solicitacaoAusencia";
import { userService } from "@/services/user";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import Button from "@/app/components/atoms/Button";
import ConfirmationModal from "@/app/components/atoms/ConfirmationModal";
import ActionButton from "@/app/components/atoms/ActionButton";
import StatusBadge from "@/app/components/atoms/StatusBadge";
import StatsCard from "@/app/components/atoms/StatsCard";

interface SolicitacaoComUsuario extends SolicitacaoAusencia {
  nomeUsuario?: string;
}

export default function SolicitacoesAusenciaContent() {
  const [loading, setLoading] = useState(true);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoComUsuario[]>([]);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoComUsuario | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const getStatusType = (status: number): 'pending' | 'approved' | 'rejected' => {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'approved';
      case 2: return 'rejected';
      default: return 'pending';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  const loadSolicitacoes = async () => {
    try {
      const response = await solicitacaoAusenciaService.listarSolicitacoes();
      
      if (response.sucesso && response.solicitacoes) {
        // Buscar nomes dos usuários para cada solicitação
        const solicitacoesComUsuarios = await Promise.all(
          response.solicitacoes.map(async (solicitacao) => {
            try {
              const userResponse = await userService.getById(solicitacao.idUsuario);
              return {
                ...solicitacao,
                nomeUsuario: userResponse.sucesso && userResponse.usuario 
                  ? userResponse.usuario.nome 
                  : `Usuário ${solicitacao.idUsuario}`
              };
            } catch (error) {
              console.error(`Erro ao buscar usuário ${solicitacao.idUsuario}:`, error);
              return {
                ...solicitacao,
                nomeUsuario: `Usuário ${solicitacao.idUsuario}`
              };
            }
          })
        );
        
        setSolicitacoes(solicitacoesComUsuarios);
      } else {
        showErrorToast(response.mensagem || "Erro ao carregar solicitações");
        setSolicitacoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      showErrorToast("Erro ao carregar solicitações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolicitacoes();
  }, []);

  const handleViewDetails = (solicitacao: SolicitacaoComUsuario) => {
    setSelectedSolicitacao(solicitacao);
    setShowDetailsModal(true);
  };

  const handleApprove = (solicitacao: SolicitacaoComUsuario) => {
    setSelectedSolicitacao(solicitacao);
    setActionType('approve');
    setShowConfirmModal(true);
  };

  const handleReject = (solicitacao: SolicitacaoComUsuario) => {
    setSelectedSolicitacao(solicitacao);
    setActionType('reject');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedSolicitacao || !actionType) return;

    setProcessing(true);
    
    try {
      const aprovar = actionType === 'approve';
      
      const response = await solicitacaoAusenciaService.responderSolicitacao(
        selectedSolicitacao.idSolicitacaoAusencia,
        aprovar
      );
      
      if (response.sucesso) {
        showSuccessToast(
          `Solicitação ${aprovar ? 'aprovada' : 'reprovada'} com sucesso!`
        );
        await loadSolicitacoes(); // Recarregar a lista
      } else {
        showErrorToast(response.mensagem || "Erro ao processar solicitação");
      }
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      showErrorToast("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setProcessing(false);
      setShowConfirmModal(false);
      setSelectedSolicitacao(null);
      setActionType(null);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSolicitacao(null);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedSolicitacao(null);
    setActionType(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando solicitações de ausência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solicitações de Ausência</h2>
          <p className="text-gray-600">Avalie e aprove solicitações de ausência e licenças</p>
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
            Não há solicitações de ausência no momento.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data da Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Início da Ausência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fim da Ausência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredSolicitacoes().map((solicitacao, index) => (
                <tr key={solicitacao.idSolicitacaoAusencia || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="truncate max-w-[120px]" title={solicitacao.nomeUsuario}>
                      {solicitacao.nomeUsuario}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(solicitacao.dataSolicitacao)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(solicitacao.dataInicioAusencia)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(solicitacao.dataFimAusencia)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <StatusBadge status={getStatusType(solicitacao.statusSolicitacao)} />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <ActionButton
                        type="view"
                        onClick={() => handleViewDetails(solicitacao)}
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

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Detalhes da Solicitação</h2>
              <button
                onClick={handleCloseDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Funcionário
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedSolicitacao.nomeUsuario}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <p className="mt-1">
                    <StatusBadge status={getStatusType(selectedSolicitacao.statusSolicitacao)} />
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data da Solicitação
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedSolicitacao.dataSolicitacao)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Período da Ausência
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedSolicitacao.dataInicioAusencia)} até {formatDate(selectedSolicitacao.dataFimAusencia)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Justificativa
                </label>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                  <p className="whitespace-pre-wrap break-words">
                    {selectedSolicitacao.mensagemSolicitacao}
                  </p>
                </div>
              </div>

              {selectedSolicitacao.linkArquivo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Atestado Médico
                  </label>
                  <div className="mt-1">
                    <a
                      href={selectedSolicitacao.linkArquivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Baixar Atestado
                    </a>
                  </div>
                </div>
              )}

              {selectedSolicitacao.statusSolicitacao === 1 && (
                <div className="flex gap-4 pt-4">
                  <ActionButton
                    type="approve"
                    onClick={() => {
                      handleCloseDetailsModal();
                      handleApprove(selectedSolicitacao);
                    }}
                    size="md"
                  />
                  <ActionButton
                    type="reject"
                    onClick={() => {
                      handleCloseDetailsModal();
                      handleReject(selectedSolicitacao);
                    }}
                    size="md"
                  />
                </div>
              )}

              <div className="flex justify-end pt-4">
                <ActionButton
                  type="view"
                  onClick={handleCloseDetailsModal}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
        title={actionType === 'approve' ? 'Aprovar Solicitação' : 'Reprovar Solicitação'}
        message={
          actionType === 'approve'
            ? 'Tem certeza que deseja aprovar esta solicitação de ausência?'
            : 'Tem certeza que deseja reprovar esta solicitação de ausência?'
        }
        confirmText={actionType === 'approve' ? 'Aprovar' : 'Reprovar'}
      />
    </div>
  );
}
