'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface BudgetBarChartProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export function BudgetBarChart({ transactions, currencySymbol }: BudgetBarChartProps) {
  const monthlyData: Record<string, { income: number; expenses: number }> = {};

  transactions.forEach(t => {
    const month = format(new Date(t.date), 'MMM yy');
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
    if (t.type === 'income') monthlyData[month].income += t.amount;
    else monthlyData[month].expenses += t.amount;
  });

  const data = Object.entries(monthlyData).map(([month, vals]) => ({
    month,
    income: Math.round(vals.income * 100) / 100,
    expenses: Math.round(vals.expenses * 100) / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: '#a1a1aa' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value, currencySymbol), name]}
          contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', fontSize: 13 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
