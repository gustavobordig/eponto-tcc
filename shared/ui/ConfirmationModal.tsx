import { ReactNode } from 'react';
import Modal, { BotaoModal } from '@/shared/ui/Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  /** Classes do botão de confirmar; com "red" vira o botão de perigo */
  confirmButtonColor?: string;
  children?: ReactNode;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false,
  confirmButtonColor = '',
  children,
}: ConfirmationModalProps) {
  const perigo = /red|danger/.test(confirmButtonColor) || /^(sair|excluir|reprovar)/i.test(confirmText);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      titulo={title}
      descricao={message}
      largura="sm"
      bloqueado={loading}
      rodape={
        <>
          <BotaoModal variante="secundario" onClick={onCancel} disabled={loading}>
            {cancelText}
          </BotaoModal>
          <BotaoModal variante={perigo ? 'perigo' : 'primario'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processando…' : confirmText}
          </BotaoModal>
        </>
      }
    >
      {children && <div className="rounded-[10px] bg-background p-3 text-sm">{children}</div>}
    </Modal>
  );
}
