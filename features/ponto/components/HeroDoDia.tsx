'use client';

import { Check, Fingerprint, MapPin } from 'lucide-react';
import { ETAPAS_DO_DIA, minutosDeAtraso } from '@/features/ponto/etapas';
import { usePontosDoDia } from '@/features/ponto/hooks/usePontosDoDia';
import { useLocalizacao } from '@/features/ponto/hooks/useLocalizacao';
import { horasCurtas, statusDoDia } from '@/features/ponto/statusDoDia';
import { horaMinuto, useAgora } from '@/shared/lib/useAgora';

const saudacao = (hora: number) => (hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite');

/** Atraso de mais de 10 minutos na entrada ou na volta do almoço */
const TOLERANCIA_MIN = 10;

interface Props {
  primeiroNome: string;
  horasDiarias: number | null;
  ponto: ReturnType<typeof usePontosDoDia>;
  onRegistrar: () => void;
}

/** Herói marinho do início (1c): relógio, localização, ação de ponto e a linha do dia. */
export default function HeroDoDia({ primeiroNome, horasDiarias, ponto, onRegistrar }: Props) {
  const agora = useAgora();
  const { texto: localizacao } = useLocalizacao();
  const { marcados, proxima, carregando } = ponto;

  const status = agora ? statusDoDia(marcados, agora) : null;
  const feitos = marcados.length;
  // A linha liga o centro da 1ª ao centro da última etapa (12,5% a 87,5%)
  const progresso = (Math.max(0, feitos - 1) / 3) * 75;
  const data = agora?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace('-feira', '');

  return (
    <section className="grid items-center gap-8 rounded-[18px] bg-marca px-6 py-7 text-white sm:px-9 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-12">
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-1">
          <p className="text-[15px] text-white/85" suppressHydrationWarning>
            {agora ? `${saudacao(agora.getHours())}${primeiroNome ? `, ${primeiroNome}` : ''} · ${data}` : ' '}
          </p>
          <p className="flex items-baseline gap-1 font-mono font-semibold" aria-label="Hora atual" suppressHydrationWarning>
            <span className="text-6xl leading-none tracking-[-3px] sm:text-7xl">{agora ? horaMinuto(agora) : '--:--'}</span>
            <span className="text-[28px] text-white/60">:{agora ? String(agora.getSeconds()).padStart(2, '0') : '--'}</span>
          </p>
        </div>

        <p className="flex min-w-0 items-center gap-2 text-[13px] text-white/85">
          <MapPin className="h-[15px] w-[15px] shrink-0" />
          <span className="truncate">{localizacao}</span>
        </p>

        <div>
          {!carregando && (
            proxima ? (
              <button
                type="button"
                onClick={onRegistrar}
                className="flex h-[52px] items-center gap-2.5 rounded-xl bg-white px-6 text-[15px] font-bold text-primary transition-colors hover:bg-primary-soft"
              >
                <Fingerprint className="h-5 w-5" />
                Registrar {proxima.label.toLowerCase()}
              </button>
            ) : (
              <p className="flex h-[52px] w-fit items-center gap-2.5 rounded-xl bg-white/14 px-6 text-[15px] font-bold">
                <Check className="h-5 w-5" /> Jornada concluída
              </p>
            )
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-[14px] border border-white/12 bg-white/7 px-5 pb-5 pt-6 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-bold">Pontos de hoje</h2>
          {status && (
            <span className="text-[13px] text-white/85">
              Trabalhado <b className="font-mono text-white">{horasCurtas(status.minutosTrabalhados)}</b>
              {horasDiarias ? ` de ${horasDiarias}h00` : ''}
            </span>
          )}
        </div>

        <ol className="relative grid grid-cols-4">
          <span className="absolute left-[12.5%] right-[12.5%] top-[21px] h-0.5 bg-white/18" aria-hidden />
          <span className="absolute left-[12.5%] top-[21px] h-0.5 bg-surface transition-[width] duration-400" style={{ width: `${progresso}%` }} aria-hidden />

          {ETAPAS_DO_DIA.map((etapa) => {
            const marcado = marcados.find((m) => m.etapa.tipo === etapa.tipo);
            const ehProxima = proxima?.tipo === etapa.tipo;
            const atraso = marcado && minutosDeAtraso(etapa, marcado.hora) > TOLERANCIA_MIN;
            return (
              <li key={etapa.tipo} className="relative flex flex-col items-center gap-2.5 text-center">
                {marcado ? (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary">
                    <Check className="h-5 w-5" />
                  </span>
                ) : ehProxima ? (
                  <span className="flex h-11 w-11 animate-[pulso_1.6s_infinite] items-center justify-center rounded-full border-2 border-white bg-marca">
                    {etapa.icone('h-[18px] w-[18px]')}
                  </span>
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#132e92] text-white/60">
                    {etapa.icone('h-[18px] w-[18px]')}
                  </span>
                )}
                <span className="flex flex-col gap-0.5">
                  <span className="text-xs text-white/80">{etapa.label}</span>
                  <span className={`font-mono text-[17px] font-semibold ${marcado ? (atraso ? 'text-[#ffc876]' : 'text-white') : 'text-white/55'}`}>
                    {marcado?.hora ?? etapa.referencia}
                  </span>
                  <span className={`text-[11px] ${marcado ? (atraso ? 'text-[#ffc876]' : 'text-white/70') : ehProxima ? 'text-white' : 'text-white/50'}`}>
                    {marcado ? (atraso ? 'Atraso' : 'Registrado') : ehProxima ? 'Próximo' : 'Previsto'}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
