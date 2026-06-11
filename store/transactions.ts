import { create } from 'zustand';
import type { Transaction } from '@/drizzle/schema';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction:  (transaction: Transaction) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  isLoading:    true,

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) =>
    set((s) => ({ transactions: [transaction, ...s.transactions] })),

  updateTransaction: (id, patch) =>
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  removeTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),
}));
