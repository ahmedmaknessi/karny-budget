import { useCallback, useEffect, useState } from 'react';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db/client';
import { budgets, transactions, syncQueue } from '@/drizzle/schema';
import { useAuthStore } from '@/store/auth';
import { useBudgetsStore } from '@/store/budgets';
import type { Budget } from '@/drizzle/schema';

export type BudgetInput = {
  categoryId: string;
  amount:     number;
  currency:   string;
  month:      number;
  year:       number;
  rollover:   boolean;
};

export function useBudgets(selectedMonth?: number, selectedYear?: number) {
  const userId     = useAuthStore((s) => s.user?.id);
  const store      = useBudgetsStore();
  const { setBudgets, setLoading } = store;

  const now   = new Date();
  const month = selectedMonth ?? now.getMonth() + 1;
  const year  = selectedYear  ?? now.getFullYear();

  const [spendByCategory, setSpendByCategory] = useState<Record<string, number>>({});
  const [monthSpent,      setMonthSpent]      = useState(0);
  const [monthBudget,     setMonthBudget]     = useState(0);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    const mm    = String(month).padStart(2, '0');
    const start = `${year}-${mm}-01`;
    const end   = `${year}-${mm}-31`;

    try {
      const [budgetRows, spendRows] = await Promise.all([
        db.select()
          .from(budgets)
          .where(and(
            eq(budgets.userId, userId),
            eq(budgets.month,  month),
            eq(budgets.year,   year),
          )),
        db.select({
          categoryId: transactions.categoryId,
          total:      sql<number>`coalesce(sum(${transactions.amount}), 0)`,
        })
          .from(transactions)
          .where(and(
            eq(transactions.userId, userId),
            eq(transactions.type,   'EXPENSE'),
            gte(transactions.date,  start),
            lte(transactions.date,  end),
          ))
          .groupBy(transactions.categoryId),
      ]);

      const spendMap: Record<string, number> = {};
      for (const row of spendRows) spendMap[row.categoryId] = row.total;

      setBudgets(budgetRows);
      setSpendByCategory(spendMap);
      setMonthBudget(budgetRows.reduce((sum, b) => sum + b.amount, 0));
      setMonthSpent(Object.values(spendMap).reduce((s, v) => s + v, 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, month, year, setBudgets, setLoading]);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (data: BudgetInput): Promise<Budget> => {
    if (!userId) throw new Error('Not authenticated');
    const now    = new Date().toISOString();
    const budget: Budget = {
      ...data,
      id:           createId(),
      userId,
      alertSent80:  false,
      alertSent100: false,
      synced:       false,
      updatedAt:    now,
    };
    await db.insert(budgets).values(budget);
    await db.insert(syncQueue).values({
      table:     'budgets',
      operation: 'INSERT',
      payload:   JSON.stringify(budget),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useBudgetsStore.getState().addBudget(budget);
    return budget;
  }, [userId]);

  const update = useCallback(async (id: string, patch: Partial<BudgetInput>): Promise<void> => {
    const now   = new Date().toISOString();
    const data  = { ...patch, updatedAt: now, synced: false };
    await db.update(budgets).set(data).where(eq(budgets.id, id));
    await db.insert(syncQueue).values({
      table:     'budgets',
      operation: 'UPDATE',
      payload:   JSON.stringify({ id, ...data }),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useBudgetsStore.getState().updateBudget(id, data);
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    const now = new Date().toISOString();
    await db.delete(budgets).where(eq(budgets.id, id));
    await db.insert(syncQueue).values({
      table:     'budgets',
      operation: 'DELETE',
      payload:   JSON.stringify({ id }),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useBudgetsStore.getState().removeBudget(id);
  }, []);

  return {
    budgets:         store.budgets,
    isLoading:       store.isLoading,
    spendByCategory,
    monthSpent,
    monthBudget,
    load,
    add,
    update,
    remove,
  };
}
