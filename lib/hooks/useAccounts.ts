import { useEffect } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { accounts } from '@/drizzle/schema';
import { useAuthStore } from '@/store/auth';
import { useAccountsStore } from '@/store/accounts';

export function useAccounts() {
  const userId    = useAuthStore((s) => s.user?.id);
  const setData   = useAccountsStore((s) => s.setAccounts);
  const setLoading = useAccountsStore((s) => s.setLoading);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    db.select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .then((rows) => {
        setData(rows.filter((a) => !a.isArchived));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [userId, setData, setLoading]);

  return useAccountsStore();
}
