/**
 * THE BREAKDOWN — Animation Utilities
 *
 * Pre-built animation classes and helper functions.
 * Components use these rather than writing one-off animations.
 */

import { duration, easing, transitions } from './keyframes';

export const classes = {
  fadeIn: `animate-fadeIn ${duration.DEFAULT} ${easing.out} forwards`,
  slideUp: `animate-slideUp ${duration.DEFAULT} ${easing.out} forwards`,
  slideDown: `animate-slideDown ${duration.DEFAULT} ${easing.out} forwards`,
  scaleIn: `animate-scaleIn ${duration.DEFAULT} ${easing.out} forwards`,
  shimmer: `animate-shimmer 1.5s ${easing.inOut} infinite`,
  spin: `animate-spin 1s ${easing.linear} infinite`,
  pulse: `animate-pulse 2s ${easing.inOut} infinite`,
} as const;

export const stagger = (childCount: number, baseDelay: number = 80): string[] => {
  return Array.from({ length: childCount }, (_, i) =>
    `${classes.fadeIn} animate-delay-${i * baseDelay}`
  );
};

export const transition = {
  all: `all ${transitions.DEFAULT}`,
  colors: `color ${transitions.DEFAULT}, background-color ${transitions.DEFAULT}, border-color ${transitions.DEFAULT}`,
  transform: `transform ${transitions.DEFAULT}`,
  opacity: `opacity ${transitions.DEFAULT}`,
  shadow: `box-shadow ${transitions.DEFAULT}`,
} as const;
