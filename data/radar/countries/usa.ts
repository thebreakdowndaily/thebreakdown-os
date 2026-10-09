import type { CountryPack } from './types';

export const USA_COUNTRY_PACK: CountryPack = {
  countryCode: 'US',
  countryName: 'United States',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'es'],
  administrativeLevels: [
    { levelNumber: 0, nameKey: 'country', displayName: 'Country / Federal' },
    { levelNumber: 1, nameKey: 'state', displayName: 'State / Territory' },
    { levelNumber: 2, nameKey: 'county', displayName: 'County / Parish / Borough' },
    { levelNumber: 3, nameKey: 'city', displayName: 'City / Township' },
  ],
  nodes: {
    us: {
      id: 'us',
      countryCode: 'US',
      name: 'United States',
      level: 'country',
      latitude: 37.0902,
      longitude: -95.7129,
      aliases: ['United States', 'USA', 'U.S.'],
    },
    'us-ca': {
      id: 'us-ca',
      countryCode: 'US',
      name: 'California',
      level: 'state',
      parentId: 'us',
      latitude: 36.7783,
      longitude: -119.4179,
      aliases: ['California', 'CA', 'State of California'],
    },
    'us-ny': {
      id: 'us-ny',
      countryCode: 'US',
      name: 'New York',
      level: 'state',
      parentId: 'us',
      latitude: 40.7128,
      longitude: -74.006,
      aliases: ['New York', 'NY', 'New York State'],
    },
  },
  discoveryPatterns: [
    {
      beat: 'government',
      institutionKeywords: ['Department', 'Governor', 'Mayor', 'County Board', 'Secretary of State'],
      domainSuffixes: ['.gov', '.us'],
      officialFeedPatterns: ['/news/feed', '/rss', '/press-releases'],
      authorityWeight: 'PRIMARY',
    },
    {
      beat: 'courts',
      institutionKeywords: ['Supreme Court', 'Appellate Court', 'District Court', 'Judicial Council'],
      domainSuffixes: ['.uscourts.gov', '.gov'],
      officialFeedPatterns: ['/opinions', '/orders', '/docket/rss'],
      authorityWeight: 'JUDICIAL',
    },
    {
      beat: 'public_safety',
      institutionKeywords: ['Sheriff', 'Police Department', 'State Police', 'Highway Patrol'],
      domainSuffixes: ['.gov', '.org'],
      officialFeedPatterns: ['/news', '/alerts/rss', '/press'],
      authorityWeight: 'PRIMARY',
    },
  ],
};
