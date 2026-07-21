/**
 * Tailwind theme — the single source of truth for the Online Chasmewala design
 * tokens (colors, typography, radius, shadows, motion). Documented in
 * src/styles/design-system/.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        // Brand — teal / navy / cyan
        brand: {
          50: '#e6fafa',
          100: '#c0f2f2',
          200: '#8ce8e8',
          300: '#4dd9d9',
          400: '#1cc4c4',
          500: '#00a6a6', // primary
          600: '#008585',
          700: '#046a6a',
          800: '#0a5454',
          900: '#0d4646',
        },
        accent: {
          400: '#33dede',
          500: '#00d4d4', // cyan accent
          600: '#00b3b3',
        },
        navy: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#131f34',
          900: '#0f172a', // secondary / dark navy
        },
        success: { light: '#dcfce7', DEFAULT: '#16a34a', dark: '#15803d' },
        error: { light: '#fee2e2', DEFAULT: '#dc2626', dark: '#b91c1c' },
        warning: { light: '#fef3c7', DEFAULT: '#f59e0b', dark: '#b45309' },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc', // off-white
          subtle: '#f1f5f9', // light gray
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Type scale
        display: ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        h1: ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        h2: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        h3: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        caption: ['0.8125rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)',
        card: '0 2px 4px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.08)',
        elevated: '0 12px 32px rgba(15,23,42,0.12)',
        glass: '0 8px 32px rgba(15,23,42,0.10)',
        focus: '0 0 0 3px rgba(0,166,166,0.35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'catalog-enter': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'catalog-pan': {
          from: { opacity: '0', transform: 'scale(1.03)' },
          to: { opacity: '1', transform: 'scale(1.08)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'catalog-enter': 'catalog-enter 0.55s ease-out',
        'catalog-pan': 'catalog-pan 5.5s ease-out both',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
