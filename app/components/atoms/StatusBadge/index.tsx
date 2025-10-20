import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'answered' | 'evaluated';
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          text: 'Pendente',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case 'approved':
        return {
          text: 'Aprovado',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'rejected':
        return {
          text: 'Reprovado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      case 'answered':
        return {
          text: 'Respondido',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'evaluated':
        return {
          text: 'Avaliado',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      default:
        return {
          text: 'Desconhecido',
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
