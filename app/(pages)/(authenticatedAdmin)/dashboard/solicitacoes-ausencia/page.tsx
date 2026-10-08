"use client";

import { useState } from "react";
import { solicitacaoAusenciaService } from "@/features/ausencias/api";
import { SolicitacaoComUsuario, useSolicitacoesAusencia } from "@/features/ausencias/hooks/useSolicitacoesAusencia";
import { getStatusColor, getStatusText, isPendente } from "@/features/ausencias/status";
import { showSuccessToast, showErrorToast } from "@/shared/lib/toast";
import Button from "@/shared/ui/Button";
import LoadingText from "@/shared/ui/LoadingText";
import ConfirmationModal from "@/shared/ui/ConfirmationModal";

export default function SolicitacoesAusenciaPage() {
  const { solicitacoes, loading, recarregar } = useSolicitacoesAusencia();
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoComUsuario | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
        await recarregar();
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
      <div className="flex justify-center items-center h-64">
        <LoadingText title="solicitações" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Solicitações de Ausência
          </h1>
          <div className="text-sm text-gray-500">
            Total: {solicitacoes.length} solicitações
          </div>
        </div>

        {solicitacoes.length === 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                    Data da Solicitação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                    Início da Ausência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                    Fim da Ausência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitacoes.map((solicitacao, index) => (
                  <tr key={solicitacao.idSolicitacaoAusencia || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 min-w-[150px]">
                      <div className="truncate max-w-[120px]" title={solicitacao.nomeUsuario}>
                        {solicitacao.nomeUsuario}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 min-w-[140px] whitespace-nowrap">
                      {formatDate(solicitacao.dataSolicitacao)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 min-w-[140px] whitespace-nowrap">
                      {formatDate(solicitacao.dataInicioAusencia)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 min-w-[140px] whitespace-nowrap">
                      {formatDate(solicitacao.dataFimAusencia)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 min-w-[100px] whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitacao.statusSolicitacao)}`}>
                        {getStatusText(solicitacao.statusSolicitacao)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium min-w-[200px] whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          text="Ver"
                          backgroundColor="bg-gray-200"
                          textColor="text-gray-700"
                          onClick={() => handleViewDetails(solicitacao)}
                          fullWidth={false}
                        />
                        {isPendente(solicitacao.statusSolicitacao) && (
                          <>
                            <Button
                              text="Aprovar"
                              backgroundColor="bg-green-600"
                              textColor="text-white"
                              onClick={() => handleApprove(solicitacao)}
                              fullWidth={false}
                            />
                            <Button
                              text="Reprovar"
                              backgroundColor="bg-red-600"
                              textColor="text-white"
                              onClick={() => handleReject(solicitacao)}
                              fullWidth={false}
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
      </div>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSolicitacao.statusSolicitacao)}`}>
                      {getStatusText(selectedSolicitacao.statusSolicitacao)}
                    </span>
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

              {isPendente(selectedSolicitacao.statusSolicitacao) && (
                <div className="flex gap-4 pt-4">
                  <Button
                    text="Aprovar"
                    backgroundColor="bg-green-600"
                    textColor="text-white"
                    onClick={() => {
                      handleCloseDetailsModal();
                      handleApprove(selectedSolicitacao);
                    }}
                    fullWidth={true}
                  />
                  <Button
                    text="Reprovar"
                    backgroundColor="bg-red-600"
                    textColor="text-white"
                    onClick={() => {
                      handleCloseDetailsModal();
                      handleReject(selectedSolicitacao);
                    }}
                    fullWidth={true}
                  />
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  text="Fechar"
                  backgroundColor="bg-gray-200"
                  textColor="text-gray-700"
                  onClick={handleCloseDetailsModal}
                  fullWidth={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onCancel={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
        title={actionType === 'approve' ? 'Aprovar Solicitação' : 'Reprovar Solicitação'}
        message={
          actionType === 'approve'
            ? 'Tem certeza que deseja aprovar esta solicitação de ausência?'
            : 'Tem certeza que deseja reprovar esta solicitação de ausência?'
        }
        confirmText={actionType === 'approve' ? 'Aprovar' : 'Reprovar'}
        cancelText="Cancelar"
        loading={processing}
      />
    </div>
  );
}