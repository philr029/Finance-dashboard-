'use client';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export default function NetWorthPage() {
  const { data, isLoaded } = useAppData();
  const sym = data.settings.currencySymbol;

  const latest = data.netWorthHistory.at(-1);
  const prev = data.netWorthHistory.at(-2);
  const change = latest && prev ? latest.netWorth - prev.netWorth : 0;
  const changePct = prev && prev.netWorth !== 0 ? (change / Math.abs(prev.netWorth)) * 100 : 0;

  const totalSavings = data.savingsPots.reduce((s, p) => s + p.currentAmount, 0);
  const totalInvestments = data.investments.reduce((s, i) => s + i.currentValue, 0);
  const totalDebt = data.debts.reduce((s, d) => s + d.balance, 0);
  const totalAssets = totalSavings + totalInvestments;
  const netWorth = totalAssets - totalDebt;

  if (!isLoaded) return <div className="p-6 animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 rounded-2xl" />)}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Net Worth</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your financial position over time</p>
      </div>

      {/* Main Net Worth Card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Current Net Worth</p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(netWorth, sym)}</p>
            {change !== 0 && (
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {change >= 0 ? '+' : ''}{formatCurrency(change, sym)} ({changePct.toFixed(1)}%) vs last month
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-400">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
      </Card>

      {/* Assets vs Liabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600 mb-4">{formatCurrency(totalAssets, sym)}</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Savings</p>
                  <p className="text-xs text-zinc-500">{data.savingsPots.length} pots</p>
                </div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalSavings, sym)}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Investments</p>
                  <p className="text-xs text-zinc-500">{data.investments.length} holdings</p>
                </div>
                <p className="font-semibold text-indigo-700 dark:text-indigo-400">{formatCurrency(totalInvestments, sym)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Liabilities</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500 mb-4">{formatCurrency(totalDebt, sym)}</p>
            <div className="space-y-3">
              {data.debts.map(debt => (
                <div key={debt.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{debt.name}</p>
                    <p className="text-xs text-zinc-500">{debt.apr}% APR</p>
                  </div>
                  <p className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(debt.balance, sym)}</p>
                </div>
              ))}
              {data.debts.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No debts 🎉</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Worth History Chart */}
      <Card>
        <CardHeader><CardTitle>Net Worth History</CardTitle></CardHeader>
        <CardContent>
          <NetWorthChart data={data.netWorthHistory} currencySymbol={sym} />
        </CardContent>
      </Card>

      {/* History Table */}
      {data.netWorthHistory.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Monthly Snapshots</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left py-2 text-xs font-medium text-zinc-500">Month</th>
                    <th className="text-right py-2 text-xs font-medium text-zinc-500">Assets</th>
                    <th className="text-right py-2 text-xs font-medium text-zinc-500">Liabilities</th>
                    <th className="text-right py-2 text-xs font-medium text-zinc-500">Net Worth</th>
                    <th className="text-right py-2 text-xs font-medium text-zinc-500">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.netWorthHistory].reverse().map((snap, idx, arr) => {
                    const prev = arr[idx + 1];
                    const change = prev ? snap.netWorth - prev.netWorth : null;
                    return (
                      <tr key={snap.id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                        <td className="py-3 text-zinc-900 dark:text-zinc-100">{format(new Date(snap.date), 'MMMM yyyy')}</td>
                        <td className="py-3 text-right text-emerald-600">{formatCurrency(snap.totalAssets, sym)}</td>
                        <td className="py-3 text-right text-red-500">{formatCurrency(snap.totalLiabilities, sym)}</td>
                        <td className="py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(snap.netWorth, sym)}</td>
                        <td className="py-3 text-right">
                          {change !== null ? (
                            <span className={change >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                              {change >= 0 ? '+' : ''}{formatCurrency(change, sym)}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
