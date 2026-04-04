import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function ProgressBar({ value, max = 100, color = '#6366f1', className, showLabel = false, size = 'md' }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden', sizes[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
