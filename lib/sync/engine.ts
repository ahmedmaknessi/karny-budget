import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { syncQueue, users, accounts, transactions, budgets, goals } from '@/drizzle/schema';
import { supabase } from '@/lib/supabase';
import { useUiStore } from '@/store/ui';

const MAX_RETRIES = 3;

function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);
}

// Explicit overrides for fields where camelToSnake doesn't reproduce the
// original snake_case column name (e.g. alertSent80 → alert_sent_80 not alert_sent80)
const COLUMN_OVERRIDES: Record<string, string> = {
  alertSent80:  'alert_sent_80',
  alertSent100: 'alert_sent_100',
};

function toSupabasePayload(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[COLUMN_OVERRIDES[k] ?? camelToSnake(k)] = v;
  }
  return out;
}

async function markRecordSynced(table: string, id: string): Promise<void> {
  switch (table) {
    case 'users':
      await db.update(users).set({ synced: true }).where(eq(users.id, id));
      break;
    case 'accounts':
      await db.update(accounts).set({ synced: true }).where(eq(accounts.id, id));
      break;
    case 'transactions':
      await db.update(transactions).set({ synced: true }).where(eq(transactions.id, id));
      break;
    case 'budgets':
      await db.update(budgets).set({ synced: true }).where(eq(budgets.id, id));
      break;
    case 'goals':
      await db.update(goals).set({ synced: true }).where(eq(goals.id, id));
      break;
  }
}

// Tables managed outside the generic queue (direct Supabase calls or RLS-restricted)
const BYPASS_TABLES = new Set(['users']);

async function runSync(): Promise<{ hasErrors: boolean; hasRetrying: boolean }> {
  const pending = await db
    .select()
    .from(syncQueue)
    .where(and(eq(syncQueue.synced, false), eq(syncQueue.error, false)));

  for (const row of pending) {
    try {
      // Clear bypass-table entries without pushing to Supabase
      if (BYPASS_TABLES.has(row.table)) {
        await db.update(syncQueue).set({ synced: true }).where(eq(syncQueue.id, row.id));
        continue;
      }

      const payload = JSON.parse(row.payload) as Record<string, unknown>;

      if (row.operation === 'DELETE') {
        const { error } = await (supabase as any)
          .from(row.table)
          .delete()
          .eq('id', payload.id);
        if (error) throw error;
      } else {
        const supaPayload = toSupabasePayload(payload);
        supaPayload.synced = true;
        const { error } = await (supabase as any).from(row.table).upsert(supaPayload);
        if (error) throw error;
        await markRecordSynced(row.table, payload.id as string);
      }

      await db.update(syncQueue).set({ synced: true }).where(eq(syncQueue.id, row.id));
    } catch (err) {
      console.error(`[sync] ${row.table}/${row.operation} id=${row.id}:`, err);
      const next = row.retries + 1;
      await db
        .update(syncQueue)
        .set({ retries: next, error: next >= MAX_RETRIES })
        .where(eq(syncQueue.id, row.id));
    }
  }

  const [errorRows, retryRows] = await Promise.all([
    db
      .select({ id: syncQueue.id })
      .from(syncQueue)
      .where(and(eq(syncQueue.synced, false), eq(syncQueue.error, true)))
      .limit(1),
    db
      .select({ id: syncQueue.id })
      .from(syncQueue)
      .where(and(eq(syncQueue.synced, false), eq(syncQueue.error, false), gt(syncQueue.retries, 0)))
      .limit(1),
  ]);

  return { hasErrors: errorRows.length > 0, hasRetrying: retryRows.length > 0 };
}

async function hasPending(): Promise<boolean> {
  const rows = await db
    .select({ id: syncQueue.id })
    .from(syncQueue)
    .where(and(eq(syncQueue.synced, false), eq(syncQueue.error, false)))
    .limit(1);
  return rows.length > 0;
}

// Module-level lock prevents concurrent sync runs
let _lock = false;

export async function triggerSync(): Promise<void> {
  if (_lock) return;
  _lock = true;

  const { setSyncStatus } = useUiStore.getState();
  setSyncStatus('pending');

  try {
    const { hasErrors, hasRetrying } = await runSync();
    const pending = await hasPending();

    if (hasErrors)        setSyncStatus('error');
    else if (hasRetrying) setSyncStatus('retrying');
    else if (pending)     setSyncStatus('pending');
    else                  setSyncStatus('synced');
  } catch (err) {
    console.error('[sync] triggerSync failed:', err);
    useUiStore.getState().setSyncStatus('error');
  } finally {
    _lock = false;
  }
}
