'use client';

import {
  ComposedChart as RechartsComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  value1: number;
  value2: number;
}

interface ComposedChartProps {
  data: DataPoint[];
  barColor?: string;
  lineColor?: string;
  barName?: string;
  lineName?: string;
  title?: string;
  description?: string;
}

const ComposedChart = ({ 
  data, 
  barColor = "#2563eb", 
  lineColor = "#16a34a",
  barName = "Barra",
  lineName = "Linha",
  title, 
  description 
}: ComposedChartProps) => {
  return (
    <div className="w-full h-[300px]">
      {title && <h3 className="text-lg font-semibold mb-1 text-black">{title}</h3>}
      {description && <p className="text-sm mb-2 text-gray-600">{description}</p>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="value1" fill={barColor} name={barName} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="value2" stroke={lineColor} strokeWidth={2} name={lineName} />
        </RechartsComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export { ComposedChart };

