'use client';
import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { BudgetBarChart } from '@/components/charts/BudgetBarChart';
import { ExpensePieChart } from '@/components/charts/ExpensePieChart';
import { formatCurrency, generateId } from '@/lib/utils';
import { Transaction, TransactionCategory } from '@/types';
import { Plus, Receipt, Pencil, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/csvUtils';

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment_income', label: 'Investment Income' },
  { value: 'other_income', label: 'Other Income' },
  { value: 'bills', label: 'Bills' },
  { value: 'food', label: 'Food & Groceries' },
  { value: 'transport', label: 'Transport' },
  { value: 'fun', label: 'Entertainment' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'investing', label: 'Investing' },
  { value: 'savings', label: 'Savings' },
  { value: 'debt', label: 'Debt Payments' },
  { value: 'other_expense', label: 'Other Expense' },
];

const INCOME_CATS = ['salary', 'freelance', 'investment_income', 'other_income'];

const emptyForm = { date: format(new Date(), 'yyyy-MM-dd'), description: '', amount: '', category: 'other_expense' as TransactionCategory, type: 'expense' as 'income' | 'expense' };

export default function BudgetPage() {
  const { data, updateData, isLoaded } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterMonth, setFilterMonth] = useState('all');
  const sym = data.settings.currencySymbol;

  const months = useMemo(() => {
    const set = new Set(data.transactions.map(t => t.date.slice(0, 7)));
    return ['all', ...Array.from(set).sort().reverse()];
  }, [data.transactions]);

  const filtered = useMemo(() => {
    const txns = filterMonth === 'all' ? data.transactions : data.transactions.filter(t => t.date.startsWith(filterMonth));
    return [...txns].sort((a, b) => b.date.localeCompare(a.date));
  }, [data.transactions, filterMonth]);

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setIsOpen(true); };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({ date: t.date, description: t.description, amount: String(t.amount), category: t.category, type: t.type });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.description.trim()) return toast.error('Enter a description');
    const amount = parseFloat(String(form.amount));
    if (isNaN(amount) || amount <= 0) return toast.error('Enter a valid amount');

    const txn: Transaction = { id: editing?.id ?? generateId(), date: form.date, description: form.description, amount, category: form.category, type: form.type };

    if (editing) {
      updateData({ ...data, transactions: data.transactions.map(t => t.id === editing.id ? txn : t) });
      toast.success('Transaction updated!');
    } else {
      updateData({ ...data, transactions: [...data.transactions, txn] });
      toast.success('Transaction added!');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    updateData({ ...data, transactions: data.transactions.filter(t => t.id !== id) });
    toast.success('Transaction deleted');
  };

  if (!isLoaded) return <div className="p-6 animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 rounded-2xl" />)}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Budget & Transactions</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{filtered.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {months.map(m => <option key={m} value={m}>{m === 'all' ? 'All Time' : format(new Date(m + '-01'), 'MMMM yyyy')}</option>)}
          </select>
          <Button variant="secondary" onClick={() => exportToCSV(filtered, 'transactions.csv')}><Download size={16} /> Export</Button>
          <Button onClick={openAdd}><Plus size={16} /> Add</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Income</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(income, sym)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Expenses</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(expenses, sym)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Balance</p>
          <p className={`text-xl font-bold ${income - expenses >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>{formatCurrency(income - expenses, sym)}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Monthly Breakdown</CardTitle></CardHeader>
          <CardContent><BudgetBarChart transactions={data.transactions} currencySymbol={sym} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expense Categories</CardTitle></CardHeader>
          <CardContent><ExpensePieChart transactions={filtered} currencySymbol={sym} /></CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState icon={<Receipt size={32} />} title="No transactions" description="Add your first transaction to start tracking" action={<Button onClick={openAdd}><Plus size={16} /> Add Transaction</Button>} />
          ) : (
            <div className="space-y-1">
              {filtered.map(t => (
                <div key={t.id} className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{t.description}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{format(new Date(t.date), 'dd MMM yyyy')}</p>
                    </div>
                    <Badge variant={t.type === 'income' ? 'success' : 'default'} className="hidden sm:inline-flex shrink-0">
                      {t.category.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, sym)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Transaction' : 'Add Transaction'}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setForm({ ...form, type: 'income', category: 'salary' })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>Income</button>
            <button onClick={() => setForm({ ...form, type: 'expense', category: 'other_expense' })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === 'expense' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>Expense</button>
          </div>
          <Input label="Description" placeholder="e.g. Monthly Salary" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Amount (${sym})`} type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <Select
            label="Category"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value as TransactionCategory })}
            options={CATEGORIES.filter(c => form.type === 'income' ? INCOME_CATS.includes(c.value) : !INCOME_CATS.includes(c.value))}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Transaction'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
