export type Currency = 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD';

export interface Settings {
  currency: Currency;
  currencySymbol: string;
  darkMode: boolean;
  demoMode: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  type: 'income' | 'expense';
}

export type TransactionCategory =
  | 'salary' | 'freelance' | 'investment_income' | 'other_income'
  | 'bills' | 'food' | 'transport' | 'fun' | 'subscriptions' | 'investing' | 'savings' | 'debt' | 'other_expense';

export interface SavingsPot {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  color: string;
  icon?: string;
}

export interface Investment {
  id: string;
  name: string;
  ticker: string;
  type: 'ETF' | 'Stock' | 'Crypto' | 'Bond' | 'Other';
  amountInvested: number;
  currentValue: number;
  purchaseDate: string;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  dueDate: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: string;
  category: string;
  note?: string;
  status: 'active' | 'cancelled' | 'paused';
}

export interface NetWorthSnapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface AppData {
  settings: Settings;
  transactions: Transaction[];
  savingsPots: SavingsPot[];
  investments: Investment[];
  debts: Debt[];
  subscriptions: Subscription[];
  netWorthHistory: NetWorthSnapshot[];
  emergencyFundGoal: number;
}
