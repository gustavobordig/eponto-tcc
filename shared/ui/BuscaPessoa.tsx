'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import Avatar from '@/shared/ui/Avatar';

export interface OpcaoPessoa {
  id: number;
  nome: string;
  /** Texto pequeno ao lado do nome ("Seu gestor") */
  marca?: string;
}

const semAcento = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Select com busca pelo nome: digita para filtrar, setas para navegar,
 * Enter para escolher e Esc para fechar.
 */
export default function BuscaPessoa({
  label,
  opcoes,
  valor,
  onChange,
  carregando = false,
  erro,
}: {
  label: string;
  opcoes: OpcaoPessoa[];
  valor: number | null;
  onChange: (id: number | null) => void;
  carregando?: boolean;
  erro?: string;
}) {
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [destaque, setDestaque] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  const selecionada = opcoes.find((o) => o.id === valor) ?? null;
  const filtradas = useMemo(() => {
    const termo = semAcento(busca.trim());
    return termo ? opcoes.filter((o) => semAcento(o.nome).includes(termo)) : opcoes;
  }, [busca, opcoes]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !caixa.current?.contains(e.target as Node) && setAberto(false);
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, [aberto]);

  useEffect(() => setDestaque(0), [busca]);

  const abrir = () => {
    setBusca('');
    setAberto(true);
    requestAnimationFrame(() => campo.current?.focus());
  };

  const escolher = (opcao: OpcaoPessoa) => {
    onChange(opcao.id);
    setAberto(false);
  };

  const teclado = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDestaque((d) => Math.min(d + 1, filtradas.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDestaque((d) => Math.max(d - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtradas[destaque]) escolher(filtradas[destaque]);
    } else if (e.key === 'Escape') {
      // Fecha só a lista: o Modal ignora o Esc já tratado (defaultPrevented)
      e.preventDefault();
      setAberto(false);
    }
  };

  return (
    <div ref={caixa} className="flex flex-col gap-1.5">
      <label htmlFor={`${id}-botao`} className="text-[13px] font-semibold text-foreground">
        {label}
      </label>

      <button
        id={`${id}-botao`}
        type="button"
        onClick={() => (aberto ? setAberto(false) : abrir())}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className={`flex h-12 w-full items-center gap-3 rounded-[10px] border bg-surface px-3.5 text-left text-[15px] focus:outline-none focus:ring-4 ${
          erro ? 'border-danger focus:ring-danger-soft' : 'border-line-strong focus:border-primary focus:ring-primary-soft'
        }`}
      >
        {selecionada ? (
          <>
            <Avatar nome={selecionada.nome} tamanho="sm" className="h-7! w-7! text-[11px]!" />
            <span className="flex-1 truncate font-medium">{selecionada.nome}</span>
            {selecionada.marca && <span className="text-xs font-semibold text-primary">{selecionada.marca}</span>}
          </>
        ) : (
          <span className="flex-1 text-subtle">{carregando ? 'Carregando pessoas…' : 'Escolha uma pessoa'}</span>
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {erro && <p className="text-[13px] text-danger-ink">{erro}</p>}

      {aberto && (
        // No fluxo (e não flutuando): dentro do modal, que rola, uma lista absoluta seria cortada
        <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[0_8px_24px_rgba(14,20,48,.12)]">
          <div className="relative border-b border-surface-2 p-2">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              ref={campo}
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={teclado}
              placeholder="Buscar pelo nome"
              role="combobox"
              aria-controls={`${id}-lista`}
              aria-expanded
              aria-activedescendant={filtradas[destaque] ? `${id}-op-${filtradas[destaque].id}` : undefined}
              aria-label="Buscar pessoa pelo nome"
              className="h-10 w-full rounded-lg bg-surface-2 pl-9 pr-8 text-sm placeholder:text-subtle focus:outline-none"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                aria-label="Limpar busca"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <ul id={`${id}-lista`} role="listbox" aria-label={label} className="max-h-60 overflow-y-auto p-1.5">
            {filtradas.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">Ninguém com esse nome.</li>
            ) : (
              filtradas.map((opcao, i) => {
                const ativa = opcao.id === valor;
                return (
                  <li
                    key={opcao.id}
                    id={`${id}-op-${opcao.id}`}
                    role="option"
                    aria-selected={ativa}
                    onMouseEnter={() => setDestaque(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => escolher(opcao)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm ${i === destaque ? 'bg-surface-2' : ''}`}
                  >
                    <Avatar nome={opcao.nome} tamanho="sm" className="h-7! w-7! text-[11px]!" />
                    <span className="flex-1 truncate font-medium">{opcao.nome}</span>
                    {opcao.marca && <span className="text-xs font-semibold text-primary">{opcao.marca}</span>}
                    {ativa && <Check className="h-4 w-4 text-primary" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
