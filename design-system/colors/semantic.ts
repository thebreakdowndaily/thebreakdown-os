/**
 * THE BREAKDOWN — Semantic Color Tokens
 *
 * Maps raw palette colors to semantic roles.
 * Supports light and dark themes.
 *
 * Every component should use semantic tokens, never palette values directly.
 * This ensures consistency and makes theming a configuration change.
 */

import { palette } from './palette';

export const semantic = {
  light: {
    brand: palette.amber,
    neutral: palette.zinc,

    success: {
      light: palette.emerald[100],
      DEFAULT: palette.emerald[500],
      dark: palette.emerald[700],
    },
    warning: {
      light: palette.orange[100],
      DEFAULT: palette.orange[500],
      dark: palette.orange[700],
    },
    error: {
      light: palette.red[100],
      DEFAULT: palette.red[500],
      dark: palette.red[700],
    },
    info: {
      light: palette.blue[100],
      DEFAULT: palette.blue[500],
      dark: palette.blue[700],
    },

    bg: {
      primary: palette.white,
      secondary: palette.zinc[50],
      tertiary: palette.zinc[100],
    },
    text: {
      primary: palette.zinc[900],
      secondary: palette.zinc[600],
      muted: palette.zinc[400],
      inverse: palette.white,
    },
    border: {
      DEFAULT: palette.zinc[200],
      hover: palette.zinc[300],
      active: palette.amber[400],
    },
  },

  dark: {
    brand: palette.amber,
    neutral: palette.zinc,

    success: {
      light: palette.emerald[900],
      DEFAULT: palette.emerald[400],
      dark: palette.emerald[300],
    },
    warning: {
      light: palette.orange[900],
      DEFAULT: palette.orange[400],
      dark: palette.orange[300],
    },
    error: {
      light: palette.red[900],
      DEFAULT: palette.red[400],
      dark: palette.red[300],
    },
    info: {
      light: palette.blue[900],
      DEFAULT: palette.blue[400],
      dark: palette.blue[300],
    },

    bg: {
      primary: palette.zinc[900],
      secondary: palette.zinc[800],
      tertiary: palette.zinc[700],
    },
    text: {
      primary: palette.zinc[100],
      secondary: palette.zinc[300],
      muted: palette.zinc[500],
      inverse: palette.zinc[900],
    },
    border: {
      DEFAULT: palette.zinc[700],
      hover: palette.zinc[600],
      active: palette.amber[400],
    },
  },
} as const;

export type ThemeMode = 'light' | 'dark';
