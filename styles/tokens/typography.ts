// styles/tokens/typography.ts
export const typography = {
  // Font families
  fontFamily: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
    display: 'var(--font-display)',
  },
  // Font sizes with line heights
  fontSize: {
    xs: ['var(--text-xs)', { lineHeight: 'var(--text-xs--line-height)' }],
    sm: ['var(--text-sm)', { lineHeight: 'var(--text-sm--line-height)' }],
    base: ['var(--text-base)', { lineHeight: 'var(--text-base--line-height)' }],
    lg: ['var(--text-lg)', { lineHeight: 'var(--text-lg--line-height)' }],
    xl: ['var(--text-xl)', { lineHeight: 'var(--text-xl--line-height)' }],
    '2xl': ['var(--text-2xl)', { lineHeight: 'var(--text-2xl--line-height)' }],
    '3xl': ['var(--text-3xl)', { lineHeight: 'var(--text-3xl--line-height)' }],
    '4xl': ['var(--text-4xl)', { lineHeight: 'var(--text-4xl--line-height)' }],
    '5xl': ['var(--text-5xl)', { lineHeight: 'var(--text-5xl--line-height)' }],
    '6xl': ['var(--text-6xl)', { lineHeight: 'var(--text-6xl--line-height)' }],
  },
  // Font weights
  fontWeight: {
    light: 'var(--font-weight-light)',
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
    extrabold: 'var(--font-weight-extrabold)',
  },
};
