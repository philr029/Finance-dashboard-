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
import { formatCurrency, getDaysUntil, generateId } from '@/lib/utils';
import { Subscription } from '@/types';
import { Plus, Repeat, Pencil, Trash2, Bell } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];

const BILLING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const CATEGORY_OPTIONS = [
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Health & Fitness', label: 'Health & Fitness' },
  { value: 'Storage', label: 'Storage' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Productivity', label: 'Productivity' },
  { value: 'News & Media', label: 'News & Media' },
  { value: 'Education', label: 'Education' },
  { value: 'Other', label: 'Other' },
];

const emptyForm = { name: '', amount: '', billingCycle: 'monthly' as Subscription['billingCycle'], renewalDate: '', category: 'Entertainment', note: '', status: 'active' as Subscription['status'] };

export default function SubscriptionsPage() {
  const { data, updateData, isLoaded } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [form, setForm] = useState(emptyForm);
  const sym = data.settings.currencySymbol;

  const active = data.subscriptions.filter(s => s.status === 'active');
  const monthlyTotal = active.reduce((s, sub) => s + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12), 0);
  const yearlyTotal = monthlyTotal * 12;
  const upcoming = active.filter(s => getDaysUntil(s.renewalDate) <= 14 && getDaysUntil(s.renewalDate) >= 0).sort((a, b) => getDaysUntil(a.renewalDate) - getDaysUntil(b.renewalDate));

  const openAdd = () => { setEditing(null); setForm(emptyForm); setIsOpen(true); };
  const openEdit = (s: Subscription) => {
    setEditing(s);
    setForm({ name: s.name, amount: String(s.amount), billingCycle: s.billingCycle, renewalDate: s.renewalDate, category: s.category, note: s.note ?? '', status: s.status });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Enter a name');
    const amount = parseFloat(String(form.amount));
    if (isNaN(amount) || amount <= 0) return toast.error('Enter a valid amount');

    const sub: Subscription = { id: editing?.id ?? generateId(), name: form.name, amount, billingCycle: form.billingCycle, renewalDate: form.renewalDate, category: form.category, note: form.note || undefined, status: form.status };

    if (editing) {
      updateData({ ...data, subscriptions: data.subscriptions.map(s => s.id === editing.id ? sub : s) });
      toast.success('Subscription updated!');
    } else {
      updateData({ ...data, subscriptions: [...data.subscriptions, sub] });
      toast.success('Subscription added!');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this subscription?')) return;
    updateData({ ...data, subscriptions: data.subscriptions.filter(s => s.id !== id) });
    toast.success('Subscription removed');
  };

  if (!isLoaded) return <div className="p-6 animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-zinc-100 rounded-2xl" />)}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Subscriptions</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{active.length} active subscriptions</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Subscription</Button>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Monthly Cost</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(monthlyTotal, sym)}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">across {active.length} subscriptions</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Annual Cost</p>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(yearlyTotal, sym)}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">per year</p>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      {upcoming.length > 0 && (
        <Card className="border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-amber-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Upcoming Renewals</h3>
          </div>
          <div className="space-y-2">
            {upcoming.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(s.amount, sym)}</span>
                  <Badge variant={getDaysUntil(s.renewalDate) <= 3 ? 'danger' : 'warning'}>
                    {getDaysUntil(s.renewalDate) === 0 ? 'Today!' : `${getDaysUntil(s.renewalDate)}d`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Subscriptions List */}
      {data.subscriptions.length === 0 ? (
        <EmptyState icon={<Repeat size={32} />} title="No subscriptions tracked" description="Add your subscriptions to see what you're spending" action={<Button onClick={openAdd}><Plus size={16} /> Add Subscription</Button>} />
      ) : (
        <Card>
          <CardHeader><CardTitle>All Subscriptions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.subscriptions.map(sub => {
                const daysUntil = getDaysUntil(sub.renewalDate);
                const monthlyEq = sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12;
                return (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <Repeat size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{sub.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-zinc-500">{sub.category}</span>
                          {sub.note && <span className="text-xs text-zinc-400 truncate">· {sub.note}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(sub.amount, sym)}/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</p>
                        <p className="text-xs text-zinc-500">{formatCurrency(monthlyEq, sym)}/mo equiv.</p>
                      </div>
                      <Badge variant={sub.status === 'active' ? 'success' : sub.status === 'paused' ? 'warning' : 'default'}>
                        {sub.status}
                      </Badge>
                      {sub.renewalDate && (
                        <span className={`text-xs hidden md:block ${daysUntil <= 7 && sub.status === 'active' ? 'text-amber-500 font-medium' : 'text-zinc-400'}`}>
                          {format(new Date(sub.renewalDate), 'dd MMM')}
                        </span>
                      )}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(sub)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(sub.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Subscription' : 'Add Subscription'}>
        <div className="space-y-4">
          <Input label="Name" placeholder="e.g. Netflix" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Amount (${sym})`} type="number" step="0.01" placeholder="9.99" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <Select label="Billing Cycle" value={form.billingCycle} onChange={e => setForm({ ...form, billingCycle: e.target.value as Subscription['billingCycle'] })} options={BILLING_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={CATEGORY_OPTIONS} />
            <Input label="Renewal Date" type="date" value={form.renewalDate} onChange={e => setForm({ ...form, renewalDate: e.target.value })} />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Subscription['status'] })} options={STATUS_OPTIONS} />
          <Input label="Note (optional)" placeholder="Any notes..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Subscription'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
