import { useTheme } from './context';
import { darkColors, lightColors } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';

export function useColors(): ThemeColors {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? darkColors : lightColors;
}
