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
    'profile.who-watching': 'Quem está logando?',
    'profile.admin': 'Admin',
    'profile.user': 'Usuário',
    'profile.admin-desc': 'Gerenciar sistema',
    'profile.user-desc': 'Bater ponto',
    'profile.logout': 'Sair',
    
    // Admin Navigation
    'admin.users': 'Usuários',
    'admin.roles': 'Cargos',
    'admin.work-schedule': 'Jornada de Trabalho',
    'admin.holidays': 'Feriados',
    'admin.vacations': 'Férias',
    'admin.calendar': 'Calendário',
    'admin.statistics': 'Estatísticas',
    'admin.approval-center': 'Central de Aprovações',
    'admin.logout': 'Sair',
    
    // Approval Center
    'approval.title': 'Central de Aprovações',
    'approval.subtitle': 'Gerencie todas as solicitações que necessitam de aprovação administrativa',
    'approval.point-adjustments': 'Ajustes de Ponto',
    'approval.point-adjustments-desc': 'Solicitações de ajuste de registro de ponto',
    'approval.absence-requests': 'Solicitações de Ausência',
    'approval.absence-requests-desc': 'Aprovação de ausências e licenças',
    'approval.feedback': 'Feedback',
    'approval.feedback-desc': 'Resposta a solicitações de feedback',
    'approval.selected': 'Selecionado',
    'approval.pending': 'Pendentes',
    'approval.approved': 'Aprovadas',
    'approval.rejected': 'Reprovadas',
    'approval.total': 'Total: {count} solicitações',
    'approval.point-adjustment-requests': 'Solicitações de Ajuste de Ponto',
    'approval.point-adjustment-requests-desc': 'Avalie e aprove solicitações de ajuste de registro de ponto',
    'approval.change-date': 'DATA ALTERAÇÃO',
    'approval.justification': 'JUSTIFICATIVA',
    'approval.records': 'REGISTROS',
    'approval.view': 'Ver',
    'approval.not-defined': 'Não definida',
    'approval.total-requests': 'Total: {count} solicitações',
    'approval.loading-requests': 'Carregando solicitações de ajuste de ponto...',
    'approval.no-requests-found': 'Nenhuma solicitação encontrada',
    'approval.no-requests-desc': 'Não há solicitações de ajuste de ponto no momento.',
    'approval.active-filter': 'Filtro ativo:',
    'approval.clear-filter': 'Limpar filtro',
    'approval.entry': 'Entrada',
    'approval.exit': 'Saída',
    'approval.no-change': 'Sem alteração',
    'approval.user-not-found': 'Usuário não encontrado',
    'approval.error-loading-name': 'Erro ao carregar nome',
    'approval.request-approved': 'Solicitação aprovada com sucesso!',
    'approval.request-rejected': 'Solicitação reprovada com sucesso!',
    'approval.error-updating': 'Erro ao atualizar solicitação',
    'approval.error-loading': 'Erro ao carregar solicitações',
    
    // Dashboard
    'dashboard.analytics': 'Analytics',
    'dashboard.employee': 'Funcionário',
    'dashboard.select-employee': 'Selecione um funcionário',
    'dashboard.hours-worked-month': 'Horas Trabalhadas por Mês',
    'dashboard.records-day-week': 'Registros por Dia da Semana',
    'dashboard.overtime-month': 'Horas Extras por Mês',
    'dashboard.delays-month': 'Atrasos por Mês',
    'dashboard.records-time-day': 'Registros por Período do Dia',
    'dashboard.monthly-evolution': 'Evolução Mensal',
    'dashboard.weekly-distribution': 'Distribuição Semanal',
    'dashboard.monthly-accumulated': 'Acumulado Mensal',
    'dashboard.delay-frequency': 'Frequência de Atrasos',
    'dashboard.records-by-time': 'Registros por Período',
    'dashboard.total-hours-month': 'Total de horas trabalhadas por mês',
    'dashboard.records-week-day': 'Quantidade de registros por dia da semana',
    'dashboard.overtime-month-total': 'Total de horas extras realizadas por mês',
    'dashboard.delays-month-total': 'Quantidade de atrasos registrados por mês',
    'dashboard.records-time-period': 'Distribuição de registros por período do dia',
    
    // Table
    'table.list-of': 'Lista de',
    'table.add': 'Adicionar',
    'table.actions': 'Ações',
    'table.edit': 'Editar',
    'table.delete': 'Excluir',
    'table.no-data': 'Nenhum {item} cadastrado.',
    'table.status': 'Status',
    'table.name': 'Nome',
    'table.email': 'Email',
    'table.phone': 'Telefone',
    'table.role': 'Cargo',
    'table.work-schedule': 'Jornada',
    'table.role-name': 'Nome do Cargo',
    'table.minimum-education': 'Formação Mínima',
    'table.salary': 'Salário',
    'table.role-age': 'Idade do Cargo',
    'table.confirm-delete-user': 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
    'table.confirm-delete-role': 'Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita.',
    'table.confirm-delete-schedule': 'Tem certeza que deseja excluir esta jornada? Esta ação não pode ser desfeita.',
    'table.schedule-name': 'Nome da Jornada',
    'table.daily-hours': 'Quantidade de Horas Diárias',
    'table.error-loading-roles': 'Erro ao carregar cargos',
    'table.error-loading-schedules': 'Erro ao carregar jornadas',
    'table.error-loading-holidays': 'Erro ao carregar feriados',
    'table.description': 'Descrição',
    'table.date': 'Data',
    'table.type': 'Tipo',
    'table.holiday-description': 'Descrição do Feriado',
    'table.holiday-date': 'Data do Feriado',
    'table.holiday-type-label': 'Tipo de Feriado',
    'table.holiday-type.full': 'Integral',
    'table.holiday-type.half': 'Meio Período',
    'table.confirm-delete-holiday': 'Tem certeza que deseja excluir este feriado? Esta ação não pode ser desfeita.',
    'table.confirm-delete-vacation': 'Tem certeza que deseja excluir estas férias? Esta ação não pode ser desfeita.',
    'table.start-date': 'Data Início',
    'table.end-date': 'Data Fim',
    'table.user-id': 'ID Usuário',
    'table.vacation-start': 'Início',
    'table.vacation-end': 'Último dia',
    'table.error-loading-vacations': 'Erro ao carregar férias',
    'table.vacation-id-not-found': 'ID das férias não encontrado',
    'table.vacation-deleted-success': 'Férias excluídas com sucesso!',
    'table.error-deleting-vacation': 'Erro ao excluir férias. Tente novamente.',
    'table.status.active': 'Ativo',
    'table.status.inactive': 'Inativo',
    'table.status.approved': 'Aprovado',
    'table.status.pending': 'Pendente',
    'table.status.rejected': 'Reprovado',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.confirm': 'Confirmar',
    
    // Calendar
    'calendar.next': 'Próximo',
    'calendar.previous': 'Anterior',
    'calendar.today': 'Hoje',
    'calendar.month': 'Mês',
    'calendar.week': 'Semana',
    'calendar.day': 'Dia',
    'calendar.agenda': 'Agenda',
    'calendar.no-vacations-period': 'Não existem férias para este período',
    'calendar.events': 'eventos',
    'calendar.date': 'Data',
    'calendar.time': 'Hora',
    'calendar.event': 'Evento',
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
    
    // Admin Navigation
    'admin.users': 'Users',
    'admin.roles': 'Roles',
    'admin.work-schedule': 'Work Schedule',
    'admin.holidays': 'Holidays',
    'admin.vacations': 'Vacations',
    'admin.calendar': 'Calendar',
    'admin.statistics': 'Statistics',
    'admin.approval-center': 'Approval Center',
    'admin.logout': 'Logout',
    
    // Approval Center
    'approval.title': 'Approval Center',
    'approval.subtitle': 'Manage all requests that require administrative approval',
    'approval.point-adjustments': 'Point Adjustments',
    'approval.point-adjustments-desc': 'Point record adjustment requests',
    'approval.absence-requests': 'Absence Requests',
    'approval.absence-requests-desc': 'Approval of absences and licenses',
    'approval.feedback': 'Feedback',
    'approval.feedback-desc': 'Response to feedback requests',
    'approval.selected': 'Selected',
    'approval.pending': 'Pending',
    'approval.approved': 'Approved',
    'approval.rejected': 'Rejected',
    'approval.total': 'Total: {count} requests',
    'approval.point-adjustment-requests': 'Point Adjustment Requests',
    'approval.point-adjustment-requests-desc': 'Evaluate and approve point record adjustment requests',
    'approval.change-date': 'CHANGE DATE',
    'approval.justification': 'JUSTIFICATION',
    'approval.records': 'RECORDS',
    'approval.view': 'View',
    'approval.not-defined': 'Not defined',
    'approval.total-requests': 'Total: {count} requests',
    'approval.loading-requests': 'Loading point adjustment requests...',
    'approval.no-requests-found': 'No requests found',
    'approval.no-requests-desc': 'There are no point adjustment requests at the moment.',
    'approval.active-filter': 'Active filter:',
    'approval.clear-filter': 'Clear filter',
    'approval.entry': 'Entry',
    'approval.exit': 'Exit',
    'approval.no-change': 'No change',
    'approval.user-not-found': 'User not found',
    'approval.error-loading-name': 'Error loading name',
    'approval.request-approved': 'Request approved successfully!',
    'approval.request-rejected': 'Request rejected successfully!',
    'approval.error-updating': 'Error updating request',
    'approval.error-loading': 'Error loading requests',
    
    // Dashboard
    'dashboard.analytics': 'Analytics',
    'dashboard.employee': 'Employee',
    'dashboard.select-employee': 'Select an employee',
    'dashboard.hours-worked-month': 'Hours Worked per Month',
    'dashboard.records-day-week': 'Records by Day of Week',
    'dashboard.overtime-month': 'Overtime per Month',
    'dashboard.delays-month': 'Delays per Month',
    'dashboard.records-time-day': 'Records by Time of Day',
    'dashboard.monthly-evolution': 'Monthly Evolution',
    'dashboard.weekly-distribution': 'Weekly Distribution',
    'dashboard.monthly-accumulated': 'Monthly Accumulated',
    'dashboard.delay-frequency': 'Delay Frequency',
    'dashboard.records-by-time': 'Records by Time',
    'dashboard.total-hours-month': 'Total hours worked per month',
    'dashboard.records-week-day': 'Number of records per day of the week',
    'dashboard.overtime-month-total': 'Total overtime hours per month',
    'dashboard.delays-month-total': 'Number of delays recorded per month',
    'dashboard.records-time-period': 'Distribution of records by time of day',
    
    // Table
    'table.list-of': 'List of',
    'table.add': 'Add',
    'table.actions': 'Actions',
    'table.edit': 'Edit',
    'table.delete': 'Delete',
    'table.no-data': 'No {item} registered.',
    'table.status': 'Status',
    'table.name': 'Name',
    'table.email': 'Email',
    'table.phone': 'Phone',
    'table.role': 'Role',
    'table.work-schedule': 'Work Schedule',
    'table.role-name': 'Role Name',
    'table.minimum-education': 'Minimum Education',
    'table.salary': 'Salary',
    'table.role-age': 'Role Age',
    'table.confirm-delete-user': 'Are you sure you want to delete this user? This action cannot be undone.',
    'table.confirm-delete-role': 'Are you sure you want to delete this role? This action cannot be undone.',
    'table.confirm-delete-schedule': 'Are you sure you want to delete this work schedule? This action cannot be undone.',
    'table.schedule-name': 'Schedule Name',
    'table.daily-hours': 'Daily Hours',
    'table.error-loading-roles': 'Error loading roles',
    'table.error-loading-schedules': 'Error loading work schedules',
    'table.error-loading-holidays': 'Error loading holidays',
    'table.description': 'Description',
    'table.date': 'Date',
    'table.type': 'Type',
    'table.holiday-description': 'Holiday Description',
    'table.holiday-date': 'Holiday Date',
    'table.holiday-type-label': 'Holiday Type',
    'table.holiday-type.full': 'Full Day',
    'table.holiday-type.half': 'Half Day',
    'table.confirm-delete-holiday': 'Are you sure you want to delete this holiday? This action cannot be undone.',
    'table.confirm-delete-vacation': 'Are you sure you want to delete this vacation? This action cannot be undone.',
    'table.start-date': 'Start Date',
    'table.end-date': 'End Date',
    'table.user-id': 'User ID',
    'table.vacation-start': 'Start',
    'table.vacation-end': 'Last Day',
    'table.error-loading-vacations': 'Error loading vacations',
    'table.vacation-id-not-found': 'Vacation ID not found',
    'table.vacation-deleted-success': 'Vacation deleted successfully!',
    'table.error-deleting-vacation': 'Error deleting vacation. Please try again.',
    'table.status.active': 'Active',
    'table.status.inactive': 'Inactive',
    'table.status.approved': 'Approved',
    'table.status.pending': 'Pending',
    'table.status.rejected': 'Rejected',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    
    // Calendar
    'calendar.next': 'Next',
    'calendar.previous': 'Previous',
    'calendar.today': 'Today',
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.day': 'Day',
    'calendar.agenda': 'Agenda',
    'calendar.no-vacations-period': 'No vacations for this period',
    'calendar.events': 'events',
    'calendar.date': 'Date',
    'calendar.time': 'Time',
    'calendar.event': 'Event',
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
