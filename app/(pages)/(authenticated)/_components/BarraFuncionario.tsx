'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, LogOut, Menu, X } from 'lucide-react';
import logo from '@/public/images/Logo.png';
import Avatar from '@/shared/ui/Avatar';
import ConfirmationModal from '@/shared/ui/ConfirmationModal';
import { tokenUtils } from '@/shared/lib/token';
import { useAreaFuncionario } from './AreaFuncionario';

interface Item {
  href: string;
  label: string;
  /** Outras rotas que contam como esta seção */
  tambem?: string[];
}

const ITENS: Item[] = [
  { href: '/home', label: 'Início' },
  { href: '/history', label: 'Histórico' },
  { href: '/calendar', label: 'Calendário' },
  // Antes eram dois itens: "Solicitar Ausência" e "Minhas Solicitações"
  { href: '/minhas-solicitacoes', label: 'Ausências', tambem: ['/solicitar-ausencia'] },
  { href: '/feedback', label: 'Feedback' },
  { href: '/perfil', label: 'Meu perfil' },
];

const ITEM_ADMIN: Item = { href: '/dashboard', label: 'Painel admin' };

export default function BarraFuncionario() {
  const pathname = usePathname();
  const { abrirRegistro, nomeUsuario } = useAreaFuncionario();
  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [itens, setItens] = useState(ITENS);
  // Foto escolhida no perfil; sem ela, as iniciais (antes era a mesma foto genérica para todos)
  const [foto, setFoto] = useState<string | null>(null);

  // Cookies e localStorage só existem no navegador
  useEffect(() => {
    if (tokenUtils.isAdmin()) setItens([...ITENS, ITEM_ADMIN]);
    const salva = localStorage.getItem('userProfilePhoto');
    if (salva) setFoto(salva);
  }, []);

  useEffect(() => setMenuAberto(false), [pathname]);

  const ativo = (item: Item) => [item.href, ...(item.tambem ?? [])].some((r) => pathname.startsWith(r));

  const baterPonto = () => {
    setMenuAberto(false);
    abrirRegistro();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/home" className="shrink-0" aria-label="Ir para o início">
          <Image src={logo} alt="ePonto" width={96} height={32} priority />
        </Link>

        <nav className="ml-4 hidden flex-1 items-center gap-1 xl:flex" aria-label="Principal">
          {itens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item) ? 'page' : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                ativo(item) ? 'bg-primary-soft text-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={baterPonto}
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Clock className="h-4 w-4" />
            Bater ponto
          </button>

          <div className="hidden items-center gap-2 xl:flex">
            <Link href="/perfil" aria-label="Meu perfil" title={nomeUsuario}>
              <Avatar nome={nomeUsuario} foto={foto} />
            </Link>
            <button
              type="button"
              onClick={() => setConfirmarSaida(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls="menu-funcionario"
            className="rounded-lg p-2 text-primary hover:bg-gray-100 xl:hidden"
          >
            {menuAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu do celular e tablet; antes não tinha Sair e o Bater Ponto não fazia nada */}
      {menuAberto && (
        <nav id="menu-funcionario" className="border-t border-gray-200 bg-white px-4 pb-4 xl:hidden" aria-label="Principal">
          <ul className="flex flex-col py-2">
            {itens.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ativo(item) ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-3 text-base font-medium ${
                    ativo(item) ? 'bg-primary-soft text-primary' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setConfirmarSaida(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </nav>
      )}

      <ConfirmationModal
        isOpen={confirmarSaida}
        onConfirm={() => tokenUtils.logout()}
        onCancel={() => setConfirmarSaida(false)}
        title="Sair do ePonto"
        message="Tem certeza que deseja sair?"
        confirmText="Sair"
        cancelText="Cancelar"
      />
    </header>
  );
}
