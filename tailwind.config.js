/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'deep-water': '#050D0B',
        'sea-depth': '#0C1C18',
        'liquid-mint': '#7EF0C8',
        'acid-lime': '#C8F06A',
        aqua: '#3EE0E8',
        lilac: '#A894F0',
        'text-primary': '#F2FFFB',
        'text-secondary': '#8FA89E',
        'text-muted': '#5F7A70',
      },
      fontSize: {
        hero: ['30px', { lineHeight: '36px', fontWeight: '700' }],
        title: ['22px', { lineHeight: '28px', fontWeight: '700' }],
        body: ['16px', { lineHeight: '22px' }],
        caption: ['13px', { lineHeight: '18px' }],
      },
      borderRadius: {
        sm: '12px',
        md: '18px',
        lg: '24px',
        xl: '32px',
      },
    },
  },
  plugins: [],
};
