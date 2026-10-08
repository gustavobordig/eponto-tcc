import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, MapPin, X } from 'lucide-react';
import { SlideUp } from '@/shared/ui/animations/SliderUp';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';
import { useLocalizacao } from '@/features/ponto/hooks/useLocalizacao';
import { usePontosDoDia } from '@/features/ponto/hooks/usePontosDoDia';
import LinhaDoDia from '@/features/ponto/components/LinhaDoDia';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ponto: ReturnType<typeof usePontosDoDia>;
}

/**
 * Confirma e grava a próxima marcação do dia.
 * Antes usava uma lista fictícia de 2024 como "pontos de hoje" e gravava tudo como Entrada.
 */
export function RegistrarPontoModal({ isOpen, onClose, ponto }: Props) {
  const [registrando, setRegistrando] = useState(false);
  const { endereco, texto: textoLocal } = useLocalizacao(isOpen);

  if (!isOpen) return null;

  const { proxima, marcados, registrar } = ponto;
  const agora = new Date();

  const confirmar = async () => {
    try {
      setRegistrando(true);
      await registrar(endereco ?? undefined);
      showSuccessToast(`${proxima?.label} registrada às ${format(new Date(), 'HH:mm')}`);
      onClose();
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      showErrorToast('Não foi possível registrar o ponto. Tente novamente.');
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="titulo-registrar-ponto">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <SlideUp>
        <div className="relative z-10 w-[92vw] max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 id="titulo-registrar-ponto" className="text-lg font-semibold text-gray-900">
            Registrar ponto
          </h2>

          <div className="mt-4 text-center">
            <p className="text-5xl font-bold tabular-nums text-primary">{format(agora, 'HH:mm')}</p>
            <p className="mt-1 text-sm text-gray-500">{format(agora, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[18rem] truncate">{textoLocal}</span>
            </p>
          </div>

          <div className="mt-6">
            <LinhaDoDia marcados={marcados} proxima={proxima} compacta />
          </div>

          {proxima ? (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={confirmar}
                disabled={registrando}
                className="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {registrando ? 'Registrando…' : `Registrar ${proxima.label.toLowerCase()}`}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={registrando}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              Você já registrou os quatro pontos de hoje.
            </div>
          )}
        </div>
      </SlideUp>
    </div>
  );
}
