import { vars } from 'nativewind';

import { palettes, type ColorPalette, type ColorSchemeName } from './tokens';

/** Palette keys exposed to NativeWind as `rgb(var(--color-…) / <alpha>)`. */
const cssColorKeys = {
  background: '--color-background',
  surface: '--color-surface',
  surfaceElevated: '--color-surface-elevated',
  border: '--color-border',
  accent: '--color-accent',
  onAccent: '--color-on-accent',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  textMuted: '--color-text-muted',
  danger: '--color-danger',
  success: '--color-success',
  warning: '--color-warning',
  mint: '--color-mint',
  lilac: '--color-lilac',
  lime: '--color-lime',
} as const satisfies Partial<Record<keyof ColorPalette, string>>;

function hexToChannels(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function buildVars(palette: ColorPalette): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, cssName] of Object.entries(cssColorKeys)) {
    out[cssName] = hexToChannels(palette[key as keyof typeof cssColorKeys]);
  }
  return out;
}

export const themeVars: Record<ColorSchemeName, ReturnType<typeof vars>> = {
  dark: vars(buildVars(palettes.dark)),
  light: vars(buildVars(palettes.light)),
};
