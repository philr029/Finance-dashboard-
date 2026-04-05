import { ReactNode } from 'react';
import { cn } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray';
  className?: string;
}

const colorMap = {
  blue: {
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    accent: 'border-l-blue-500',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    accent: 'border-l-emerald-500',
  },
  red: {
    icon: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
    accent: 'border-l-red-500',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    accent: 'border-l-amber-500',
  },
  purple: {
    icon: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    accent: 'border-l-purple-500',
  },
  gray: {
    icon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    accent: 'border-l-gray-300',
  },
};

export function StatCard({ label, value, sub, icon, trend, trendValue, color = 'blue', className }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
  const colors = colorMap[color];
  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-5',
      'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5 tabular-nums truncate">{value}</p>
          {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={cn('rounded-xl p-2.5 ml-3 flex-shrink-0', colors.icon)}>
            {icon}
          </div>
        )}
      </div>
      {(trend || trendValue) && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
