'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import TextArea from '@/app/components/atoms/TextArea';
import Button from '@/app/components/atoms/Button';
import { feedbackService } from '@/services/feedback';
import { tokenUtils } from '@/utils/token';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSolicitacaoCreated?: () => void; // Callback para recarregar a lista
}

const FeedbackModal = ({ isOpen, onClose, onSolicitacaoCreated }: FeedbackModalProps) => {
  const [formData, setFormData] = useState({
    mensagem: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mensagem.trim()) {
      newErrors.mensagem = 'Mensagem é obrigatória';
    } else if (formData.mensagem.length < 10) {
      newErrors.mensagem = 'Mensagem deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userId = tokenUtils.getId();
      
      if (!userId) {
        showErrorToast('Usuário não encontrado');
        return;
      }

      // Obter dados do usuário do localStorage
      const userData = localStorage.getItem('user');
      const userName = userData ? JSON.parse(userData).nome : 'Usuário';

      const solicitacaoData = {
        idUsuarioSolicitacao: Number(userId),
        nomeUsuarioSolicitacao: userName,
        idResponsavelFeedback: 29, // ID padrão para responsável
        nomeResponsavelFeedback: 'Administrador', // Nome padrão para responsável
        status: 0, // 0 = pendente
        mensagemSolicitacao: formData.mensagem
      };

      console.log('Dados sendo enviados para a API:', solicitacaoData);

      const response = await feedbackService.createSolicitacao(solicitacaoData);

      if (response.sucesso) {
        showSuccessToast('Solicitação de feedback enviada com sucesso!');
        resetForm();
        onClose();
        
        // Recarregar a lista de solicitações
        if (onSolicitacaoCreated) {
          onSolicitacaoCreated();
        }
      } else {
        showErrorToast(response.mensagem || 'Erro ao enviar solicitação');
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      showErrorToast('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mensagem: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        style={{
          opacity: '0.5',
        }}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="bg-white rounded-xl p-6 shadow-lg flex flex-col max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-51"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#002085]">Solicitar Feedback</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <TextArea
            label="Mensagem da Solicitação"
            placeholder="Descreva sua solicitação de feedback, avaliação ou qualquer outra observação que gostaria de compartilhar..."
            value={formData.mensagem}
            onTextareaChange={(value) => setFormData(prev => ({ ...prev, mensagem: value }))}
            error={errors.mensagem}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            text="Cancelar"
            backgroundColor="bg-gray-300"
            textColor="text-gray-700"
            onClick={handleClose}
            fullWidth={false}
            className="flex-1"
          />
          <Button
            text="Enviar Solicitação"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="flex-1"
          />
        </div>
      </div>
    </>
  );
};

export default FeedbackModal; 