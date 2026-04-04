'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PiggyBank, Receipt, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/savings', label: 'Savings', icon: PiggyBank },
  { href: '/budget', label: 'Budget', icon: Receipt },
  { href: '/investments', label: 'Invest', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150',
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
