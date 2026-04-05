'use client';
import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CURRENCY_OPTIONS } from '@/types';
import { exportData, importData } from '@/lib/storage';
import { Settings, Palette, Database, Download, Upload, RotateCcw, Zap, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { data, updateSettings, resetData } = useAppData();
  const [importError, setImportError] = useState('');

  if (!data) return <LoadingSpinner />;

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opt = CURRENCY_OPTIONS.find(c => c.code === e.target.value);
    if (opt) {
      updateSettings({ currency: opt.code, currencySymbol: opt.symbol });
      toast.success(`Currency changed to ${opt.label}`);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success(`${theme.charAt(0).toUpperCase() + theme.slice(1)} mode enabled`);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        importData(json);
        toast.success('Data imported! Refresh to see changes.');
        setImportError('');
      } catch {
        setImportError('Invalid file format');
        toast.error('Import failed — invalid file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Are you sure? This will reset all data to demo seed data.')) {
      resetData();
      toast.success('Data reset to demo data');
    }
  };

  const handleDemoToggle = () => {
    updateSettings({ demoMode: !data.settings.demoMode });
    toast.success(`Demo mode ${!data.settings.demoMode ? 'enabled' : 'disabled'}`);
  };

  return (
    <div>
      <Header title="Settings" subtitle="Customise your VaultFlow experience" />
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Currency */}
        <Card>
          <CardHeader
            title="Currency"
            subtitle="Set your preferred currency"
            action={<Globe className="w-5 h-5 text-gray-400" />}
          />
          <CardContent>
            <Select
              label="Display Currency"
              value={data.settings.currency}
              onChange={handleCurrencyChange}
            >
              {CURRENCY_OPTIONS.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </Select>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader
            title="Appearance"
            subtitle="Choose your preferred theme"
            action={<Palette className="w-5 h-5 text-gray-400" />}
          />
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${data.settings.theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                  <div className="w-4 h-4 rounded bg-gray-100" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Light</p>
                <p className="text-xs text-gray-500">Clean and bright</p>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${data.settings.theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center mb-2">
                  <div className="w-4 h-4 rounded bg-gray-700" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dark</p>
                <p className="text-xs text-gray-500">Easy on the eyes</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Demo mode */}
        <Card>
          <CardHeader
            title="Demo Mode"
            subtitle="Toggle demo seed data on/off"
            action={<Zap className="w-5 h-5 text-gray-400" />}
          />
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {data.settings.demoMode ? 'Demo mode is active — using example data' : 'Demo mode is off'}
                </p>
              </div>
              <button
                onClick={handleDemoToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${data.settings.demoMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.settings.demoMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Data management */}
        <Card>
          <CardHeader
            title="Data Management"
            subtitle="Export, import, or reset your data"
            action={<Database className="w-5 h-5 text-gray-400" />}
          />
          <CardContent className="space-y-3">
            <Button onClick={handleExport} variant="secondary" fullWidth>
              <Download className="w-4 h-4" />Export Data (JSON)
            </Button>
            <label className="block">
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              <span className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white cursor-pointer transition-all">
                <Upload className="w-4 h-4" />Import Data (JSON)
              </span>
            </label>
            {importError && <p className="text-xs text-red-500">{importError}</p>}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <Button onClick={handleReset} variant="danger" fullWidth>
                <RotateCcw className="w-4 h-4" />Reset to Demo Data
              </Button>
              <p className="text-xs text-gray-400 mt-2 text-center">This will overwrite all your data with the demo seed data</p>
            </div>
          </CardContent>
        </Card>

        {/* Future integrations */}
        <Card>
          <CardHeader
            title="Integrations"
            subtitle="Coming soon — connect external data sources"
            action={<Settings className="w-5 h-5 text-gray-400" />}
          />
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Trading 212 CSV Import', desc: 'Import your portfolio from Trading 212', status: 'Soon' },
                { name: 'Open Banking / Plaid', desc: 'Connect your bank accounts automatically', status: 'Planned' },
                { name: 'Crypto Price APIs', desc: 'Live crypto prices via CoinGecko', status: 'Planned' },
                { name: 'Plum / Chip Import', desc: 'Import savings from Plum or Chip', status: 'Planned' },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
