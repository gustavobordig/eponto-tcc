import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'answered' | 'evaluated';
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const { t } = useLanguage();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          text: t('admin.status.pending'),
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case 'approved':
        return {
          text: t('admin.status.approved'),
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'rejected':
        return {
          text: t('admin.status.rejected'),
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      case 'answered':
        return {
          text: t('admin.status.answered'),
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'evaluated':
        return {
          text: t('admin.status.evaluated'),
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      default:
        return {
          text: t('admin.status.unknown'),
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span className={`
      ${config.bgColor} 
      ${config.textColor} 
      ${sizeClasses}
      rounded-full font-medium inline-flex items-center
    `}>
      {config.text}
    </span>
  );
};

export default StatusBadge;
