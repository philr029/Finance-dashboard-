'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NetWorthSnapshot } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface NetWorthChartProps {
  data: NetWorthSnapshot[];
  currencySymbol: string;
}

export function NetWorthChart({ data, currencySymbol }: NetWorthChartProps) {
  const chartData = data.map(d => ({
    month: format(new Date(d.date), 'MMM yy'),
    netWorth: d.netWorth,
    assets: d.totalAssets,
    liabilities: d.totalLiabilities,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: '#a1a1aa' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value, currencySymbol), 'Net Worth']}
          labelStyle={{ fontSize: 12, color: '#71717a' }}
          contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', fontSize: 13 }}
        />
        <Area type="monotone" dataKey="netWorth" stroke="#6366f1" strokeWidth={2} fill="url(#netWorthGrad)" dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
