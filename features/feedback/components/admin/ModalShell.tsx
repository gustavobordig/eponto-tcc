import { ReactNode } from 'react';
import Modal from '@/shared/ui/Modal';

interface Props {
  titulo: string;
  icone: ReactNode;
  /** Mantido por compatibilidade; o ícone usa a cor da marca */
  corIcone?: string;
  onClose: () => void;
  rodape: ReactNode;
  children: ReactNode;
}

/** Casca comum aos modais de feedback do admin. */
export default function ModalShell({ titulo, icone, onClose, rodape, children }: Props) {
  return (
    <Modal isOpen onClose={onClose} titulo={titulo} icone={icone} rodape={rodape} largura="lg">
      <div className="flex flex-col gap-5">{children}</div>
    </Modal>
  );
}
