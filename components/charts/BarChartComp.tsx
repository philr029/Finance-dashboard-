'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface BarChartCompProps {
  data: { name: string; income?: number; expenses?: number; value?: number }[];
  currencySymbol?: string;
  height?: number;
}

export function BarChartComp({ data, currencySymbol = '£', height = 220 }: BarChartCompProps) {
  if (!data || data.length === 0) return null;
  const hasMultiple = data[0] && ('income' in data[0] || 'expenses' in data[0]);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={hasMultiple ? 14 : 20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: unknown, name: unknown) => { const v = Number(value); return [`${currencySymbol}${v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name as string]; }}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '13px' }}
        />
        {hasMultiple ? (
          <>
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-sm capitalize">{v}</span>} />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </>
        ) : (
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
