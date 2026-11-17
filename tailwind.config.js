/**
 * Minimal Performance UI — NativeWind mapping.
 * Colors resolve through CSS variables set by ThemeProvider (src/theme/themeVars.ts),
 * so the same class works in dark and light mode. Canonical hex values live in
 * src/theme/tokens.ts.
 */
const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: color('background'),
        surface: color('surface'),
        'surface-elevated': color('surface-elevated'),
        border: color('border'),
        accent: color('accent'),
        'on-accent': color('on-accent'),
        'text-primary': color('text-primary'),
        'text-secondary': color('text-secondary'),
        'text-muted': color('text-muted'),
        danger: color('danger'),
        success: color('success'),
        warning: color('warning'),
        mint: color('mint'),
        lilac: color('lilac'),
        lime: color('lime'),
      },
      fontSize: {
        display: ['30px', { lineHeight: '36px', fontWeight: '700' }],
        title: ['21px', { lineHeight: '27px', fontWeight: '700' }],
        'card-title': ['17px', { lineHeight: '23px', fontWeight: '600' }],
        body: ['15px', { lineHeight: '21px' }],
        label: ['13px', { lineHeight: '18px' }],
      },
      borderRadius: {
        sm: '12px',
        md: '14px',
        lg: '18px',
      },
      spacing: {
        gutter: '20px',
      },
    },
  },
  plugins: [],
};
