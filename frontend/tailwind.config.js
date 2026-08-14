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
          50: '#E7F3F2',
          100: '#CFE8E6',
          200: '#A8D6D3',
          300: '#72BDB9',
          400: '#16B8B2',
          500: '#087F7B', // refined teal
          600: '#066A67',
          700: '#055856',
          800: '#044846',
          900: '#033837',
        },
        accent: {
          400: '#D7B979',
          500: '#C9A45C', // champagne gold, used sparingly
          600: '#A8833E',
        },
        navy: {
          50: '#EEF2F4',
          100: '#D9E1E8',
          200: '#CBD5DF',
          300: '#8A99AA',
          400: '#526174',
          500: '#3D4B5D',
          600: '#2C394B',
          700: '#202C3D',
          800: '#111827',
          900: '#0B1428', // deep ink navy
        },
        success: { light: '#E7F3F2', DEFAULT: '#087F7B', dark: '#066A67' },
        error: { light: '#FBE9E7', DEFAULT: '#D95C55', dark: '#B84540' },
        warning: { light: '#F7F0E0', DEFAULT: '#C9A45C', dark: '#8D6B32' },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F9F7', // soft ivory
          subtle: '#EEF2F4', // cool mist
        },
        hero: '#F4F7F6',
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
        soft: '0 1px 2px rgba(11,20,40,0.035), 0 2px 8px rgba(11,20,40,0.045)',
        card: '0 2px 5px rgba(11,20,40,0.035), 0 8px 22px rgba(11,20,40,0.06)',
        elevated: '0 12px 30px rgba(11,20,40,0.09)',
        glass: '0 8px 28px rgba(11,20,40,0.08)',
        focus: '0 0 0 3px rgba(8,127,123,0.28)',
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
        'catalog-pan': 'catalog-pan 5s ease-out both',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
