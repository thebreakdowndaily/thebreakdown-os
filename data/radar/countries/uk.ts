import type { CountryPack } from './types';

export const UK_COUNTRY_PACK: CountryPack = {
  countryCode: 'GB',
  countryName: 'United Kingdom',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'cy'],
  administrativeLevels: [
    { levelNumber: 0, nameKey: 'country', displayName: 'Country' },
    { levelNumber: 1, nameKey: 'nation', displayName: 'Constituent Nation' },
    { levelNumber: 2, nameKey: 'authority', displayName: 'County / Unitary Authority' },
    { levelNumber: 3, nameKey: 'borough', displayName: 'Borough / District' },
  ],
  nodes: {
    uk: {
      id: 'uk',
      countryCode: 'GB',
      name: 'United Kingdom',
      level: 'country',
      latitude: 55.3781,
      longitude: -3.436,
      aliases: ['United Kingdom', 'UK', 'Britain', 'Great Britain'],
    },
    'uk-england': {
      id: 'uk-england',
      countryCode: 'GB',
      name: 'England',
      level: 'nation',
      parentId: 'uk',
      latitude: 52.3555,
      longitude: -1.1743,
      aliases: ['England'],
    },
    'uk-scotland': {
      id: 'uk-scotland',
      countryCode: 'GB',
      name: 'Scotland',
      level: 'nation',
      parentId: 'uk',
      latitude: 56.4907,
      longitude: -4.2026,
      aliases: ['Scotland'],
    },
  },
  discoveryPatterns: [
    {
      beat: 'government',
      institutionKeywords: ['Cabinet Office', 'Department', 'Ministry', 'Council', 'HM Government'],
      domainSuffixes: ['.gov.uk'],
      officialFeedPatterns: ['/news/feed', '/announcements.atom'],
      authorityWeight: 'PRIMARY',
    },
    {
      beat: 'courts',
      institutionKeywords: ['Judiciary', 'Crown Court', 'Magistrates Court', 'High Court'],
      domainSuffixes: ['judiciary.uk', '.gov.uk'],
      officialFeedPatterns: ['/judgments/feed', '/rss'],
      authorityWeight: 'JUDICIAL',
    },
  ],
};
