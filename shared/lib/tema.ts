'use client';

import { useCallback, useEffect, useState } from 'react';

/** Tema do app: claro (padrão) ou escuro. */
export type Tema = 'claro' | 'escuro';

const CHAVE = 'tema';

/**
 * Roda antes da hidratação para a página já abrir no tema certo (sem piscar
 * o claro). Mantém a mesma regra de lerTema.
 */
export const SCRIPT_TEMA = `try{if(localStorage.getItem('${CHAVE}')==='escuro')document.documentElement.classList.add('dark')}catch(e){}`;

// Sem escolha salva (ou com o antigo "sistema"), o app abre no claro
const lerTema = (): Tema => {
  try {
    return localStorage.getItem(CHAVE) === 'escuro' ? 'escuro' : 'claro';
  } catch {
    return 'claro';
  }
};

/** Tema atual e como trocar. */
export function useTema() {
  const [tema, setTemaEstado] = useState<Tema>('claro');

  useEffect(() => {
    setTemaEstado(lerTema());
  }, []);

  const setTema = useCallback((novo: Tema) => {
    try {
      if (novo === 'escuro') localStorage.setItem(CHAVE, 'escuro');
      else localStorage.removeItem(CHAVE);
    } catch {
      // Sem armazenamento (aba anônima bloqueada): vale só nesta visita
    }
    document.documentElement.classList.toggle('dark', novo === 'escuro');
    setTemaEstado(novo);
  }, []);

  return { tema, setTema };
}
