/**
 * THE BREAKDOWN — Design Token Types
 *
 * The foundation of the design system. Every token is typed
 * and documented. No magic values anywhere.
 */

// ── Color Tokens ────────────────────────────────────────────────────────

export interface ColorTokens {
  // Brand
  brand: {
    50: string; 100: string; 200: string; 300: string; 400: string;
    500: string; 600: string; 700: string; 800: string; 900: string;
    950: string;
  };
  // Neutrals
  neutral: {
    50: string; 100: string; 200: string; 300: string; 400: string;
    500: string; 600: string; 700: string; 800: string; 900: string;
    950: string;
  };
  // Semantic
  success: { light: string; DEFAULT: string; dark: string };
  warning: { light: string; DEFAULT: string; dark: string };
  error: { light: string; DEFAULT: string; dark: string };
  info: { light: string; DEFAULT: string; dark: string };
  // Surfaces (theme-aware)
  bg: { primary: string; secondary: string; tertiary: string };
  text: { primary: string; secondary: string; muted: string; inverse: string };
  border: { DEFAULT: string; hover: string; active: string };
}

export interface SemanticColors {
  light: ColorTokens;
  dark: ColorTokens;
}

// ── Typography Tokens ───────────────────────────────────────────────────

export interface FontFamilyTokens {
  sans: string;
  serif: string;
  mono: string;
  display: string;
}

export interface TypeScaleToken {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  fontWeight: number;
}

export interface TypographyTokens {
  fontFamily: FontFamilyTokens;
  /** Text scales — xs through 6xl */
  scale: Record<'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl', TypeScaleToken>;
  /** Heading scale — h1 through h6 */
  heading: Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', TypeScaleToken>;
  /** Font weights */
  weight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
}

// ── Spacing Tokens ──────────────────────────────────────────────────────

export interface SpacingTokens {
  /** 0 through 96 — 4px base scale */
  scale: Record<0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64 | 72 | 80 | 96, string>;
  /** Named layout spacings */
  layout: {
    pagePadding: Record<'mobile' | 'tablet' | 'desktop', string>;
    sectionGap: Record<'sm' | 'md' | 'lg', string>;
    componentGap: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>;
  };
}

// ── Border Tokens ───────────────────────────────────────────────────────

export interface BorderTokens {
  radius: {
    none: string;
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  width: {
    none: string;
    hairline: string;
    thin: string;
    DEFAULT: string;
    thick: string;
  };
}

// ── Shadow Tokens ───────────────────────────────────────────────────────

export interface ShadowTokens {
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  glow: Record<'sm' | 'DEFAULT' | 'lg', string>;
}

// ── Motion Tokens ───────────────────────────────────────────────────────

export interface MotionTokens {
  duration: {
    instant: string;
    fast: string;
    DEFAULT: string;
    slow: string;
    slower: string;
    slowest: string;
  };
  easing: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
    bounce: string;
    emphasize: string;
  };
  keyframes: Record<string, string>;
}

// ── Breakpoint Tokens ───────────────────────────────────────────────────

export interface BreakpointTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// ── Z-Index Tokens ──────────────────────────────────────────────────────

export interface ZIndexTokens {
  base: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  popover: number;
  toast: number;
  tooltip: number;
}

// ── Opacity Tokens ──────────────────────────────────────────────────────

export interface OpacityTokens {
  none: number;
  low: number;
  medium: number;
  high: number;
  full: number;
  hover: number;
  disabled: number;
}

// ── Icon Tokens ─────────────────────────────────────────────────────────

export interface IconTokens {
  size: Record<'xs' | 'sm' | 'DEFAULT' | 'lg' | 'xl' | '2xl', string>;
}

// ── Complete Design Token Set ───────────────────────────────────────────

export interface DesignTokens {
  colors: SemanticColors;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  motion: MotionTokens;
  breakpoints: BreakpointTokens;
  zIndex: ZIndexTokens;
  opacity: OpacityTokens;
  icons: IconTokens;
}
