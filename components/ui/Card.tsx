import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: CardProps) {
  return <h3 className={cn('text-base font-semibold text-zinc-900 dark:text-zinc-100', className)}>{children}</h3>;
}

export function CardContent({ className, children }: CardProps) {
  return <div className={cn('', className)}>{children}</div>;
}
