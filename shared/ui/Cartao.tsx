import { ReactNode } from 'react';
import Link from 'next/link';

/** Card branco do redesign: cantos de 16px, título em negrito e link opcional à direita. */
export default function Cartao({
  titulo,
  acao,
  children,
  className = '',
}: {
  titulo?: ReactNode;
  acao?: { href: string; texto: string } | ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const link =
    acao && typeof acao === 'object' && 'href' in acao ? (
      <Link href={acao.href} className="text-[13px] font-semibold text-primary hover:text-primary-dark">
        {acao.texto}
      </Link>
    ) : (
      acao
    );
  return (
    <section className={`flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-card ${className}`}>
      {(titulo || link) && (
        <div className="flex items-center justify-between gap-3">
          {titulo && <h2 className="text-[15px] font-bold">{titulo}</h2>}
          {link}
        </div>
      )}
      {children}
    </section>
  );
}
