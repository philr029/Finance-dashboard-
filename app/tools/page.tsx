'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

type ToolTab = 'emergency' | 'compound' | 'debt-payoff' | 'savings-goal' | 'salary' | 'percent-calc';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>('emergency');

  const tabs: { id: ToolTab; label: string }[] = [
    { id: 'emergency', label: '🛡️ Emergency Fund' },
    { id: 'compound', label: '📈 Compound Interest' },
    { id: 'debt-payoff', label: '💳 Debt Payoff' },
    { id: 'savings-goal', label: '🎯 Savings Goal' },
    { id: 'salary', label: '💼 Salary Calc' },
    { id: 'percent-calc', label: '% Calc' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Financial Tools</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculators to help you plan</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'emergency' && <EmergencyFundCalc />}
      {activeTab === 'compound' && <CompoundInterestCalc />}
      {activeTab === 'debt-payoff' && <DebtPayoffCalc />}
      {activeTab === 'savings-goal' && <SavingsGoalCalc />}
      {activeTab === 'salary' && <SalaryCalc />}
      {activeTab === 'percent-calc' && <PercentCalc />}
    </div>
  );
}

function EmergencyFundCalc() {
  const [monthly, setMonthly] = useState('');
  const [months, setMonths] = useState('6');
  const [current, setCurrent] = useState('');

  const goal = parseFloat(monthly) * parseFloat(months) || 0;
  const remaining = Math.max(0, goal - (parseFloat(current) || 0));
  const coverage = goal > 0 ? ((parseFloat(current) || 0) / goal) * 100 : 0;

  return (
    <Card>
      <CardHeader><CardTitle>Emergency Fund Calculator</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Calculate how much you need for an emergency fund</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Input label="Monthly Expenses (£)" type="number" placeholder="2000" value={monthly} onChange={e => setMonthly(e.target.value)} />
          <Input label="Months of Coverage" type="number" placeholder="6" value={months} onChange={e => setMonths(e.target.value)} />
          <Input label="Current Savings (£)" type="number" placeholder="0" value={current} onChange={e => setCurrent(e.target.value)} />
        </div>
        {goal > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Target</p>
              <p className="text-xl font-bold text-indigo-600">{formatCurrency(goal)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Still needed</p>
              <p className="text-xl font-bold text-red-500">{formatCurrency(remaining)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Coverage</p>
              <p className="text-xl font-bold text-emerald-600">{coverage.toFixed(0)}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompoundInterestCalc() {
  const [principal, setPrincipal] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');

  const calc = () => {
    const p = parseFloat(principal) || 0;
    const m = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = (parseFloat(years) || 0) * 12;
    if (n === 0) return null;
    const futureValue = r > 0
      ? p * Math.pow(1 + r, n) + m * ((Math.pow(1 + r, n) - 1) / r)
      : p + m * n;
    const totalContributed = p + m * n;
    const interest = futureValue - totalContributed;
    return { futureValue, totalContributed, interest };
  };

  const result = calc();

  return (
    <Card>
      <CardHeader><CardTitle>Compound Interest Calculator</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input label="Initial Investment (£)" type="number" placeholder="1000" value={principal} onChange={e => setPrincipal(e.target.value)} />
          <Input label="Monthly Contribution (£)" type="number" placeholder="200" value={monthly} onChange={e => setMonthly(e.target.value)} />
          <Input label="Annual Interest Rate (%)" type="number" placeholder="7" value={rate} onChange={e => setRate(e.target.value)} />
          <Input label="Time Period (Years)" type="number" placeholder="10" value={years} onChange={e => setYears(e.target.value)} />
        </div>
        {result && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Future Value</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(result.futureValue)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Contributed</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(result.totalContributed)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Interest Earned</p>
              <p className="text-xl font-bold text-indigo-600">{formatCurrency(result.interest)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DebtPayoffCalc() {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [payment, setPayment] = useState('');

  const calc = () => {
    const b = parseFloat(balance);
    const r = parseFloat(apr) / 100 / 12;
    const p = parseFloat(payment);
    if (!b || !p || p <= 0) return null;
    if (r === 0) return { months: Math.ceil(b / p), totalPaid: b, totalInterest: 0 };
    if (p <= b * r) return { months: Infinity, totalPaid: Infinity, totalInterest: Infinity };
    const months = Math.ceil(-Math.log(1 - (b * r) / p) / Math.log(1 + r));
    const totalPaid = p * months;
    return { months, totalPaid, totalInterest: totalPaid - b };
  };

  const result = calc();

  return (
    <Card>
      <CardHeader><CardTitle>Debt Payoff Calculator</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Input label="Debt Balance (£)" type="number" placeholder="5000" value={balance} onChange={e => setBalance(e.target.value)} />
          <Input label="APR (%)" type="number" placeholder="22.9" value={apr} onChange={e => setApr(e.target.value)} />
          <Input label="Monthly Payment (£)" type="number" placeholder="200" value={payment} onChange={e => setPayment(e.target.value)} />
        </div>
        {result && (
          result.months === Infinity ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
              <p className="text-red-600 font-medium">⚠️ Payment too low — you&apos;ll never pay off this debt!</p>
              <p className="text-sm text-red-500 mt-1">Minimum needed: £{(parseFloat(balance) * parseFloat(apr) / 100 / 12 + 0.01).toFixed(2)}/mo</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Months to Payoff</p>
                <p className="text-xl font-bold text-amber-600">{result.months} months</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Paid</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(result.totalPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Interest</p>
                <p className="text-xl font-bold text-red-500">{formatCurrency(result.totalInterest)}</p>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}

function SavingsGoalCalc() {
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');

  const calc = () => {
    const t = parseFloat(target);
    const c = parseFloat(current) || 0;
    const m = parseFloat(monthly);
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const remaining = t - c;
    if (!t || !m || remaining <= 0) return null;
    let months = 0;
    let balance = c;
    while (balance < t && months < 1200) {
      balance = balance * (1 + r) + m;
      months++;
    }
    return { months, years: Math.floor(months / 12), extraMonths: months % 12, targetDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000) };
  };

  const result = calc();

  return (
    <Card>
      <CardHeader><CardTitle>Savings Goal Calculator</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input label="Target Amount (£)" type="number" placeholder="20000" value={target} onChange={e => setTarget(e.target.value)} />
          <Input label="Current Savings (£)" type="number" placeholder="0" value={current} onChange={e => setCurrent(e.target.value)} />
          <Input label="Monthly Savings (£)" type="number" placeholder="500" value={monthly} onChange={e => setMonthly(e.target.value)} />
          <Input label="Interest Rate (% p.a.)" type="number" placeholder="4.5" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        {result && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Time to Goal</p>
              <p className="text-xl font-bold text-indigo-600">
                {result.years > 0 ? `${result.years}y ` : ''}{result.extraMonths}mo
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Est. Target Date</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {result.targetDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SalaryCalc() {
  const [annual, setAnnual] = useState('');

  const a = parseFloat(annual) || 0;
  const monthly = a / 12;
  const weekly = a / 52;
  const daily = a / 260;
  const hourly = a / (260 * 8);

  return (
    <Card>
      <CardHeader><CardTitle>Salary Calculator</CardTitle></CardHeader>
      <CardContent>
        <Input label="Annual Salary (£)" type="number" placeholder="45000" value={annual} onChange={e => setAnnual(e.target.value)} className="mb-6" />
        {a > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Monthly', value: monthly },
              { label: 'Weekly', value: weekly },
              { label: 'Daily', value: daily },
              { label: 'Hourly', value: hourly },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
                <p className="text-xs text-zinc-500 mb-1">{label}</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PercentCalc() {
  const [initial, setInitial] = useState('');
  const [final, setFinal] = useState('');

  const change = parseFloat(initial) && parseFloat(final)
    ? ((parseFloat(final) - parseFloat(initial)) / parseFloat(initial)) * 100
    : null;

  return (
    <Card>
      <CardHeader><CardTitle>Percentage Change Calculator</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input label="Initial Value" type="number" placeholder="1000" value={initial} onChange={e => setInitial(e.target.value)} />
          <Input label="Final Value" type="number" placeholder="1250" value={final} onChange={e => setFinal(e.target.value)} />
        </div>
        {change !== null && (
          <div className={`p-4 rounded-xl ${change >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
            <p className="text-xs text-zinc-500 mb-1">Change</p>
            <p className={`text-3xl font-bold ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {change >= 0 ? 'Gain' : 'Loss'} of {formatCurrency(Math.abs(parseFloat(final) - parseFloat(initial)))}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
