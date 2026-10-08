import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  titulo: string;
  icone: ReactNode;
  corIcone: string;
  onClose: () => void;
  rodape: ReactNode;
  children: ReactNode;
}

/** Overlay, cabeçalho e rodapé comuns aos modais de feedback do admin. */
export default function ModalShell({ titulo, icone, corIcone, onClose, rodape, children }: Props) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        style={{ opacity: 0.5 }}
        onClick={onClose}
      />

      <div
        className="bg-white rounded-xl shadow-xl flex flex-col max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-51"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${corIcone}`}>{icone}</div>
            <h2 className="text-xl font-semibold text-gray-900">{titulo}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} className="hover:text-red-600 cursor-pointer" />
          </button>
        </div>

        <div className="p-6 space-y-6">{children}</div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">{rodape}</div>
      </div>
    </>
  );
}
