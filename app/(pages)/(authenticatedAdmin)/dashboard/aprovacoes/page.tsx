'use client';

import { useState, useEffect } from 'react';
import Container from '@/app/components/atoms/container';
import LoadingText from '@/app/components/atoms/LoadingText';
import { Clock, CheckCircle, XCircle, FileText, UserCheck, MessageSquare } from 'lucide-react';

// Importar componentes das páginas existentes
import AjustesPontoContent from './components/AjustesPontoContent';
import SolicitacoesAusenciaContent from './components/SolicitacoesAusenciaContent';
import FeedbackContent from './components/FeedbackContent';

// Context
import { useLanguage } from '@/app/contexts/LanguageContext';

type ApprovalType = 'ajustes-ponto' | 'solicitacoes-ausencia' | 'feedback';

interface ApprovalOption {
  id: ApprovalType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Mover para dentro do componente para usar traduções

export default function AprovacoesPage() {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<ApprovalType>('ajustes-ponto');
  const [loading, setLoading] = useState(false);

  const approvalOptions: ApprovalOption[] = [
    {
      id: 'ajustes-ponto',
      label: t('admin.approval-center.punch-adjustments'),
      description: t('admin.approval-center.punch-adjustments-desc'),
      icon: <Clock className="w-5 h-5" />,
      color: 'blue'
    },
    {
      id: 'solicitacoes-ausencia',
      label: t('admin.approval-center.absence-requests'),
      description: t('admin.approval-center.absence-requests-desc'),
      icon: <UserCheck className="w-5 h-5" />,
      color: 'orange'
    },
    {
      id: 'feedback',
      label: t('admin.approval-center.feedback'),
      description: t('admin.approval-center.feedback-desc'),
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'green'
    }
  ];

  const handleTypeChange = (type: ApprovalType) => {
    setSelectedType(type);
    setLoading(true);
    // Simular loading para transição suave
    setTimeout(() => setLoading(false), 300);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        hover: 'hover:bg-blue-100',
        selected: 'bg-blue-100 border-blue-300'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        hover: 'hover:bg-orange-100',
        selected: 'bg-orange-100 border-orange-300'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        hover: 'hover:bg-green-100',
        selected: 'bg-green-100 border-green-300'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingText title={t('admin.approval-center.loading')} />
        </div>
      );
    }

    switch (selectedType) {
      case 'ajustes-ponto':
        return <AjustesPontoContent />;
      case 'solicitacoes-ausencia':
        return <SolicitacoesAusenciaContent />;
      case 'feedback':
        return <FeedbackContent />;
      default:
        return <AjustesPontoContent />;
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('admin.approval-center.title')}
        </h1>
        <p className="text-gray-600">
          {t('admin.approval-center.description')}
        </p>
      </div>

      {/* Selector de Tipo */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {approvalOptions.map((option) => {
            const colors = getColorClasses(option.color);
            const isSelected = selectedType === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleTypeChange(option.id)}
                className={`
                  p-6 rounded-lg border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? `${colors.selected} shadow-md` 
                    : `${colors.bg} ${colors.border} ${colors.hover}`
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                    {option.icon}
                  </div>
                  <h3 className={`font-semibold ${colors.text}`}>
                    {option.label}
                  </h3>
                </div>
                <p className={`text-sm ${colors.text} opacity-80`}>
                  {option.description}
                </p>
                {isSelected && (
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      {t('admin.approval-center.selected')}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {renderContent()}
      </div>
    </Container>
  );
}
