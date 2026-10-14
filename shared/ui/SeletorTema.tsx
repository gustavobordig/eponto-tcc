'use client';

import { Moon, Sun } from 'lucide-react';
import { useTema } from '@/shared/lib/tema';

/**
 * Interruptor do modo escuro: a linha toda é clicável e a bolinha leva o
 * sol (claro) ou a lua (escuro). `sobreMarca` é para o menu do RH, que fica
 * sobre o azul da marca.
 */
export default function SeletorTema({ sobreMarca = false }: { sobreMarca?: boolean }) {
  const { tema, setTema } = useTema();
  const escuro = tema === 'escuro';
  const Icone = escuro ? Moon : Sun;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={escuro}
      onClick={() => setTema(escuro ? 'claro' : 'escuro')}
      className={`flex w-full items-center gap-2.5 rounded-lg text-sm font-semibold ${
        sobreMarca ? 'px-2.5 py-2 text-white/[.82] hover:bg-white/[.08] hover:text-white' : 'px-3 py-2.5 hover:bg-background'
      }`}
    >
      <Moon className={`h-4 w-4 ${sobreMarca ? '' : 'text-muted'}`} />
      <span className="flex-1 text-left">Modo escuro</span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          escuro ? (sobreMarca ? 'bg-white/40' : 'bg-primary') : sobreMarca ? 'bg-white/20' : 'bg-line-strong'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(14,20,48,.3)] transition-transform duration-200 ${
            escuro ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          <Icone className={`h-3 w-3 ${escuro ? 'text-primary' : 'text-warn'}`} />
        </span>
      </span>
    </button>
  );
}
