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
    
    // Admin navigation
    'admin.users': 'Usuários',
    'admin.positions': 'Cargos',
    'admin.work-schedule': 'Jornada de Trabalho',
    'admin.holidays': 'Feriados',
    'admin.vacations': 'Férias',
    'admin.calendar': 'Calendário',
    'admin.statistics': 'Estatísticas',
    'admin.create-admin': 'Criar Admin',
    'admin.approvals': 'Central de Aprovações',
    
    // Admin forms
    'admin.create-administrator': 'Criar Administrador',
    'admin.create-administrator-desc': 'Cadastre um novo administrador no sistema',
    'admin.full-name': 'Nome Completo',
    'admin.email': 'Email',
    'admin.birth-date': 'Data de Nascimento',
    'admin.phone': 'Telefone',
    'admin.password': 'Senha',
    'admin.position': 'Cargo',
    'admin.work-schedule-field': 'Jornada de Trabalho',
    'admin.access-profile': 'Perfil de Acesso',
    'admin.select-position': 'Selecione um cargo',
    'admin.select-work-schedule': 'Selecione uma jornada',
    'admin.select-profile': 'Selecione um perfil',
    'admin.loading-positions': 'Carregando cargos...',
    'admin.loading-schedules': 'Carregando jornadas...',
    'admin.loading-profiles': 'Carregando perfis...',
    'admin.no-positions': 'Nenhum cargo disponível. Verifique se há cargos cadastrados no sistema.',
    'admin.no-schedules': 'Nenhuma jornada disponível. Verifique se há jornadas cadastradas no sistema.',
    'admin.no-profiles': 'Nenhum perfil disponível. Verifique se há perfis cadastrados no sistema.',
    'admin.create-administrator-btn': 'Criar Administrador',
    'admin.creating': 'Criando...',
    'admin.administrator-created': 'Administrador criado com sucesso!',
    'admin.create-new': 'Criar Novo',
    'admin.link-existing': 'Vincular Existente',
    'admin.select-existing-user': 'Selecionar Usuário Existente',
    'admin.search-user': 'Buscar Usuário',
    'admin.select-user': 'Selecionar Usuário',
    'admin.select-user-option': 'Selecione um usuário',
    'admin.no-users-found': 'Nenhum usuário encontrado',
    'admin.no-users-matching': 'Nenhum usuário corresponde à busca',
    'admin.link-administrator-btn': 'Vincular como Administrador',
    'admin.linking': 'Vinculando...',
    'admin.administrator-linked': 'Usuário vinculado como administrador com sucesso!',
    'admin.placeholder.search-user': 'Digite nome ou email do usuário',
    
    // Placeholders
    'admin.placeholder.full-name': 'Digite o nome completo',
    'admin.placeholder.email': 'Digite o email',
    'admin.placeholder.phone': '(11) 99999-9999',
    'admin.placeholder.password': 'Digite uma senha segura',
    
    // Page titles
    'admin.page.users': 'Usuários',
    'admin.page.positions': 'Cargos',
    'admin.page.work-schedule': 'Jornada de Trabalho',
    'admin.page.holidays': 'Feriados',
    'admin.page.vacations': 'Férias',
    'admin.page.calendar': 'Calendário',
    'admin.page.statistics': 'Estatísticas',
    'admin.page.approvals': 'Central de Aprovações',
    'admin.page.punch-adjustments': 'Ajustes de Ponto',
    'admin.page.absence-requests': 'Solicitações de Ausência',
    'admin.page.feedback': 'Feedback',
    
    // Table columns
    'admin.table.name': 'Nome',
    'admin.table.email': 'Email',
    'admin.table.phone': 'Telefone',
    'admin.table.birth-date': 'Data de Nascimento',
    'admin.page.position': 'Cargo',
    'admin.table.work-schedule': 'Jornada',
    'admin.table.status': 'Status',
    'admin.table.actions': 'Ações',
    'admin.table.description': 'Descrição',
    'admin.table.date': 'Data',
    'admin.table.type': 'Tipo',
    'admin.table.minimum-education': 'Formação Mínima',
    'admin.table.salary': 'Salário',
    'admin.table.holiday-type': 'Tipo de Feriado',
    'admin.table.integral': 'Integral',
    'admin.table.half-day': 'Meio Período',
    'admin.table.active': 'Ativo',
    'admin.table.inactive': 'Inativo',
    
    // Approval Center
    'admin.approval-center.title': 'Central de Aprovações',
    'admin.approval-center.description': 'Gerencie todas as solicitações que necessitam de aprovação administrativa',
    'admin.approval-center.punch-adjustments': 'Ajustes de Ponto',
    'admin.approval-center.punch-adjustments-desc': 'Solicitações de ajuste de registro de ponto',
    'admin.approval-center.absence-requests': 'Solicitações de Ausência',
    'admin.approval-center.absence-requests-desc': 'Aprovação de ausências e licenças',
    'admin.approval-center.feedback': 'Feedback',
    'admin.approval-center.feedback-desc': 'Resposta a solicitações de feedback',
    'admin.approval-center.selected': 'Selecionado',
    'admin.approval-center.loading': 'Carregando',
    
    // Punch Adjustments
    'admin.punch-adjustments.title': 'Solicitações de Ajuste de Ponto',
    'admin.punch-adjustments.description': 'Avalie e aprove solicitações de ajuste de registro de ponto',
    'admin.punch-adjustments.total': 'Total',
    'admin.punch-adjustments.requests': 'solicitações',
    'admin.punch-adjustments.pending': 'Pendentes',
    'admin.punch-adjustments.approved': 'Aprovadas',
    'admin.punch-adjustments.rejected': 'Reprovadas',
    'admin.punch-adjustments.active-filter': 'Filtro ativo:',
    'admin.punch-adjustments.clear-filter': 'Limpar filtro',
    'admin.punch-adjustments.no-requests': 'Nenhuma solicitação encontrada',
    'admin.punch-adjustments.no-requests-desc': 'Não há solicitações de ajuste de ponto no momento.',
    'admin.punch-adjustments.loading': 'Carregando solicitações de ajuste de ponto...',
    'admin.punch-adjustments.table.date': 'Data Alteração',
    'admin.punch-adjustments.table.justification': 'Justificativa',
    'admin.punch-adjustments.table.status': 'Status',
    'admin.punch-adjustments.table.records': 'Registros',
    'admin.punch-adjustments.table.actions': 'Ações',
    'admin.punch-adjustments.table.entry': 'Entrada',
    'admin.punch-adjustments.table.exit': 'Saída',
    'admin.punch-adjustments.not-defined': 'Não definida',
    'admin.punch-adjustments.no-change': 'Sem alteração',
    
    // Status Badges
    'admin.status.pending': 'Pendente',
    'admin.status.approved': 'Aprovado',
    'admin.status.rejected': 'Reprovado',
    'admin.status.answered': 'Respondido',
    'admin.status.evaluated': 'Avaliado',
    'admin.status.unknown': 'Desconhecido',
    
    // Action Buttons
    'admin.actions.view': 'Ver',
    'admin.actions.approve': 'Aprovar',
    'admin.actions.reject': 'Reprovar',
    'admin.actions.evaluate': 'Avaliar',
    'admin.actions.respond': 'Responder',
    'admin.actions.action': 'Ação',
    
    // Analytics Charts
    'admin.analytics.hours-worked-month': 'Horas Trabalhadas por Mês',
    'admin.analytics.monthly-evolution': 'Evolução Mensal',
    'admin.analytics.hours-worked-description': 'Total de horas trabalhadas por mês',
    'admin.analytics.records-by-day': 'Registros por Dia da Semana',
    'admin.analytics.weekly-distribution': 'Distribuição Semanal',
    'admin.analytics.records-by-day-description': 'Quantidade de registros por dia da semana',
    'admin.analytics.overtime-month': 'Horas Extras por Mês',
    'admin.analytics.monthly-accumulated': 'Acumulado Mensal',
    'admin.analytics.overtime-description': 'Total de horas extras realizadas por mês',
    'admin.analytics.delays-month': 'Atrasos por Mês',
    'admin.analytics.delay-frequency': 'Frequência de Atrasos',
    'admin.analytics.delays-description': 'Quantidade de atrasos registrados por mês',
    'admin.analytics.records-by-period': 'Registros por Período do Dia',
    'admin.analytics.daily-distribution': 'Distribuição Diária',
    'admin.analytics.records-by-period-description': 'Quantidade de registros por período do dia',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    
    // Logout Modal
    'common.logout-confirmation': 'Tem certeza que deseja sair do sistema?',
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
    
    // Admin navigation
    'admin.users': 'Users',
    'admin.positions': 'Positions',
    'admin.work-schedule': 'Work Schedule',
    'admin.holidays': 'Holidays',
    'admin.vacations': 'Vacations',
    'admin.calendar': 'Calendar',
    'admin.statistics': 'Statistics',
    'admin.create-admin': 'Create Admin',
    'admin.approvals': 'Approval Center',
    
    // Admin forms
    'admin.create-administrator': 'Create Administrator',
    'admin.create-administrator-desc': 'Register a new administrator in the system',
    'admin.full-name': 'Full Name',
    'admin.email': 'Email',
    'admin.birth-date': 'Birth Date',
    'admin.phone': 'Phone',
    'admin.password': 'Password',
    'admin.position': 'Position',
    'admin.work-schedule-field': 'Work Schedule',
    'admin.access-profile': 'Access Profile',
    'admin.select-position': 'Select a position',
    'admin.select-work-schedule': 'Select a schedule',
    'admin.select-profile': 'Select a profile',
    'admin.loading-positions': 'Loading positions...',
    'admin.loading-schedules': 'Loading schedules...',
    'admin.loading-profiles': 'Loading profiles...',
    'admin.no-positions': 'No positions available. Check if there are positions registered in the system.',
    'admin.no-schedules': 'No schedules available. Check if there are schedules registered in the system.',
    'admin.no-profiles': 'No profiles available. Check if there are profiles registered in the system.',
    'admin.create-administrator-btn': 'Create Administrator',
    'admin.creating': 'Creating...',
    'admin.administrator-created': 'Administrator created successfully!',
    'admin.create-new': 'Create New',
    'admin.link-existing': 'Link Existing',
    'admin.select-existing-user': 'Select Existing User',
    'admin.search-user': 'Search User',
    'admin.select-user': 'Select User',
    'admin.select-user-option': 'Select a user',
    'admin.no-users-found': 'No users found',
    'admin.no-users-matching': 'No users match the search',
    'admin.link-administrator-btn': 'Link as Administrator',
    'admin.linking': 'Linking...',
    'admin.administrator-linked': 'User linked as administrator successfully!',
    'admin.placeholder.search-user': 'Enter user name or email',
    
    // Placeholders
    'admin.placeholder.full-name': 'Enter full name',
    'admin.placeholder.email': 'Enter email',
    'admin.placeholder.phone': '(11) 99999-9999',
    'admin.placeholder.password': 'Enter a secure password',
    
    // Page titles
    'admin.page.users': 'Users',
    'admin.page.positions': 'Positions',
    'admin.page.work-schedule': 'Work Schedule',
    'admin.page.holidays': 'Holidays',
    'admin.page.vacations': 'Vacations',
    'admin.page.calendar': 'Calendar',
    'admin.page.statistics': 'Statistics',
    'admin.page.approvals': 'Approval Center',
    'admin.page.punch-adjustments': 'Punch Adjustments',
    'admin.page.absence-requests': 'Absence Requests',
    'admin.page.feedback': 'Feedback',
    
    // Table columns
    'admin.table.name': 'Name',
    'admin.table.email': 'Email',
    'admin.table.phone': 'Phone',
    'admin.table.birth-date': 'Birth Date',
    'admin.page.position': 'Position',
    'admin.table.work-schedule': 'Schedule',
    'admin.table.status': 'Status',
    'admin.table.actions': 'Actions',
    'admin.table.description': 'Description',
    'admin.table.date': 'Date',
    'admin.table.type': 'Type',
    'admin.table.minimum-education': 'Minimum Education',
    'admin.table.salary': 'Salary',
    'admin.table.holiday-type': 'Holiday Type',
    'admin.table.integral': 'Full Day',
    'admin.table.half-day': 'Half Day',
    'admin.table.active': 'Active',
    'admin.table.inactive': 'Inactive',
    
    // Approval Center
    'admin.approval-center.title': 'Approval Center',
    'admin.approval-center.description': 'Manage all requests that require administrative approval',
    'admin.approval-center.punch-adjustments': 'Punch Adjustments',
    'admin.approval-center.punch-adjustments-desc': 'Time record adjustment requests',
    'admin.approval-center.absence-requests': 'Absence Requests',
    'admin.approval-center.absence-requests-desc': 'Approval of absences and leaves',
    'admin.approval-center.feedback': 'Feedback',
    'admin.approval-center.feedback-desc': 'Response to feedback requests',
    'admin.approval-center.selected': 'Selected',
    'admin.approval-center.loading': 'Loading',
    
    // Punch Adjustments
    'admin.punch-adjustments.title': 'Punch Adjustment Requests',
    'admin.punch-adjustments.description': 'Evaluate and approve time record adjustment requests',
    'admin.punch-adjustments.total': 'Total',
    'admin.punch-adjustments.requests': 'requests',
    'admin.punch-adjustments.pending': 'Pending',
    'admin.punch-adjustments.approved': 'Approved',
    'admin.punch-adjustments.rejected': 'Rejected',
    'admin.punch-adjustments.active-filter': 'Active filter:',
    'admin.punch-adjustments.clear-filter': 'Clear filter',
    'admin.punch-adjustments.no-requests': 'No requests found',
    'admin.punch-adjustments.no-requests-desc': 'There are no punch adjustment requests at the moment.',
    'admin.punch-adjustments.loading': 'Loading punch adjustment requests...',
    'admin.punch-adjustments.table.date': 'Change Date',
    'admin.punch-adjustments.table.justification': 'Justification',
    'admin.punch-adjustments.table.status': 'Status',
    'admin.punch-adjustments.table.records': 'Records',
    'admin.punch-adjustments.table.actions': 'Actions',
    'admin.punch-adjustments.table.entry': 'Entry',
    'admin.punch-adjustments.table.exit': 'Exit',
    'admin.punch-adjustments.not-defined': 'Not defined',
    'admin.punch-adjustments.no-change': 'No change',
    
    // Status Badges
    'admin.status.pending': 'Pending',
    'admin.status.approved': 'Approved',
    'admin.status.rejected': 'Rejected',
    'admin.status.answered': 'Answered',
    'admin.status.evaluated': 'Evaluated',
    'admin.status.unknown': 'Unknown',
    
    // Action Buttons
    'admin.actions.view': 'View',
    'admin.actions.approve': 'Approve',
    'admin.actions.reject': 'Reject',
    'admin.actions.evaluate': 'Evaluate',
    'admin.actions.respond': 'Respond',
    'admin.actions.action': 'Action',
    
    // Analytics Charts
    'admin.analytics.hours-worked-month': 'Hours Worked per Month',
    'admin.analytics.monthly-evolution': 'Monthly Evolution',
    'admin.analytics.hours-worked-description': 'Total hours worked per month',
    'admin.analytics.records-by-day': 'Records by Day of the Week',
    'admin.analytics.weekly-distribution': 'Weekly Distribution',
    'admin.analytics.records-by-day-description': 'Number of records per day of the week',
    'admin.analytics.overtime-month': 'Overtime per Month',
    'admin.analytics.monthly-accumulated': 'Monthly Accumulated',
    'admin.analytics.overtime-description': 'Total overtime hours worked per month',
    'admin.analytics.delays-month': 'Delays per Month',
    'admin.analytics.delay-frequency': 'Delay Frequency',
    'admin.analytics.delays-description': 'Number of delays recorded per month',
    'admin.analytics.records-by-period': 'Records by Time of Day',
    'admin.analytics.daily-distribution': 'Daily Distribution',
    'admin.analytics.records-by-period-description': 'Number of records by time of day',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Logout Modal
    'common.logout-confirmation': 'Are you sure you want to log out of the system?',
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
    const currentTranslations = translations[language as keyof typeof translations];
    return currentTranslations?.[key as keyof typeof currentTranslations] || key;
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
