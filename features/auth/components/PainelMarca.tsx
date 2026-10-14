import { ReactNode } from 'react';
import Logo from '@/shared/ui/Logo';

/** Metade marinho das telas de entrada (login e escolha de perfil). */
export default function PainelMarca({ children }: { children: ReactNode }) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-marca px-14 py-12 text-white md:flex">
      <Logo branco altura={30} className="relative self-start" />
      {/* Círculos decorativos */}
      <div className="pointer-events-none absolute -right-30 top-30 h-[520px] w-[520px] rounded-full border border-white/12" aria-hidden />
      <div className="pointer-events-none absolute -right-10 top-50 h-[360px] w-[360px] rounded-full border border-white/12" aria-hidden />
      <div className="relative">{children}</div>
      <p className="relative text-xs text-white/70">© {new Date().getFullYear()} MK Ponto</p>
    </div>
  );
}
