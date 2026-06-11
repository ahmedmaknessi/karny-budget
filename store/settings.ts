import { create } from 'zustand';

export type Language = 'ar' | 'fr' | 'en';

interface SettingsState {
  language:     Language;
  baseCurrency: string;
  loaded:       boolean;
  setLanguage:  (lang: Language) => void;
  setCurrency:  (code: string) => void;
  setLoaded:    () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language:     'fr',
  baseCurrency: 'TND',
  loaded:       false,
  setLanguage:  (language)     => set({ language }),
  setCurrency:  (baseCurrency) => set({ baseCurrency }),
  setLoaded:    ()             => set({ loaded: true }),
}));
