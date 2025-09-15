"use client";

import { useState, useEffect } from "react";
import { tokenUtils } from "@/utils/token";
import { solicitacaoAusenciaService, SolicitacaoAusencia } from "@/services/solicitacaoAusencia";
import { showErrorToast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import Button from "@/app/components/atoms/Button";
import LoadingText from "@/app/components/atoms/LoadingText";

export default function MinhasSolicitacoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAusencia[]>([]);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoAusencia | null>(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return "Pendente";
      case 2: return "Aprovada";
      case 3: return "Reprovada";
      default: return "Desconhecido";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return "bg-yellow-100 text-yellow-800";
      case 2: return "bg-green-100 text-green-800";
      case 3: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const loadSolicitacoes = async () => {
    try {
      // DADOS MOCKADOS PARA TESTE - REMOVER QUANDO A API ESTIVER FUNCIONANDO
      const mockSolicitacoes: SolicitacaoAusencia[] = [
        {
          idSolicitacaoAusencia: 1,
          idUsuario: 1,
          mensagemSolicitacao: "Preciso me ausentar por motivos médicos. Tenho consulta marcada e exames para realizar.",
          dataInicioAusencia: "2024-01-15T00:00:00",
          dataFimAusencia: "2024-01-15T00:00:00",
          linkArquivo: "/docs/atestado-medico-1.pdf",
          statusSolicitacao: 1, // Pendente
          dataSolicitacao: "2024-01-10T00:00:00"
        },
        {
          idSolicitacaoAusencia: 2,
          idUsuario: 1,
          mensagemSolicitacao: "Ausência por motivo familiar. Falecimento de parente próximo.",
          dataInicioAusencia: "2024-01-20T00:00:00",
          dataFimAusencia: "2024-01-22T00:00:00",
          linkArquivo: "/docs/atestado-medico-2.pdf",
          statusSolicitacao: 2, // Aprovada
          dataSolicitacao: "2024-01-18T00:00:00"
        },
        {
          idSolicitacaoAusencia: 3,
          idUsuario: 1,
          mensagemSolicitacao: "Tratamento médico contínuo. Sessões de fisioterapia.",
          dataInicioAusencia: "2024-02-01T00:00:00",
          dataFimAusencia: "2024-02-05T00:00:00",
          linkArquivo: "/docs/atestado-medico-3.pdf",
          statusSolicitacao: 3, // Reprovada
          dataSolicitacao: "2024-01-28T00:00:00"
        }
      ];

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSolicitacoes(mockSolicitacoes);

      // CÓDIGO ORIGINAL COMENTADO - DESCOMENTAR QUANDO A API ESTIVER FUNCIONANDO
      /*
      const userId = tokenUtils.getId();
      if (!userId) {
        showErrorToast("Usuário não encontrado");
        router.push('/');
        return;
      }

      const response = await solicitacaoAusenciaService.obterSolicitacoesPorUsuario(Number(userId));
      
      if (response.sucesso && response.solicitacoes) {
        setSolicitacoes(response.solicitacoes);
      } else {
        showErrorToast(response.mensagem || "Erro ao carregar solicitações");
      }
      */
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

  const handleViewDetails = (solicitacao: SolicitacaoAusencia) => {
    setSelectedSolicitacao(solicitacao);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSolicitacao(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingText title="solicitações" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Minhas Solicitações de Ausência
          </h1>
          <Button
            text="Nova Solicitação"
            backgroundColor="bg-blue-600"
            textColor="text-white"
            onClick={() => router.push('/solicitar-ausencia')}
            fullWidth={false}
          />
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
            <p className="text-gray-500 mb-4">
              Você ainda não possui solicitações de ausência.
            </p>
            <Button
              text="Fazer Nova Solicitação"
              backgroundColor="bg-blue-600"
              textColor="text-white"
              onClick={() => router.push('/solicitar-ausencia')}
              fullWidth={false}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitacoes.map((solicitacao, index) => (
                  <tr key={solicitacao.idSolicitacaoAusencia || index} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 text-sm font-medium min-w-[150px] whitespace-nowrap">
                      <Button
                        text="Ver Detalhes"
                        backgroundColor="bg-gray-200"
                        textColor="text-gray-700"
                        onClick={() => handleViewDetails(solicitacao)}
                        fullWidth={false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Detalhes da Solicitação</h2>
              <button
                onClick={handleCloseModal}
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
                    Data da Solicitação
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedSolicitacao.dataSolicitacao)}
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
                    Data de Início
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedSolicitacao.dataInicioAusencia)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data de Fim
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedSolicitacao.dataFimAusencia)}
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

              <div className="flex justify-end pt-4">
                <Button
                  text="Fechar"
                  backgroundColor="bg-gray-200"
                  textColor="text-gray-700"
                  onClick={handleCloseModal}
                  fullWidth={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}