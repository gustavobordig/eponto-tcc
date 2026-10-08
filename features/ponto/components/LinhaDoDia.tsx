import { Check } from 'lucide-react';
import { ETAPAS_DO_DIA, EtapaDoDia, minutosDeAtraso } from '@/features/ponto/etapas';
import { PontoMarcado } from '@/features/ponto/hooks/usePontosDoDia';

interface Props {
  marcados: PontoMarcado[];
  proxima: EtapaDoDia | null;
  compacta?: boolean;
}

/**
 * As quatro marcações do dia: registradas (com horário e atraso), a próxima
 * destacada e as demais com o horário de referência, em cinza.
 */
export default function LinhaDoDia({ marcados, proxima, compacta = false }: Props) {
  return (
    <ol className="grid grid-cols-4 gap-2">
      {ETAPAS_DO_DIA.map((etapa) => {
        const marcado = marcados.find((m) => m.etapa.tipo === etapa.tipo);
        const ehProxima = proxima?.tipo === etapa.tipo;
        const atraso = marcado ? minutosDeAtraso(etapa, marcado.hora) : 0;

        return (
          <li key={etapa.tipo} className="flex flex-col items-center text-center">
            <span
              className={`flex items-center justify-center rounded-full ${compacta ? 'h-10 w-10' : 'h-12 w-12'} ${
                marcado
                  ? 'bg-primary text-white'
                  : ehProxima
                    ? 'bg-primary-soft text-primary ring-2 ring-primary'
                    : 'bg-gray-100 text-gray-400'
              }`}
              aria-hidden
            >
              {marcado ? <Check className="h-5 w-5" /> : etapa.icone()}
            </span>
            <span className={`mt-2 text-xs leading-tight ${marcado || ehProxima ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {etapa.label}
            </span>
            {marcado ? (
              <span className="text-sm font-semibold tabular-nums text-gray-900">{marcado.hora}</span>
            ) : ehProxima ? (
              <span className="text-xs font-semibold text-primary">Próximo</span>
            ) : (
              <span className="text-xs tabular-nums text-gray-400" title="Horário de referência">
                {etapa.referencia}
              </span>
            )}
            {atraso > 0 && <span className="text-xs text-amber-700">+{atraso} min</span>}
          </li>
        );
      })}
    </ol>
  );
}
