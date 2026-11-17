import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import { palettes, type ColorSchemeName } from './tokens';

export function createNavigationTheme(scheme: ColorSchemeName): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const c = palettes[scheme];
  return {
    ...base,
    dark: scheme === 'dark',
    colors: {
      ...base.colors,
      primary: c.accent,
      background: c.background,
      card: c.background,
      text: c.textPrimary,
      border: c.border,
      notification: c.accent,
    },
  };
}
