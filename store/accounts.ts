import { create } from 'zustand';
import type { Account } from '@/drizzle/schema';

interface AccountsState {
  accounts: Account[];
  isLoading: boolean;
  setAccounts: (accounts: Account[]) => void;
  addAccount:  (account: Account) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAccountsStore = create<AccountsState>((set) => ({
  accounts:  [],
  isLoading: true,

  setAccounts: (accounts) => set({ accounts }),

  addAccount: (account) =>
    set((s) => ({ accounts: [account, ...s.accounts] })),

  updateAccount: (id, patch) =>
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  removeAccount: (id) =>
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),
}));
