import { create } from 'zustand';
import type { Budget } from '@/drizzle/schema';

interface BudgetsState {
  budgets: Budget[];
  isLoading: boolean;
  setBudgets: (budgets: Budget[]) => void;
  addBudget:  (budget: Budget) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;
  removeBudget: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useBudgetsStore = create<BudgetsState>((set) => ({
  budgets:   [],
  isLoading: true,

  setBudgets: (budgets) => set({ budgets }),

  addBudget: (budget) =>
    set((s) => ({ budgets: [budget, ...s.budgets] })),

  updateBudget: (id, patch) =>
    set((s) => ({
      budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    })),

  removeBudget: (id) =>
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),
}));
