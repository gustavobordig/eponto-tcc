'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { Tema, useTema } from '@/shared/lib/tema';

const OPCOES: { valor: Tema; rotulo: string; icone: typeof Sun }[] = [
  { valor: 'claro', rotulo: 'Claro', icone: Sun },
  { valor: 'escuro', rotulo: 'Escuro', icone: Moon },
  { valor: 'sistema', rotulo: 'Auto', icone: Monitor },
];

/**
 * Claro, escuro ou automático. `sobreMarca` é para o menu do RH, que fica
 * sobre o azul da marca.
 */
export default function SeletorTema({ sobreMarca = false }: { sobreMarca?: boolean }) {
  const { tema, setTema } = useTema();

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={`flex rounded-[9px] p-[3px] text-xs font-semibold ${sobreMarca ? 'bg-white/[.1]' : 'bg-surface-2'}`}
    >
      {OPCOES.map(({ valor, rotulo, icone: Icone }) => {
        const ativo = tema === valor;
        const estilo = sobreMarca
          ? ativo
            ? 'bg-white text-marca'
            : 'text-white/75 hover:text-white'
          : ativo
            ? 'bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,.12)]'
            : 'text-muted hover:text-foreground';
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            title={valor === 'sistema' ? 'Segue o tema do sistema' : undefined}
            onClick={() => setTema(valor)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] px-1.5 py-1.5 ${estilo}`}
          >
            <Icone className="h-3.5 w-3.5" />
            {rotulo}
          </button>
        );
      })}
    </div>
  );
}
