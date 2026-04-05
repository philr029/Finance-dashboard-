import { Transaction, Investment, Debt, Subscription, SavingsPot } from '@/types';

export function getMonthlyIncome(transactions: Transaction[], month: string): number {
  return transactions
    .filter(t => t.month === month && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyExpenses(transactions: Transaction[], month: string): number {
  return transactions
    .filter(t => t.month === month && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlySurplus(transactions: Transaction[], month: string): number {
  return getMonthlyIncome(transactions, month) - getMonthlyExpenses(transactions, month);
}

export function getSavingsRate(transactions: Transaction[], month: string): number {
  const income = getMonthlyIncome(transactions, month);
  const surplus = getMonthlySurplus(transactions, month);
  if (income === 0) return 0;
  return (surplus / income) * 100;
}

export function getTotalPortfolioValue(investments: Investment[]): number {
  return investments.reduce((sum, inv) => sum + inv.units * inv.currentPrice, 0);
}

export function getTotalPortfolioCost(investments: Investment[]): number {
  return investments.reduce((sum, inv) => sum + inv.units * inv.averageCost, 0);
}

export function getPortfolioGainLoss(investments: Investment[]): number {
  return getTotalPortfolioValue(investments) - getTotalPortfolioCost(investments);
}

export function getTotalDebt(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.balance, 0);
}

export function getHighestInterestDebt(debts: Debt[]): Debt | null {
  if (debts.length === 0) return null;
  return debts.reduce((max, d) => d.apr > max.apr ? d : max, debts[0]);
}

export function getTotalMonthlySubs(subscriptions: Subscription[]): number {
  return subscriptions.reduce((sum, s) => {
    return sum + (s.billingCycle === 'monthly' ? s.cost : s.cost / 12);
  }, 0);
}

export function getMonthlySubsYearlyCost(subscriptions: Subscription[]): number {
  return getTotalMonthlySubs(subscriptions) * 12;
}

export function getTotalSaved(pots: SavingsPot[]): number {
  return pots.reduce((sum, p) => sum + p.currentAmount, 0);
}

export function getTotalSavingsTarget(pots: SavingsPot[]): number {
  return pots.reduce((sum, p) => sum + p.targetAmount, 0);
}

export function getMonthsToGoal(pot: SavingsPot): number | null {
  if (pot.monthlyContribution <= 0) return null;
  const remaining = pot.targetAmount - pot.currentAmount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / pot.monthlyContribution);
}

export function getCategoryBreakdown(transactions: Transaction[], month: string): Record<string, number> {
  return transactions
    .filter(t => t.month === month && t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
}

export function getNetWorth(investments: Investment[], debts: Debt[], pots: SavingsPot[], cashBalance: number = 0): number {
  const assets = getTotalPortfolioValue(investments) + getTotalSaved(pots) + cashBalance;
  const liabilities = getTotalDebt(debts);
  return assets - liabilities;
}

export function calculateCompoundInterest(principal: number, rate: number, years: number, frequency: number = 12): number {
  return principal * Math.pow(1 + rate / (100 * frequency), frequency * years);
}

export function calculateDebtPayoffMonths(balance: number, apr: number, monthlyPayment: number): number {
  if (monthlyPayment <= 0) return Infinity;
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return Math.ceil(balance / monthlyPayment);
  if (monthlyPayment <= balance * monthlyRate) return Infinity;
  return Math.ceil(-Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate));
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
