'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import logo from '@/public/images/Logo.png';
import ConfirmationModal from '@/shared/ui/ConfirmationModal';
import { tokenUtils } from '@/shared/lib/token';

interface Item {
  href: string;
  label: string;
  /** Telas de cadastro que pertencem a esta seção */
  tambem?: string[];
}

// Antes eram 10 abas numa linha só
const GRUPOS: { titulo: string; itens: Item[] }[] = [
  {
    titulo: 'Pessoas',
    itens: [
      { href: '/dashboard', label: 'Usuários', tambem: ['/adicionar-usuario'] },
      { href: '/dashboard/cargos', label: 'Cargos', tambem: ['/adicionar-cargo'] },
      { href: '/dashboard/jornada-trabalho', label: 'Jornadas de trabalho', tambem: ['/adicionar-jornada'] },
    ],
  },
  {
    titulo: 'Ponto',
    itens: [
      { href: '/dashboard/ajustes-ponto', label: 'Ajustes de ponto' },
      { href: '/dashboard/feriados', label: 'Feriados', tambem: ['/adicionar-feriado'] },
      { href: '/dashboard/calendario', label: 'Calendário' },
    ],
  },
  {
    titulo: 'Solicitações',
    itens: [
      { href: '/dashboard/ferias', label: 'Férias', tambem: ['/adicionar-ferias'] },
      { href: '/dashboard/solicitacoes-ausencia', label: 'Ausências' },
      { href: '/dashboard/feedback', label: 'Feedback' },
    ],
  },
  {
    titulo: 'Relatórios',
    itens: [{ href: '/dashboard/analytics', label: 'Estatísticas' }],
  },
];

// /dashboard só é a lista de usuários quando é exatamente /dashboard
const estaAtivo = (pathname: string, item: Item) =>
  pathname === item.href ||
  (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
  (item.tambem ?? []).some((r) => pathname.startsWith(r));

function Navegacao({ pathname, onSair }: { pathname: string; onSair: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Painel admin">
        {GRUPOS.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{grupo.titulo}</p>
            <ul className="mt-2 space-y-1">
              {grupo.itens.map((item) => {
                const ativo = estaAtivo(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={ativo ? 'page' : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        ativo ? 'bg-primary-soft text-primary' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-gray-200 p-3">
        <Link
          href="/home"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao meu ponto
        </Link>
        <button
          type="button"
          onClick={onSair}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  // O acesso é liberado pelo middleware, a partir do perfil da sessão
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  useEffect(() => setMenuAberto(false), [pathname]);

  const cabecalho = (
    <Link href="/dashboard" className="flex items-center gap-2" aria-label="Painel admin">
      <Image src={logo} alt="ePonto" width={88} height={28} priority />
      <span className="rounded bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">Admin</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Menu lateral no desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">{cabecalho}</div>
        <Navegacao pathname={pathname} onSair={() => setConfirmarSaida(true)} />
      </aside>

      {/* Barra e gaveta no celular e tablet */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        {cabecalho}
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          className="rounded-lg p-2 text-primary hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {menuAberto && (
        <div className="lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel admin">
          <div className="fixed inset-0 z-40 bg-gray-900/40" onClick={() => setMenuAberto(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              {cabecalho}
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Navegacao pathname={pathname} onSair={() => setConfirmarSaida(true)} />
          </aside>
        </div>
      )}

      <main className="px-4 py-6 lg:ml-64 lg:px-8 lg:py-8">{children}</main>

      <ConfirmationModal
        isOpen={confirmarSaida}
        onConfirm={() => tokenUtils.logout()}
        onCancel={() => setConfirmarSaida(false)}
        title="Sair do ePonto"
        message="Tem certeza que deseja sair?"
        confirmText="Sair"
        cancelText="Cancelar"
      />
    </div>
  );
}
