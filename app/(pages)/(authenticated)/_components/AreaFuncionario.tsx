'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { userService } from '@/features/usuarios/api';
import { usePontosDoDia } from '@/features/ponto/hooks/usePontosDoDia';
import { useMeusPedidos } from '@/features/solicitacoes/hooks/useMeusPedidos';
import { RegistrarPontoModal } from '@/features/ponto/components/RegistrarPontoModal';
import { showErrorToast } from '@/shared/lib/toast';
import { tokenUtils } from '@/shared/lib/token';

export interface UsuarioLogado {
  nome: string;
  email: string;
  cargo: string;
  foto: string | null;
  /** Jornada diária, em horas */
  horasDiarias: number | null;
}

interface AreaFuncionario {
  nomeUsuario: string;
  usuario: UsuarioLogado | null;
  ponto: ReturnType<typeof usePontosDoDia>;
  /** Pedidos ao RH (a barra mostra quantos estão em análise) */
  pedidos: ReturnType<typeof useMeusPedidos>;
  abrirRegistro: () => void;
}

const Contexto = createContext<AreaFuncionario | null>(null);

/**
 * Dados compartilhados pela área do funcionário: o nome do usuário, os pontos
 * de hoje e o modal de registro (aberto pela barra e pela home).
 */
export function AreaFuncionarioProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [registroAberto, setRegistroAberto] = useState(false);
  const ponto = usePontosDoDia();
  const pedidos = useMeusPedidos();

  useEffect(() => {
    const carregar = async () => {
      try {
        // O contrato traz o nome do cargo, que a barra mostra ao lado do nome
        const { contrato } = await userService.getContrato(Number(tokenUtils.getId()));
        if (contrato) {
          setUsuario({
            nome: contrato.nome,
            email: contrato.email,
            cargo: contrato.nomeCargo,
            foto: contrato.fotoPerfil || localStorage.getItem('userProfilePhoto'),
            horasDiarias: contrato.qtdHorasDiarias ?? null,
          });
        }
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
    <Contexto.Provider value={{ nomeUsuario: usuario?.nome ?? '', usuario, ponto, pedidos, abrirRegistro: () => setRegistroAberto(true) }}>
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
