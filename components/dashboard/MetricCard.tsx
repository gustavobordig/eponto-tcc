'use client';

import { MetricCard as MetricCardType } from "@/lib/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  metric: MetricCardType;
}

export function MetricCard({ metric }: MetricCardProps) {
  const isPositive = metric.trend === 'up';
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor}`}>
          {isPositive ? (
            <TrendingUp className={`w-4 h-4 ${changeColor}`} />
          ) : (
            <TrendingDown className={`w-4 h-4 ${changeColor}`} />
          )}
          <span className={`text-xs font-semibold ${changeColor}`}>
            {Math.abs(metric.change)}%
          </span>
        </div>
      </div>
    </div>
  );
}

