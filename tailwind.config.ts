import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          // Backed by CSS variables so white-labelers can override via --color-brand
          red:          'rgb(var(--color-brand) / <alpha-value>)',
          'red-dark':   'rgb(var(--color-brand-dark) / <alpha-value>)',
          teal:         '#006DC4',
          'teal-light': '#00CFC4',
        },
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger:  'rgb(var(--color-danger)  / <alpha-value>)',
        neutral: {
          primary:      'rgb(var(--color-text) / <alpha-value>)',
          secondary:    'rgb(var(--color-text-secondary) / <alpha-value>)',
          tertiary:     'rgb(var(--color-text-secondary) / <alpha-value>)',
          border:       'rgb(var(--color-border) / <alpha-value>)',
          'border-warm':'rgb(var(--color-border-warm) / <alpha-value>)',
          surface:      'rgb(var(--color-bg) / <alpha-value>)',
          muted:        'rgb(var(--color-surface-2) / <alpha-value>)',
        },
        surface:    'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2':'rgb(var(--color-surface-2) / <alpha-value>)',
        bg:         'rgb(var(--color-bg) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-inter-tight)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
