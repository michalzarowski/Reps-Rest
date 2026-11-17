/** Aquatic Liquid Glass — canonical design tokens. Mirror hex values in tailwind.config.js. */

export const colors = {
  deepWater: '#050D0B',
  seaDepth: '#0C1C18',
  liquidMint: '#7EF0C8',
  /** Primary interactive / active glow (moodboard cyan-teal). */
  aqua: '#3EE0E8',
  acidLime: '#C8F06A',
  lilac: '#A894F0',
  textPrimary: '#F2FFFB',
  textSecondary: '#8FA89E',
  textMuted: '#5F7A70',

  glassFill: 'rgba(62, 224, 232, 0.06)',
  glassBorder: 'rgba(62, 224, 232, 0.22)',
  glassHighlight: 'rgba(242, 255, 251, 0.2)',
  androidGlassFill: 'rgba(12, 28, 24, 0.92)',
  overlay: 'rgba(5, 13, 11, 0.62)',
  mintGlow: 'rgba(126, 240, 200, 0.22)',
  aquaGlow: 'rgba(62, 224, 232, 0.35)',
  activeGlow: 'rgba(62, 224, 232, 0.28)',
  danger: '#FF6B7A',
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  hero: 30,
  title: 22,
  body: 16,
  caption: 13,
} as const;

export const iconSize = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
} as const;

export const motion = {
  pressScale: 0.97,
} as const;

export const shadows = {
  softGlow: {
    shadowColor: '#3EE0E8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const layout = {
  tabBarHeight: 68,
  tabBarBottomOffset: 10,
  screenBottomInset: 100,
} as const;
