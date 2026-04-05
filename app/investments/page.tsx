'use client';
import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DonutChart } from '@/components/charts/DonutChart';
import { Investment } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { getTotalPortfolioValue, getTotalPortfolioCost, getPortfolioGainLoss } from '@/utils/calculations';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS: Record<string, string> = {
  stock: '#3b82f6', etf: '#8b5cf6', crypto: '#f59e0b', cash: '#10b981', other: '#9ca3af',
};
const CATEGORY_LABELS: Record<string, string> = {
  stock: 'Stock', etf: 'ETF', crypto: 'Crypto', cash: 'Cash', other: 'Other',
};

interface FormState {
  name: string; ticker: string; category: string;
  units: string; averageCost: string; currentPrice: string; notes: string;
}
const emptyForm = (): FormState => ({ name: '', ticker: '', category: 'etf', units: '', averageCost: '', currentPrice: '', notes: '' });

export default function InvestmentsPage() {
  const { data, addInvestment, updateInvestment, deleteInvestment } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editInv, setEditInv] = useState<Investment | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const sym = data?.settings.currencySymbol ?? '£';

  const totalValue = useMemo(() => data ? getTotalPortfolioValue(data.investments) : 0, [data]);
  const totalCost = useMemo(() => data ? getTotalPortfolioCost(data.investments) : 0, [data]);
  const gainLoss = useMemo(() => data ? getPortfolioGainLoss(data.investments) : 0, [data]);
  const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

  const allocationData = useMemo(() => {
    if (!data) return [];
    const byCategory: Record<string, number> = {};
    data.investments.forEach(inv => {
      const val = inv.units * inv.currentPrice;
      byCategory[inv.category] = (byCategory[inv.category] || 0) + val;
    });
    return Object.entries(byCategory).map(([cat, val]) => ({
      name: CATEGORY_LABELS[cat] ?? cat, value: Math.round(val * 100) / 100, color: CATEGORY_COLORS[cat] ?? '#9ca3af',
    }));
  }, [data]);

  if (!data) return <LoadingSpinner />;

  const validate = (f: FormState) => {
    const e: Partial<FormState> = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.units || isNaN(Number(f.units)) || Number(f.units) <= 0) e.units = 'Enter valid units/amount';
    if (!f.averageCost || isNaN(Number(f.averageCost))) e.averageCost = 'Enter valid cost';
    if (!f.currentPrice || isNaN(Number(f.currentPrice))) e.currentPrice = 'Enter valid price';
    return e;
  };

  const openAdd = () => { setEditInv(null); setForm(emptyForm()); setErrors({}); setModalOpen(true); };
  const openEdit = (inv: Investment) => {
    setEditInv(inv);
    setForm({ name: inv.name, ticker: inv.ticker, category: inv.category, units: String(inv.units), averageCost: String(inv.averageCost), currentPrice: String(inv.currentPrice), notes: inv.notes });
    setErrors({}); setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const inv: Investment = {
      id: editInv?.id ?? `inv-${Date.now()}`,
      name: form.name.trim(), ticker: form.ticker.trim().toUpperCase(),
      category: form.category as Investment['category'],
      units: Number(form.units), averageCost: Number(form.averageCost),
      currentPrice: Number(form.currentPrice), notes: form.notes,
      createdAt: editInv?.createdAt ?? new Date().toISOString(),
    };
    if (editInv) { updateInvestment(inv); toast.success('Investment updated'); }
    else { addInvestment(inv); toast.success('Investment added'); }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) { deleteInvestment(id); toast.success('Investment deleted'); }
  };

  return (
    <div>
      <Header title="Investments" subtitle="Track your portfolio performance" demoMode={data.settings.demoMode} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Portfolio Value" value={formatCurrency(totalValue, sym)} icon={<BarChart3 className="w-5 h-5" />} color="blue" />
          <StatCard label="Total Invested" value={formatCurrency(totalCost, sym)} icon={<DollarSign className="w-5 h-5" />} color="purple" />
          <StatCard
            label="Total Gain/Loss"
            value={formatCurrency(Math.abs(gainLoss), sym)}
            icon={gainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            color={gainLoss >= 0 ? 'green' : 'red'}
            trend={gainLoss >= 0 ? 'up' : 'down'}
            trendValue={`${gainLossPct >= 0 ? '+' : ''}${formatPercentage(gainLossPct)}`}
          />
          <StatCard label="Holdings" value={String(data.investments.length)} icon={<TrendingUp className="w-5 h-5" />} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader title="Allocation" subtitle="By asset type" />
            <CardContent>
              {allocationData.length === 0
                ? <EmptyState icon={<BarChart3 className="w-8 h-8" />} title="No investments yet" />
                : <DonutChart data={allocationData} currencySymbol={sym} height={260} />}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Holdings" action={<Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" />Add</Button>} />
            <CardContent>
              {data.investments.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="w-8 h-8" />}
                  title="No holdings yet"
                  description="Add stocks, ETFs, crypto or other assets"
                  action={<Button onClick={openAdd}><Plus className="w-4 h-4" />Add Investment</Button>}
                />
              ) : (
                <div className="space-y-3">
                  {data.investments.map(inv => {
                    const currentVal = inv.units * inv.currentPrice;
                    const costBasis = inv.units * inv.averageCost;
                    const gl = currentVal - costBasis;
                    const glPct = costBasis > 0 ? (gl / costBasis) * 100 : 0;
                    const allocationPct = totalValue > 0 ? (currentVal / totalValue) * 100 : 0;
                    return (
                      <div key={inv.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${CATEGORY_COLORS[inv.category]}20` }}>
                              <span className="text-xs font-bold" style={{ color: CATEGORY_COLORS[inv.category] }}>
                                {inv.ticker || inv.name.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{inv.name}</p>
                              <div className="flex items-center gap-2">
                                {inv.ticker && <span className="text-xs text-gray-400">{inv.ticker}</span>}
                                <Badge variant="default" size="sm">{CATEGORY_LABELS[inv.category]}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 ml-3 flex-shrink-0">
                            <div className="text-right">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatCurrency(currentVal, sym)}</p>
                              <p className={`text-xs font-medium ${gl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {gl >= 0 ? '+' : ''}{formatCurrency(Math.abs(gl), sym)} ({gl >= 0 ? '+' : ''}{formatPercentage(glPct)})
                              </p>
                            </div>
                            <div className="hidden group-hover:flex gap-1">
                              <button onClick={() => openEdit(inv)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(inv.id, inv.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-gray-500">
                          <div><span className="block text-gray-400">Units</span>{inv.units}</div>
                          <div><span className="block text-gray-400">Avg Cost</span>{formatCurrency(inv.averageCost, sym)}</div>
                          <div><span className="block text-gray-400">Allocation</span>{formatPercentage(allocationPct)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editInv ? 'Edit Investment' : 'Add Investment'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Asset Name" placeholder="Vanguard S&P 500 ETF" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
            <Input label="Ticker (optional)" placeholder="VUSA" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} />
          </div>
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="stock">Stock</option>
            <option value="etf">ETF</option>
            <option value="crypto">Crypto</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </Select>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Units / Shares" type="number" step="any" min="0" placeholder="0" value={form.units} onChange={e => setForm(f => ({ ...f, units: e.target.value }))} error={errors.units} />
            <Input label="Avg Cost" type="number" step="any" min="0" prefix={sym} placeholder="0.00" value={form.averageCost} onChange={e => setForm(f => ({ ...f, averageCost: e.target.value }))} error={errors.averageCost} />
            <Input label="Current Price" type="number" step="any" min="0" prefix={sym} placeholder="0.00" value={form.currentPrice} onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))} error={errors.currentPrice} />
          </div>
          <TextArea label="Notes (optional)" placeholder="Any notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>{editInv ? 'Save Changes' : 'Add Investment'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
