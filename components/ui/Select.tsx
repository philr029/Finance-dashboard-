import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 rounded-xl border text-sm transition-colors',
          'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
          'border-zinc-200 dark:border-zinc-700',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
