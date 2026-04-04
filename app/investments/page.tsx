'use client';
import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { formatCurrency, formatPercent, generateId } from '@/lib/utils';
import { Investment } from '@/types';
import { Plus, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
  { value: 'ETF', label: 'ETF' },
  { value: 'Stock', label: 'Stock' },
  { value: 'Crypto', label: 'Crypto' },
  { value: 'Bond', label: 'Bond' },
  { value: 'Other', label: 'Other' },
];

const emptyForm = { name: '', ticker: '', type: 'ETF' as Investment['type'], amountInvested: '', currentValue: '', purchaseDate: '' };

export default function InvestmentsPage() {
  const { data, updateData, isLoaded } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const sym = data.settings.currencySymbol;

  const totalInvested = data.investments.reduce((s, i) => s + i.amountInvested, 0);
  const totalValue = data.investments.reduce((s, i) => s + i.currentValue, 0);
  const totalGain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const openAdd = () => { setEditing(null); setForm(emptyForm); setIsOpen(true); };
  const openEdit = (inv: Investment) => {
    setEditing(inv);
    setForm({ name: inv.name, ticker: inv.ticker, type: inv.type, amountInvested: String(inv.amountInvested), currentValue: String(inv.currentValue), purchaseDate: inv.purchaseDate });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.ticker.trim()) return toast.error('Name and ticker are required');
    const amountInvested = parseFloat(String(form.amountInvested));
    const currentValue = parseFloat(String(form.currentValue));
    if (isNaN(amountInvested) || isNaN(currentValue)) return toast.error('Enter valid amounts');

    const inv: Investment = { id: editing?.id ?? generateId(), name: form.name, ticker: form.ticker.toUpperCase(), type: form.type, amountInvested, currentValue, purchaseDate: form.purchaseDate };

    if (editing) {
      updateData({ ...data, investments: data.investments.map(i => i.id === editing.id ? inv : i) });
      toast.success('Investment updated!');
    } else {
      updateData({ ...data, investments: [...data.investments, inv] });
      toast.success('Investment added!');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this investment?')) return;
    updateData({ ...data, investments: data.investments.filter(i => i.id !== id) });
    toast.success('Investment removed');
  };

  if (!isLoaded) return <div className="p-6 animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 rounded-2xl" />)}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Investments</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{data.investments.length} holdings</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Investment</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Total Invested</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(totalInvested, sym)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Current Value</p>
          <p className="text-xl font-bold text-indigo-600">{formatCurrency(totalValue, sym)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Total Gain/Loss</p>
          <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain, sym)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Return</p>
          <p className={`text-xl font-bold flex items-center gap-1 ${gainPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {gainPercent >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {gainPercent >= 0 ? '+' : ''}{formatPercent(gainPercent)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Portfolio Chart */}
        <Card>
          <CardHeader><CardTitle>Portfolio Allocation</CardTitle></CardHeader>
          <CardContent>
            {data.investments.length === 0 ? (
              <EmptyState icon={<TrendingUp size={32} />} title="No investments yet" description="Add your first investment to see allocation" />
            ) : (
              <PortfolioChart investments={data.investments} currencySymbol={sym} />
            )}
          </CardContent>
        </Card>

        {/* Holdings List */}
        <Card>
          <CardHeader><CardTitle>Holdings</CardTitle></CardHeader>
          <CardContent>
            {data.investments.length === 0 ? (
              <EmptyState icon={<TrendingUp size={32} />} title="No investments yet" description="Add your first investment" action={<Button onClick={openAdd}><Plus size={16} /> Add Investment</Button>} />
            ) : (
              <div className="space-y-3">
                {data.investments.map(inv => {
                  const gain = inv.currentValue - inv.amountInvested;
                  const gainPct = (gain / inv.amountInvested) * 100;
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 group transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{inv.ticker.slice(0, 3)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{inv.name}</p>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="purple">{inv.type}</Badge>
                            <span className="text-xs text-zinc-500">{inv.ticker}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(inv.currentValue, sym)}</p>
                        <p className={`text-xs font-medium ${gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {gain >= 0 ? '+' : ''}{formatPercent(gainPct)}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(inv)} className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Investment' : 'Add Investment'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" placeholder="Vanguard All-World ETF" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="Ticker" placeholder="VWRL" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })} />
          </div>
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Investment['type'] })} options={TYPE_OPTIONS} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Invested (${sym})`} type="number" step="0.01" placeholder="1000" value={form.amountInvested} onChange={e => setForm({ ...form, amountInvested: e.target.value })} />
            <Input label={`Current Value (${sym})`} type="number" step="0.01" placeholder="1200" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} />
          </div>
          <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Investment'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
