'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PiggyBank, DollarSign, TrendingUp, CreditCard, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/formatters';
import { useState } from 'react';
import { RefreshCcw, BarChart3, Wrench, Settings } from 'lucide-react';

import { Vault } from 'lucide-react';

const mainNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/savings', label: 'Savings', icon: PiggyBank },
  { href: '/budget', label: 'Budget', icon: DollarSign },
  { href: '/investments', label: 'Investments', icon: TrendingUp },
  { href: '/debt', label: 'Debt', icon: CreditCard },
];

const moreNav = [
  { href: '/subscriptions', label: 'Subscriptions', icon: RefreshCcw },
  { href: '/net-worth', label: 'Net Worth', icon: BarChart3 },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  return (
    <>
      {/* Bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                  active ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-500 dark:text-gray-400"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
      {/* More menu overlay */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">More</h3>
            <div className="grid grid-cols-2 gap-3">
              {moreNav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                    pathname === href
                      ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/20'
                      : 'border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
