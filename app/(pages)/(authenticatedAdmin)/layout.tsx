'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CalendarX,
  ChartColumn,
  Clock,
  Inbox,
  LogOut,
  LucideIcon,
  Menu,
  MessageSquare,
  Plane,
  Timer,
  Users,
  X,
} from 'lucide-react';
import { FilaAprovacaoProvider, useFilaAprovacao } from '@/features/solicitacoes/hooks/useFilaAprovacao';
import ConfirmationModal from '@/shared/ui/ConfirmationModal';
import Logo from '@/shared/ui/Logo';
import SeletorTema from '@/shared/ui/SeletorTema';
import { tokenUtils } from '@/shared/lib/token';

interface Item {
  href: string;
  label: string;
  icone: LucideIcon;
  /** Telas que pertencem a esta seção (cadastros, telas antigas) */
  tambem?: string[];
  contador?: 'total' | 'ajustes';
}

// Antes eram 10 abas numa linha só
const GRUPOS: { titulo: string; itens: Item[] }[] = [
  {
    titulo: 'Pessoas',
    itens: [
      { href: '/dashboard', label: 'Usuários', icone: Users, tambem: ['/adicionar-usuario'] },
      { href: '/dashboard/cargos', label: 'Cargos', icone: Briefcase, tambem: ['/adicionar-cargo'] },
      { href: '/dashboard/jornada-trabalho', label: 'Jornadas', icone: Timer, tambem: ['/adicionar-jornada'] },
    ],
  },
  {
    titulo: 'Ponto',
    itens: [
      { href: '/dashboard/ajustes-ponto', label: 'Ajustes de ponto', icone: Clock, contador: 'ajustes' },
      { href: '/dashboard/feriados', label: 'Feriados', icone: CalendarX, tambem: ['/adicionar-feriado'] },
      { href: '/dashboard/calendario', label: 'Calendário', icone: Calendar },
    ],
  },
  {
    titulo: 'Solicitações',
    itens: [
      // Ajustes, ausências e férias numa fila só (1i)
      { href: '/dashboard/solicitacoes', label: 'Todas', icone: Inbox, contador: 'total', tambem: ['/dashboard/solicitacoes-ausencia'] },
      { href: '/dashboard/ferias', label: 'Férias da empresa', icone: Plane, tambem: ['/adicionar-ferias'] },
      { href: '/dashboard/feedback', label: 'Feedback', icone: MessageSquare },
    ],
  },
  {
    titulo: 'Relatórios',
    itens: [{ href: '/dashboard/analytics', label: 'Estatísticas', icone: ChartColumn }],
  },
];

// /dashboard só é a lista de usuários quando é exatamente /dashboard
const estaAtivo = (pathname: string, item: Item) =>
  pathname === item.href ||
  (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)) ||
  (item.tambem ?? []).some((r) => pathname.startsWith(r));

function Navegacao({ pathname, onSair }: { pathname: string; onSair: () => void }) {
  const { pendentes } = useFilaAprovacao();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-3.5 pb-4" aria-label="Painel RH">
        {GRUPOS.map((grupo) => (
          <div key={grupo.titulo} className="flex flex-col gap-0.5">
            <p className="px-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-[.8px] text-white/60">{grupo.titulo}</p>
            {grupo.itens.map((item) => {
              const ativo = estaAtivo(pathname, item);
              const n = item.contador ? pendentes[item.contador] : 0;
              const Icone = item.icone;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={ativo ? 'page' : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors ${
                    ativo ? 'bg-white/[.14] text-white' : 'text-white/[.82] hover:bg-white/[.08] hover:text-white'
                  }`}
                >
                  <Icone className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {n > 0 && (
                    <span className="rounded-full bg-white px-[7px] py-px text-[11px] font-bold text-primary" aria-label={`${n} pendentes`}>
                      {n}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-white/[.14] px-3.5 py-3 text-sm font-semibold">
        <div className="px-2.5 pb-2">
          <SeletorTema sobreMarca />
        </div>
        <Link href="/home" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-white hover:bg-white/[.08]">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao meu ponto
        </Link>
        <button
          type="button"
          onClick={onSair}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-white/80 hover:bg-white/[.08] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}

const Marca = () => (
  <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Painel RH">
    <Logo branco altura={22} />
    <span className="rounded-[5px] bg-white/[.16] px-[7px] py-[3px] text-[11px] font-bold text-white">RH</span>
  </Link>
);

export default function AdminLayout({ children }: { children: ReactNode }) {
  // O acesso é liberado pelo middleware, a partir do perfil da sessão
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  useEffect(() => setMenuAberto(false), [pathname]);

  return (
    <FilaAprovacaoProvider>
      <div className="min-h-screen bg-background">
        {/* Menu lateral marinho no desktop */}
        <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col bg-marca pt-5 lg:flex">
          <div className="px-6 pb-5 pt-1">
            <Marca />
          </div>
          <Navegacao pathname={pathname} onSair={() => setConfirmarSaida(true)} />
        </aside>

        {/* Barra e gaveta no celular e tablet */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-marca px-4 lg:hidden">
          <Marca />
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            className="rounded-lg p-2 text-white hover:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {menuAberto && (
          <div className="lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel RH">
            <div className="fixed inset-0 z-40 bg-[#0e1430]/45" onClick={() => setMenuAberto(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-marca shadow-xl">
              <div className="flex h-16 items-center justify-between px-6">
                <Marca />
                <button
                  type="button"
                  onClick={() => setMenuAberto(false)}
                  aria-label="Fechar menu"
                  className="rounded-lg p-2 text-white/80 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Navegacao pathname={pathname} onSair={() => setConfirmarSaida(true)} />
            </aside>
          </div>
        )}

        <main className="px-4 py-6 lg:ml-[248px] lg:p-8">
          <div className="mx-auto max-w-[1100px]">{children}</div>
        </main>

        <ConfirmationModal
          isOpen={confirmarSaida}
          onConfirm={() => tokenUtils.logout()}
          onCancel={() => setConfirmarSaida(false)}
          title="Sair do MK Ponto"
          message="Tem certeza que deseja sair?"
          confirmText="Sair"
          cancelText="Cancelar"
        />
      </div>
    </FilaAprovacaoProvider>
  );
}
