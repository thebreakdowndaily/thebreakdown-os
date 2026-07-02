/**
 * THE BREAKDOWN — Shadow Tokens
 *
 * Box shadow scale. Shadows use semantic colors to stay theme-aware.
 * Glow shadows use the brand color for emphasis.
 */

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  glow: {
    sm: '0 0 8px rgb(245 158 11 / 0.3)',
    DEFAULT: '0 0 16px rgb(245 158 11 / 0.35)',
    lg: '0 0 32px rgb(245 158 11 / 0.4)',
  },
} as const;

export type ShadowKey = keyof typeof shadows;
