import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { budgets, transactions } from '@/drizzle/schema';
import { useBudgetsStore } from '@/store/budgets';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function checkBudgetAlerts(
  userId:     string,
  categoryId: string,
  txDate:     string,
): Promise<void> {
  try {
    const d     = new Date(txDate + 'T00:00:00');
    const month = d.getMonth() + 1;
    const year  = d.getFullYear();
    const mm    = String(month).padStart(2, '0');
    const start = `${year}-${mm}-01`;
    const end   = `${year}-${mm}-31`;

    const [budgetRows, spendResult] = await Promise.all([
      db.select()
        .from(budgets)
        .where(and(
          eq(budgets.userId,     userId),
          eq(budgets.categoryId, categoryId),
          eq(budgets.month,      month),
          eq(budgets.year,       year),
        ))
        .limit(1),
      db.select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
        .from(transactions)
        .where(and(
          eq(transactions.userId,     userId),
          eq(transactions.categoryId, categoryId),
          eq(transactions.type,       'EXPENSE'),
          gte(transactions.date,      start),
          lte(transactions.date,      end),
        )),
    ]);

    if (!budgetRows.length) return;

    const budget = budgetRows[0];
    const spent  = spendResult[0]?.total ?? 0;
    const pct    = budget.amount > 0 ? spent / budget.amount : 0;
    const cat    = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
    const name   = cat?.name ?? 'Budget';

    if (pct >= 1 && !budget.alertSent100) {
      try {
        const Notifications = await import('expo-notifications');
        await Notifications.scheduleNotificationAsync({
          content: { title: '⚠️ Budget exceeded', body: `You've exceeded your ${name} budget`, data: { categoryId } },
          trigger: null,
        });
      } catch { /* not available in Expo Go */ }
      await db.update(budgets).set({ alertSent100: true }).where(eq(budgets.id, budget.id));
      useBudgetsStore.getState().updateBudget(budget.id, { alertSent100: true });

    } else if (pct >= 0.8 && !budget.alertSent80) {
      try {
        const Notifications = await import('expo-notifications');
        await Notifications.scheduleNotificationAsync({
          content: { title: '📊 Budget at 80%', body: `You've used 80% of your ${name} budget`, data: { categoryId } },
          trigger: null,
        });
      } catch { /* not available in Expo Go */ }
      await db.update(budgets).set({ alertSent80: true }).where(eq(budgets.id, budget.id));
      useBudgetsStore.getState().updateBudget(budget.id, { alertSent80: true });
    }
  } catch (err) {
    console.error('Budget alert check failed:', err);
  }
}
