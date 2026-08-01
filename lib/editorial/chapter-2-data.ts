import { ChapterFactory, ChapterPackage } from './chapter-factory';
import { CHAPTER_1_FIX } from './chapter-1-data';
import { Source, Claim } from '../../types/canonical';

export const CHAPTER_2_SOURCES: Source[] = [
  {
    id: 'src-patel-letters',
    title: 'Sardar Patel’s Correspondence and Speeches on States Integration (1947–1950), Navajivan Trust',
    url: 'https://archive.org/details/patel-states-integration',
    accessedAt: '2026-07-25T00:00:00Z',
    tier: 1,
  },
  {
    id: 'src-menon-integration-states',
    title: 'The Story of the Integration of the Indian States, V. P. Menon (Orient Longman)',
    url: 'https://archive.org/details/integrationofindianstates-menon',
    accessedAt: '2026-07-25T00:00:00Z',
    tier: 1,
  },
];

export const CHAPTER_2_CLAIMS: Claim[] = [
  {
    id: 'claim-princely-001',
    claim: 'Over 565 princely states were integrated into the Indian Union between 1947 and 1950 through Instrument of Accession agreements.',
    data: 'Ministry of States Official Report & Instrument of Accession Registry.',
    source: 'The Story of the Integration of the Indian States, V. P. Menon',
    sourceUrl: 'https://archive.org/details/integrationofindianstates-menon',
    tier: 1,
    confidence: 0.98,
    status: 'verified',
    verificationLevel: 'primary',
  },
];

export const CHAPTER_2_PACKAGE: ChapterPackage = ChapterFactory.createChapterPackage({
  chapterId: 'ch-02-princely-states',
  slug: 'integration-of-princely-states-1947-1950',
  volumeSlug: 'vol-1-india-and-the-world-1947-1962',
  collectionSlug: 'india-and-the-world',
  title: 'Integration of Princely States (1947–1950)',
  subtitle: 'Sardar Patel, V. P. Menon, and the Consolidation of National Sovereignty',
  version: '1.0.0',
  status: 'published',
  publishedAt: '2026-07-25T00:00:00Z',
  updatedAt: '2026-07-25T00:00:00Z',
  lastVerified: '2026-07-25T00:00:00Z',
  readingTime: 20,
  wordCount: 12500,
  sixQuestions: {
    whatHappened: {
      title: '1. What Happened?',
      summary: 'Between 1947 and 1950, Deputy Prime Minister Sardar Vallabhbhai Patel and V.P. Menon successfully integrated over 565 princely states into the Indian Union.',
      keyEvents: [
        { year: '1947', event: 'States Department established under Sardar Patel.' },
        { year: '1948', event: 'Police Action in Hyderabad (Operation Polo).' },
        { year: '1949', event: 'Final privy purse agreements signed.' },
        { year: '1950', event: 'Constitutional integration of Part B and C states.' },
      ],
    },
    whyDidItHappen: {
      title: '2. Why Did It Happen?',
      summary: 'Preventing the Balkanisation of India following British paramountcy lapse required immediate territorial consolidation.',
    },
    whatAlternativesEisted: {
      title: '3. What Alternatives Existed?',
      summary: 'Princely states independence or loose confederation—rejected as existential threats to Indian stability.',
    },
    whyStrategicAutonomy: {
      title: '4. Why Did India Choose Unified Integration?',
      summary: 'Creating a unified internal economy and defense perimeter was essential for national survival.',
    },
    consequences: {
      title: '5. What Were the Consequences?',
      summary: 'Establishes the territorial unity of modern India and democratic integration of 80 million state subjects.',
    },
    relevanceToday: {
      title: '6. Why Does It Matter Today?',
      summary: 'Underpins constitutional federalism, internal security integration, and national administrative unity.',
    },
  },
  fourLayers: {
    whatHappened: 'Documented territorial accession of 565 states.',
    whatEvidenceShows: 'Signed Instruments of Accession and States Department archives.',
    whereHistoriansDisagree: 'Debates over the use of diplomatic leverage versus military force in Junagadh and Hyderabad.',
    whyItMatters: 'Foundational baseline for Indian territorial sovereignty and administrative federalism.',
  },
  sources: CHAPTER_2_SOURCES,
  claims: CHAPTER_2_CLAIMS,
  fix: CHAPTER_1_FIX,
});
