/**
 * THE BREAKDOWN — Design Tokens
 *
 * Single import point for ALL design tokens.
 *
 * Usage:
 *   import { colors, spacing, typography } from '@/design-system/tokens';
 *   // or
 *   import { semantic } from '@/design-system/tokens';
 *
 * Every component reads from here. No magic values anywhere.
 */

// Colors
export { palette, semantic } from '../colors';
export type { ThemeMode } from '../colors';

// Typography
export { fonts, scale as typeScale, heading as headingScale, weight as fontWeight } from '../typography';

// Spacing
export { scale as spacingScale, layout as spacingLayout } from '../spacing';
export type { SpacingKey } from '../spacing';

// Borders
export { radius as borderRadius, width as borderWidth, border as borders } from './borders';
export type { BorderRadiusKey, BorderWidthKey } from './borders';

// Shadows
export { shadows } from './shadows';
export type { ShadowKey } from './shadows';

// Motion
export { duration as motionDuration, easing as motionEasing, keyframes as motionKeyframes, transitions as motionTransitions } from '../animations';
export type { DurationKey, EasingKey, TransitionKey } from '../animations';

// Breakpoints
export { breakpoints, mediaQuery } from './breakpoints';
export type { BreakpointKey } from './breakpoints';

// Z-Index
export { zIndex } from './z-index';
export type { ZIndexKey } from './z-index';

// Opacity
export { opacity } from './opacity';
export type { OpacityKey } from './opacity';
