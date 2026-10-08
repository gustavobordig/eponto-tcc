'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { SolicitacaoData } from '@/features/feedback/api';

interface FeedbackContextType {
  isFeedbackModalOpen: boolean;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  solicitacoes: SolicitacaoData[];
  setSolicitacoes: (solicitacoes: SolicitacaoData[]) => void;
  refreshSolicitacoes: () => void;
  registerRefresh: (callback: (() => void) | null) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoData[]>([]);

  const openFeedbackModal = () => setIsFeedbackModalOpen(true);
  const closeFeedbackModal = () => setIsFeedbackModalOpen(false);
  
  const refreshCallback = useRef<(() => void) | null>(null);

  // A página de feedback registra aqui como recarregar a lista
  const registerRefresh = useCallback((callback: (() => void) | null) => {
    refreshCallback.current = callback;
  }, []);

  const refreshSolicitacoes = useCallback(() => {
    refreshCallback.current?.();
  }, []);

  return (
    <FeedbackContext.Provider value={{
      isFeedbackModalOpen,
      openFeedbackModal,
      closeFeedbackModal,
      solicitacoes,
      setSolicitacoes,
      refreshSolicitacoes,
      registerRefresh
    }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
} 