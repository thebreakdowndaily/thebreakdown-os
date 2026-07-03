/**
 * THE BREAKDOWN — Tailwind CSS Configuration
 *
 * Maps every design system token to a Tailwind utility class.
 * This ensures:
 *   1. Existing components using Tailwind classes (bg-gray-800, text-gray-100) 
 *      resolve to CSS variables from the design system
 *   2. New components using DS tokens get consistent values
 *   3. Theme switching works via [data-theme="dark"]
 *   4. Migration path: Tailwind classes → DS components is gradual
 *
 * Design tokens are defined in:
 *   colors/  — palette.ts + semantic.ts
 *   typography/ — scale.ts
 *   spacing/ — scale.ts
 *   tokens/  — borders.ts, shadows.ts, breakpoints.ts
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './design-system/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      // ── Colors ────────────────────────────────────────────────────
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
          950: 'var(--color-brand-950)',
        },
        surface: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          hover: 'var(--color-border-hover)',
          active: 'var(--color-border-active)',
        },
        success: {
          light: 'var(--color-success-light)',
          DEFAULT: 'var(--color-success)',
          dark: 'var(--color-success-dark)',
        },
        warning: {
          light: 'var(--color-warning-light)',
          DEFAULT: 'var(--color-warning)',
          dark: 'var(--color-warning-dark)',
        },
        error: {
          light: 'var(--color-error-light)',
          DEFAULT: 'var(--color-error)',
          dark: 'var(--color-error-dark)',
        },
        info: {
          light: 'var(--color-info-light)',
          DEFAULT: 'var(--color-info)',
          dark: 'var(--color-info-dark)',
        },
      },

      // ── Typography ────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--text-xs--line-height)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--text-sm--line-height)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--text-base--line-height)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--text-lg--line-height)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--text-xl--line-height)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--text-2xl--line-height)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--text-3xl--line-height)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--text-4xl--line-height)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--text-5xl--line-height)' }],
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--text-6xl--line-height)' }],
      },
      fontWeight: {
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
      },

      // ── Spacing ───────────────────────────────────────────────────
      spacing: {
        '0-5': 'var(--spacing-0-5)',
        '1-5': 'var(--spacing-1-5)',
        '2-5': 'var(--spacing-2-5)',
        '3-5': 'var(--spacing-3-5)',
        0: 'var(--spacing-0)',
        0.5: 'var(--spacing-0-5)',
        1: 'var(--spacing-1)',
        1.5: 'var(--spacing-1-5)',
        2: 'var(--spacing-2)',
        2.5: 'var(--spacing-2-5)',
        3: 'var(--spacing-3)',
        3.5: 'var(--spacing-3-5)',
        4: 'var(--spacing-4)',
        5: 'var(--spacing-5)',
        6: 'var(--spacing-6)',
        7: 'var(--spacing-7)',
        8: 'var(--spacing-8)',
        9: 'var(--spacing-9)',
        10: 'var(--spacing-10)',
        11: 'var(--spacing-11)',
        12: 'var(--spacing-12)',
        14: 'var(--spacing-14)',
        16: 'var(--spacing-16)',
        20: 'var(--spacing-20)',
        24: 'var(--spacing-24)',
        28: 'var(--spacing-28)',
        32: 'var(--spacing-32)',
        36: 'var(--spacing-36)',
        40: 'var(--spacing-40)',
        44: 'var(--spacing-44)',
        48: 'var(--spacing-48)',
        52: 'var(--spacing-52)',
        56: 'var(--spacing-56)',
        60: 'var(--spacing-60)',
        64: 'var(--spacing-64)',
        72: 'var(--spacing-72)',
        80: 'var(--spacing-80)',
        96: 'var(--spacing-96)',
      },

      // ── Border Radius ─────────────────────────────────────────────
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-default)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      borderWidth: {
        none: 'var(--border-none)',
        hairline: 'var(--border-hairline)',
        thin: 'var(--border-thin)',
        DEFAULT: 'var(--border-default)',
        thick: 'var(--border-thick)',
      },

      // ── Box Shadow ────────────────────────────────────────────────
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-default)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        'glow-sm': 'var(--shadow-glow-sm)',
        glow: 'var(--shadow-glow)',
        'glow-lg': 'var(--shadow-glow-lg)',
      },

      // ── Animation ─────────────────────────────────────────────────
      animation: {
        'fade-in': 'fadeIn var(--duration-default) var(--easing-out) forwards',
        'slide-up': 'slideUp var(--duration-default) var(--easing-out) forwards',
        'slide-down': 'slideDown var(--duration-default) var(--easing-out) forwards',
        'slide-in-right': 'slideInRight 300ms var(--easing-out) forwards',
        'scale-in': 'scaleIn var(--duration-default) var(--easing-out) forwards',
        shimmer: 'shimmer 1.5s var(--easing-in-out) infinite',
        spin: 'spin 1s var(--easing-linear) infinite',
        pulse: 'pulse 2s var(--easing-in-out) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },

      // ── Transition Duration + Timing ──────────────────────────────
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        DEFAULT: 'var(--duration-default)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
        slowest: 'var(--duration-slowest)',
      },
      transitionTimingFunction: {
        'ease-in': 'var(--easing-in)',
        'ease-out': 'var(--easing-out)',
        'ease-in-out': 'var(--easing-in-out)',
        bounce: 'var(--easing-bounce)',
        emphasize: 'var(--easing-emphasize)',
      },

      // ── Z-Index ───────────────────────────────────────────────────
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },

      // ── Opacity ───────────────────────────────────────────────────
      opacity: {
        none: 'var(--opacity-none)',
        low: 'var(--opacity-low)',
        medium: 'var(--opacity-medium)',
        high: 'var(--opacity-high)',
        hover: 'var(--opacity-hover)',
        disabled: 'var(--opacity-disabled)',
      },
    },
  },
  plugins: [],
};

export default config;
