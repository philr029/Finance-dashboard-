'use client';
import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { calculateCompoundInterest, calculateDebtPayoffMonths } from '@/utils/calculations';
import { Shield, TrendingUp, Target, CreditCard, Clock, Percent, Wallet, RefreshCcw } from 'lucide-react';

function ResultBox({ label, value, color = 'blue' }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  };
  return (
    <div className={`p-4 rounded-xl ${colors[color] ?? colors.blue}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

export default function ToolsPage() {
  const { data } = useAppData();
  const sym = data?.settings.currencySymbol ?? '£';

  // Emergency fund calculator
  const [ef, setEf] = useState({ monthly: '', months: '3' });
  const efResult = ef.monthly ? Number(ef.monthly) * Number(ef.months) : null;

  // Compound interest
  const [ci, setCi] = useState({ principal: '', rate: '', years: '', frequency: '12' });
  const ciResult = ci.principal && ci.rate && ci.years
    ? calculateCompoundInterest(Number(ci.principal), Number(ci.rate), Number(ci.years), Number(ci.frequency))
    : null;
  const ciInterest = ciResult && ci.principal ? ciResult - Number(ci.principal) : null;

  // Savings goal
  const [sg, setSg] = useState({ goal: '', current: '', monthly: '' });
  const sgResult = sg.goal && sg.monthly && Number(sg.monthly) > 0
    ? Math.ceil((Number(sg.goal) - Number(sg.current || '0')) / Number(sg.monthly))
    : null;

  // Debt payoff
  const [dp, setDp] = useState({ balance: '', apr: '', payment: '' });
  const dpResult = dp.balance && dp.apr && dp.payment
    ? calculateDebtPayoffMonths(Number(dp.balance), Number(dp.apr), Number(dp.payment))
    : null;

  // Salary calculator
  const [sal, setSal] = useState({ annual: '' });
  const salMonthly = sal.annual ? Number(sal.annual) / 12 : null;
  const salHourly = sal.annual ? Number(sal.annual) / 52 / 40 : null;

  // Percentage gain/loss
  const [pg, setPg] = useState({ buy: '', sell: '' });
  const pgResult = pg.buy && pg.sell && Number(pg.buy) > 0
    ? ((Number(pg.sell) - Number(pg.buy)) / Number(pg.buy)) * 100
    : null;

  // Budget split (50/30/20)
  const [bs, setBs] = useState({ income: '' });
  const bsNeeds = bs.income ? Number(bs.income) * 0.5 : null;
  const bsWants = bs.income ? Number(bs.income) * 0.3 : null;
  const bsSavings = bs.income ? Number(bs.income) * 0.2 : null;

  // Subscription yearly impact
  const [si, setSi] = useState({ monthly: '' });
  const siYearly = si.monthly ? Number(si.monthly) * 12 : null;
  const si5yr = si.monthly ? Number(si.monthly) * 12 * 5 : null;

  const tools = [
    {
      id: 'ef',
      icon: <Shield className="w-5 h-5" />,
      title: 'Emergency Fund',
      description: 'Calculate your recommended emergency fund size',
      color: 'blue',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monthly Expenses" type="number" min="0" step="0.01" prefix={sym} placeholder="2000" value={ef.monthly} onChange={e => setEf(f => ({ ...f, monthly: e.target.value }))} />
            <Input label="Months of Cover" type="number" min="1" max="12" placeholder="3" value={ef.months} onChange={e => setEf(f => ({ ...f, months: e.target.value }))} />
          </div>
          {efResult !== null && (
            <div className="grid grid-cols-2 gap-3">
              <ResultBox label="Recommended Fund" value={formatCurrency(efResult, sym)} color="blue" />
              <ResultBox label="Months Coverage" value={`${ef.months} months`} color="green" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'ci',
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Compound Interest',
      description: 'See how your money grows over time',
      color: 'green',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Principal" type="number" min="0" step="0.01" prefix={sym} placeholder="10000" value={ci.principal} onChange={e => setCi(f => ({ ...f, principal: e.target.value }))} />
            <Input label="Annual Rate %" type="number" min="0" step="0.1" suffix="%" placeholder="7" value={ci.rate} onChange={e => setCi(f => ({ ...f, rate: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Years" type="number" min="1" placeholder="10" value={ci.years} onChange={e => setCi(f => ({ ...f, years: e.target.value }))} />
            <Input label="Compounds/year" type="number" min="1" max="365" placeholder="12" value={ci.frequency} onChange={e => setCi(f => ({ ...f, frequency: e.target.value }))} />
          </div>
          {ciResult !== null && ciInterest !== null && (
            <div className="grid grid-cols-2 gap-3">
              <ResultBox label="Final Value" value={formatCurrency(ciResult, sym)} color="green" />
              <ResultBox label="Interest Earned" value={formatCurrency(ciInterest, sym)} color="purple" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'sg',
      icon: <Target className="w-5 h-5" />,
      title: 'Savings Goal',
      description: 'Find out how long to reach your savings goal',
      color: 'purple',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Goal Amount" type="number" min="0" step="0.01" prefix={sym} placeholder="5000" value={sg.goal} onChange={e => setSg(f => ({ ...f, goal: e.target.value }))} />
            <Input label="Current Savings" type="number" min="0" step="0.01" prefix={sym} placeholder="0" value={sg.current} onChange={e => setSg(f => ({ ...f, current: e.target.value }))} />
          </div>
          <Input label="Monthly Contribution" type="number" min="0" step="0.01" prefix={sym} placeholder="200" value={sg.monthly} onChange={e => setSg(f => ({ ...f, monthly: e.target.value }))} />
          {sgResult !== null && (
            <div className="grid grid-cols-2 gap-3">
              <ResultBox label="Months to Goal" value={sgResult <= 0 ? 'Already reached!' : `${sgResult} months`} color="purple" />
              <ResultBox label="Years to Goal" value={sgResult <= 0 ? '—' : `${(sgResult / 12).toFixed(1)} years`} color="blue" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'dp',
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Debt Payoff',
      description: 'Calculate how long to pay off a debt',
      color: 'red',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input label="Balance" type="number" min="0" step="0.01" prefix={sym} placeholder="5000" value={dp.balance} onChange={e => setDp(f => ({ ...f, balance: e.target.value }))} />
            <Input label="APR %" type="number" min="0" step="0.1" suffix="%" placeholder="22.9" value={dp.apr} onChange={e => setDp(f => ({ ...f, apr: e.target.value }))} />
            <Input label="Monthly Payment" type="number" min="0" step="0.01" prefix={sym} placeholder="150" value={dp.payment} onChange={e => setDp(f => ({ ...f, payment: e.target.value }))} />
          </div>
          {dpResult !== null && (
            <div className="grid grid-cols-2 gap-3">
              <ResultBox label="Months to Payoff" value={dpResult === Infinity ? 'Payment too low' : `${dpResult} months`} color={dpResult === Infinity ? 'red' : 'green'} />
              <ResultBox label="Years" value={dpResult === Infinity ? '—' : `${(dpResult / 12).toFixed(1)} years`} color="amber" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'sal',
      icon: <Clock className="w-5 h-5" />,
      title: 'Salary Calculator',
      description: 'Convert annual salary to hourly and monthly rates',
      color: 'amber',
      content: (
        <div className="space-y-3">
          <Input label="Annual Salary" type="number" min="0" step="100" prefix={sym} placeholder="35000" value={sal.annual} onChange={e => setSal(f => ({ ...f, annual: e.target.value }))} />
          {salMonthly !== null && salHourly !== null && (
            <div className="grid grid-cols-3 gap-3">
              <ResultBox label="Annual" value={formatCurrency(Number(sal.annual), sym)} color="blue" />
              <ResultBox label="Monthly" value={formatCurrency(salMonthly, sym)} color="green" />
              <ResultBox label="Hourly (40h)" value={formatCurrency(salHourly, sym)} color="amber" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'pg',
      icon: <Percent className="w-5 h-5" />,
      title: 'Gain / Loss Calculator',
      description: 'Calculate percentage gain or loss on an investment',
      color: 'purple',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Buy Price" type="number" min="0" step="any" prefix={sym} placeholder="100" value={pg.buy} onChange={e => setPg(f => ({ ...f, buy: e.target.value }))} />
            <Input label="Sell Price" type="number" min="0" step="any" prefix={sym} placeholder="150" value={pg.sell} onChange={e => setPg(f => ({ ...f, sell: e.target.value }))} />
          </div>
          {pgResult !== null && (
            <div className="grid grid-cols-2 gap-3">
              <ResultBox
                label="Gain / Loss"
                value={`${pgResult >= 0 ? '+' : ''}${formatCurrency(Math.abs(Number(pg.sell) - Number(pg.buy)), sym)}`}
                color={pgResult >= 0 ? 'green' : 'red'}
              />
              <ResultBox
                label="Percentage"
                value={`${pgResult >= 0 ? '+' : ''}${formatPercentage(pgResult)}`}
                color={pgResult >= 0 ? 'green' : 'red'}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'bs',
      icon: <Wallet className="w-5 h-5" />,
      title: '50/30/20 Budget Split',
      description: 'Split your income using the 50/30/20 rule',
      color: 'blue',
      content: (
        <div className="space-y-3">
          <Input label="Monthly Income" type="number" min="0" step="0.01" prefix={sym} placeholder="3000" value={bs.income} onChange={e => setBs(f => ({ ...f, income: e.target.value }))} />
          {bsNeeds !== null && (
            <div className="grid grid-cols-3 gap-3">
              <ResultBox label="Needs (50%)" value={formatCurrency(bsNeeds, sym)} color="blue" />
              <ResultBox label="Wants (30%)" value={formatCurrency(bsWants!, sym)} color="amber" />
              <ResultBox label="Savings (20%)" value={formatCurrency(bsSavings!, sym)} color="green" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'si',
      icon: <RefreshCcw className="w-5 h-5" />,
      title: 'Subscription Impact',
      description: 'See the true yearly cost of a subscription',
      color: 'amber',
      content: (
        <div className="space-y-3">
          <Input label="Monthly Cost" type="number" min="0" step="0.01" prefix={sym} placeholder="9.99" value={si.monthly} onChange={e => setSi(f => ({ ...f, monthly: e.target.value }))} />
          {siYearly !== null && (
            <div className="grid grid-cols-2 gap-3">
              <ResultBox label="Yearly Cost" value={formatCurrency(siYearly, sym)} color="amber" />
              <ResultBox label="5-Year Cost" value={formatCurrency(si5yr!, sym)} color="red" />
            </div>
          )}
        </div>
      ),
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
  };

  return (
    <div>
      <Header title="Tools" subtitle="Useful financial calculators" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tools.map(tool => (
            <Card key={tool.id}>
              <CardHeader
                title={tool.title}
                subtitle={tool.description}
                action={
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[tool.color] ?? colorMap.blue}`}>
                    {tool.icon}
                  </div>
                }
              />
              <CardContent>{tool.content}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
