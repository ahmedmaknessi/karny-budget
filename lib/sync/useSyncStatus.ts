import { useCallback, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuthStore } from '@/store/auth';
import { triggerSync } from './engine';

export function useSyncStatus() {
  const isAuthenticated = useAuthStore((s) => !!s.session);

  const sync = useCallback(() => {
    if (!isAuthenticated) return;
    triggerSync();
  }, [isAuthenticated]);

  // Initial sync on mount
  useEffect(() => {
    sync();
  }, [sync]);

  // Sync whenever app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') sync();
    });
    return () => sub.remove();
  }, [sync]);

  return { sync };
}
