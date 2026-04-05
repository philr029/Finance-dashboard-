'use client';
import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { InsightCard } from '@/components/ui/InsightCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { Transaction, BUDGET_CATEGORIES } from '@/types';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import { getMonthlyIncome, getMonthlyExpenses, getMonthlySurplus, getSavingsRate, getCategoryBreakdown } from '@/utils/calculations';
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown, Percent, ArrowUpRight, ArrowDownRight, Lightbulb } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORY_COLORS: Record<string, string> = {
  'Bills': '#3b82f6', 'Rent / Housing': '#8b5cf6', 'Food': '#10b981',
  'Transport': '#f59e0b', 'Shopping': '#ec4899', 'Entertainment': '#06b6d4',
  'Subscriptions': '#f97316', 'Investing': '#6366f1', 'Other': '#9ca3af',
};

interface FormState {
  description: string; amount: string; type: 'income' | 'expense'; category: string; date: string;
}
const emptyForm = (): FormState => ({
  description: '', amount: '', type: 'expense', category: 'Other', date: format(new Date(), 'yyyy-MM-dd'),
});

export default function BudgetPage() {
  const { data, addTransaction, updateTransaction, deleteTransaction } = useAppData();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(now, 'yyyy-MM'));
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const sym = data?.settings.currencySymbol ?? '£';

  // Month options: last 12 months
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, i);
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') };
  }), []);

  const monthTransactions = useMemo(() =>
    (data?.transactions ?? []).filter(t => t.month === selectedMonth).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data, selectedMonth]
  );

  const income = useMemo(() => data ? getMonthlyIncome(data.transactions, selectedMonth) : 0, [data, selectedMonth]);
  const expenses = useMemo(() => data ? getMonthlyExpenses(data.transactions, selectedMonth) : 0, [data, selectedMonth]);
  const surplus = getMonthlySurplus(data?.transactions ?? [], selectedMonth);
  const savingsRate = getSavingsRate(data?.transactions ?? [], selectedMonth);

  const catBreakdown = useMemo(() => data ? getCategoryBreakdown(data.transactions, selectedMonth) : {}, [data, selectedMonth]);
  const donutData = useMemo(() =>
    Object.entries(catBreakdown).filter(([, v]) => v > 0)
      .map(([cat, val]) => ({ name: cat, value: Math.round(val * 100) / 100, color: CATEGORY_COLORS[cat] ?? '#9ca3af' }))
      .sort((a, b) => b.value - a.value),
    [catBreakdown]
  );

  // Monthly trend (last 5 months)
  const barData = useMemo(() => Array.from({ length: 5 }, (_, i) => {
    const m = format(subMonths(now, 4 - i), 'yyyy-MM');
    return {
      name: format(subMonths(now, 4 - i), 'MMM'),
      income: data ? getMonthlyIncome(data.transactions, m) : 0,
      expenses: data ? getMonthlyExpenses(data.transactions, m) : 0,
    };
  }), [data]);

  // Month-over-month comparison
  const prevMonth = format(subMonths(new Date(selectedMonth + '-01'), 1), 'yyyy-MM');
  const prevExpenses = useMemo(() => data ? getMonthlyExpenses(data.transactions, prevMonth) : 0, [data, prevMonth]);
  const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
  const highestCat = useMemo(() => Object.entries(catBreakdown).sort(([, a], [, b]) => b - a)[0], [catBreakdown]);

  if (!data) return <LoadingSpinner />;

  const validate = (f: FormState) => {
    const e: Partial<FormState> = {};
    if (!f.description.trim()) e.description = 'Required';
    if (!f.amount || isNaN(Number(f.amount)) || Number(f.amount) <= 0) e.amount = 'Enter valid amount';
    return e;
  };

  const openAdd = () => { setEditTx(null); setForm(emptyForm()); setErrors({}); setModalOpen(true); };
  const openEdit = (tx: Transaction) => {
    setEditTx(tx);
    setForm({ description: tx.description, amount: String(tx.amount), type: tx.type, category: tx.category, date: tx.date });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const month = form.date.slice(0, 7);
    const tx: Transaction = {
      id: editTx?.id ?? `tx-${Date.now()}`,
      description: form.description.trim(),
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      month,
    };
    if (editTx) { updateTransaction(tx); toast.success('Entry updated'); }
    else { addTransaction(tx); toast.success('Entry added'); }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this entry?')) { deleteTransaction(id); toast.success('Entry deleted'); }
  };

  return (
    <div>
      <Header title="Budget" subtitle="Track your income and expenses" demoMode={data.settings.demoMode} />
      <div className="p-6 space-y-6">
        {/* Month selector + add */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            containerClassName="w-full sm:w-64"
          >
            {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" />Add Entry</Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Income" value={formatCurrency(income, sym)} icon={<ArrowUpRight className="w-5 h-5" />} color="green" />
          <StatCard
            label="Expenses"
            value={formatCurrency(expenses, sym)}
            sub={prevExpenses > 0 ? `${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(0)}% vs last month` : undefined}
            icon={<ArrowDownRight className="w-5 h-5" />}
            color="red"
          />
          <StatCard label="Surplus" value={formatCurrency(surplus, sym)} icon={surplus >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />} color={surplus >= 0 ? 'blue' : 'red'} />
          <StatCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} icon={<Percent className="w-5 h-5" />} color={savingsRate >= 20 ? 'green' : savingsRate >= 10 ? 'amber' : 'purple'} />
        </div>

        {/* Spending insight */}
        {expenses > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expenseChange > 15 && (
              <InsightCard
                icon={<TrendingUp className="w-4 h-4" />}
                title={`Spending up ${expenseChange.toFixed(0)}% vs last month`}
                description="Review your highest categories to identify where costs increased."
                variant="warning"
              />
            )}
            {expenseChange < -10 && (
              <InsightCard
                icon={<TrendingDown className="w-4 h-4" />}
                title={`Spending down ${Math.abs(expenseChange).toFixed(0)}% vs last month`}
                description="Great work keeping costs under control this month."
                variant="success"
              />
            )}
            {highestCat && (
              <InsightCard
                icon={<Lightbulb className="w-4 h-4" />}
                title={`${highestCat[0]} is your largest category`}
                description={`${formatCurrency(highestCat[1], sym)} spent — ${((highestCat[1] / expenses) * 100).toFixed(0)}% of total expenses this month.`}
                variant="info"
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category breakdown */}
          <Card>
            <CardHeader title="Category Breakdown" subtitle="Expenses by category" />
            <CardContent>
              {donutData.length === 0 ? (
                <EmptyState icon={<DollarSign className="w-8 h-8" />} title="No expenses" description="Add expense entries to see the breakdown" />
              ) : (
                <>
                  <DonutChart data={donutData} currencySymbol={sym} height={240} />
                  <div className="mt-2 space-y-1.5">
                    {donutData.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(d.value, sym)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Monthly trend */}
          <Card>
            <CardHeader title="Monthly Trend" subtitle="Last 5 months" />
            <CardContent>
              <BarChartComp data={barData} currencySymbol={sym} height={240} />
            </CardContent>
          </Card>
        </div>

        {/* Transactions list */}
        <Card>
          <CardHeader title="Transactions" subtitle={`${monthTransactions.length} entries`} />
          <CardContent>
            {monthTransactions.length === 0 ? (
              <EmptyState
                icon={<DollarSign className="w-8 h-8" />}
                title="No entries yet"
                description="Add income or expense entries for this month"
                action={<Button onClick={openAdd}><Plus className="w-4 h-4" />Add Entry</Button>}
              />
            ) : (
              <div className="space-y-2">
                {monthTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{formatShortDate(tx.date)}</span>
                          <Badge variant="default" size="sm">{tx.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, sym)}
                      </span>
                      <div className="hidden group-hover:flex gap-1">
                        <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTx ? 'Edit Entry' : 'Add Budget Entry'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Description" placeholder="e.g. Rent, Salary, Tesco" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} error={errors.description} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'income' | 'expense' }))}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
            <Input label="Amount" type="number" step="0.01" min="0.01" prefix={sym} placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} error={errors.amount} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>{editTx ? 'Save Changes' : 'Add Entry'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
