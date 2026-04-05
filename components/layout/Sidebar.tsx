'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PiggyBank, DollarSign, TrendingUp, CreditCard,
  RefreshCcw, BarChart3, Wrench, Settings, Vault
} from 'lucide-react';
import { cn } from '@/utils/formatters';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/net-worth', label: 'Net Worth', icon: BarChart3 },
    ],
  },
  {
    label: 'Money',
    items: [
      { href: '/budget', label: 'Budget', icon: DollarSign },
      { href: '/savings', label: 'Savings', icon: PiggyBank },
      { href: '/investments', label: 'Investments', icon: TrendingUp },
      { href: '/debt', label: 'Debt', icon: CreditCard },
      { href: '/subscriptions', label: 'Subscriptions', icon: RefreshCcw },
    ],
  },
  {
    label: 'More',
    items: [
      { href: '/tools', label: 'Tools', icon: Wrench },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800/60 fixed top-0 left-0 bottom-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800/60">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/20 dark:shadow-blue-700/40">
          <Vault className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">VaultFlow</span>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">Personal Finance</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500')} />
                    {label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs text-gray-400 dark:text-gray-500">Data saved locally · v1.0</p>
        </div>
      </div>
    </aside>
  );
}
