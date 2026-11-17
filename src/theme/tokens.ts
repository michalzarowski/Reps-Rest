/**
 * Minimal Performance UI — canonical design tokens.
 *
 * Colors exist in two palettes (dark is the default identity, light mirrors it).
 * NativeWind classes read the same values through CSS variables declared in
 * `themeVars` (see `src/theme/themeVars.ts` and `tailwind.config.js`).
 * Components that need raw values (SVG, navigation options, icons) read the
 * active palette via `useTheme()` from `@/context`.
 */

export interface ColorPalette {
  /** App background behind every screen. */
  background: string;
  /** Default card / panel surface. */
  surface: string;
  /** Raised surface: inputs, nested rows, pressed states. */
  surfaceElevated: string;
  /** Hairline borders and dividers. */
  border: string;
  /** Primary interactive accent (CTA, active tab, focus). */
  accent: string;
  /** Translucent accent wash for selected chips and icon wells. */
  accentSoft: string;
  /** Text / icons placed on top of `accent`. */
  onAccent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  dangerSoft: string;
  success: string;
  warning: string;
  /** Secondary data colors — charts, plates, timer phases only. */
  mint: string;
  lilac: string;
  lime: string;
  /** Dark scrim for text over images. */
  overlay: string;
}

export type ColorSchemeName = 'dark' | 'light';

export const palettes: Record<ColorSchemeName, ColorPalette> = {
  dark: {
    background: '#071310',
    surface: '#11211F',
    surfaceElevated: '#172B28',
    border: '#1B3531',
    accent: '#3DD9D0',
    accentSoft: 'rgba(61, 217, 208, 0.14)',
    onAccent: '#04201D',
    textPrimary: '#F1F7F4',
    textSecondary: '#9BB0AA',
    textMuted: '#6F8680',
    danger: '#FF7A85',
    dangerSoft: 'rgba(255, 122, 133, 0.12)',
    success: '#5FD69A',
    warning: '#F2C46D',
    mint: '#7EE0B8',
    lilac: '#A99BF0',
    lime: '#C8F06A',
    overlay: 'rgba(7, 19, 16, 0.72)',
  },
  light: {
    background: '#F3F7F5',
    surface: '#FFFFFF',
    surfaceElevated: '#E9F1EE',
    border: '#D4E2DD',
    accent: '#0B7F79',
    accentSoft: 'rgba(11, 127, 121, 0.10)',
    onAccent: '#FFFFFF',
    textPrimary: '#0D1F1B',
    textSecondary: '#4A605A',
    textMuted: '#62766F',
    danger: '#C3354A',
    dangerSoft: 'rgba(195, 53, 74, 0.08)',
    success: '#1E8A5A',
    warning: '#9A6A00',
    mint: '#1E9E70',
    lilac: '#6B5BD6',
    lime: '#6E8F12',
    overlay: 'rgba(7, 19, 16, 0.62)',
  },
};

/** Shared spacing scale: 4 / 8 / 12 / 16 / 24 / 32. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  /** Inputs, chips inside cards. */
  sm: 12,
  /** Buttons. */
  md: 14,
  /** Cards. */
  lg: 18,
  pill: 999,
} as const;

/** Font sizes — one size per role. Mirror in tailwind `fontSize`. */
export const typography = {
  display: 30,
  title: 21,
  cardTitle: 17,
  body: 15,
  label: 13,
} as const;

export const iconSize = {
  sm: 18,
  md: 22,
  lg: 26,
} as const;

/** Single stroke width for all Lucide icons. */
export const iconStroke = 2;

export const layout = {
  /** Horizontal screen gutter. */
  screenPadding: 20,
  /** Vertical gap between screen sections. */
  sectionGap: 24,
  /** Minimum touch target. */
  minTouch: 44,
  /** Readable content width cap for web / tablets. */
  maxContentWidth: 640,
} as const;

export const motion = {
  pressScale: 0.98,
  pressDurationMs: 90,
} as const;
