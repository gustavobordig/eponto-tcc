'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  History,
  House,
  Inbox,
  LogOut,
  LucideIcon,
  MessageSquare,
  ShieldCheck,
  User,
} from 'lucide-react';
import SeletorTema from '@/shared/ui/SeletorTema';
import Avatar from '@/shared/ui/Avatar';
import Logo from '@/shared/ui/Logo';
import ConfirmationModal from '@/shared/ui/ConfirmationModal';
import { tokenUtils } from '@/shared/lib/token';
import { useAgora } from '@/shared/lib/useAgora';
import { horasCurtas, statusDoDia, SituacaoDoDia } from '@/features/ponto/statusDoDia';
import { useAreaFuncionario } from './AreaFuncionario';

interface Item {
  href: string;
  label: string;
  icone: LucideIcon;
  /** Outras rotas que contam como esta seção */
  tambem?: string[];
}

const ITENS: Item[] = [
  { href: '/home', label: 'Início', icone: House },
  { href: '/history', label: 'Histórico', icone: History },
  { href: '/calendar', label: 'Calendário', icone: Calendar },
  // Ausências, ajustes de ponto e férias que o funcionário enviou ao RH
  { href: '/minhas-solicitacoes', label: 'Solicitações', icone: Inbox, tambem: ['/solicitar-ausencia'] },
  { href: '/feedback', label: 'Feedback', icone: MessageSquare },
  { href: '/perfil', label: 'Meu perfil', icone: User },
];

const COR_STATUS: Record<SituacaoDoDia, { pilula: string; ponto: string }> = {
  'nao-iniciado': { pilula: 'bg-surface-2 text-muted', ponto: 'bg-subtle' },
  trabalhando: { pilula: 'bg-ok-soft text-ok-ink', ponto: 'bg-ok' },
  almoco: { pilula: 'bg-warn-soft text-warn-ink', ponto: 'bg-warn' },
  encerrado: { pilula: 'bg-primary-soft text-primary', ponto: 'bg-primary' },
};

/** Barra do funcionário (opção 2b do redesign): status do dia + abas sublinhadas. */
export default function BarraFuncionario() {
  const pathname = usePathname();
  const { abrirRegistro, usuario, ponto, pedidos } = useAreaFuncionario();
  const agora = useAgora(30_000);
  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [admin, setAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cookies só existem no navegador
  useEffect(() => setAdmin(tokenUtils.isAdmin()), []);
  useEffect(() => setMenuAberto(false), [pathname]);

  // Fecha o menu do avatar com clique fora ou Esc
  useEffect(() => {
    if (!menuAberto) return;
    const fora = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAberto(false);
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [menuAberto]);

  const ativo = (item: Item) => [item.href, ...(item.tambem ?? [])].some((r) => pathname.startsWith(r));
  const status = agora && !ponto.carregando ? statusDoDia(ponto.marcados, agora) : null;
  const IconeAcao = ponto.proxima?.icone;
  const nome = usuario?.nome ?? '';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-8">
        <Link href="/home" className="shrink-0" aria-label="Ir para o início">
          <Logo altura={24} />
        </Link>

        <div className="flex-1" />

        {status && (
          <div
            className={`hidden h-[38px] items-center gap-2.5 rounded-full pl-3.5 pr-1.5 text-[13px] font-semibold md:flex ${COR_STATUS[status.situacao].pilula} ${status.situacao === 'nao-iniciado' ? 'pr-3.5' : ''}`}
          >
            <span className={`h-2 w-2 rounded-full ${COR_STATUS[status.situacao].ponto}`} aria-hidden />
            {status.texto}
            {status.situacao !== 'nao-iniciado' && (
              <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-xs" title="Trabalhado hoje">
                {horasCurtas(status.minutosTrabalhados)}
              </span>
            )}
          </div>
        )}

        {ponto.proxima && IconeAcao && (
          <button
            type="button"
            onClick={abrirRegistro}
            className="flex h-[38px] items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-dark"
          >
            {IconeAcao('h-4 w-4')}
            {ponto.proxima.acao}
          </button>
        )}

        <div ref={menuRef} className="relative border-l border-line pl-3 sm:pl-4">
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuAberto}
            aria-label="Menu da conta"
            className="flex items-center gap-2.5 rounded-lg py-1 text-left"
          >
            <Avatar nome={nome} foto={usuario?.foto} tamanho="sm" />
            <span className="hidden flex-col leading-tight lg:flex">
              <b className="text-[13px]">{nome}</b>
              <span className="text-[11px] text-muted">{usuario?.cargo}</span>
            </span>
            <ChevronDown className={`h-[15px] w-[15px] text-muted transition-transform ${menuAberto ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu do avatar (2e): perfil, painel RH e sair saem da barra */}
          {menuAberto && (
            <div role="menu" className="absolute right-0 top-[calc(100%+10px)] w-[300px] rounded-xl bg-surface p-2 shadow-[0_1px_2px_rgba(14,20,48,.06),0_12px_40px_rgba(14,20,48,.12)]">
              <div className="flex items-center gap-3 p-3">
                <Avatar nome={nome} foto={usuario?.foto} />
                <div className="flex min-w-0 flex-col leading-tight">
                  <b className="truncate text-sm">{nome}</b>
                  <span className="truncate text-xs text-muted">{usuario?.email}</span>
                </div>
              </div>
              <div className="my-1 h-px bg-surface-2" />
              <Link role="menuitem" href="/perfil" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-background">
                <User className="h-4 w-4 text-muted" /> Meu perfil
              </Link>
              {admin && (
                <Link role="menuitem" href="/dashboard" className="flex items-center gap-2.5 rounded-lg bg-primary-tint px-3 py-2.5 text-sm font-semibold hover:bg-primary-soft">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="flex-1">Ir para o Painel RH</span>
                  <ArrowRight className="h-[15px] w-[15px] text-primary" />
                </Link>
              )}
              <SeletorTema />
              <div className="my-1 h-px bg-surface-2" />
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenuAberto(false);
                  setConfirmarSaida(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger-soft"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Abas; no celular rolam de lado */}
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 sm:px-6" aria-label="Principal">
        {ITENS.map((item) => {
          const Icone = item.icone;
          const atual = ativo(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={atual ? 'page' : undefined}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 pb-[13px] pt-3 text-sm font-semibold transition-colors ${
                atual ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Icone className="h-4 w-4" />
              {item.label}
              {item.href === '/minhas-solicitacoes' && pedidos.emAnalise > 0 && (
                <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-[5px] text-[11px] font-extrabold text-white" aria-label={`${pedidos.emAnalise} em análise`}>
                  {pedidos.emAnalise}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <ConfirmationModal
        isOpen={confirmarSaida}
        onConfirm={() => tokenUtils.logout()}
        onCancel={() => setConfirmarSaida(false)}
        title="Sair do MK Ponto"
        message="Tem certeza que deseja sair?"
        confirmText="Sair"
        cancelText="Cancelar"
      />
    </header>
  );
}
