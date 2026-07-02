/**
 * THE BREAKDOWN — Opacity Tokens
 *
 * Consistent opacity values for overlays, disabled states, hover effects.
 */

export const opacity = {
  none: 0,
  low: 0.1,
  medium: 0.5,
  high: 0.75,
  full: 1,
  hover: 0.8,
  disabled: 0.4,
} as const;

export type OpacityKey = keyof typeof opacity;
