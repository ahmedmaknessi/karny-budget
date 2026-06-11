import { useEffect, useCallback } from 'react';
import { desc, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db/client';
import { transactions, syncQueue } from '@/drizzle/schema';
import { useAuthStore } from '@/store/auth';
import { useTransactionsStore } from '@/store/transactions';
import { checkBudgetAlerts } from '@/lib/notifications/budgetAlerts';
import type { Transaction } from '@/drizzle/schema';

export type TransactionInput = Omit<Transaction, 'id' | 'userId' | 'synced' | 'updatedAt' | 'createdAt'>;

export function useTransactions() {
  const userId     = useAuthStore((s) => s.user?.id);
  const store      = useTransactionsStore();
  const { setTransactions, setLoading } = store;

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .then((rows) => {
        setTransactions(rows);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [userId, setTransactions, setLoading]);

  const add = useCallback(async (data: TransactionInput): Promise<Transaction> => {
    if (!userId) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    const tx: Transaction = {
      ...data,
      id:        createId(),
      userId,
      synced:    false,
      updatedAt: now,
      createdAt: now,
    };
    await db.insert(transactions).values(tx);
    await db.insert(syncQueue).values({
      table:     'transactions',
      operation: 'INSERT',
      payload:   JSON.stringify(tx),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useTransactionsStore.getState().addTransaction(tx);

    // Fire-and-forget budget alert check for EXPENSE transactions
    if (tx.type === 'EXPENSE') {
      checkBudgetAlerts(userId, tx.categoryId, tx.date).catch(console.error);
    }

    return tx;
  }, [userId]);

  const update = useCallback(async (id: string, data: Partial<TransactionInput>): Promise<void> => {
    const now   = new Date().toISOString();
    const patch = { ...data, updatedAt: now, synced: false };
    await db.update(transactions).set(patch).where(eq(transactions.id, id));
    await db.insert(syncQueue).values({
      table:     'transactions',
      operation: 'UPDATE',
      payload:   JSON.stringify({ id, ...patch }),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useTransactionsStore.getState().updateTransaction(id, patch);
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    const now = new Date().toISOString();
    await db.delete(transactions).where(eq(transactions.id, id));
    await db.insert(syncQueue).values({
      table:     'transactions',
      operation: 'DELETE',
      payload:   JSON.stringify({ id }),
      retries:   0,
      synced:    false,
      error:     false,
      createdAt: now,
    });
    useTransactionsStore.getState().removeTransaction(id);
  }, []);

  return {
    transactions: store.transactions,
    isLoading:    store.isLoading,
    add,
    update,
    remove,
  };
}
