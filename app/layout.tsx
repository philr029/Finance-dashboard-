import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'VaultFlow - Personal Finance Dashboard',
  description: 'Track your finances, savings, investments, and debts in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#18181b',
              borderRadius: '12px',
              border: '1px solid #f4f4f5',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              fontSize: '14px',
            },
          }}
        />
        <Sidebar />
        <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
