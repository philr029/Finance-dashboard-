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
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Debt } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getTotalDebt, getHighestInterestDebt, calculateDebtPayoffMonths, getDaysUntil } from '@/utils/calculations';
import { Plus, Pencil, Trash2, CreditCard, Flame, Calendar, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_LABELS: Record<string, string> = {
  credit_card: 'Credit Card', loan: 'Loan', overdraft: 'Overdraft', finance: 'Finance', other: 'Other',
};
const TYPE_COLORS: Record<string, string> = {
  credit_card: '#ef4444', loan: '#f97316', overdraft: '#eab308', finance: '#8b5cf6', other: '#9ca3af',
};

interface FormState {
  name: string; type: string; balance: string; apr: string; minimumPayment: string; dueDate: string; notes: string;
}
const emptyForm = (): FormState => ({ name: '', type: 'credit_card', balance: '', apr: '', minimumPayment: '', dueDate: '', notes: '' });

export default function DebtPage() {
  const { data, addDebt, updateDebt, deleteDebt } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const sym = data?.settings.currencySymbol ?? '£';

  const totalDebt = useMemo(() => data ? getTotalDebt(data.debts) : 0, [data]);
  const highestAPR = useMemo(() => data ? getHighestInterestDebt(data.debts) : null, [data]);
  const totalMinPayment = useMemo(() => data ? data.debts.reduce((s, d) => s + d.minimumPayment, 0) : 0, [data]);

  if (!data) return <LoadingSpinner />;

  const validate = (f: FormState) => {
    const e: Partial<FormState> = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.balance || isNaN(Number(f.balance)) || Number(f.balance) < 0) e.balance = 'Enter valid balance';
    if (!f.apr || isNaN(Number(f.apr))) e.apr = 'Enter valid APR';
    if (!f.minimumPayment || isNaN(Number(f.minimumPayment))) e.minimumPayment = 'Enter valid payment';
    return e;
  };

  const openAdd = () => { setEditDebt(null); setForm(emptyForm()); setErrors({}); setModalOpen(true); };
  const openEdit = (d: Debt) => {
    setEditDebt(d);
    setForm({ name: d.name, type: d.type, balance: String(d.balance), apr: String(d.apr), minimumPayment: String(d.minimumPayment), dueDate: d.dueDate, notes: d.notes });
    setErrors({}); setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const debt: Debt = {
      id: editDebt?.id ?? `d-${Date.now()}`,
      name: form.name.trim(), type: form.type as Debt['type'],
      balance: Number(form.balance), apr: Number(form.apr),
      minimumPayment: Number(form.minimumPayment), dueDate: form.dueDate, notes: form.notes,
      createdAt: editDebt?.createdAt ?? new Date().toISOString(),
    };
    if (editDebt) { updateDebt(debt); toast.success('Debt updated'); }
    else { addDebt(debt); toast.success('Debt added'); }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) { deleteDebt(id); toast.success('Debt deleted'); }
  };

  const maxBalance = data.debts.length > 0 ? Math.max(...data.debts.map(d => d.balance)) : 1;

  return (
    <div>
      <Header title="Debt" subtitle="Track and pay off your debts" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Debt" value={formatCurrency(totalDebt, sym)} icon={<CreditCard className="w-5 h-5" />} color="red" />
          <StatCard label="Number of Debts" value={String(data.debts.length)} icon={<TrendingDown className="w-5 h-5" />} color="amber" />
          <StatCard label="Min. Monthly Payments" value={formatCurrency(totalMinPayment, sym)} icon={<Calendar className="w-5 h-5" />} color="blue" />
          {highestAPR && (
            <StatCard label="Highest APR" value={`${highestAPR.apr}%`} sub={highestAPR.name} icon={<Flame className="w-5 h-5" />} color="red" />
          )}
        </div>

        <Card>
          <CardHeader
            title="Debt Overview"
            subtitle={`${data.debts.length} debt${data.debts.length !== 1 ? 's' : ''}`}
            action={<Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" />Add Debt</Button>}
          />
          <CardContent>
            {data.debts.length === 0 ? (
              <EmptyState
                icon={<CreditCard className="w-8 h-8" />}
                title="No debts tracked"
                description="Add your loans, credit cards, or other debts to track them"
                action={<Button onClick={openAdd}><Plus className="w-4 h-4" />Add Debt</Button>}
              />
            ) : (
              <div className="space-y-4">
                {data.debts.sort((a, b) => b.apr - a.apr).map(debt => {
                  const months = calculateDebtPayoffMonths(debt.balance, debt.apr, debt.minimumPayment);
                  const daysUntilDue = debt.dueDate ? getDaysUntil(debt.dueDate) : null;
                  return (
                    <div key={debt.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${TYPE_COLORS[debt.type]}20` }}>
                            <CreditCard className="w-5 h-5" style={{ color: TYPE_COLORS[debt.type] }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{debt.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="default">{TYPE_LABELS[debt.type]}</Badge>
                              <span className="text-xs text-gray-400">{debt.apr}% APR</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 flex-shrink-0 ml-3">
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(debt.balance, sym)}</p>
                            <p className="text-xs text-gray-400">Min. {formatCurrency(debt.minimumPayment, sym)}/mo</p>
                          </div>
                          <div className="hidden group-hover:flex gap-1">
                            <button onClick={() => openEdit(debt)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(debt.id, debt.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                      <ProgressBar value={maxBalance - debt.balance} max={maxBalance} color={TYPE_COLORS[debt.type]} height="sm" className="mb-2" />
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {months !== Infinity && months > 0 && <span>Payoff at min. payments: ~{months} months</span>}
                        {daysUntilDue !== null && (
                          <span className={daysUntilDue <= 7 ? 'text-red-500 font-medium' : ''}>
                            {daysUntilDue <= 0 ? 'Overdue!' : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}
                          </span>
                        )}
                        {debt.notes && <span className="text-gray-400 italic">{debt.notes}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editDebt ? 'Edit Debt' : 'Add Debt'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Debt Name" placeholder="e.g. Barclays Credit Card" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="credit_card">Credit Card</option>
              <option value="loan">Loan</option>
              <option value="overdraft">Overdraft</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Balance" type="number" step="0.01" min="0" prefix={sym} value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} error={errors.balance} />
            <Input label="APR %" type="number" step="0.1" min="0" suffix="%" value={form.apr} onChange={e => setForm(f => ({ ...f, apr: e.target.value }))} error={errors.apr} />
            <Input label="Min. Payment" type="number" step="0.01" min="0" prefix={sym} value={form.minimumPayment} onChange={e => setForm(f => ({ ...f, minimumPayment: e.target.value }))} error={errors.minimumPayment} />
          </div>
          <Input label="Due Date (optional)" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          <TextArea label="Notes (optional)" placeholder="Any notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>{editDebt ? 'Save Changes' : 'Add Debt'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
