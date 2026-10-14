import { useState } from 'react';
import { format } from 'date-fns';
import { Check, CheckCircle2, Fingerprint, MapPin, RotateCw } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';
import { useLocalizacao } from '@/features/ponto/hooks/useLocalizacao';
import { usePontosDoDia } from '@/features/ponto/hooks/usePontosDoDia';
import { ETAPAS_DO_DIA } from '@/features/ponto/etapas';
import { horaMinuto, useAgora } from '@/shared/lib/useAgora';
import Modal, { BotaoModal } from '@/shared/ui/Modal';

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
  const { endereco, texto: textoLocal, falhou, tentarDeNovo } = useLocalizacao(isOpen);
  const agora = useAgora();
  const { proxima, marcados, registrar } = ponto;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo="Registrar ponto"
      largura="sm"
      bloqueado={registrando}
      rodape={
        proxima && (
          <>
            <BotaoModal variante="secundario" onClick={onClose} disabled={registrando}>
              Cancelar
            </BotaoModal>
            <BotaoModal onClick={confirmar} disabled={registrando}>
              <Fingerprint className="h-4 w-4" />
              {registrando ? 'Registrando…' : `Registrar ${proxima.label.toLowerCase()}`}
            </BotaoModal>
          </>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 rounded-[14px] bg-primary px-5 py-5 text-white">
          <p className="font-mono text-5xl font-semibold tracking-[-2px]" suppressHydrationWarning>
            {agora ? horaMinuto(agora) : '--:--'}
          </p>
          <p className="text-sm text-white/85 first-letter:uppercase" suppressHydrationWarning>
            {agora?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <p className="mt-1 flex max-w-full items-center gap-1.5 text-xs text-white/80">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{textoLocal}</span>
            {falhou && (
              <button
                type="button"
                onClick={tentarDeNovo}
                aria-label="Tentar obter a localização de novo"
                title="Tentar de novo"
                className="ml-0.5 shrink-0 rounded-full p-1 text-white hover:bg-white/[.14]"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            )}
          </p>
        </div>

        <ol className="grid grid-cols-4 gap-2">
          {ETAPAS_DO_DIA.map((etapa) => {
            const marcado = marcados.find((m) => m.etapa.tipo === etapa.tipo);
            const ehProxima = proxima?.tipo === etapa.tipo;
            return (
              <li
                key={etapa.tipo}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center ${
                  ehProxima ? 'bg-primary-soft ring-1 ring-primary/40' : 'bg-background'
                }`}
              >
                <span className={marcado ? 'text-ok' : ehProxima ? 'text-primary' : 'text-subtle'}>
                  {marcado ? <Check className="h-4 w-4" /> : etapa.icone('h-4 w-4')}
                </span>
                <span className="text-[11px] leading-tight text-muted">{etapa.label}</span>
                <span className={`font-mono text-sm font-semibold ${marcado ? '' : 'text-subtle'}`}>{marcado?.hora ?? '--:--'}</span>
              </li>
            );
          })}
        </ol>

        {!proxima && (
          <p className="flex items-center gap-2 rounded-[10px] bg-ok-soft p-3 text-sm text-ok-ink">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Você já registrou os quatro pontos de hoje.
          </p>
        )}
      </div>
    </Modal>
  );
}
