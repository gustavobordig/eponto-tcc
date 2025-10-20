import React from 'react';

interface StatsCardProps {
  title: string;
  count: number;
  type: 'pending' | 'approved' | 'rejected' | 'total' | 'answered';
  icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, type, icon }) => {
  const getCardConfig = () => {
    switch (type) {
      case 'pending':
        return {
          bgColor: 'bg-yellow-50',
          dotColor: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          countColor: 'text-yellow-900'
        };
      case 'approved':
        return {
          bgColor: 'bg-green-50',
          dotColor: 'bg-green-500',
          textColor: 'text-green-700',
          countColor: 'text-green-900'
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-50',
          dotColor: 'bg-red-500',
          textColor: 'text-red-700',
          countColor: 'text-red-900'
        };
      case 'total':
        return {
          bgColor: 'bg-blue-50',
          dotColor: 'bg-blue-500',
          textColor: 'text-blue-700',
          countColor: 'text-blue-900'
        };
      case 'answered':
        return {
          bgColor: 'bg-green-50',
          dotColor: 'bg-green-500',
          textColor: 'text-green-700',
          countColor: 'text-green-900'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          dotColor: 'bg-gray-500',
          textColor: 'text-gray-700',
          countColor: 'text-gray-900'
        };
    }
  };

  const config = getCardConfig();

  return (
    <div className={`${config.bgColor} p-4 rounded-lg`}>
      <div className="flex items-center gap-2">
        {icon ? (
          <div className={`${config.textColor}`}>
            {icon}
          </div>
        ) : (
          <div className={`w-3 h-3 ${config.dotColor} rounded-full`}></div>
        )}
        <span className={`text-sm font-medium ${config.textColor}`}>
          {title}
        </span>
      </div>
      <p className={`text-2xl font-bold ${config.countColor} mt-1`}>
        {count}
      </p>
    </div>
  );
};

export default StatsCard;
