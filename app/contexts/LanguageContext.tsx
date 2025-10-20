"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traduções
const translations = {
  'pt-BR': {
    // Navigation
    'nav.home': 'Início',
    'nav.profile': 'Meu Perfil',
    'nav.history': 'Histórico de Pontos',
    'nav.calendar': 'Calendário',
    'nav.feedback': 'Feedback',
    'nav.request-absence': 'Solicitar Ausência',
    'nav.my-requests': 'Minhas Solicitações',
    'nav.logout': 'Sair',
    
    // Home page
    'home.welcome': 'Bem-vindo de volta',
    'home.good-morning': 'Bom dia',
    'home.good-afternoon': 'Boa tarde',
    'home.good-evening': 'Boa noite',
    'home.actions': 'Ações',
    'home.punch-in': 'Bater Ponto',
    'home.edit-location': 'Editar localização',
    'home.daily-punches': 'Pontos do Dia',
    'home.daily-status': 'Status do Dia',
    'home.entry': 'Entrada',
    'home.lunch-start': 'Início Almoço',
    'home.lunch-end': 'Fim Almoço',
    'home.exit': 'Saída',
    
    // Profile selection
    'profile.who-watching': 'Quem está assistindo?',
    'profile.admin': 'Admin',
    'profile.user': 'Usuário',
    'profile.admin-desc': 'Gerenciar sistema',
    'profile.user-desc': 'Bater ponto',
    'profile.logout': 'Sair',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.confirm': 'Confirmar',
  },
  'en': {
    // Navigation
    'nav.home': 'Home',
    'nav.profile': 'My Profile',
    'nav.history': 'Punch History',
    'nav.calendar': 'Calendar',
    'nav.feedback': 'Feedback',
    'nav.request-absence': 'Request Absence',
    'nav.my-requests': 'My Requests',
    'nav.logout': 'Logout',
    
    // Home page
    'home.welcome': 'Welcome back',
    'home.good-morning': 'Good morning',
    'home.good-afternoon': 'Good afternoon',
    'home.good-evening': 'Good evening',
    'home.actions': 'Actions',
    'home.punch-in': 'Punch In/Out',
    'home.edit-location': 'Edit location',
    'home.daily-punches': 'Daily Punches',
    'home.daily-status': 'Daily Status',
    'home.entry': 'Entry',
    'home.lunch-start': 'Lunch Start',
    'home.lunch-end': 'Lunch End',
    'home.exit': 'Exit',
    
    // Profile selection
    'profile.who-watching': 'Who\'s watching?',
    'profile.admin': 'Admin',
    'profile.user': 'User',
    'profile.admin-desc': 'Manage system',
    'profile.user-desc': 'Punch in/out',
    'profile.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('pt-BR');

  useEffect(() => {
    // Carregar idioma salvo
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'pt-BR' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['pt-BR']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
