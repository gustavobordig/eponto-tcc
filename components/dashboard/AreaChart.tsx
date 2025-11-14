'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  color?: string;
  title?: string;
  description?: string;
}

const AreaChart = ({ data, color = "#2563eb", title, description }: AreaChartProps) => {
  return (
    <div className="w-full h-[300px]">
      {title && <h3 className="text-lg font-semibold mb-1 text-black">{title}</h3>}
      {description && <p className="text-sm mb-2 text-gray-600">{description}</p>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#color${color.replace('#', '')})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export { AreaChart };

