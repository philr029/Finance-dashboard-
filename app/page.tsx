'use client';
import { useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatShortDate, formatPercentage } from '@/utils/formatters';
import {
  getMonthlyIncome, getMonthlyExpenses, getMonthlySurplus, getSavingsRate,
  getTotalPortfolioValue, getTotalDebt, getTotalSaved, getCategoryBreakdown
} from '@/utils/calculations';
import {
  Wallet, PiggyBank, TrendingUp, CreditCard, BarChart3,
  ArrowUpRight, ArrowDownRight, Shield, Target, Zap
} from 'lucide-react';
import { format, subMonths } from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  'Bills': '#3b82f6',
  'Rent / Housing': '#8b5cf6',
  'Food': '#10b981',
  'Transport': '#f59e0b',
  'Shopping': '#ec4899',
  'Entertainment': '#06b6d4',
  'Subscriptions': '#f97316',
  'Investing': '#6366f1',
  'Other': '#9ca3af',
};

export default function DashboardPage() {
  const { data } = useAppData();
  const sym = data?.settings.currencySymbol ?? '£';
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');

  const stats = useMemo(() => {
    if (!data) return null;
    const income = getMonthlyIncome(data.transactions, currentMonth);
    const expenses = getMonthlyExpenses(data.transactions, currentMonth);
    const surplus = getMonthlySurplus(data.transactions, currentMonth);
    const savingsRate = getSavingsRate(data.transactions, currentMonth);
    const totalSaved = getTotalSaved(data.savingsPots);
    const portfolioValue = getTotalPortfolioValue(data.investments);
    const totalDebt = getTotalDebt(data.debts);
    const netWorth = totalSaved + portfolioValue - totalDebt;
    const emergencyPot = data.savingsPots.find(p => p.name.toLowerCase().includes('emergency'));
    const catBreakdown = getCategoryBreakdown(data.transactions, currentMonth);
    // Monthly bar data (last 5 months)
    const barData = Array.from({ length: 5 }, (_, i) => {
      const m = format(subMonths(now, 4 - i), 'yyyy-MM');
      const shortName = format(subMonths(now, 4 - i), 'MMM');
      return {
        name: shortName,
        income: getMonthlyIncome(data.transactions, m),
        expenses: getMonthlyExpenses(data.transactions, m),
      };
    });
    // Donut data
    const donutData = Object.entries(catBreakdown)
      .filter(([, v]) => v > 0)
      .map(([cat, val]) => ({ name: cat, value: Math.round(val * 100) / 100, color: CATEGORY_COLORS[cat] ?? '#9ca3af' }))
      .sort((a, b) => b.value - a.value);
    // Next sub renewal
    const nextSub = data.subscriptions
      .filter(s => s.renewalDate)
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())[0];
    // Highest expense category
    const highestCat = Object.entries(catBreakdown).sort(([, a], [, b]) => b - a)[0];
    return {
      income, expenses, surplus, savingsRate, totalSaved, portfolioValue, totalDebt, netWorth,
      emergencyPot, barData, donutData, nextSub, highestCat,
    };
  }, [data, currentMonth]);

  if (!data || !stats) return <LoadingSpinner />;

  const recentTransactions = [...data.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div>
      <Header title="Dashboard" subtitle={`Good ${getGreeting()}, welcome back to VaultFlow`} />
      <div className="p-6 space-y-6">
        {/* Hero stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Net Worth"
            value={formatCurrency(stats.netWorth, sym)}
            sub="Total assets minus debts"
            icon={<BarChart3 className="w-5 h-5" />}
            color="blue"
            trend={stats.netWorth >= 0 ? 'up' : 'down'}
          />
          <StatCard
            label="Total Savings"
            value={formatCurrency(stats.totalSaved, sym)}
            sub="Across all saving pots"
            icon={<PiggyBank className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Investments"
            value={formatCurrency(stats.portfolioValue, sym)}
            sub="Portfolio market value"
            icon={<TrendingUp className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            label="Total Debt"
            value={formatCurrency(stats.totalDebt, sym)}
            sub="Across all debts"
            icon={<CreditCard className="w-5 h-5" />}
            color="red"
          />
        </div>

        {/* Monthly overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Monthly Income"
            value={formatCurrency(stats.income, sym)}
            icon={<ArrowUpRight className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Monthly Expenses"
            value={formatCurrency(stats.expenses, sym)}
            icon={<ArrowDownRight className="w-5 h-5" />}
            color="red"
          />
          <StatCard
            label="Surplus"
            value={formatCurrency(stats.surplus, sym)}
            sub="Income - Expenses"
            icon={<Wallet className="w-5 h-5" />}
            color={stats.surplus >= 0 ? 'blue' : 'red'}
            trend={stats.surplus >= 0 ? 'up' : 'down'}
          />
          <StatCard
            label="Savings Rate"
            value={formatPercentage(stats.savingsRate)}
            sub="% of income saved"
            icon={<Zap className="w-5 h-5" />}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly income vs expenses chart */}
          <Card className="lg:col-span-2">
            <CardHeader title="Income vs Expenses" subtitle="Last 5 months" />
            <CardContent>
              <BarChartComp data={stats.barData} currencySymbol={sym} height={220} />
            </CardContent>
          </Card>

          {/* Quick insights */}
          <Card>
            <CardHeader title="Quick Insights" />
            <CardContent className="space-y-4">
              {stats.highestCat && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Top Expense</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats.highestCat[0]}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(stats.highestCat[1], sym)} this month</p>
                  </div>
                </div>
              )}
              {stats.nextSub && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Next Renewal</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats.nextSub.name}</p>
                    <p className="text-xs text-gray-500">{formatShortDate(stats.nextSub.renewalDate)} · {formatCurrency(stats.nextSub.cost, sym)}</p>
                  </div>
                </div>
              )}
              {stats.emergencyPot && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Emergency Fund</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {Math.round((stats.emergencyPot.currentAmount / stats.emergencyPot.targetAmount) * 100)}% funded
                    </p>
                    <ProgressBar
                      value={stats.emergencyPot.currentAmount}
                      max={stats.emergencyPot.targetAmount}
                      color="#10b981"
                      height="sm"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category breakdown donut */}
          <Card>
            <CardHeader title="Spending Breakdown" subtitle="This month" />
            <CardContent>
              {stats.donutData.length > 0 ? (
                <DonutChart data={stats.donutData} currencySymbol={sym} height={260} />
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No expenses this month</p>
              )}
            </CardContent>
          </Card>

          {/* Recent transactions */}
          <Card className="lg:col-span-2">
            <CardHeader title="Recent Transactions" subtitle="Latest activity" />
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                          {tx.type === 'income'
                            ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                            : <ArrowDownRight className="w-4 h-4 text-red-500" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                          <p className="text-xs text-gray-400">{formatShortDate(tx.date)} · {tx.category}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold flex-shrink-0 ml-3 ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, sym)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Savings goals */}
        <Card>
          <CardHeader title="Savings Goals" subtitle="Progress toward your targets" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.savingsPots.map(pot => {
                const pct = Math.min(100, pot.targetAmount > 0 ? (pot.currentAmount / pot.targetAmount) * 100 : 0);
                return (
                  <div key={pot.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{pot.name}</p>
                      <Badge variant={pct >= 100 ? 'success' : pct >= 50 ? 'info' : 'default'}>
                        {Math.round(pct)}%
                      </Badge>
                    </div>
                    <ProgressBar value={pot.currentAmount} max={pot.targetAmount} color={pot.color} height="md" />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{formatCurrency(pot.currentAmount, sym)}</span>
                      <span>{formatCurrency(pot.targetAmount, sym)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
