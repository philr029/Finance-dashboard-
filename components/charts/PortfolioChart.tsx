'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Investment } from '@/types';
import { formatCurrency } from '@/lib/utils';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

interface PortfolioChartProps {
  investments: Investment[];
  currencySymbol: string;
}

export function PortfolioChart({ investments, currencySymbol }: PortfolioChartProps) {
  const data = investments.map(inv => ({
    name: inv.ticker,
    value: inv.currentValue,
  }));

  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">No investment data</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value, currencySymbol), 'Value']}
          contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', fontSize: 13 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
