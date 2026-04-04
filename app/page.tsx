'use client';
import { useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { ExpensePieChart } from '@/components/charts/ExpensePieChart';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data, isLoaded } = useAppData();
  const sym = data.settings.currencySymbol;

  const stats = useMemo(() => {
    const totalSavings = data.savingsPots.reduce((s, p) => s + p.currentAmount, 0);
    const totalInvestments = data.investments.reduce((s, i) => s + i.currentValue, 0);
    const totalDebt = data.debts.reduce((s, d) => s + d.balance, 0);
    const emergencyFund = data.savingsPots.find(p => p.name.toLowerCase().includes('emergency'))?.currentAmount ?? 0;

    const currentMonth = format(new Date(), 'yyyy-MM');
    const monthlyTransactions = data.transactions.filter(t => t.date.startsWith(currentMonth));
    const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const latestNetWorth = data.netWorthHistory.at(-1);
    const prevNetWorth = data.netWorthHistory.at(-2);
    const netWorthChange = latestNetWorth && prevNetWorth ? latestNetWorth.netWorth - prevNetWorth.netWorth : 0;

    return {
      totalSavings, totalInvestments, totalDebt, emergencyFund,
      monthlyIncome, monthlyExpenses, savingsRate,
      netWorth: latestNetWorth?.netWorth ?? 0, netWorthChange,
    };
  }, [data]);

  if (!isLoaded) return <LoadingSkeleton />;

  const recentTransactions = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Worth"
          value={formatCurrency(stats.netWorth, sym)}
          change={stats.netWorthChange}
          icon={<BarChart3 size={20} />}
          color="indigo"
          sym={sym}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(stats.totalSavings, sym)}
          icon={<PiggyBank size={20} />}
          color="emerald"
          sym={sym}
        />
        <StatCard
          title="Investments"
          value={formatCurrency(stats.totalInvestments, sym)}
          icon={<TrendingUp size={20} />}
          color="purple"
          sym={sym}
        />
        <StatCard
          title="Total Debt"
          value={formatCurrency(stats.totalDebt, sym)}
          icon={<CreditCard size={20} />}
          color="red"
          sym={sym}
          isDebt
        />
      </div>

      {/* Monthly Summary + Emergency Fund */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Income</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(stats.monthlyIncome, sym)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Expenses</p>
                <p className="text-xl font-bold text-red-500">{formatCurrency(stats.monthlyExpenses, sym)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Leftover</p>
                <p className={`text-xl font-bold ${stats.monthlyIncome - stats.monthlyExpenses >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                  {formatCurrency(stats.monthlyIncome - stats.monthlyExpenses, sym)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Savings Rate</span>
                <Badge variant={stats.savingsRate >= 20 ? 'success' : stats.savingsRate >= 10 ? 'warning' : 'danger'}>
                  {formatPercent(stats.savingsRate)}
                </Badge>
              </div>
              <ProgressBar value={stats.savingsRate} max={100} color="#6366f1" size="md" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(stats.emergencyFund, sym)}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">of {formatCurrency(data.emergencyFundGoal, sym)} goal</p>
              </div>
              <ProgressBar value={stats.emergencyFund} max={data.emergencyFundGoal} color="#10b981" size="lg" />
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{formatPercent((stats.emergencyFund / data.emergencyFundGoal) * 100)} saved</span>
                <span>{formatCurrency(Math.max(0, data.emergencyFundGoal - stats.emergencyFund), sym)} to go</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Net Worth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <NetWorthChart data={data.netWorthHistory} currencySymbol={sym} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensePieChart transactions={data.transactions} currencySymbol={sym} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <a href="/budget" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={14} className="text-emerald-600" /> : <ArrowDownRight size={14} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.description}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{format(new Date(t.date), 'MMM d, yyyy')} · {t.category.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, sym)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Savings Pots Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.savingsPots.map(pot => (
          <Card key={pot.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{pot.icon ?? '💰'}</span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{pot.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatCurrency(pot.currentAmount, sym)} / {formatCurrency(pot.targetAmount, sym)}</p>
              </div>
            </div>
            <ProgressBar value={pot.currentAmount} max={pot.targetAmount} color={pot.color} size="sm" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, color, sym, isDebt }: {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'purple' | 'red';
  sym: string;
  isDebt?: boolean;
}) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600',
    purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600',
    red: 'bg-red-50 dark:bg-red-950/50 text-red-500',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
          {change !== undefined && change !== 0 && (
            <div className={`flex items-center gap-0.5 mt-1 text-xs font-medium ${change > 0 ? (isDebt ? 'text-red-500' : 'text-emerald-600') : (isDebt ? 'text-emerald-600' : 'text-red-500')}`}>
              {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {formatCurrency(Math.abs(change), sym)} this month
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />)}
      </div>
    </div>
  );
}
