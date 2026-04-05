'use client';
import { Sun, Moon, FlaskConical } from 'lucide-react';
import { cn } from '@/utils/formatters';
import { useState, useEffect } from 'react';
import { Vault } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  demoMode?: boolean;
}

export function Header({ title, subtitle, demoMode }: HeaderProps) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setDark(d => !d);
  };
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/60 sticky top-0 z-30">
      {/* Mobile logo + title */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Vault className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-none">{title}</h1>
            {demoMode && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[10px] font-semibold uppercase tracking-wide">
                <FlaskConical className="w-2.5 h-2.5" />
                Demo
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {demoMode && (
          <span className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[10px] font-semibold uppercase tracking-wide">
            <FlaskConical className="w-2.5 h-2.5" />
            Demo
          </span>
        )}
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors',
            'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          )}
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
