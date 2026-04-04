'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PiggyBank, Receipt, TrendingUp, CreditCard,
  Repeat, BarChart3, Wrench, Settings, Vault
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/savings', label: 'Savings', icon: PiggyBank },
  { href: '/budget', label: 'Budget', icon: Receipt },
  { href: '/investments', label: 'Investments', icon: TrendingUp },
  { href: '/debt', label: 'Debt', icon: CreditCard },
  { href: '/subscriptions', label: 'Subscriptions', icon: Repeat },
  { href: '/net-worth', label: 'Net Worth', icon: BarChart3 },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 fixed top-0 left-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Vault size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">VaultFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              <Icon size={18} className={cn(isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">VaultFlow v1.0</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">Personal Finance Dashboard</p>
      </div>
    </aside>
  );
}
