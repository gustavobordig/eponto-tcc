'use client';

import { useCallback, useEffect, useState } from 'react';

/** Preferência de tema: claro, escuro ou seguir o sistema (padrão). */
export type Tema = 'claro' | 'escuro' | 'sistema';

const CHAVE = 'tema';

/**
 * Roda no <head>, antes da primeira pintura, para a página já abrir no tema
 * certo (sem piscar o claro). Mantém a mesma regra de aplicarTema.
 */
export const SCRIPT_TEMA = `try{var t=localStorage.getItem('${CHAVE}');if(t==='escuro'||(t!=='claro'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

const lerTema = (): Tema => {
  try {
    const t = localStorage.getItem(CHAVE);
    return t === 'claro' || t === 'escuro' ? t : 'sistema';
  } catch {
    return 'sistema';
  }
};

const sistemaEscuro = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

function aplicarTema(tema: Tema) {
  const escuro = tema === 'escuro' || (tema === 'sistema' && sistemaEscuro());
  document.documentElement.classList.toggle('dark', escuro);
}

/** Tema atual e como trocar; no modo sistema, acompanha a troca do sistema operacional. */
export function useTema() {
  const [tema, setTemaEstado] = useState<Tema>('sistema');

  useEffect(() => {
    setTemaEstado(lerTema());
  }, []);

  useEffect(() => {
    if (tema !== 'sistema') return;
    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const mudou = () => aplicarTema('sistema');
    consulta.addEventListener('change', mudou);
    return () => consulta.removeEventListener('change', mudou);
  }, [tema]);

  const setTema = useCallback((novo: Tema) => {
    try {
      if (novo === 'sistema') localStorage.removeItem(CHAVE);
      else localStorage.setItem(CHAVE, novo);
    } catch {
      // Sem armazenamento (aba anônima bloqueada): vale só nesta visita
    }
    aplicarTema(novo);
    setTemaEstado(novo);
  }, []);

  return { tema, setTema };
}
