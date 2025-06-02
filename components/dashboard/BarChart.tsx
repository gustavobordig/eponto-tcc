'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
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

interface BarChartProps {
  data: DataPoint[];
  color?: string;
  title?: string;
  description?: string;
}

const BarChart = ({ data, color = "#2563eb", title, description }: BarChartProps) => {
  return (
    <div className="w-full h-[300px]">
      {title && <h3 className="text-lg font-semibold mb-1 text-black">{title}</h3>}
      {description && <p className="text-sm mb-2 text-black">{description}</p>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { BarChart }; 