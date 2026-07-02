/**
 * THE BREAKDOWN — Animation / Motion Tokens
 *
 * Every animation in the UI uses these tokens.
 * Durations, easings, and keyframes are defined once and referenced by name.
 */

export const duration = {
  instant: '50ms',
  fast: '150ms',
  DEFAULT: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '700ms',
} as const;

export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  emphasize: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideUp: {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  slideDown: {
    from: { opacity: 0, transform: 'translateY(-8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
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
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
} as const;

export const transitions = {
  fast: `${duration.fast} ${easing.out}`,
  DEFAULT: `${duration.DEFAULT} ${easing.inOut}`,
  slow: `${duration.slow} ${easing.inOut}`,
  bounce: `${duration.slow} ${easing.bounce}`,
  emphasize: `${duration.DEFAULT} ${easing.emphasize}`,
} as const;

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
export type TransitionKey = keyof typeof transitions;
