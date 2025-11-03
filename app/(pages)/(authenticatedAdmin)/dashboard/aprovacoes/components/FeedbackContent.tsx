'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Eye, Clock, User, X, CheckCircle, AlertCircle, MessageCircle, Send, Star } from 'lucide-react';
import { feedbackService, SolicitacaoData, FeedbackInsertData, FeedbackData } from '@/services/feedback';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { tokenUtils } from '@/utils/token';
import TextArea from '@/app/components/atoms/TextArea';
import Button from '@/app/components/atoms/Button';
import ActionButton from '@/app/components/atoms/ActionButton';
import StatusBadge from '@/app/components/atoms/StatusBadge';
import StatsCard from '@/app/components/atoms/StatsCard';

interface SolicitacaoResponse {
  sucesso: boolean;
  mensagem: string | null;
  solicitacao: SolicitacaoData | null;
  solicitacoes: SolicitacaoData[] | null;
  solicitacoesFeedback: SolicitacaoData[] | null;
  feedback: SolicitacaoData | null;
  feedbacks: SolicitacaoData[] | null;
}

interface FeedbackResponse {
  sucesso: boolean;
  mensagem: string | null;
  feedback: FeedbackData | null;
  feedbacks: FeedbackData[] | null;
}

export default function FeedbackContent() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoData[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoData | null>(null);
  const [feedbackData, setFeedbackData] = useState({
    mensagemFeedback: '',
    avaliacao: 4
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackErrors, setFeedbackErrors] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('all');

  const getStatusType = (status: number): 'pending' | 'answered' => {
    switch (status) {
      case 0:
        return 'pending';
      case 1:
        return 'answered';
      default:
        return 'pending';
    }
  };

  const getFilteredSolicitacoes = () => {
    if (statusFilter === 'all') return solicitacoes;
    
    return solicitacoes.filter(solicitacao => {
      switch (statusFilter) {
        case 'pending':
          return solicitacao.status === 0;
        case 'answered':
          return solicitacao.status === 1;
        default:
          return true;
      }
    });
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

  const fetchSolicitacoes = async () => {
    try {
      const response = await feedbackService.getAllSolicitacoes() as SolicitacaoResponse;
      console.log('Resposta da API:', response);
      
      if (response.sucesso && response.solicitacoesFeedback) {
        console.log('Solicitações encontradas:', response.solicitacoesFeedback);
        setSolicitacoes(response.solicitacoesFeedback);
      } else {
        console.log('Nenhuma solicitação encontrada ou erro na resposta');
        setSolicitacoes([]);
      }
    } catch (error) {
      showErrorToast('Erro ao carregar solicitações de feedback');
      console.error('Erro ao carregar solicitações:', error);
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackService.getAllFeedbacks() as FeedbackResponse;
      console.log('Resposta da API de feedbacks:', response);
      
      if (response.sucesso && response.feedbacks) {
        console.log('Feedbacks encontrados:', response.feedbacks);
        setFeedbacks(response.feedbacks);
      } else {
        console.log('Nenhum feedback encontrado ou erro na resposta');
        setFeedbacks([]);
      }
    } catch (error) {
      showErrorToast('Erro ao carregar feedbacks');
      console.error('Erro ao carregar feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
    fetchFeedbacks();
  }, []);

  const handleView = (solicitacao: SolicitacaoData) => {
    setSelectedSolicitacao(solicitacao);
    setIsViewModalOpen(true);
  };

  const handleViewClose = () => {
    setIsViewModalOpen(false);
    setSelectedSolicitacao(null);
  };

  const handleFeedback = (solicitacao: SolicitacaoData) => {
    setSelectedSolicitacao(solicitacao);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackClose = () => {
    setIsFeedbackModalOpen(false);
    setSelectedSolicitacao(null);
    setFeedbackData({ mensagemFeedback: '', avaliacao: 4 });
    setFeedbackErrors({});
  };

  const validateFeedbackForm = () => {
    const newErrors: Record<string, string> = {};

    if (!feedbackData.mensagemFeedback.trim()) {
      newErrors.mensagemFeedback = 'Mensagem é obrigatória';
    } else if (feedbackData.mensagemFeedback.length < 10) {
      newErrors.mensagemFeedback = 'Mensagem deve ter pelo menos 10 caracteres';
    }

    if (feedbackData.avaliacao < 0 || feedbackData.avaliacao > 4) {
      newErrors.avaliacao = 'Avaliação deve ser entre 0 e 4';
    }

    setFeedbackErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitFeedback = async () => {
    if (!validateFeedbackForm() || !selectedSolicitacao) {
      return;
    }

    setFeedbackLoading(true);

    try {
      const userId = tokenUtils.getId();
      
      if (!userId) {
        showErrorToast('Usuário não encontrado');
        return;
      }

      const feedbackInsertData: Omit<FeedbackInsertData, 'idFeedback'> = {
        idUsuarioFeedback: selectedSolicitacao.idUsuarioSolicitacao,
        idAutorFeedback: Number(userId),
        idSolicitacaoFeedback: selectedSolicitacao.idSolicitacaoFeedback,
        mensagemFeedback: feedbackData.mensagemFeedback,
        avaliacao: feedbackData.avaliacao
      };

      console.log('Dados sendo enviados para a API:', feedbackInsertData);

      // Inserir o feedback
      const feedbackResponse = await feedbackService.createFeedback(feedbackInsertData);

      if (feedbackResponse.sucesso) {
        // Atualizar o status da solicitação para "Respondido" (status = 1)
        try {
          await feedbackService.updateSolicitacaoStatus(selectedSolicitacao.idSolicitacaoFeedback, 1);
        } catch (statusError) {
          console.warn('Erro ao atualizar status da solicitação:', statusError);
          // Não falhar se apenas a atualização do status der erro
        }

        showSuccessToast('Feedback enviado com sucesso!');
        handleFeedbackClose();
        fetchSolicitacoes(); // Recarregar a lista
        fetchFeedbacks(); // Recarregar feedbacks
      } else {
        showErrorToast(feedbackResponse.mensagem || 'Erro ao enviar feedback');
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      showErrorToast('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
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

  const truncateText = (text: string | null | undefined, maxLength: number = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Preparar dados para a tabela de solicitações
  const tableData = getFilteredSolicitacoes()?.map(solicitacao => ({
    ...solicitacao,
    statusType: getStatusType(solicitacao.status),
    dataSolicitacao: formatDate(solicitacao.dataSolicitacao),
    mensagemSolicitacao: truncateText(solicitacao.mensagemSolicitacao, 60)
  })) || [];

  // Preparar dados para a tabela de feedbacks
  const feedbackTableData = feedbacks?.map(feedback => ({
    ...feedback,
    dataRealizacao: formatDate(feedback.dataRealizacao),
    mensagemFeedback: truncateText(feedback.mensagemFeedback, 60),
    avaliacao: getRatingStars(feedback.avaliacao)
  })) || [];

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando solicitações de feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solicitações de Feedback</h2>
          <p className="text-gray-600">Responda a solicitações de feedback dos usuários</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg ${
            statusFilter === 'all' ? 'ring-2 ring-blue-400 shadow-lg' : ''
          }`}
        >
          <StatsCard
            title="Total"
            count={solicitacoes?.length || 0}
            type="total"
            icon={<Clock className="text-blue-600" size={20} />}
          />
        </div>
        <div 
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg ${
            statusFilter === 'pending' ? 'ring-2 ring-yellow-400 shadow-lg' : ''
          }`}
        >
          <StatsCard
            title="Pendentes"
            count={solicitacoes?.filter(s => s.status === 0).length || 0}
            type="pending"
            icon={<Clock className="text-yellow-600" size={20} />}
          />
        </div>
        <div 
          onClick={() => setStatusFilter(statusFilter === 'answered' ? 'all' : 'answered')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg ${
            statusFilter === 'answered' ? 'ring-2 ring-green-400 shadow-lg' : ''
          }`}
        >
          <StatsCard
            title="Respondidas"
            count={solicitacoes?.filter(s => s.status === 1).length || 0}
            type="answered"
            icon={<Clock className="text-green-600" size={20} />}
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
              'bg-green-100 text-green-800'
            }`}>
              {statusFilter === 'pending' ? 'Pendentes' : 'Respondidas'}
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

      {/* Tabela de Solicitações */}
      {getFilteredSolicitacoes() && getFilteredSolicitacoes().length > 0 ? (
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data da Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mensagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.nomeUsuarioSolicitacao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.dataSolicitacao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.statusType} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.mensagemSolicitacao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <ActionButton
                        type="view"
                        onClick={() => handleView(solicitacoes[index])}
                      />
                      {solicitacoes[index].status !== 1 && (
                        <ActionButton
                          type="respond"
                          onClick={() => handleFeedback(solicitacoes[index])}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 mb-8">
          <MessageSquare className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
          <p className="mt-2 text-gray-500">Não há solicitações de feedback para exibir.</p>
        </div>
      )}

      {/* Modal de Visualização */}
      {isViewModalOpen && selectedSolicitacao && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
            onClick={handleViewClose}
          />
          
          {/* Modal */}
          <div 
            className="bg-white rounded-xl shadow-xl flex flex-col max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-51"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Detalhes da Solicitação</h2>
              </div>
              <button
                onClick={handleViewClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} className="hover:text-red-600 cursor-pointer" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex justify-center">
                <StatusBadge status={getStatusType(selectedSolicitacao.status)} size="md" />
              </div>

              {/* Informações do Solicitante */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Informações do Solicitante
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Nome:</label>
                    <p className="text-gray-900 font-medium">{selectedSolicitacao.nomeUsuarioSolicitacao}</p>
                  </div>
                </div>
              </div>

              {/* Informações da Solicitação */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-green-600" />
                  Informações da Solicitação
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Data da Solicitação:</label>
                    <p className="text-gray-900 font-medium">{formatDate(selectedSolicitacao.dataSolicitacao)}</p>
                  </div>
                </div>
              </div>

              {/* Mensagem */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle size={18} className="text-purple-600" />
                  Mensagem da Solicitação
                </h4>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedSolicitacao.mensagemSolicitacao}</p>
                </div>
              </div>

              {/* Responsável */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={18} className="text-orange-600" />
                  Responsável
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Nome:</label>
                    <p className="text-gray-900 font-medium">{selectedSolicitacao.nomeResponsavelFeedback}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              {selectedSolicitacao.status !== 1 && (
                <ActionButton
                  type="respond"
                  onClick={() => {
                    handleViewClose();
                    handleFeedback(selectedSolicitacao);
                  }}
                  size="md"
                />
              )}
              <ActionButton
                type="view"
                onClick={handleViewClose}
                size="md"
              />
            </div>
          </div>
        </>
      )}

      {/* Modal de Inserir Feedback */}
      {isFeedbackModalOpen && selectedSolicitacao && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
            onClick={handleFeedbackClose}
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
                  <Send className="text-green-600" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Inserir Feedback</h2>
              </div>
              <button
                onClick={handleFeedbackClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} className="hover:text-red-600 cursor-pointer" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Informações da Solicitação */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Solicitação de {selectedSolicitacao.nomeUsuarioSolicitacao}</h4>
                <p className="text-gray-600 text-sm">{selectedSolicitacao.mensagemSolicitacao}</p>
              </div>

              {/* Formulário de Feedback */}
              <div className="space-y-4">
                <TextArea
                  label="Mensagem do Feedback"
                  placeholder="Digite sua resposta, feedback ou avaliação para esta solicitação..."
                  value={feedbackData.mensagemFeedback}
                  onTextareaChange={(value) => setFeedbackData(prev => ({ ...prev, mensagemFeedback: value }))}
                  error={feedbackErrors.mensagemFeedback}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avaliação (0-4)
                  </label>
                  <select
                    value={feedbackData.avaliacao}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, avaliacao: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>0 - Péssimo</option>
                    <option value={1}>1 - Ruim</option>
                    <option value={2}>2 - Regular</option>
                    <option value={3}>3 - Bom</option>
                    <option value={4}>4 - Excelente</option>
                  </select>
                  {feedbackErrors.avaliacao && (
                    <p className="text-red-500 text-sm mt-1">{feedbackErrors.avaliacao}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleFeedbackClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <Button
                text="Enviar Feedback"
                onClick={handleSubmitFeedback}
                isLoading={feedbackLoading}
                className="px-4 py-2"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
