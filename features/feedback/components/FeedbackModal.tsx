'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Modal, { BotaoModal } from '@/shared/ui/Modal';
import TextArea from '@/shared/ui/TextArea';
import { feedbackService } from '@/features/feedback/api';
import { userService } from '@/features/usuarios/api';
import { tokenUtils } from '@/shared/lib/token';
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast';

// Responsável usado quando o usuário não tem chefe cadastrado. Era o único valor
// antes (fixo no código); o ideal é a API escolher o responsável.
const RESPONSAVEL_PADRAO = 29;

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

      // O pedido vai para o chefe direto do usuário
      const { usuario } = await userService.getById(Number(userId));

      const solicitacaoData = {
        idUsuarioSolicitacao: Number(userId),
        nomeUsuarioSolicitacao: usuario?.nome ?? 'Usuário',
        idResponsavelFeedback: usuario?.idChefe || RESPONSAVEL_PADRAO,
        nomeResponsavelFeedback: '',
        status: 0, // 0 = pendente
        mensagemSolicitacao: formData.mensagem
      };


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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titulo="Pedir feedback"
      descricao="O pedido vai para o seu gestor. Conte sobre o que você quer um retorno."
      icone={<MessageSquare className="h-5 w-5" />}
      bloqueado={isLoading}
      rodape={
        <>
          <BotaoModal variante="secundario" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </BotaoModal>
          <BotaoModal onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Enviando…' : 'Enviar Solicitação'}
          </BotaoModal>
        </>
      }
    >
      <TextArea
        label="Mensagem"
        placeholder="Ex.: queria um retorno sobre o projeto de outubro."
        value={formData.mensagem}
        onTextareaChange={(value) => setFormData((prev) => ({ ...prev, mensagem: value }))}
        error={errors.mensagem}
        textareaClassName="min-h-[120px]"
      />
    </Modal>
  );
};

export default FeedbackModal;
