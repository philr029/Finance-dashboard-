'use client';
import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, getDaysUntil, generateId } from '@/lib/utils';
import { Debt } from '@/types';
import { Plus, CreditCard, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'loan', label: 'Personal Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'other', label: 'Other' },
];

const emptyForm = { name: '', balance: '', apr: '', minimumPayment: '', dueDate: '', type: 'credit_card' as Debt['type'] };

export default function DebtPage() {
  const { data, updateData, isLoaded } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [form, setForm] = useState(emptyForm);
  const sym = data.settings.currencySymbol;

  const totalDebt = data.debts.reduce((s, d) => s + d.balance, 0);
  const totalMinimum = data.debts.reduce((s, d) => s + d.minimumPayment, 0);
  const highestAPR = data.debts.reduce((max, d) => d.apr > (max?.apr ?? 0) ? d : max, data.debts[0]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setIsOpen(true); };
  const openEdit = (d: Debt) => {
    setEditing(d);
    setForm({ name: d.name, balance: String(d.balance), apr: String(d.apr), minimumPayment: String(d.minimumPayment), dueDate: d.dueDate, type: d.type });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Enter a name');
    const balance = parseFloat(String(form.balance));
    const apr = parseFloat(String(form.apr));
    const minimumPayment = parseFloat(String(form.minimumPayment));
    if (isNaN(balance) || isNaN(apr) || isNaN(minimumPayment)) return toast.error('Enter valid numbers');

    const debt: Debt = { id: editing?.id ?? generateId(), name: form.name, balance, apr, minimumPayment, dueDate: form.dueDate, type: form.type };

    if (editing) {
      updateData({ ...data, debts: data.debts.map(d => d.id === editing.id ? debt : d) });
      toast.success('Debt updated!');
    } else {
      updateData({ ...data, debts: [...data.debts, debt] });
      toast.success('Debt added!');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this debt?')) return;
    updateData({ ...data, debts: data.debts.filter(d => d.id !== id) });
    toast.success('Debt removed');
  };

  if (!isLoaded) return <div className="p-6 animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 rounded-2xl" />)}</div>;

  const sortedDebts = [...data.debts].sort((a, b) => b.apr - a.apr);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Debt Tracker</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{data.debts.length} debts tracked</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Debt</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Total Debt</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalDebt, sym)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Monthly Minimum</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(totalMinimum, sym)}</p>
        </Card>
        {highestAPR && (
          <Card className="border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-amber-500" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Highest APR</p>
            </div>
            <p className="text-lg font-bold text-amber-600">{highestAPR.apr}% APR</p>
            <p className="text-xs text-zinc-500 truncate">{highestAPR.name}</p>
          </Card>
        )}
      </div>

      {/* Debts List */}
      {data.debts.length === 0 ? (
        <EmptyState icon={<CreditCard size={32} />} title="No debts tracked" description="Add your debts to track balances and plan payoff" action={<Button onClick={openAdd}><Plus size={16} /> Add Debt</Button>} />
      ) : (
        <div className="space-y-4">
          {sortedDebts.map(debt => {
            const daysUntil = getDaysUntil(debt.dueDate);
            const monthsToPayoff = debt.minimumPayment > 0 ? Math.ceil(debt.balance / debt.minimumPayment) : null;
            return (
              <Card key={debt.id} className="hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <CreditCard size={18} className="text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{debt.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="danger">{debt.apr}% APR</Badge>
                        <Badge variant="default">{DEBT_TYPES.find(t => t.value === debt.type)?.label}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(debt)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(debt.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Balance</p>
                    <p className="text-lg font-bold text-red-500">{formatCurrency(debt.balance, sym)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Min. Payment</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(debt.minimumPayment, sym)}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Next Due</p>
                    <p className={`text-sm font-semibold ${daysUntil <= 7 ? 'text-red-500' : daysUntil <= 14 ? 'text-amber-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {format(new Date(debt.dueDate), 'dd MMM')}
                      {daysUntil <= 7 && <span className="ml-1 text-xs">(soon!)</span>}
                    </p>
                  </div>
                </div>

                {monthsToPayoff !== null && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    At minimum payments: ~{monthsToPayoff} months to pay off
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Debt' : 'Add Debt'}>
        <div className="space-y-4">
          <Input label="Debt Name" placeholder="e.g. Barclaycard Visa" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Debt['type'] })} options={DEBT_TYPES} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Balance (${sym})`} type="number" step="0.01" placeholder="2500" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
            <Input label="APR (%)" type="number" step="0.1" placeholder="22.9" value={form.apr} onChange={e => setForm({ ...form, apr: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Min. Payment (${sym})`} type="number" step="0.01" placeholder="50" value={form.minimumPayment} onChange={e => setForm({ ...form, minimumPayment: e.target.value })} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Debt'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
