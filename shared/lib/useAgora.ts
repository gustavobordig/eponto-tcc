'use client';

import { useEffect, useState } from 'react';

/**
 * Hora atual, atualizada a cada `intervaloMs`. Começa como null para o HTML do
 * servidor e o do navegador não divergirem (erro de hidratação).
 */
export function useAgora(intervaloMs = 1000): Date | null {
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return agora;
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

export const horaMinuto = (d: Date) => `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;

/** "terça-feira, 13 de outubro de 2026" */
export const dataPorExtenso = (d: Date, comAno = true) =>
  d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', ...(comAno ? { year: 'numeric' } : {}) });
