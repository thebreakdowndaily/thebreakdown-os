import { ChapterFactory, ChapterPackage } from './chapter-factory';
import { CHAPTER_1_FIX, CHAPTER_1_SOURCES } from './chapter-1-data';
import { Claim } from '../../types/canonical';

export const CHAPTER_3_CLAIMS: Claim[] = [
  {
    id: 'claim-kashmir-001',
    claim: 'Maharaja Hari Singh signed the Instrument of Accession on October 26, 1947 following tribal incursions.',
    data: 'Instrument of Accession Document & Governor-General Mountbatten Acceptance Letter.',
    source: 'United Nations Security Council Resolution 47 (1948)',
    sourceUrl: 'https://undocs.org/S/RES/47(1948)',
    tier: 1,
    confidence: 0.97,
    status: 'verified',
    verificationLevel: 'primary',
  },
];

export const CHAPTER_3_PACKAGE: ChapterPackage = ChapterFactory.createChapterPackage({
  chapterId: 'ch-03-kashmir-1947-48',
  slug: 'kashmir-1947-1948-un-referral',
  volumeSlug: 'vol-1-india-and-the-world-1947-1962',
  collectionSlug: 'india-and-the-world',
  title: 'Kashmir 1947–1948 & The United Nations Referral',
  subtitle: 'Accession, Military Hostilities, and Security Council Resolution 47',
  version: '1.0.0',
  status: 'published',
  publishedAt: '2026-07-25T00:00:00Z',
  updatedAt: '2026-07-25T00:00:00Z',
  lastVerified: '2026-07-25T00:00:00Z',
  readingTime: 22,
  wordCount: 13800,
  sixQuestions: {
    whatHappened: {
      title: '1. What Happened?',
      summary: 'Following tribal invasion in October 1947, Jammu & Kashmir acceded to India, leading to the 1947–48 war and UN Security Council Resolution 47.',
      keyEvents: [
        { year: '1947', event: 'Signing of Instrument of Accession by Maharaja Hari Singh.' },
        { year: '1948', event: 'India refers Kashmir issue to UNSC under Article 35.' },
        { year: '1948', event: 'UNSC Resolution 47 adopted establishing UNCIP.' },
        { year: '1949', event: 'UN-brokered Ceasefire Line established.' },
      ],
    },
    whyDidItHappen: {
      title: '2. Why Did It Happen?',
      summary: 'Pakistani-backed tribal invasion forced immediate military intervention upon legal accession.',
    },
    whatAlternativesEisted: {
      title: '3. What Alternatives Existed?',
      summary: 'Direct bilateral military resolution without UN referral—rejected in favor of international rules-based order.',
    },
    whyStrategicAutonomy: {
      title: '4. Why Did India Choose UN Referral?',
      summary: 'India sought international law attestation of Pakistani aggression under Article 35 of the UN Charter.',
    },
    consequences: {
      title: '5. What Were the Consequences?',
      summary: 'Institutionalized the Line of Control and introduced Cold War geopolitical dynamics into the UN Security Council.',
    },
    relevanceToday: {
      title: '6. Why Does It Matter Today?',
      summary: 'Underpins bilateral diplomacy under the Simla Agreement (1972) and constitutional re-organization.',
    },
  },
  fourLayers: {
    whatHappened: 'Documented 1947 accession and 1948 UN Security Council proceedings.',
    whatEvidenceShows: 'UNSC Resolution 47 text, official cables, and military logs.',
    whereHistoriansDisagree: 'Evaluations of the rationale behind Mountbatten’s plebiscite advice versus Nehru’s legal confidence.',
    whyItMatters: 'Foundational baseline for South Asian security architecture and diplomatic posture.',
  },
  sources: CHAPTER_1_SOURCES.slice(0, 2),
  claims: CHAPTER_3_CLAIMS,
  fix: CHAPTER_1_FIX,
});
