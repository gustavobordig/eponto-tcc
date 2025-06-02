'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/atoms/container';
import { listAdjustmentRequests, updateAdjustmentRequest } from '@/services/timeRecordAdjustment';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';

interface ItemRegistro {
  horaRegistro: string;
  idTipoRegistroPonto: number;
}

interface SolicitacaoAjuste {
  idSolicitante: number;
  justificativa: string;
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
  const [observacao, setObservacao] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

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
    setObservacao('');
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedSolicitacao) return;

    setUpdateLoading(true);
    try {
      await updateAdjustmentRequest(selectedSolicitacao.idSolicitante, status, observacao);
      showSuccessToast(`Solicitação ${status.toLowerCase()} com sucesso!`);
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Solicitações de Ajuste de Ponto</h1>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  ID Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Data Alteração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Justificativa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(solicitacoes) && solicitacoes.map((solicitacao, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {solicitacao.idSolicitante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {formatarData(solicitacao.dataRegistroAlteracao)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {solicitacao.justificativa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {solicitacao.itens.map((item, i) => (
                      <div key={i}>
                        {formatarHora(item.horaRegistro)} - 
                        {item.idTipoRegistroPonto === 1 ? ' Entrada' : ' Saída'}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(index)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!Array.isArray(solicitacoes) || solicitacoes.length === 0) && (
          <div className="text-center py-8">
            <p className="text-black">Nenhuma solicitação encontrada.</p>
          </div>
        )}
      </div>

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

              <div>
                <label htmlFor="observacao" className="block text-sm font-medium text-black">
                  Observação
                </label>
                <textarea
                  id="observacao"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  text="Rejeitar"
                  backgroundColor="bg-red-600"
                  textColor="text-white"
                  onClick={() => handleUpdateStatus('REJEITADO')}
                  disabled={updateLoading}
                />
                <Button
                  text="Aprovar"
                  backgroundColor="bg-green-600"
                  textColor="text-white"
                  onClick={() => handleUpdateStatus('APROVADO')}
                  disabled={updateLoading}
                />
              </div>

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