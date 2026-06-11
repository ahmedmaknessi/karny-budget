import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePref = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
  theme:         ThemePref;
  resolvedTheme: ResolvedTheme;
  setTheme:      (pref: ThemePref) => void;
}

const STORAGE_KEY = '@karny_theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme:         'system',
  resolvedTheme: 'dark',
  setTheme:      () => {},
});

function resolveTheme(pref: ThemePref): ResolvedTheme {
  if (pref === 'system') {
    return Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
  }
  return pref;
}

interface ThemeProviderProps {
  children:     ReactNode;
  initialTheme?: ThemePref;
}

export function ThemeProvider({ children, initialTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePref>(initialTheme);
  const [resolvedTheme, setResolved] = useState<ResolvedTheme>(() => resolveTheme(initialTheme));

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        setThemeState(stored);
        setResolved(resolveTheme(stored));
      }
    });
  }, []);

  // Watch system appearance changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setResolved(colorScheme === 'light' ? 'light' : 'dark');
    });

    return () => sub.remove();
  }, [theme]);

  const setTheme = useCallback((pref: ThemePref) => {
    setThemeState(pref);
    setResolved(resolveTheme(pref));
    AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
