import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 rounded-xl border text-sm transition-colors',
          'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
          'border-zinc-200 dark:border-zinc-700',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
