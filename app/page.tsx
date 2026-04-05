'use client';
import { useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { InsightCard } from '@/components/ui/InsightCard';
import { HealthScore, computeHealthScore } from '@/components/ui/HealthScore';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatShortDate, formatPercentage } from '@/utils/formatters';
import {
  getMonthlyIncome, getMonthlyExpenses, getMonthlySurplus, getSavingsRate,
  getTotalPortfolioValue, getTotalDebt, getTotalSaved, getCategoryBreakdown,
  getTotalMonthlySubs, getDaysUntil
} from '@/utils/calculations';
import {
  Wallet, PiggyBank, TrendingUp, CreditCard, BarChart3,
  ArrowUpRight, ArrowDownRight, Shield, Target, Zap,
  TrendingDown, Bell, Lightbulb, AlertTriangle, CheckCircle2
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
  const lastMonth = format(subMonths(now, 1), 'yyyy-MM');

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
    const lastMonthExpenses = getMonthlyExpenses(data.transactions, lastMonth);
    const lastMonthIncome = getMonthlyIncome(data.transactions, lastMonth);

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

    // Subscriptions due this week
    const subsThisWeek = data.subscriptions.filter(s => s.renewalDate && getDaysUntil(s.renewalDate) <= 7 && getDaysUntil(s.renewalDate) >= 0);

    // Highest expense category
    const highestCat = Object.entries(catBreakdown).sort(([, a], [, b]) => b - a)[0];

    // Month-over-month spending change
    const spendingChange = lastMonthExpenses > 0 ? ((expenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    // Emergency fund months covered (based on avg monthly expenses)
    const avgMonthlyExpenses = lastMonthExpenses > 0 ? (expenses + lastMonthExpenses) / 2 : expenses;
    const emergencyMonths = emergencyPot && avgMonthlyExpenses > 0
      ? emergencyPot.currentAmount / avgMonthlyExpenses
      : 0;

    // Savings goal overall progress
    const totalSavingsTarget = data.savingsPots.reduce((s, p) => s + p.targetAmount, 0);
    const overallGoalPct = totalSavingsTarget > 0 ? (totalSaved / totalSavingsTarget) * 100 : 0;

    // Has high-interest debt
    const hasHighInterestDebt = data.debts.some(d => d.apr > 20);

    // Health score
    const { score: healthScore, breakdown: healthBreakdown } = computeHealthScore({
      savingsRate,
      emergencyMonths,
      hasInvestments: data.investments.length > 0,
      hasHighInterestDebt,
      debtToIncomeRatio: income > 0 ? totalDebt / income : 0,
      savingsGoalProgress: overallGoalPct,
    });

    // Monthly sub cost
    const monthlySubsCost = getTotalMonthlySubs(data.subscriptions);

    return {
      income, expenses, surplus, savingsRate, totalSaved, portfolioValue, totalDebt, netWorth,
      emergencyPot, barData, donutData, nextSub, highestCat, spendingChange, emergencyMonths,
      overallGoalPct, healthScore, healthBreakdown, monthlySubsCost, subsThisWeek,
      lastMonthIncome, lastMonthExpenses,
    };
  }, [data, currentMonth, lastMonth]);

  if (!data || !stats) return <LoadingSpinner />;

  const recentTransactions = [...data.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Smart insights
  const insights = buildInsights(stats, sym);

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`${getGreeting()} — ${format(now, 'EEEE, d MMMM yyyy')}`}
        demoMode={data.settings.demoMode}
      />
      <div className="p-6 space-y-6">

        {/* Hero stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Net Worth"
            value={formatCurrency(stats.netWorth, sym)}
            sub={stats.netWorth >= 0 ? 'Total assets minus liabilities' : 'Net liabilities'}
            icon={<BarChart3 className="w-5 h-5" />}
            color="blue"
            trend={stats.netWorth >= 0 ? 'up' : 'down'}
          />
          <StatCard
            label="Total Savings"
            value={formatCurrency(stats.totalSaved, sym)}
            sub={`${Math.round(stats.overallGoalPct)}% of goals reached`}
            icon={<PiggyBank className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Investments"
            value={formatCurrency(stats.portfolioValue, sym)}
            sub={`${data.investments.length} holding${data.investments.length !== 1 ? 's' : ''}`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            label="Total Debt"
            value={formatCurrency(stats.totalDebt, sym)}
            sub={`${data.debts.length} account${data.debts.length !== 1 ? 's' : ''}`}
            icon={<CreditCard className="w-5 h-5" />}
            color={stats.totalDebt > 0 ? 'red' : 'green'}
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
            sub={stats.spendingChange !== 0 ? `${stats.spendingChange > 0 ? '+' : ''}${stats.spendingChange.toFixed(0)}% vs last month` : undefined}
            icon={<ArrowDownRight className="w-5 h-5" />}
            color="red"
            trend={stats.spendingChange > 0 ? 'down' : stats.spendingChange < 0 ? 'up' : 'neutral'}
            trendValue={stats.spendingChange !== 0 ? `${Math.abs(stats.spendingChange).toFixed(0)}% vs last month` : undefined}
          />
          <StatCard
            label="Surplus"
            value={formatCurrency(stats.surplus, sym)}
            sub="Income minus expenses"
            icon={<Wallet className="w-5 h-5" />}
            color={stats.surplus >= 0 ? 'blue' : 'red'}
            trend={stats.surplus >= 0 ? 'up' : 'down'}
          />
          <StatCard
            label="Savings Rate"
            value={formatPercentage(stats.savingsRate)}
            sub={stats.savingsRate >= 20 ? '🎯 Above 20% target' : stats.savingsRate >= 10 ? 'Aim for 20%+' : 'Build this up'}
            icon={<Zap className="w-5 h-5" />}
            color={stats.savingsRate >= 20 ? 'green' : stats.savingsRate >= 10 ? 'amber' : 'red'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly income vs expenses chart */}
          <Card className="lg:col-span-2">
            <CardHeader title="Cash Flow" subtitle="Income vs expenses — last 5 months" />
            <CardContent>
              <BarChartComp data={stats.barData} currencySymbol={sym} height={220} />
            </CardContent>
          </Card>

          {/* Financial Health Score */}
          <Card>
            <CardHeader title="Financial Health" subtitle="Based on your activity" />
            <CardContent>
              <HealthScore
                score={stats.healthScore}
                breakdown={stats.healthBreakdown}
              />
            </CardContent>
          </Card>
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Smart Insights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {insights.map((insight, i) => (
                <InsightCard key={i} {...insight} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category breakdown donut */}
          <Card>
            <CardHeader title="Spending Breakdown" subtitle={`${format(now, 'MMMM yyyy')}`} />
            <CardContent>
              {stats.donutData.length > 0 ? (
                <DonutChart data={stats.donutData} currencySymbol={sym} height={260} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <BarChart3 className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No expenses this month</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add transactions to see your spending breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent transactions */}
          <Card className="lg:col-span-2">
            <CardHeader title="Recent Activity" subtitle="Latest transactions" />
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <Wallet className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No transactions yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Head to Budget to log your first entry</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                          {tx.type === 'income'
                            ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                            : <ArrowDownRight className="w-4 h-4 text-red-500" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{formatShortDate(tx.date)} · {tx.category}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ml-3 ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
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
        {data.savingsPots.length > 0 && (
          <Card>
            <CardHeader
              title="Savings Goals"
              subtitle={`${formatCurrency(stats.totalSaved, sym)} saved · ${Math.round(stats.overallGoalPct)}% of total target`}
            />
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.savingsPots.map(pot => {
                  const pct = Math.min(100, pot.targetAmount > 0 ? (pot.currentAmount / pot.targetAmount) * 100 : 0);
                  const remaining = pot.targetAmount - pot.currentAmount;
                  return (
                    <div key={pot.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pot.color }} />
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{pot.name}</p>
                        </div>
                        <Badge variant={pct >= 100 ? 'success' : pct >= 50 ? 'info' : 'default'}>
                          {Math.round(pct)}%
                        </Badge>
                      </div>
                      <ProgressBar value={pot.currentAmount} max={pot.targetAmount} color={pot.color} height="md" />
                      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="tabular-nums">{formatCurrency(pot.currentAmount, sym)}</span>
                        <span className="tabular-nums">{remaining > 0 ? `${formatCurrency(remaining, sym)} to go` : 'Complete!'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick overview row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Emergency fund */}
          {stats.emergencyPot && (
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emergency Fund</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {stats.emergencyMonths >= 3
                        ? `${stats.emergencyMonths.toFixed(1)} months covered`
                        : `${stats.emergencyMonths.toFixed(1)} / 3 months target`}
                    </p>
                  </div>
                </div>
                <ProgressBar
                  value={stats.emergencyPot.currentAmount}
                  max={stats.emergencyPot.targetAmount}
                  color="#10b981"
                  height="sm"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 tabular-nums">
                  {formatCurrency(stats.emergencyPot.currentAmount, sym)} / {formatCurrency(stats.emergencyPot.targetAmount, sym)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Subscriptions summary */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subscriptions</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                    {formatCurrency(stats.monthlySubsCost, sym)}/month
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {data.subscriptions.length} active · {formatCurrency(stats.monthlySubsCost * 12, sym)}/year
              </p>
              {stats.subsThisWeek.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <Bell className="w-3 h-3" />
                  {stats.subsThisWeek.length} renewal{stats.subsThisWeek.length !== 1 ? 's' : ''} due this week
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next subscription */}
          {stats.nextSub && (
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Next Renewal</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats.nextSub.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatShortDate(stats.nextSub.renewalDate)}</span>
                  <span className="tabular-nums font-medium text-gray-900 dark:text-white">
                    {formatCurrency(stats.nextSub.cost, sym)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface InsightDef {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'info' | 'warning' | 'success' | 'tip';
}

function buildInsights(
  stats: {
    spendingChange: number;
    expenses: number;
    income: number;
    savingsRate: number;
    subsThisWeek: { name: string }[];
    monthlySubsCost: number;
    highestCat?: [string, number];
    emergencyMonths: number;
    healthScore: number;
    surplus: number;
  },
  sym: string
): InsightDef[] {
  const list: InsightDef[] = [];

  if (stats.spendingChange > 15) {
    list.push({
      icon: <TrendingUp className="w-4 h-4" />,
      title: `Spending up ${stats.spendingChange.toFixed(0)}% this month`,
      description: `You've spent more than last month. Review your biggest categories to find savings.`,
      variant: 'warning',
    });
  } else if (stats.spendingChange < -10) {
    list.push({
      icon: <TrendingDown className="w-4 h-4" />,
      title: `Spending down ${Math.abs(stats.spendingChange).toFixed(0)}% this month`,
      description: `Great discipline — you're spending less than last month. Keep it up!`,
      variant: 'success',
    });
  }

  if (stats.subsThisWeek.length > 0) {
    const names = stats.subsThisWeek.slice(0, 2).map(s => s.name).join(', ');
    list.push({
      icon: <AlertTriangle className="w-4 h-4" />,
      title: `${stats.subsThisWeek.length} subscription${stats.subsThisWeek.length > 1 ? 's' : ''} renewing this week`,
      description: `${names}${stats.subsThisWeek.length > 2 ? ` and ${stats.subsThisWeek.length - 2} more` : ''} are due soon. Review before renewal.`,
      variant: 'warning',
    });
  }

  if (stats.savingsRate >= 20) {
    list.push({
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: `Savings rate: ${stats.savingsRate.toFixed(0)}% — above target`,
      description: `You're saving more than the recommended 20% of income. Excellent financial discipline.`,
      variant: 'success',
    });
  } else if (stats.savingsRate > 0 && stats.savingsRate < 10) {
    const toSave = ((stats.income * 0.15) - stats.surplus);
    list.push({
      icon: <Lightbulb className="w-4 h-4" />,
      title: `Could you save an extra ${formatCurrency(Math.max(0, toSave), sym)}/month?`,
      description: `Bringing your savings rate to 15% would significantly accelerate your financial goals.`,
      variant: 'tip',
    });
  }

  if (stats.emergencyMonths < 1 && stats.income > 0) {
    list.push({
      icon: <Shield className="w-4 h-4" />,
      title: 'Build your emergency fund first',
      description: `Your emergency fund covers less than 1 month of expenses. Aim for 3 months as a safety net.`,
      variant: 'warning',
    });
  } else if (stats.emergencyMonths >= 3 && stats.emergencyMonths < 6) {
    list.push({
      icon: <Shield className="w-4 h-4" />,
      title: `Emergency fund: ${stats.emergencyMonths.toFixed(1)} months covered`,
      description: `You have a solid buffer. Consider growing it to 6 months for extra security.`,
      variant: 'info',
    });
  }

  if (stats.highestCat && stats.expenses > 0) {
    const [cat, amount] = stats.highestCat;
    const pct = ((amount / stats.expenses) * 100).toFixed(0);
    list.push({
      icon: <BarChart3 className="w-4 h-4" />,
      title: `${cat} is your top expense — ${pct}% of spending`,
      description: `${formatCurrency(amount, sym)} this month on ${cat.toLowerCase()}. Is this in line with your budget?`,
      variant: 'info',
    });
  }

  return list.slice(0, 4);
}
