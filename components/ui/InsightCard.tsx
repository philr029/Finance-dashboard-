import { ReactNode } from 'react';
import { cn } from '@/utils/formatters';

type InsightVariant = 'info' | 'warning' | 'success' | 'tip';

interface InsightCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  variant?: InsightVariant;
  className?: string;
}

const variantStyles: Record<InsightVariant, { wrapper: string; icon: string }> = {
  info: {
    wrapper: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40',
    icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  },
  warning: {
    wrapper: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40',
    icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  },
  success: {
    wrapper: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40',
    icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  },
  tip: {
    wrapper: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40',
    icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  },
};

export function InsightCard({ icon, title, description, variant = 'info', className }: InsightCardProps) {
  const styles = variantStyles[variant];
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-xl border', styles.wrapper, className)}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', styles.icon)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
