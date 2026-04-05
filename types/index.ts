export interface SavingsPot {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  monthlyContribution: number;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  month: string; // YYYY-MM
}

export interface Investment {
  id: string;
  name: string;
  ticker: string;
  category: 'stock' | 'etf' | 'crypto' | 'cash' | 'other';
  units: number;
  averageCost: number;
  currentPrice: number;
  notes: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  name: string;
  type: 'credit_card' | 'loan' | 'overdraft' | 'finance' | 'other';
  balance: number;
  apr: number;
  minimumPayment: number;
  dueDate: string;
  notes: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: string;
  category: 'entertainment' | 'productivity' | 'health' | 'utilities' | 'shopping' | 'finance' | 'other';
  status: 'keep' | 'cancel' | 'review';
  notes: string;
}

export interface NetWorthEntry {
  id: string;
  date: string; // YYYY-MM
  assets: number;
  liabilities: number;
  netWorth: number;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  theme: 'light' | 'dark' | 'system';
  demoMode: boolean;
}

export interface AppData {
  savingsPots: SavingsPot[];
  transactions: Transaction[];
  investments: Investment[];
  debts: Debt[];
  subscriptions: Subscription[];
  netWorthHistory: NetWorthEntry[];
  settings: AppSettings;
  lastUpdated: string;
}

export const BUDGET_CATEGORIES = [
  'Bills',
  'Rent / Housing',
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Subscriptions',
  'Investing',
  'Other',
] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number];

export const CURRENCY_OPTIONS = [
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc (Fr)' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona (kr)' },
  { code: 'NOK', symbol: 'kr', label: 'Norwegian Krone (kr)' },
  { code: 'DKK', symbol: 'kr', label: 'Danish Krone (kr)' },
] as const;
