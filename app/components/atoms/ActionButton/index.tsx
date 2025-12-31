import React from 'react';

interface ActionButtonProps {
  type: 'view' | 'approve' | 'reject' | 'evaluate' | 'respond';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false,
  size = 'sm'
}) => {
  const getButtonConfig = () => {
    switch (type) {
      case 'view':
        return {
          text: 'Ver',
          bgColor: 'bg-gray-200',
          textColor: 'text-gray-700',
          hoverColor: 'hover:bg-gray-300'
        };
      case 'approve':
        return {
          text: 'Aprovar',
          bgColor: 'bg-green-600',
          textColor: 'text-white',
          hoverColor: 'hover:bg-green-700'
        };
      case 'reject':
        return {
          text: 'Reprovar',
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          hoverColor: 'hover:bg-red-700'
        };
      case 'evaluate':
        return {
          text: 'Avaliar',
          bgColor: 'bg-blue-600',
          textColor: 'text-white',
          hoverColor: 'hover:bg-blue-700'
        };
      case 'respond':
        return {
          text: 'Responder',
          bgColor: 'bg-green-600',
          textColor: 'text-white',
          hoverColor: 'hover:bg-green-700'
        };
      default:
        return {
          text: 'Ação',
          bgColor: 'bg-gray-600',
          textColor: 'text-white',
          hoverColor: 'hover:bg-gray-700'
        };
    }
  };

  const config = getButtonConfig();
  const sizeClasses = size === 'sm' 
    ? 'px-3 py-1 text-xs' 
    : 'px-4 py-2 text-sm';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${config.bgColor} 
        ${config.textColor} 
        ${config.hoverColor}
        ${sizeClasses}
        rounded-md font-medium transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-1
      `}
    >
      {loading && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
      )}
      {config.text}
    </button>
  );
};

export default ActionButton;
