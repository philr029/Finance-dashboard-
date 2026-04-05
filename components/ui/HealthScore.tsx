'use client';
import { cn } from '@/utils/formatters';

interface HealthScoreProps {
  score: number; // 0-100
  breakdown?: { label: string; points: number; max: number; achieved: boolean }[];
  className?: string;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
  if (score >= 40) return { label: 'Fair', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Needs work', color: 'text-red-600 dark:text-red-400' };
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export function HealthScore({ score, breakdown, className }: HealthScoreProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const { label, color } = getScoreLabel(clamped);
  const ringColor = getScoreRingColor(clamped);

  // SVG ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-gray-100 dark:text-gray-800" />
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{clamped}</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">/ 100</span>
        </div>
      </div>
      <p className={cn('text-sm font-semibold mt-2', color)}>{label}</p>
      {breakdown && (
        <div className="w-full mt-4 space-y-2">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', item.achieved ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-700')} />
                {item.label}
              </div>
              <span className={cn('font-medium', item.achieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400')}>
                {item.achieved ? `+${item.points}` : '0'}/{item.max}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function computeHealthScore(data: {
  savingsRate: number;
  emergencyMonths: number;
  hasInvestments: boolean;
  hasHighInterestDebt: boolean;
  debtToIncomeRatio: number;
  savingsGoalProgress: number;
}): { score: number; breakdown: { label: string; points: number; max: number; achieved: boolean }[] } {
  const breakdown = [
    {
      label: 'Savings rate ≥ 15%',
      points: 25,
      max: 25,
      achieved: data.savingsRate >= 15,
    },
    {
      label: 'Emergency fund ≥ 3 months',
      points: 25,
      max: 25,
      achieved: data.emergencyMonths >= 3,
    },
    {
      label: 'Investing regularly',
      points: 20,
      max: 20,
      achieved: data.hasInvestments,
    },
    {
      label: 'No high-interest debt (>20% APR)',
      points: 15,
      max: 15,
      achieved: !data.hasHighInterestDebt,
    },
    {
      label: 'Savings goal ≥ 50% complete',
      points: 15,
      max: 15,
      achieved: data.savingsGoalProgress >= 50,
    },
  ];
  const score = breakdown.reduce((sum, item) => sum + (item.achieved ? item.points : 0), 0);
  return { score, breakdown };
}
