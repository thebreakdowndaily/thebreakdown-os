/**
 * THE BREAKDOWN — Breakpoint Tokens
 *
 * Responsive breakpoints. Used by layout components and media queries.
 * Values in pixels (matching Tailwind defaults).
 */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const mediaQuery = {
  sm: `@media (min-width: ${String(breakpoints.sm)}px)`,
  md: `@media (min-width: ${String(breakpoints.md)}px)`,
  lg: `@media (min-width: ${String(breakpoints.lg)}px)`,
  xl: `@media (min-width: ${String(breakpoints.xl)}px)`,
  '2xl': `@media (min-width: ${String(breakpoints['2xl'])}px)`,
  motionSafe: '@media (prefers-reduced-motion: no-preference)',
  motionReduce: '@media (prefers-reduced-motion: reduce)',
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
} as const;

export type BreakpointKey = keyof typeof breakpoints;
