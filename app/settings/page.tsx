'use client';
import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { exportToCSV } from '@/lib/csvUtils';
import { Settings, Moon, Sun, RefreshCw, Download, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Currency } from '@/types';

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'GBP', label: '🇬🇧 British Pound (GBP)', symbol: '£' },
  { value: 'USD', label: '🇺🇸 US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)', symbol: '€' },
  { value: 'CAD', label: '🇨🇦 Canadian Dollar (CAD)', symbol: 'CA$' },
  { value: 'AUD', label: '🇦🇺 Australian Dollar (AUD)', symbol: 'A$' },
];

export default function SettingsPage() {
  const { data, updateData, reset, isLoaded } = useAppData();
  const [emergencyGoal, setEmergencyGoal] = useState(String(data.emergencyFundGoal));
  const sym = data.settings.currencySymbol;

  const handleCurrencyChange = (currency: Currency) => {
    const found = CURRENCIES.find(c => c.value === currency);
    if (!found) return;
    updateData({ ...data, settings: { ...data.settings, currency, currencySymbol: found.symbol } });
    toast.success(`Currency changed to ${found.label}`);
  };

  const handleDarkMode = (dark: boolean) => {
    updateData({ ...data, settings: { ...data.settings, darkMode: dark } });
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success(`${dark ? 'Dark' : 'Light'} mode enabled`);
  };

  const handleEmergencyGoal = () => {
    const val = parseFloat(emergencyGoal);
    if (isNaN(val) || val <= 0) return toast.error('Enter a valid amount');
    updateData({ ...data, emergencyFundGoal: val });
    toast.success('Emergency fund goal updated!');
  };

  const handleReset = () => {
    if (!confirm('This will reset ALL your data to the demo data. Are you sure?')) return;
    reset();
    toast.success('Data reset to demo data');
  };

  const handleExport = () => {
    exportToCSV(data.transactions, `vaultflow-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Transactions exported!');
  };

  if (!isLoaded) return <div className="p-6 animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 rounded-2xl" />)}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your preferences</p>
      </div>

      {/* Currency */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-indigo-600" />
            <CardTitle>Currency</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            label="Display Currency"
            value={data.settings.currency}
            onChange={e => handleCurrencyChange(e.target.value as Currency)}
            options={CURRENCIES.map(c => ({ value: c.value, label: c.label }))}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Current symbol: <strong>{sym}</strong></p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-indigo-600" />
            <CardTitle>Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">Theme</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleDarkMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${!data.settings.darkMode ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
            >
              <Sun size={16} /> Light
            </button>
            <button
              onClick={() => handleDarkMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${data.settings.darkMode ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Fund Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Fund Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <Input
              label={`Target Amount (${sym})`}
              type="number"
              value={emergencyGoal}
              onChange={e => setEmergencyGoal(e.target.value)}
            />
            <Button onClick={handleEmergencyGoal} className="shrink-0">Save</Button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Current goal: {formatCurrency(data.emergencyFundGoal, sym)}</p>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Export Transactions</p>
              <p className="text-xs text-zinc-500">Download all transactions as CSV</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download size={14} /> Export CSV
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Reset All Data</p>
              <p className="text-xs text-zinc-500">Restore to demo data (cannot be undone)</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleReset}>
              <RefreshCw size={14} /> Reset
            </Button>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              💾 All data is stored locally in your browser. Nothing is sent to any server.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader><CardTitle>Data Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Transactions', value: data.transactions.length },
              { label: 'Savings Pots', value: data.savingsPots.length },
              { label: 'Investments', value: data.investments.length },
              { label: 'Debts', value: data.debts.length },
              { label: 'Subscriptions', value: data.subscriptions.length },
              { label: 'Net Worth Snapshots', value: data.netWorthHistory.length },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
                <p className="text-2xl font-bold text-indigo-600">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
