'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SolicitacaoData } from '@/services/feedback';

interface FeedbackContextType {
  isFeedbackModalOpen: boolean;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  solicitacoes: SolicitacaoData[];
  setSolicitacoes: (solicitacoes: SolicitacaoData[]) => void;
  refreshSolicitacoes: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoData[]>([]);

  const openFeedbackModal = () => setIsFeedbackModalOpen(true);
  const closeFeedbackModal = () => setIsFeedbackModalOpen(false);
  
  const refreshSolicitacoes = useCallback(() => {
    // Esta função será implementada na página que usa o contexto
    // Por enquanto, apenas um placeholder
    console.log('Refresh solicitado - implementar na página');
  }, []);

  return (
    <FeedbackContext.Provider value={{
      isFeedbackModalOpen,
      openFeedbackModal,
      closeFeedbackModal,
      solicitacoes,
      setSolicitacoes,
      refreshSolicitacoes
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