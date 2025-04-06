import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HoursBalanceData {
  date: string;
  balance: number;
}

interface HoursBalanceChartProps {
  data: HoursBalanceData[];
}

export const HoursBalanceChart: React.FC<HoursBalanceChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value: string) => {
            const date = new Date(value);
            return format(date, "MMM/yy", { locale: ptBR });
          }}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`${value}h`, 'Saldo']}
          labelFormatter={(label: string) => {
            const date = new Date(label);
            return format(date, "MMMM yyyy", { locale: ptBR });
          }}
        />
        <Bar 
          dataKey="balance" 
          fill="#002085" 
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}; 