'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Modal, { BotaoModal } from '@/shared/ui/Modal';
import TextArea from '@/shared/ui/TextArea';
import BuscaPessoa, { OpcaoPessoa } from '@/shared/ui/BuscaPessoa';
import { feedbackService } from '@/features/feedback/api';
import { PessoaResumo, userService } from '@/features/usuarios/api';
import { tokenUtils } from '@/shared/lib/token';
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast';

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
  // Antes o pedido ia sempre para o chefe (ou para o id 29, fixo no código, para quem não tinha chefe)
  const [pessoas, setPessoas] = useState<PessoaResumo[]>([]);
  const [carregandoPessoas, setCarregandoPessoas] = useState(false);
  const [responsavel, setResponsavel] = useState<number | null>(null);
  const meuId = Number(tokenUtils.getId());

  useEffect(() => {
    if (!isOpen) return;
    setCarregandoPessoas(true);
    userService
      .pessoas()
      .then((lista) => {
        setPessoas(lista);
        // O gestor já vem escolhido
        const chefe = lista.find((p) => p.idUsuario === meuId)?.idChefe;
        setResponsavel((atual) => atual ?? chefe ?? null);
      })
      .catch((error) => console.error('Erro ao carregar pessoas:', error))
      .finally(() => setCarregandoPessoas(false));
  }, [isOpen, meuId]);

  const opcoes = useMemo<OpcaoPessoa[]>(() => {
    const chefe = pessoas.find((p) => p.idUsuario === meuId)?.idChefe;
    return pessoas
      .filter((p) => p.idUsuario !== meuId)
      .map((p) => ({ id: p.idUsuario, nome: p.nome, marca: p.idUsuario === chefe ? 'Seu gestor' : undefined }))
      .sort((a, b) => Number(Boolean(b.marca)) - Number(Boolean(a.marca)) || a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [pessoas, meuId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!responsavel) {
      newErrors.responsavel = 'Escolha para quem vai o pedido';
    }
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

      const eu = pessoas.find((p) => p.idUsuario === Number(userId));

      const solicitacaoData = {
        idUsuarioSolicitacao: Number(userId),
        nomeUsuarioSolicitacao: eu?.nome ?? 'Usuário',
        idResponsavelFeedback: responsavel!,
        nomeResponsavelFeedback: pessoas.find((p) => p.idUsuario === responsavel)?.nome ?? '',
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
    setResponsavel(null);
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
      descricao="Escolha quem vai te dar o retorno e conte sobre o quê."
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
      <div className="flex flex-col gap-4">
        <BuscaPessoa
          label="Para quem"
          opcoes={opcoes}
          valor={responsavel}
          onChange={(id) => {
            setResponsavel(id);
            setErrors(({ responsavel: _, ...resto }) => resto);
          }}
          carregando={carregandoPessoas}
          erro={errors.responsavel}
        />
        <TextArea
          label="Mensagem"
          placeholder="Ex.: queria um retorno sobre o projeto de outubro."
          value={formData.mensagem}
          onTextareaChange={(value) => setFormData((prev) => ({ ...prev, mensagem: value }))}
          error={errors.mensagem}
          textareaClassName="min-h-[120px]"
        />
      </div>
    </Modal>
  );
};

export default FeedbackModal;
