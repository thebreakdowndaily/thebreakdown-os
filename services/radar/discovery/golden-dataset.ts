import type { SourceCandidate } from './types';

export interface DiscoveryGoldenFixture {
  id: string;
  name: string;
  description: string;
  candidate: SourceCandidate;
  expectedStatus: 'validated' | 'rejected';
  expectedRejectionReason?: string;
  fixtureType:
    | 'valid_official'
    | 'duplicate_source'
    | 'mirror_domain'
    | 'regional_news'
    | 'rss_endpoint'
    | 'pdf_gazette'
    | 'spa_portal'
    | 'dead_url'
    | 'malicious_ssrf'
    | 'content_farm'
    | 'multilingual_hindi';
}

export const DISCOVERY_GOLDEN_DATASET: DiscoveryGoldenFixture[] = [
  // 1. Valid Official Portal
  {
    id: 'gold-mp-official',
    name: 'MP Public Relations',
    description: 'Valid official government state press portal',
    fixtureType: 'valid_official',
    expectedStatus: 'validated',
    candidate: {
      id: 'cand-mp-official',
      geography: { country: 'IN', state: 'mp', district: 'bhopal-district' },
      organizationName: 'MP Public Relations',
      sourceType: 'GOVERNMENT',
      url: 'https://mpinfo.org/',
      canonicalDomain: 'mpinfo.org',
      discoveredFrom: 'https://mp.gov.in',
      feedType: 'html',
      beat: 'government',
      authorityClass: 'PRIMARY',
      officialStatus: 'official_primary',
      discoveryConfidence: 0.95,
      validationStatus: 'candidate',
      discoveredAt: '2026-09-29T10:00:00Z',
    },
  },
  // 2. Malicious SSRF Attempt
  {
    id: 'gold-ssrf-metadata',
    name: 'Cloud Metadata IP Bypass',
    description: 'Attempts to read cloud instance metadata 169.254.169.254',
    fixtureType: 'malicious_ssrf',
    expectedStatus: 'rejected',
    expectedRejectionReason: 'ssrf_blocked',
    candidate: {
      id: 'cand-ssrf-meta',
      geography: { country: 'IN' },
      organizationName: 'Fake Metadata',
      sourceType: 'GOVERNMENT',
      url: 'http://169.254.169.254/latest/meta-data',
      canonicalDomain: '169.254.169.254',
      discoveredFrom: 'https://attacker.com',
      feedType: 'html',
      beat: 'government',
      authorityClass: 'PRIMARY',
      officialStatus: 'official_primary',
      discoveryConfidence: 0.1,
      validationStatus: 'candidate',
      discoveredAt: '2026-09-29T10:00:00Z',
    },
  },
  // 3. Duplicate Source Colliding with Active Registry
  {
    id: 'gold-duplicate-rewa',
    name: 'Rewa District Duplicate',
    description: 'Exact duplicate URL matching active monitored source radar-rewa-nic',
    fixtureType: 'duplicate_source',
    expectedStatus: 'rejected',
    expectedRejectionReason: 'duplicate_source',
    candidate: {
      id: 'cand-dup-rewa',
      geography: { country: 'IN', state: 'mp', district: 'rewa-district' },
      organizationName: 'District Rewa',
      sourceType: 'GOVERNMENT',
      url: 'https://rewa.nic.in/',
      canonicalDomain: 'rewa.nic.in',
      discoveredFrom: 'https://mp.gov.in',
      feedType: 'html',
      beat: 'government',
      authorityClass: 'PRIMARY',
      officialStatus: 'official_primary',
      discoveryConfidence: 0.9,
      validationStatus: 'candidate',
      discoveredAt: '2026-09-29T10:00:00Z',
    },
  },
  // 4. PDF Gazette Notification
  {
    id: 'gold-pdf-gazette',
    name: 'Official State Gazette PDF',
    description: 'Valid PDF statutory notice endpoint',
    fixtureType: 'pdf_gazette',
    expectedStatus: 'validated',
    candidate: {
      id: 'cand-pdf-gazette',
      geography: { country: 'IN', state: 'mp' },
      organizationName: 'Government Press Bhopal',
      sourceType: 'GOVERNMENT',
      url: 'https://example.com/gazette.pdf',
      canonicalDomain: 'example.com',
      discoveredFrom: 'https://mp.gov.in',
      feedType: 'pdf',
      beat: 'government',
      authorityClass: 'PRIMARY',
      officialStatus: 'official_primary',
      discoveryConfidence: 0.9,
      validationStatus: 'candidate',
      discoveredAt: '2026-09-29T10:00:00Z',
    },
  },
  // 5. Dead / Unreachable URL
  {
    id: 'gold-dead-url',
    name: 'Defunct 404 Government Portal',
    description: 'Returns HTTP 404 or connection failure',
    fixtureType: 'dead_url',
    expectedStatus: 'rejected',
    expectedRejectionReason: 'unreachable',
    candidate: {
      id: 'cand-dead-404',
      geography: { country: 'IN' },
      organizationName: 'Expired Commission',
      sourceType: 'GOVERNMENT',
      url: 'https://httpstat.us/404',
      canonicalDomain: 'httpstat.us',
      discoveredFrom: 'https://directory.in',
      feedType: 'html',
      beat: 'government',
      authorityClass: 'PRIMARY',
      officialStatus: 'official_primary',
      discoveryConfidence: 0.5,
      validationStatus: 'candidate',
      discoveredAt: '2026-09-29T10:00:00Z',
    },
  },
  // 6. Multilingual Hindi Candidate
  {
    id: 'gold-multilingual-hindi',
    name: 'रीवा पुलिस पोर्टल',
    description: 'Regional Hindi administration bulletin',
    fixtureType: 'multilingual_hindi',
    expectedStatus: 'validated',
    candidate: {
      id: 'cand-hindi-police',
      geography: { country: 'IN', state: 'mp', district: 'rewa-district' },
      organizationName: 'पुलिस अधीक्षक कार्यालय रीवा',
      sourceType: 'GOVERNMENT',
      url: 'https://example.com/rewa/police',
      canonicalDomain: 'example.com',
      discoveredFrom: 'https://mp.gov.in',
      feedType: 'html',
      beat: 'public_safety',
      authorityClass: 'PRIMARY',
      officialStatus: 'official_primary',
      discoveryConfidence: 0.88,
      validationStatus: 'candidate',
      discoveredAt: '2026-09-29T10:00:00Z',
    },
  },
];
