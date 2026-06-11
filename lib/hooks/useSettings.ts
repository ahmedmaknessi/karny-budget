import { useCallback, useEffect } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/drizzle/schema';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore, type Language } from '@/store/settings';
import { supabase } from '@/lib/supabase';
import { setLocale } from '@/i18n';

export function useSettings() {
  const userId   = useAuthStore((s) => s.user?.id);
  const authUser = useAuthStore((s) => s.user);
  const store    = useSettingsStore();

  useEffect(() => {
    if (!userId || store.loaded) return;

    (async () => {
      try {
        let rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (rows.length === 0) {
          // First login — seed local user profile
          const now = new Date().toISOString();
          const profile = {
            id:           userId,
            email:        authUser?.email ?? '',
            name:         (authUser?.user_metadata?.name as string | undefined) ?? null,
            baseCurrency: 'TND',
            language:     'fr',
            synced:       false,
            updatedAt:    now,
          };
          await db.insert(users).values(profile);
          rows = [profile];
        }

        const user = rows[0];
        const lang = (user.language ?? 'fr') as Language;
        store.setLanguage(lang);
        store.setCurrency(user.baseCurrency);
        store.setLoaded();
        setLocale(lang);
      } catch (err) {
        console.error('[useSettings] load failed:', err);
      }
    })();
  }, [userId, store.loaded]);

  const changeLanguage = useCallback(async (lang: Language): Promise<void> => {
    if (!userId) return;
    store.setLanguage(lang);
    setLocale(lang);
    const now = new Date().toISOString();
    // Persist locally
    await db.update(users).set({ language: lang, updatedAt: now }).where(eq(users.id, userId));
    // Push directly to Supabase (bypasses syncQueue — users table has auth-level RLS)
    void (supabase as any)
      .from('users')
      .update({ language: lang, updated_at: now })
      .eq('id', userId);
  }, [userId]);

  const changeCurrency = useCallback(async (code: string): Promise<void> => {
    if (!userId) return;
    store.setCurrency(code);
    const now = new Date().toISOString();
    // Persist locally
    await db.update(users).set({ baseCurrency: code, updatedAt: now }).where(eq(users.id, userId));
    // Push directly to Supabase
    void (supabase as any)
      .from('users')
      .update({ base_currency: code, updated_at: now })
      .eq('id', userId);
  }, [userId]);

  return {
    language:       store.language,
    baseCurrency:   store.baseCurrency,
    changeLanguage,
    changeCurrency,
  };
}
