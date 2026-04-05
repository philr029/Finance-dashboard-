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
import { Subscription } from '@/types';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import { getTotalMonthlySubs, getDaysUntil } from '@/utils/calculations';
import { Plus, Pencil, Trash2, RefreshCcw, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'warning'> = {
  keep: 'success', cancel: 'danger', review: 'warning',
};
const CAT_LABELS: Record<string, string> = {
  entertainment: 'Entertainment', productivity: 'Productivity', health: 'Health',
  utilities: 'Utilities', shopping: 'Shopping', finance: 'Finance', other: 'Other',
};

interface FormState {
  name: string; cost: string; billingCycle: string; renewalDate: string;
  category: string; status: string; notes: string;
}
const emptyForm = (): FormState => ({
  name: '', cost: '', billingCycle: 'monthly', renewalDate: '',
  category: 'entertainment', status: 'keep', notes: '',
});

export default function SubscriptionsPage() {
  const { data, addSubscription, updateSubscription, deleteSubscription } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const sym = data?.settings.currencySymbol ?? '£';

  const totalMonthly = useMemo(() => data ? getTotalMonthlySubs(data.subscriptions) : 0, [data]);
  const upcomingRenewals = useMemo(() =>
    (data?.subscriptions ?? [])
      .filter(s => s.renewalDate && getDaysUntil(s.renewalDate) <= 14)
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()),
    [data]
  );
  const topSub = useMemo(() => {
    if (!data || data.subscriptions.length === 0) return null;
    return data.subscriptions.reduce((max, s) => {
      const monthlyCost = s.billingCycle === 'monthly' ? s.cost : s.cost / 12;
      const maxCost = max.billingCycle === 'monthly' ? max.cost : max.cost / 12;
      return monthlyCost > maxCost ? s : max;
    });
  }, [data]);

  if (!data) return <LoadingSpinner />;

  const validate = (f: FormState) => {
    const e: Partial<FormState> = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.cost || isNaN(Number(f.cost)) || Number(f.cost) <= 0) e.cost = 'Enter valid cost';
    return e;
  };

  const openAdd = () => { setEditSub(null); setForm(emptyForm()); setErrors({}); setModalOpen(true); };
  const openEdit = (s: Subscription) => {
    setEditSub(s);
    setForm({ name: s.name, cost: String(s.cost), billingCycle: s.billingCycle, renewalDate: s.renewalDate, category: s.category, status: s.status, notes: s.notes });
    setErrors({}); setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const sub: Subscription = {
      id: editSub?.id ?? `sub-${Date.now()}`,
      name: form.name.trim(), cost: Number(form.cost),
      billingCycle: form.billingCycle as Subscription['billingCycle'],
      renewalDate: form.renewalDate, category: form.category as Subscription['category'],
      status: form.status as Subscription['status'], notes: form.notes,
    };
    if (editSub) { updateSubscription(sub); toast.success('Subscription updated'); }
    else { addSubscription(sub); toast.success('Subscription added'); }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) { deleteSubscription(id); toast.success('Subscription deleted'); }
  };

  const cycleStatus = (id: string, status: Subscription['status']) => {
    const sub = data.subscriptions.find(s => s.id === id);
    if (sub) { updateSubscription({ ...sub, status }); toast.success('Status updated'); }
  };

  return (
    <div>
      <Header title="Subscriptions" subtitle="Manage your recurring payments" demoMode={data.settings.demoMode} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Monthly Cost" value={formatCurrency(totalMonthly, sym)} sub="All subscriptions" icon={<RefreshCcw className="w-5 h-5" />} color="blue" />
          <StatCard label="Yearly Impact" value={formatCurrency(totalMonthly * 12, sym)} sub="Total annual spend" icon={<TrendingUp className="w-5 h-5" />} color="purple" />
          <StatCard label="Active Plans" value={String(data.subscriptions.length)} sub={`${data.subscriptions.filter(s => s.status === 'review').length} marked for review`} icon={<Calendar className="w-5 h-5" />} color="amber" />
          {topSub && (
            <StatCard label="Most Expensive" value={topSub.name} sub={formatCurrency(topSub.cost, sym) + `/${topSub.billingCycle === 'monthly' ? 'mo' : 'yr'}`} icon={<AlertCircle className="w-5 h-5" />} color="gray" />
          )}
        </div>

        {upcomingRenewals.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              ⚡ {upcomingRenewals.length} Renewal{upcomingRenewals.length !== 1 ? 's' : ''} Due Soon
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingRenewals.map(sub => {
                const days = getDaysUntil(sub.renewalDate);
                const isUrgent = days <= 3;
                return (
                  <div key={sub.id} className={`flex items-center justify-between p-4 rounded-xl border ${isUrgent ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40'}`}>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{sub.name}</p>
                      <p className={`text-xs font-medium mt-0.5 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {days === 0 ? 'Renewing today' : `In ${days} day${days !== 1 ? 's' : ''}`} · {formatShortDate(sub.renewalDate)}
                      </p>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {formatCurrency(sub.cost, sym)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Card>
          <CardHeader
            title="All Subscriptions"
            subtitle={`${data.subscriptions.length} subscriptions · ${formatCurrency(totalMonthly, sym)}/month`}
            action={<Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" />Add</Button>}
          />
          <CardContent>
            {data.subscriptions.length === 0 ? (
              <EmptyState
                icon={<RefreshCcw className="w-8 h-8" />}
                title="No subscriptions yet"
                description="Track your Netflix, Spotify, and other recurring payments"
                action={<Button onClick={openAdd}><Plus className="w-4 h-4" />Add Subscription</Button>}
              />
            ) : (
              <div className="space-y-3">
                {data.subscriptions.sort((a, b) => {
                  const aC = a.billingCycle === 'monthly' ? a.cost : a.cost / 12;
                  const bC = b.billingCycle === 'monthly' ? b.cost : b.cost / 12;
                  return bC - aC;
                }).map(sub => {
                  const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
                  const days = sub.renewalDate ? getDaysUntil(sub.renewalDate) : null;
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                          <RefreshCcw className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{sub.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{CAT_LABELS[sub.category] ?? sub.category}</span>
                            {days !== null && days <= 7 && (
                              <span className="text-xs text-amber-500 font-medium">Renews in {days}d</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(sub.cost, sym)}/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</p>
                          <p className="text-xs text-gray-400">{formatCurrency(monthlyCost, sym)}/mo equiv.</p>
                        </div>
                        <div className="flex gap-1">
                          {(['keep', 'review', 'cancel'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => cycleStatus(sub.id, s)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${sub.status === s ? (s === 'keep' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : s === 'cancel' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400') : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="hidden group-hover:flex gap-1">
                          <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(sub.id, sub.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editSub ? 'Edit Subscription' : 'Add Subscription'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Service Name" placeholder="Netflix, Spotify..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cost" type="number" step="0.01" min="0.01" prefix={sym} value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} error={errors.cost} />
            <Select label="Billing Cycle" value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="entertainment">Entertainment</option>
              <option value="productivity">Productivity</option>
              <option value="health">Health</option>
              <option value="utilities">Utilities</option>
              <option value="shopping">Shopping</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </Select>
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="keep">Keep</option>
              <option value="review">Review</option>
              <option value="cancel">Cancel</option>
            </Select>
          </div>
          <Input label="Renewal Date (optional)" type="date" value={form.renewalDate} onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))} />
          <TextArea label="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>{editSub ? 'Save Changes' : 'Add Subscription'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
