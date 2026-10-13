'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  /** Ícone em quadrado à esquerda do título */
  icone?: ReactNode;
  rodape?: ReactNode;
  children?: ReactNode;
  largura?: 'sm' | 'md' | 'lg';
  /** Impede fechar (por exemplo, enquanto salva) */
  bloqueado?: boolean;
}

const LARGURA = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

/**
 * Casca dos modais no padrão MK Ponto: fundo escurecido, cartão branco de
 * cantos 16px, título com fechar e rodapé de ações. Fecha com Esc ou clique fora.
 */
export default function Modal({ isOpen, onClose, titulo, descricao, icone, rodape, children, largura = 'md', bloqueado = false }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && !bloqueado && onClose();
    document.addEventListener('keydown', esc);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose, bloqueado]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e1430]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !bloqueado && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_60px_rgba(14,20,48,.25)] sm:rounded-2xl ${LARGURA[largura]}`}
      >
        <div className="flex items-start gap-3 px-6 pb-2 pt-5">
          {icone && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-primary-soft text-primary">{icone}</span>}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="text-[17px] font-bold">{titulo}</h2>
            {descricao && <p className="text-[13px] text-muted">{descricao}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={bloqueado}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted hover:bg-background hover:text-foreground disabled:opacity-40"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        {children && <div className="overflow-y-auto px-6 py-4">{children}</div>}
        {rodape && <div className="flex flex-wrap justify-end gap-2.5 border-t border-surface-2 px-6 py-4">{rodape}</div>}
      </div>
    </div>
  );
}

/** Botões padrão do rodapé */
export function BotaoModal({
  children,
  onClick,
  variante = 'primario',
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const estilo = {
    primario: 'bg-primary text-white hover:bg-primary-dark',
    secundario: 'border border-line bg-white text-foreground hover:bg-background',
    perigo: 'bg-danger text-white hover:brightness-95',
  }[variante];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${estilo}`}
    >
      {children}
    </button>
  );
}
