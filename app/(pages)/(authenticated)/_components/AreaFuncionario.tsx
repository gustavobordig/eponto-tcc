'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { userService } from '@/features/usuarios/api';
import { usePontosDoDia } from '@/features/ponto/hooks/usePontosDoDia';
import { RegistrarPontoModal } from '@/features/ponto/components/RegistrarPontoModal';
import { showErrorToast } from '@/shared/lib/toast';
import { tokenUtils } from '@/shared/lib/token';

interface AreaFuncionario {
  nomeUsuario: string;
  ponto: ReturnType<typeof usePontosDoDia>;
  abrirRegistro: () => void;
}

const Contexto = createContext<AreaFuncionario | null>(null);

/**
 * Dados compartilhados pela área do funcionário: o nome do usuário, os pontos
 * de hoje e o modal de registro (aberto pela barra e pela home).
 */
export function AreaFuncionarioProvider({ children }: { children: ReactNode }) {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [registroAberto, setRegistroAberto] = useState(false);
  const ponto = usePontosDoDia();

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await userService.getById(Number(tokenUtils.getId()));
        if (response.sucesso && response.usuario) setNomeUsuario(response.usuario.nome);
      } catch (error) {
        // Sessão inválida (401) já é encerrada no interceptor do axios.
        // Voltar para "/" aqui criava um loop com o middleware.
        console.error('Erro ao buscar dados do usuário:', error);
        showErrorToast('Não foi possível carregar seus dados');
      }
    };
    carregar();
  }, []);

  return (
    <Contexto.Provider value={{ nomeUsuario, ponto, abrirRegistro: () => setRegistroAberto(true) }}>
      {children}
      <RegistrarPontoModal isOpen={registroAberto} onClose={() => setRegistroAberto(false)} ponto={ponto} />
    </Contexto.Provider>
  );
}

export function useAreaFuncionario() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAreaFuncionario precisa estar dentro de AreaFuncionarioProvider');
  return contexto;
}
