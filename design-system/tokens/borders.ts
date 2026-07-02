/**
 * THE BREAKDOWN — Border Tokens
 *
 * Border radius and width scales.
 * Border colors use semantic color tokens (never hardcoded).
 */

export const radius = {
  none: '0px',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // pill
} as const;

export const width = {
  none: '0px',
  hairline: '0.5px',
  thin: '1px',
  DEFAULT: '1px',
  thick: '2px',
} as const;

export const border = {
  radius,
  width,
} as const;

export type BorderRadiusKey = keyof typeof radius;
export type BorderWidthKey = keyof typeof width;
