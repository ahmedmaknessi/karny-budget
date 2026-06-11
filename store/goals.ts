import { create } from 'zustand';
import type { Goal } from '@/drizzle/schema';

interface GoalsState {
  goals:     Goal[];
  isLoading: boolean;
  setGoals:   (goals: Goal[]) => void;
  addGoal:    (goal: Goal) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals:     [],
  isLoading: true,

  setGoals: (goals) => set({ goals }),

  addGoal: (goal) =>
    set((s) => ({ goals: [goal, ...s.goals] })),

  updateGoal: (id, patch) =>
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    })),

  removeGoal: (id) =>
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),
}));
