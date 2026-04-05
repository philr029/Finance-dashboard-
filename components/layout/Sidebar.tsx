'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PiggyBank, DollarSign, TrendingUp, CreditCard,
  RefreshCcw, BarChart3, Wrench, Settings, Zap
} from 'lucide-react';
import { cn } from '@/utils/formatters';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/savings', label: 'Savings', icon: PiggyBank },
  { href: '/budget', label: 'Budget', icon: DollarSign },
  { href: '/investments', label: 'Investments', icon: TrendingUp },
  { href: '/debt', label: 'Debt', icon: CreditCard },
  { href: '/subscriptions', label: 'Subscriptions', icon: RefreshCcw },
  { href: '/net-worth', label: 'Net Worth', icon: BarChart3 },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 fixed top-0 left-0 bottom-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">VaultFlow</span>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600">VaultFlow v1.0</p>
      </div>
    </aside>
  );
}
