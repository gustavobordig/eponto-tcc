'use client';

import { useEffect, useState, useCallback } from 'react';
import Button from '@/app/components/atoms/Button';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, X, Star } from 'lucide-react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { feedbackService, SolicitacaoData, FeedbackData } from '@/services/feedback';
import { tokenUtils } from '@/utils/token';
import { showErrorToast } from '@/utils/toast';

export default function FeedbackPage() {
  const { openFeedbackModal, solicitacoes, setSolicitacoes } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoData | null>(null);
  const [feedbackResponse, setFeedbackResponse] = useState<FeedbackData | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchSolicitacoes = useCallback(async () => {
    try {
      const userId = tokenUtils.getId();
      
      if (!userId) {
        showErrorToast('Usuário não encontrado');
        return;
      }

      const response = await feedbackService.getSolicitacoesByUsuario(Number(userId));
      
      if (response.sucesso && response.solicitacoesFeedback) {
        setSolicitacoes(response.solicitacoesFeedback);
      } else {
        setSolicitacoes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      showErrorToast('Erro ao carregar suas solicitações');
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  }, [setSolicitacoes]);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  // Atualizar o contexto com a função de refresh
  useEffect(() => {
    // Registrar o callback de refresh no layout
    if (typeof window !== 'undefined' && (window as any).registerFeedbackRefresh) {
      (window as any).registerFeedbackRefresh(fetchSolicitacoes);
    }
  }, [fetchSolicitacoes]);

  const handleViewResponse = async (solicitacao: SolicitacaoData) => {
    setSelectedSolicitacao(solicitacao);
    setFeedbackLoading(true);
    setIsResponseModalOpen(true);

    try {
      // Buscar o feedback relacionado a esta solicitação
      const response = await feedbackService.getAllFeedbacks();
      
      if (response.sucesso && response.feedbacks) {
        const feedback = response.feedbacks.find(f => f.idSolicitacaoFeedback === solicitacao.idSolicitacaoFeedback);
        setFeedbackResponse(feedback || null);
      } else {
        setFeedbackResponse(null);
      }
    } catch (error) {
      console.error('Erro ao buscar feedback:', error);
      showErrorToast('Erro ao carregar resposta');
      setFeedbackResponse(null);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleResponseClose = () => {
    setIsResponseModalOpen(false);
    setSelectedSolicitacao(null);
    setFeedbackResponse(null);
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return 'Pendente';
      case 1:
        return 'Respondido';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <AlertCircle className="text-yellow-600" size={16} />;
      case 1:
        return <CheckCircle className="text-green-600" size={16} />;
      default:
        return <AlertCircle className="text-gray-600" size={16} />;
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string | null | undefined, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Avaliação de Desempenho</h1>
                <p className="text-gray-600">Solicite uma avaliação de desempenho do seu gerente</p>
              </div>
            </div>
            <Button
              text="Nova Solicitação"
              icon={<Plus size={20} />}
              onClick={openFeedbackModal}
              fullWidth={false}
            />
          </div>
          
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando suas solicitações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Avaliação de Desempenho</h1>
              <p className="text-gray-600">Solicite uma avaliação de desempenho do seu gerente</p>
            </div>
          </div>
          <Button
            text="Nova Solicitação"
            icon={<Plus size={20} />}
            onClick={openFeedbackModal}
            fullWidth={false}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Suas Solicitações de Avaliação</h2>
          
          {solicitacoes.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-600 mb-4">
                Você ainda não solicitou nenhuma avaliação de desempenho.
              </p>
              <Button
                text="Solicitar Primeira Avaliação"
                onClick={openFeedbackModal}
                fullWidth={false}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoes.map((solicitacao) => (
                <div 
                  key={solicitacao.idSolicitacaoFeedback} 
                  className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                    solicitacao.status === 1 ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => solicitacao.status === 1 && handleViewResponse(solicitacao)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(solicitacao.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitacao.status)}`}>
                          {getStatusLabel(solicitacao.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(solicitacao.dataSolicitacao)}
                        </span>
                        {solicitacao.status === 1 && (
                          <span className="text-xs text-blue-600 font-medium">
                            Clique para ver a resposta
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Responsável:</strong> {solicitacao.nomeResponsavelFeedback}
                        </p>
                        <p className="text-gray-900">
                          {truncateText(solicitacao.mensagemSolicitacao)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Resposta */}
      {isResponseModalOpen && selectedSolicitacao && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            style={{
              opacity: 0.5
            }}
            onClick={handleResponseClose}
          />
          
          {/* Modal */}
          <div 
            className="bg-white rounded-xl shadow-xl flex flex-col max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-51"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Resposta da Solicitação</h2>
              </div>
              <button
                onClick={handleResponseClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} className="hover:text-red-600 cursor-pointer" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Informações da Solicitação */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Sua Solicitação</h4>
                <p className="text-gray-600 text-sm">{selectedSolicitacao.mensagemSolicitacao}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Enviada em: {formatDate(selectedSolicitacao.dataSolicitacao)}
                </p>
              </div>

              {/* Resposta */}
              {feedbackLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Carregando resposta...</p>
                </div>
              ) : feedbackResponse ? (
                <div className="space-y-4">
                  {/* Avaliação */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="text-yellow-600" size={18} />
                      Avaliação Recebida
                    </h4>
                    <div className="flex items-center gap-2">
                      {getRatingStars(feedbackResponse.avaliacao)}
                    </div>
                  </div>

                  {/* Mensagem da Resposta */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="text-green-600" size={18} />
                      Resposta do Administrador
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {feedbackResponse.mensagemFeedback}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Respondido em: {formatDate(feedbackResponse.dataRealizacao)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resposta não encontrada</h3>
                  <p className="text-gray-600">
                    Não foi possível carregar a resposta para esta solicitação.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleResponseClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 