import { useCallback, useEffect } from 'react';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db/client';
import { goals, syncQueue } from '@/drizzle/schema';
import { useAuthStore } from '@/store/auth';
import { useGoalsStore } from '@/store/goals';
import type { Goal } from '@/drizzle/schema';

export type GoalInput = {
  name:         string;
  emoji:        string;
  targetAmount: number;
  currency:     string;
  deadline?:    string | null;
};

export function useGoals() {
  const userId     = useAuthStore((s) => s.user?.id);
  const store      = useGoalsStore();
  const { setGoals, setLoading } = store;

  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const rows = await db.select().from(goals).where(eq(goals.userId, userId));
      setGoals(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, setGoals, setLoading]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(async (data: GoalInput): Promise<Goal> => {
    if (!userId) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    const goal: Goal = {
      ...data,
      id:          createId(),
      userId,
      savedAmount: 0,
      deadline:    data.deadline ?? null,
      synced:      false,
      updatedAt:   now,
      createdAt:   now,
    };
    await db.insert(goals).values(goal);
    await db.insert(syncQueue).values({
      table:     'goals',
      operation: 'INSERT',
      payload:   JSON.stringify(goal),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useGoalsStore.getState().addGoal(goal);
    return goal;
  }, [userId]);

  const addSavings = useCallback(async (id: string, amount: number): Promise<void> => {
    const goal = useGoalsStore.getState().goals.find((g) => g.id === id);
    if (!goal) return;
    const now        = new Date().toISOString();
    const newSaved   = goal.savedAmount + amount;
    const patch      = { savedAmount: newSaved, updatedAt: now, synced: false };
    await db.update(goals).set(patch).where(eq(goals.id, id));
    await db.insert(syncQueue).values({
      table:     'goals',
      operation: 'UPDATE',
      payload:   JSON.stringify({ id, ...patch }),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useGoalsStore.getState().updateGoal(id, patch);
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    const now = new Date().toISOString();
    await db.delete(goals).where(eq(goals.id, id));
    await db.insert(syncQueue).values({
      table:     'goals',
      operation: 'DELETE',
      payload:   JSON.stringify({ id }),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useGoalsStore.getState().removeGoal(id);
  }, []);

  return {
    goals:      store.goals,
    isLoading:  store.isLoading,
    add,
    addSavings,
    remove,
    reload,
  };
}
