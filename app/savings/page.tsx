'use client';
import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, getMonthsUntilGoal, generateId } from '@/lib/utils';
import { SavingsPot } from '@/types';
import { Plus, PiggyBank, Pencil, Trash2, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const POT_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444'];
const POT_ICONS = ['🛡️', '✈️', '🏠', '🚗', '🎓', '💍', '🎮', '🏖️', '💰'];

const emptyPot: Omit<SavingsPot, 'id'> = {
  name: '', targetAmount: 0, currentAmount: 0, monthlyContribution: 0, color: '#6366f1', icon: '💰',
};

export default function SavingsPage() {
  const { data, updateData, isLoaded } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsPot | null>(null);
  const [form, setForm] = useState<Omit<SavingsPot, 'id'>>(emptyPot);
  const sym = data.settings.currencySymbol;

  const totalSavings = data.savingsPots.reduce((s, p) => s + p.currentAmount, 0);
  const totalTarget = data.savingsPots.reduce((s, p) => s + p.targetAmount, 0);

  const openAdd = () => { setEditing(null); setForm(emptyPot); setIsOpen(true); };
  const openEdit = (pot: SavingsPot) => { setEditing(pot); setForm({ name: pot.name, targetAmount: pot.targetAmount, currentAmount: pot.currentAmount, monthlyContribution: pot.monthlyContribution, color: pot.color, icon: pot.icon ?? '💰' }); setIsOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Please enter a pot name');
    if (form.targetAmount <= 0) return toast.error('Target amount must be greater than 0');

    if (editing) {
      const updated = data.savingsPots.map(p => p.id === editing.id ? { ...editing, ...form } : p);
      updateData({ ...data, savingsPots: updated });
      toast.success('Savings pot updated!');
    } else {
      const newPot: SavingsPot = { id: generateId(), ...form };
      updateData({ ...data, savingsPots: [...data.savingsPots, newPot] });
      toast.success('Savings pot created!');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this savings pot?')) return;
    updateData({ ...data, savingsPots: data.savingsPots.filter(p => p.id !== id) });
    toast.success('Pot deleted');
  };

  if (!isLoaded) return <div className="p-6 animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-zinc-100 rounded-2xl" />)}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Savings Pots</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {formatCurrency(totalSavings, sym)} saved of {formatCurrency(totalTarget, sym)} total target
          </p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Pot</Button>
      </div>

      {/* Overall Progress */}
      {data.savingsPots.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardTitle>Overall Progress</CardTitle>
            <span className="text-sm font-semibold text-indigo-600">{((totalSavings / totalTarget) * 100).toFixed(1)}%</span>
          </div>
          <ProgressBar value={totalSavings} max={totalTarget} color="#6366f1" size="lg" />
        </Card>
      )}

      {/* Pots Grid */}
      {data.savingsPots.length === 0 ? (
        <EmptyState
          icon={<PiggyBank size={32} />}
          title="No savings pots yet"
          description="Create your first savings pot to start tracking your goals"
          action={<Button onClick={openAdd}><Plus size={16} /> Create your first pot</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.savingsPots.map(pot => {
            const percent = Math.min(100, (pot.currentAmount / pot.targetAmount) * 100);
            const months = getMonthsUntilGoal(pot.currentAmount, pot.targetAmount, pot.monthlyContribution);
            return (
              <Card key={pot.id} className="hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pot.icon ?? '💰'}</span>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{pot.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatCurrency(pot.monthlyContribution, sym)}/mo</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(pot)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(pot.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(pot.currentAmount, sym)}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">{formatCurrency(pot.targetAmount, sym)}</span>
                  </div>
                  <ProgressBar value={pot.currentAmount} max={pot.targetAmount} color={pot.color} size="md" />
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{percent.toFixed(1)}% complete</span>
                    {months > 0 && <span className="flex items-center gap-1"><Target size={10} /> {months}mo to go</span>}
                    {percent >= 100 && <span className="text-emerald-600 font-medium">✓ Goal reached!</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Savings Pot' : 'New Savings Pot'}>
        <div className="space-y-4">
          <Input label="Pot Name" placeholder="e.g. Holiday Fund" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

          <div className="grid grid-cols-2 gap-3">
            <Input label={`Target Amount (${sym})`} type="number" placeholder="5000" value={form.targetAmount || ''} onChange={e => setForm({ ...form, targetAmount: parseFloat(e.target.value) || 0 })} />
            <Input label={`Current Amount (${sym})`} type="number" placeholder="0" value={form.currentAmount || ''} onChange={e => setForm({ ...form, currentAmount: parseFloat(e.target.value) || 0 })} />
          </div>

          <Input label={`Monthly Contribution (${sym})`} type="number" placeholder="200" value={form.monthlyContribution || ''} onChange={e => setForm({ ...form, monthlyContribution: parseFloat(e.target.value) || 0 })} />

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {POT_ICONS.map(icon => (
                <button key={icon} onClick={() => setForm({ ...form, icon })} className={`text-2xl p-1.5 rounded-xl transition-all ${form.icon === icon ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>{icon}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Color</label>
            <div className="flex gap-2">
              {POT_COLORS.map(color => (
                <button key={color} onClick={() => setForm({ ...form, color })} className={`w-8 h-8 rounded-full transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110' : ''}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editing ? 'Save Changes' : 'Create Pot'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
