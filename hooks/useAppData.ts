'use client';
import { useState, useCallback, useEffect } from 'react';
import { AppData, SavingsPot, Transaction, Investment, Debt, Subscription, NetWorthEntry, AppSettings } from '@/types';
import { loadData, saveData, clearData as storageClear, resetToSeedData } from '@/lib/storage';

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // Savings
  const addSavingsPot = useCallback((pot: SavingsPot) => {
    update(d => ({ ...d, savingsPots: [...d.savingsPots, pot] }));
  }, [update]);
  const updateSavingsPot = useCallback((pot: SavingsPot) => {
    update(d => ({ ...d, savingsPots: d.savingsPots.map(p => p.id === pot.id ? pot : p) }));
  }, [update]);
  const deleteSavingsPot = useCallback((id: string) => {
    update(d => ({ ...d, savingsPots: d.savingsPots.filter(p => p.id !== id) }));
  }, [update]);

  // Transactions
  const addTransaction = useCallback((tx: Transaction) => {
    update(d => ({ ...d, transactions: [...d.transactions, tx] }));
  }, [update]);
  const updateTransaction = useCallback((tx: Transaction) => {
    update(d => ({ ...d, transactions: d.transactions.map(t => t.id === tx.id ? tx : t) }));
  }, [update]);
  const deleteTransaction = useCallback((id: string) => {
    update(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== id) }));
  }, [update]);

  // Investments
  const addInvestment = useCallback((inv: Investment) => {
    update(d => ({ ...d, investments: [...d.investments, inv] }));
  }, [update]);
  const updateInvestment = useCallback((inv: Investment) => {
    update(d => ({ ...d, investments: d.investments.map(i => i.id === inv.id ? inv : i) }));
  }, [update]);
  const deleteInvestment = useCallback((id: string) => {
    update(d => ({ ...d, investments: d.investments.filter(i => i.id !== id) }));
  }, [update]);

  // Debts
  const addDebt = useCallback((debt: Debt) => {
    update(d => ({ ...d, debts: [...d.debts, debt] }));
  }, [update]);
  const updateDebt = useCallback((debt: Debt) => {
    update(d => ({ ...d, debts: d.debts.map(db => db.id === debt.id ? debt : db) }));
  }, [update]);
  const deleteDebt = useCallback((id: string) => {
    update(d => ({ ...d, debts: d.debts.filter(db => db.id !== id) }));
  }, [update]);

  // Subscriptions
  const addSubscription = useCallback((sub: Subscription) => {
    update(d => ({ ...d, subscriptions: [...d.subscriptions, sub] }));
  }, [update]);
  const updateSubscription = useCallback((sub: Subscription) => {
    update(d => ({ ...d, subscriptions: d.subscriptions.map(s => s.id === sub.id ? sub : s) }));
  }, [update]);
  const deleteSubscription = useCallback((id: string) => {
    update(d => ({ ...d, subscriptions: d.subscriptions.filter(s => s.id !== id) }));
  }, [update]);

  // Net Worth
  const addNetWorthEntry = useCallback((entry: NetWorthEntry) => {
    update(d => ({ ...d, netWorthHistory: [...d.netWorthHistory, entry] }));
  }, [update]);

  // Settings
  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    update(d => ({ ...d, settings: { ...d.settings, ...settings } }));
  }, [update]);

  const resetData = useCallback(() => {
    const fresh = resetToSeedData();
    setData(fresh);
  }, []);

  const clearData = useCallback(() => {
    storageClear();
    setData(loadData());
  }, []);

  return {
    data,
    addSavingsPot, updateSavingsPot, deleteSavingsPot,
    addTransaction, updateTransaction, deleteTransaction,
    addInvestment, updateInvestment, deleteInvestment,
    addDebt, updateDebt, deleteDebt,
    addSubscription, updateSubscription, deleteSubscription,
    addNetWorthEntry,
    updateSettings,
    resetData,
    clearData,
  };
}
