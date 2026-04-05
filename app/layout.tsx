import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "VaultFlow — Personal Finance Dashboard",
  description: "Track savings, investments, budgets, debts and net worth in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-[#0c0e14] text-gray-900 dark:text-white antialiased">
        <Sidebar />
        <div className="lg:pl-64">
          <main className="min-h-screen pb-24 lg:pb-8">
            {children}
          </main>
        </div>
        <MobileNav />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  );
}
