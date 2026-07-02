/**
 * THE BREAKDOWN — Typography Tokens
 *
 * Type scale, font families, and font weights.
 * Scale follows a 1.25 (major third) ratio for harmonious sizing.
 */

export const fonts = {
  family: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "'Merriweather', Georgia, 'Times New Roman', serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
    display: "'Inter', system-ui, sans-serif",
  },
  url: {
    inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    merriweather: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap',
    jetbrains: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap',
  },
} as const;

export const scale = {
  xs: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: 400 },
  sm: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 400 },
  base: { fontSize: '1rem', lineHeight: '1.625rem', fontWeight: 400 },
  lg: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: 400 },
  xl: { fontSize: '1.25rem', lineHeight: '1.875rem', fontWeight: 500 },
  '2xl': { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 600 },
  '3xl': { fontSize: '1.875rem', lineHeight: '2.375rem', fontWeight: 600 },
  '4xl': { fontSize: '2.25rem', lineHeight: '2.75rem', fontWeight: 700 },
  '5xl': { fontSize: '3rem', lineHeight: '3.5rem', fontWeight: 700 },
  '6xl': { fontSize: '3.75rem', lineHeight: '4.25rem', fontWeight: 800 },
} as const;

export const heading = {
  h1: { fontSize: '2.25rem', lineHeight: '2.75rem', fontWeight: 700, letterSpacing: '-0.025em' },
  h2: { fontSize: '1.875rem', lineHeight: '2.375rem', fontWeight: 600, letterSpacing: '-0.02em' },
  h3: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 600, letterSpacing: '-0.015em' },
  h4: { fontSize: '1.25rem', lineHeight: '1.875rem', fontWeight: 600 },
  h5: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: 600 },
  h6: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 600 },
} as const;

export const weight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;
