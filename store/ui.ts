import { create } from 'zustand';

type SyncStatus = 'synced' | 'pending' | 'retrying' | 'error';
export type ThemePref = 'dark' | 'light' | 'system';

interface UiState {
  syncStatus:    SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  theme:         ThemePref;
  setTheme:      (theme: ThemePref) => void;
}

export const useUiStore = create<UiState>((set) => ({
  syncStatus:    'synced',
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  theme:         'system',
  setTheme:      (theme) => set({ theme }),
}));
