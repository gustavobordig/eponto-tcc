import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PunctualityData {
  date: string;
  late: number;
  early: number;
}

interface PunctualityChartProps {
  data: PunctualityData[];
}

export const PunctualityChart: React.FC<PunctualityChartProps> = ({ data }) => {
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
          formatter={(value: number, name: string) => [
            `${value} ${value === 1 ? 'vez' : 'vezes'}`,
            name === 'late' ? 'Atrasos' : 'Adiantamentos'
          ]}
          labelFormatter={(label: string) => {
            const date = new Date(label);
            return format(date, "MMMM yyyy", { locale: ptBR });
          }}
        />
        <Legend 
          formatter={(value: string) => 
            value === 'late' ? 'Atrasos' : 'Adiantamentos'
          }
        />
        <Bar 
          dataKey="late" 
          fill="#ef4444" 
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
        <Bar 
          dataKey="early" 
          fill="#22c55e" 
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}; 