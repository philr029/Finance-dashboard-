'use client';
import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { AreaLineChart } from '@/components/charts/AreaLineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { NetWorthEntry } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { getTotalPortfolioValue, getTotalDebt, getTotalSaved } from '@/utils/calculations';
import { BarChart3, TrendingUp, TrendingDown, Plus, Landmark } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function NetWorthPage() {
  const { data, addNetWorthEntry } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ assets: '', liabilities: '', date: format(new Date(), 'yyyy-MM') });
  const sym = data?.settings.currencySymbol ?? '£';

  const currentAssets = useMemo(() => {
    if (!data) return 0;
    return getTotalPortfolioValue(data.investments) + getTotalSaved(data.savingsPots);
  }, [data]);
  const currentLiabilities = useMemo(() => data ? getTotalDebt(data.debts) : 0, [data]);
  const currentNetWorth = currentAssets - currentLiabilities;

  const chartData = useMemo(() =>
    (data?.netWorthHistory ?? [])
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ name: e.date.slice(0, 7), value: e.netWorth })),
    [data]
  );

  const assetBreakdown = useMemo(() => {
    if (!data) return [];
    const investVal = getTotalPortfolioValue(data.investments);
    const savingsVal = getTotalSaved(data.savingsPots);
    return [
      { name: 'Investments', value: Math.round(investVal * 100) / 100, color: '#8b5cf6' },
      { name: 'Savings', value: Math.round(savingsVal * 100) / 100, color: '#10b981' },
    ].filter(d => d.value > 0);
  }, [data]);

  const latestEntry = data?.netWorthHistory.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const previousEntry = data?.netWorthHistory.slice().sort((a, b) => b.date.localeCompare(a.date))[1];
  const nwChange = latestEntry && previousEntry ? latestEntry.netWorth - previousEntry.netWorth : 0;

  if (!data) return <LoadingSpinner />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assets || !form.liabilities) { toast.error('Please fill in all fields'); return; }
    const entry: NetWorthEntry = {
      id: `nw-${Date.now()}`,
      date: form.date,
      assets: Number(form.assets),
      liabilities: Number(form.liabilities),
      netWorth: Number(form.assets) - Number(form.liabilities),
    };
    addNetWorthEntry(entry);
    toast.success('Net worth entry added');
    setModalOpen(false);
    setForm({ assets: '', liabilities: '', date: format(new Date(), 'yyyy-MM') });
  };

  return (
    <div>
      <Header title="Net Worth" subtitle="Your financial position over time" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Net Worth"
            value={formatCurrency(currentNetWorth, sym)}
            icon={<BarChart3 className="w-5 h-5" />}
            color={currentNetWorth >= 0 ? 'blue' : 'red'}
            trend={currentNetWorth >= 0 ? 'up' : 'down'}
          />
          <StatCard label="Total Assets" value={formatCurrency(currentAssets, sym)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
          <StatCard label="Total Liabilities" value={formatCurrency(currentLiabilities, sym)} icon={<TrendingDown className="w-5 h-5" />} color="red" />
          <StatCard
            label="Month Change"
            value={`${nwChange >= 0 ? '+' : ''}${formatCurrency(Math.abs(nwChange), sym)}`}
            icon={<Landmark className="w-5 h-5" />}
            color={nwChange >= 0 ? 'green' : 'red'}
            trend={nwChange >= 0 ? 'up' : 'down'}
          />
        </div>

        {/* Net worth trend */}
        <Card>
          <CardHeader
            title="Net Worth Trend"
            subtitle="12-month history"
            action={<Button onClick={() => setModalOpen(true)} size="sm"><Plus className="w-4 h-4" />Add Entry</Button>}
          />
          <CardContent>
            {chartData.length === 0 ? (
              <EmptyState
                icon={<BarChart3 className="w-8 h-8" />}
                title="No history yet"
                description="Add net worth entries to see your trend over time"
                action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" />Add Entry</Button>}
              />
            ) : (
              <AreaLineChart data={chartData} currencySymbol={sym} height={260} label="Net Worth" />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset breakdown */}
          <Card>
            <CardHeader title="Asset Breakdown" />
            <CardContent>
              {assetBreakdown.length === 0
                ? <EmptyState icon={<TrendingUp className="w-8 h-8" />} title="No assets tracked" description="Add investments and savings to see breakdown" />
                : (
                  <>
                    <DonutChart data={assetBreakdown} currencySymbol={sym} height={240} />
                    <div className="mt-3 space-y-2">
                      {assetBreakdown.map(a => (
                        <div key={a.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                            <span className="text-gray-600 dark:text-gray-400">{a.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(a.value, sym)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
            </CardContent>
          </Card>

          {/* History table */}
          <Card>
            <CardHeader title="History" subtitle="Recent entries" />
            <CardContent>
              {data.netWorthHistory.length === 0
                ? <EmptyState icon={<BarChart3 className="w-8 h-8" />} title="No entries" />
                : (
                  <div className="space-y-2">
                    {[...data.netWorthHistory]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 12)
                      .map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{entry.date}</span>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${entry.netWorth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(entry.netWorth, sym)}</p>
                            <p className="text-xs text-gray-400">Assets: {formatCurrency(entry.assets, sym)} · Debt: {formatCurrency(entry.liabilities, sym)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Net Worth Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Month (YYYY-MM)" type="month" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Input label="Total Assets" type="number" step="0.01" min="0" prefix={sym} placeholder="0.00" value={form.assets} onChange={e => setForm(f => ({ ...f, assets: e.target.value }))} />
          <Input label="Total Liabilities" type="number" step="0.01" min="0" prefix={sym} placeholder="0.00" value={form.liabilities} onChange={e => setForm(f => ({ ...f, liabilities: e.target.value }))} />
          {form.assets && form.liabilities && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
              Net Worth: {formatCurrency(Number(form.assets) - Number(form.liabilities), sym)}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>Add Entry</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
