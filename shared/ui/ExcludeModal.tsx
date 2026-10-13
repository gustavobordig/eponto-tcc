import Modal, { BotaoModal } from '@/shared/ui/Modal';

interface ExcludeModalProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function ExcludeModal({ title, message, onCancel, onConfirm, loading }: ExcludeModalProps) {
  return (
    <Modal
      isOpen
      onClose={onCancel}
      titulo={title}
      descricao={message}
      largura="sm"
      bloqueado={loading}
      rodape={
        <>
          <BotaoModal variante="secundario" onClick={onCancel} disabled={loading}>
            Cancelar
          </BotaoModal>
          <BotaoModal variante="perigo" onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo…' : 'Excluir'}
          </BotaoModal>
        </>
      }
    />
  );
}
