import { useMemo } from 'react';
import { create } from 'zustand';

import { AppTheme, createLayoutStyles, darkTheme, lightTheme } from '../theme/theme';

interface ThemeState {
  isDark: boolean;
  theme: AppTheme;
  toggleDark: () => void;
  setDark: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  theme: lightTheme,
  toggleDark: () =>
    set((state) => ({
      isDark: !state.isDark,
      theme: !state.isDark ? darkTheme : lightTheme,
    })),
  setDark: (value: boolean) =>
    set({
      isDark: value,
      theme: value ? darkTheme : lightTheme,
    }),
}));

export function useTheme() {
  return useThemeStore((s) => s.theme);
}

export function useLayoutStyles() {
  const theme = useTheme();
  return useMemo(() => createLayoutStyles(theme), [theme]);
}
