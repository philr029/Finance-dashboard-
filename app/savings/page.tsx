'use client';
import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SavingsPot } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { getTotalSaved, getTotalSavingsTarget, getMonthsToGoal } from '@/utils/calculations';
import { Plus, Pencil, Trash2, PiggyBank, Target, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

interface FormState {
  name: string;
  currentAmount: string;
  targetAmount: string;
  monthlyContribution: string;
  color: string;
}

const emptyForm: FormState = { name: '', currentAmount: '', targetAmount: '', monthlyContribution: '', color: COLORS[0] };

function validateForm(f: FormState) {
  const errors: Partial<FormState> = {};
  if (!f.name.trim()) errors.name = 'Name is required';
  if (!f.currentAmount || isNaN(Number(f.currentAmount))) errors.currentAmount = 'Enter a valid amount';
  if (!f.targetAmount || isNaN(Number(f.targetAmount)) || Number(f.targetAmount) <= 0) errors.targetAmount = 'Enter a valid target';
  if (!f.monthlyContribution || isNaN(Number(f.monthlyContribution))) errors.monthlyContribution = 'Enter a valid contribution';
  return errors;
}

export default function SavingsPage() {
  const { data, addSavingsPot, updateSavingsPot, deleteSavingsPot } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPot, setEditPot] = useState<SavingsPot | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const sym = data?.settings.currencySymbol ?? '£';

  const totalSaved = useMemo(() => data ? getTotalSaved(data.savingsPots) : 0, [data]);
  const totalTarget = useMemo(() => data ? getTotalSavingsTarget(data.savingsPots) : 0, [data]);
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const totalRemaining = totalTarget - totalSaved;

  if (!data) return <LoadingSpinner />;

  const openAdd = () => { setEditPot(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (pot: SavingsPot) => {
    setEditPot(pot);
    setForm({ name: pot.name, currentAmount: String(pot.currentAmount), targetAmount: String(pot.targetAmount), monthlyContribution: String(pot.monthlyContribution), color: pot.color });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const pot: SavingsPot = {
      id: editPot?.id ?? `sp-${Date.now()}`,
      name: form.name.trim(),
      currentAmount: Number(form.currentAmount),
      targetAmount: Number(form.targetAmount),
      monthlyContribution: Number(form.monthlyContribution),
      color: form.color,
      icon: 'PiggyBank',
      createdAt: editPot?.createdAt ?? new Date().toISOString(),
    };
    if (editPot) { updateSavingsPot(pot); toast.success('Pot updated!'); }
    else { addSavingsPot(pot); toast.success('Pot added!'); }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) { deleteSavingsPot(id); toast.success('Pot deleted'); }
  };

  return (
    <div>
      <Header title="Savings" subtitle="Track your saving goals and pots" />
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Saved" value={formatCurrency(totalSaved, sym)} icon={<PiggyBank className="w-5 h-5" />} color="green" />
          <StatCard label="Total Target" value={formatCurrency(totalTarget, sym)} icon={<Target className="w-5 h-5" />} color="blue" />
          <StatCard label="Overall Progress" value={formatPercentage(overallPct)} icon={<TrendingUp className="w-5 h-5" />} color="purple" />
          <StatCard label="Remaining" value={formatCurrency(totalRemaining > 0 ? totalRemaining : 0, sym)} icon={<Clock className="w-5 h-5" />} color="amber" />
        </div>

        {/* Pots */}
        <Card>
          <CardHeader
            title="Saving Pots"
            subtitle={`${data.savingsPots.length} pot${data.savingsPots.length !== 1 ? 's' : ''}`}
            action={<Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" />Add Pot</Button>}
          />
          <CardContent>
            {data.savingsPots.length === 0 ? (
              <EmptyState
                icon={<PiggyBank className="w-8 h-8" />}
                title="No saving pots yet"
                description="Create a savings pot to start tracking your goals"
                action={<Button onClick={openAdd}><Plus className="w-4 h-4" />Add Your First Pot</Button>}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.savingsPots.map(pot => {
                  const pct = Math.min(100, pot.targetAmount > 0 ? (pot.currentAmount / pot.targetAmount) * 100 : 0);
                  const months = getMonthsToGoal(pot);
                  const remaining = pot.targetAmount - pot.currentAmount;
                  return (
                    <div key={pot.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${pot.color}20` }}>
                            <PiggyBank className="w-5 h-5" style={{ color: pot.color }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{pot.name}</h3>
                            <p className="text-xs text-gray-500">{formatCurrency(pot.monthlyContribution, sym)}/month</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(pot)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(pot.id, pot.name)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatCurrency(pot.currentAmount, sym)} saved</span>
                          <span>{formatCurrency(pot.targetAmount, sym)} goal</span>
                        </div>
                        <ProgressBar value={pot.currentAmount} max={pot.targetAmount} color={pot.color} height="md" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant={pct >= 100 ? 'success' : pct >= 75 ? 'info' : 'default'}>
                          {Math.round(pct)}% complete
                        </Badge>
                        {months !== null && months > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {months} months to go
                          </span>
                        )}
                        {remaining <= 0 && <Badge variant="success">Goal reached! 🎉</Badge>}
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editPot ? 'Edit Savings Pot' : 'New Savings Pot'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Pot Name"
            placeholder="e.g. Emergency Fund, Holiday 2025"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Amount"
              type="number"
              step="0.01"
              min="0"
              prefix={sym}
              placeholder="0.00"
              value={form.currentAmount}
              onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
              error={errors.currentAmount}
            />
            <Input
              label="Target Amount"
              type="number"
              step="0.01"
              min="0.01"
              prefix={sym}
              placeholder="0.00"
              value={form.targetAmount}
              onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
              error={errors.targetAmount}
            />
          </div>
          <Input
            label="Monthly Contribution"
            type="number"
            step="0.01"
            min="0"
            prefix={sym}
            placeholder="0.00"
            value={form.monthlyContribution}
            onChange={e => setForm(f => ({ ...f, monthlyContribution: e.target.value }))}
            error={errors.monthlyContribution}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Colour</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ backgroundColor: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>{editPot ? 'Save Changes' : 'Add Pot'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
