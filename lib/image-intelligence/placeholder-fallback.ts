const PLACEHOLDER_BY_CATEGORY: Record<string, string> = {
  economy: 'economy',
  employment: 'economy',
  finance: 'economy',
  agriculture: 'economy',
  policy: 'policy',
  politics: 'policy',
  governance: 'policy',
  institutions: 'policy',
  geopolitics: 'policy',
  diplomacy: 'policy',
  technology: 'technology',
  cybersecurity: 'technology',
  education: 'education',
  health: 'health',
  healthcare: 'health',
  environment: 'environment',
  climate: 'environment',
  investigation: 'environment',
};

/**
 * Return a real, bundled placeholder for a story category.
 * Do not derive a filename directly from the category: many editorial category
 * labels (for example "geopolitics" or "governance") do not have SVGs of their own.
 */
export function getHeroImageFallbackPath(category?: string | null): string {
  const key = typeof category === 'string' ? category.trim().toLowerCase() : '';
  const placeholder = PLACEHOLDER_BY_CATEGORY[key] || 'policy';
  return `/images/placeholders/${placeholder}-placeholder.svg`;
}
