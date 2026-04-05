'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, type PieLabelRenderProps } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  currencySymbol?: string;
  height?: number;
}

const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if ((percent ?? 0) < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const ri = Number(innerRadius ?? 0);
  const ro = Number(outerRadius ?? 0);
  const ma = Number(midAngle ?? 0);
  const radius = ri + (ro - ri) * 0.5;
  const x = Number(cx ?? 0) + radius * Math.cos(-ma * RADIAN);
  const y = Number(cy ?? 0) + radius * Math.sin(-ma * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium" fontSize={11}>
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

export function DonutChart({ data, currencySymbol = '£', height = 280 }: DonutChartProps) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="45%"
          outerRadius="75%"
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: unknown) => { const v = Number(value); return [`${currencySymbol}${v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']; }}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '13px' }}
        />
        <Legend
          formatter={(value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
