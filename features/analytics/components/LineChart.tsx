'use client';

import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  title?: string;
  description?: string;
}

const LineChart = ({ data, color = "#2563eb", title, description }: LineChartProps) => {
  return (
    <div className="w-full h-[300px]">
      {title && <h3 className="text-lg font-semibold mb-1 text-black">{title}</h3>}
      {description && <p className="text-sm mb-2 text-black">{description}</p>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { LineChart }; 