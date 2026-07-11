export type ImagePriority = 1 | 2 | 3 | 4;

export interface ImageCandidate {
  src: string;
  priority: ImagePriority;
  label: string;
  type: 'official' | 'editorial' | 'creative-commons' | 'ai-illustration' | 'branded-placeholder';
  width?: number;
  height?: number;
  alt: string;
  credit?: string;
  agency?: string;
  license?: string;
  sourceUrl?: string;
}

export interface ImageSpec {
  hero: ImageCandidate;
  thumbnail?: ImageCandidate;
  og?: ImageCandidate;
  fallback: string;
}

export interface ImageRegistryEntry {
  id: string;
  label: string;
  officialImages: ImageCandidate[];
  editorialImages: ImageCandidate[];
  ccImages: ImageCandidate[];
  aiIllustrations: ImageCandidate[];
  defaultPlaceholder: string;
}

const officialImages: Record<string, ImageCandidate[]> = {
  'india': [
    { src: '/images/entities/india.jpg', priority: 1, label: 'India flag and parliament', type: 'official', alt: 'Republic of India — flag and Parliament House', credit: 'PIB', agency: 'Government of India', license: 'PUBLIC_DOMAIN' },
  ],
  'rbi': [
    { src: '/images/entities/rbi.jpg', priority: 1, label: 'Reserve Bank of India headquarters', type: 'official', alt: 'Reserve Bank of India headquarters, Mumbai', credit: 'RBI', agency: 'RBI', license: 'PUBLIC_DOMAIN' },
  ],
  'un': [
    { src: '/images/entities/un.jpg', priority: 1, label: 'United Nations headquarters', type: 'official', alt: 'United Nations headquarters, New York', credit: 'UN Photo', agency: 'United Nations', license: 'CC-BY-NC' },
  ],
  'who': [
    { src: '/images/entities/who.jpg', priority: 1, label: 'World Health Organization headquarters', type: 'official', alt: 'World Health Organization headquarters, Geneva', credit: 'WHO', agency: 'WHO', license: 'PUBLIC_DOMAIN' },
  ],
  'world-bank': [
    { src: '/images/entities/world-bank.jpg', priority: 1, label: 'World Bank headquarters', type: 'official', alt: 'World Bank Group headquarters, Washington DC', credit: 'World Bank', agency: 'World Bank', license: 'CC-BY-NC' },
  ],
  'imf': [
    { src: '/images/entities/imf.jpg', priority: 1, label: 'IMF headquarters', type: 'official', alt: 'International Monetary Fund headquarters, Washington DC', credit: 'IMF', agency: 'IMF', license: 'PUBLIC_DOMAIN' },
  ],
  'cag': [
    { src: '/images/entities/cag.jpg', priority: 1, label: 'CAG India logo', type: 'official', alt: 'Comptroller and Auditor General of India', credit: 'CAG', agency: 'CAG India', license: 'PUBLIC_DOMAIN' },
  ],
  'election-commission': [
    { src: '/images/entities/election-commission.jpg', priority: 1, label: 'Election Commission of India', type: 'official', alt: 'Election Commission of India', credit: 'ECI', agency: 'ECI', license: 'PUBLIC_DOMAIN' },
  ],
  'mgnrega': [
    { src: '/images/entities/mgnrega.jpg', priority: 1, label: 'MGNREGA logo', type: 'official', alt: 'MGNREGA — Mahatma Gandhi National Rural Employment Guarantee Act', credit: 'MoRD', agency: 'Ministry of Rural Development', license: 'PUBLIC_DOMAIN' },
  ],
};

const editorialImages: Record<string, ImageCandidate[]> = {};

const ccImages: Record<string, ImageCandidate[]> = {};

const aiIllustrations: Record<string, ImageCandidate[]> = {};

const staticPlaceholders: Record<string, string> = {
  economy: '/images/placeholders/economy-placeholder.svg',
  technology: '/images/placeholders/technology-placeholder.svg',
  health: '/images/placeholders/health-placeholder.svg',
  environment: '/images/placeholders/environment-placeholder.svg',
  policy: '/images/placeholders/policy-placeholder.svg',
  education: '/images/placeholders/education-placeholder.svg',
  investigation: '/images/placeholders/investigation-placeholder.svg',
  story: '/images/placeholders/story-placeholder.svg',
  entity: '/images/placeholders/entity-placeholder.svg',
  person: '/images/placeholders/person-placeholder.svg',
  organization: '/images/placeholders/organization-placeholder.svg',
  country: '/images/placeholders/country-placeholder.svg',
};

export function getPlaceholder(type: string): string {
  return staticPlaceholders[type] || staticPlaceholders.story || '/images/placeholders/story-placeholder.svg';
}

export function findImage(entityId: string): ImageCandidate | null {
  const official = officialImages[entityId]?.[0];
  if (official) return official;
  const editorial = editorialImages[entityId]?.[0];
  if (editorial) return editorial;
  const cc = ccImages[entityId]?.[0];
  if (cc) return cc;
  const ai = aiIllustrations[entityId]?.[0];
  if (ai) return ai;
  return null;
}
