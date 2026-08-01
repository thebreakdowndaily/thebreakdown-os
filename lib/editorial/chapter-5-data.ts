import { ChapterFactory, ChapterPackage } from './chapter-factory';
import { CHAPTER_1_FIX, CHAPTER_1_SOURCES } from './chapter-1-data';
import { Claim } from '../../types/canonical';

export const CHAPTER_5_CLAIMS: Claim[] = [
  {
    id: 'claim-sino1962-001',
    claim: 'The October–November 1962 conflict exposed severe logistics, intelligence, and defense procurement gaps in India’s northern border infrastructure.',
    data: 'Sino-Indian White Papers I–VI & Henderson Brooks-Bhagat Report findings.',
    source: 'Notes, Memoranda and Letters Exchanged Between the Governments of India and China (White Papers I–VI)',
    sourceUrl: 'https://mea.gov.in/historical-documents/sino-indian-white-papers',
    tier: 1,
    confidence: 0.95,
    status: 'verified',
    verificationLevel: 'primary',
  },
];

export const CHAPTER_5_PACKAGE: ChapterPackage = ChapterFactory.createChapterPackage({
  chapterId: 'ch-05-sino-indian-1962',
  slug: '1962-sino-indian-war-strategic-lessons',
  volumeSlug: 'vol-1-india-and-the-world-1947-1962',
  collectionSlug: 'india-and-the-world',
  title: 'The 1962 Sino-Indian Border War & Strategic Lessons',
  subtitle: 'Border Disputes, Military Crisis, and the Recalibration of Strategic Autonomy',
  version: '1.0.0',
  status: 'published',
  publishedAt: '2026-07-25T00:00:00Z',
  updatedAt: '2026-07-25T00:00:00Z',
  lastVerified: '2026-07-25T00:00:00Z',
  readingTime: 24,
  wordCount: 14900,
  sixQuestions: {
    whatHappened: {
      title: '1. What Happened?',
      summary: 'In October 1962, military conflict erupted along the Sino-Indian border in Aksai Chin and NEFA, ending with a unilateral Chinese ceasefire.',
      keyEvents: [
        { year: '1959', event: 'Dalai Lama granted asylum in India; border skirmishes at Longju and Konka Pass.' },
        { year: '1961', event: 'Implementation of the Forward Policy in border sectors.' },
        { year: '1962', event: 'Chinese offensive in Namka Chu and Aksai Chin.' },
        { year: '1962', event: 'Unilateral Chinese ceasefire declared on November 21.' },
      ],
    },
    whyDidItHappen: {
      title: '2. Why Did It Happen?',
      summary: 'Unresolved territorial claims, differing interpretations of the McMahon Line, intelligence failures, and miscalculated forward deployments.',
    },
    whatAlternativesEisted: {
      title: '3. What Alternatives Existed?',
      summary: 'Early boundary settlement via territorial swap (Aksai Chin for NEFA recognition) as proposed by Zhou Enlai in 1960.',
    },
    whyStrategicAutonomy: {
      title: '4. Why Did India Recalibrate Strategic Autonomy?',
      summary: 'The 1962 crisis forced India to combine diplomatic non-alignment with rapid defense modernization and intelligence integration.',
    },
    consequences: {
      title: '5. What Were the Consequences?',
      summary: 'Defense spending doubled; intelligence services reorganized; foundational shift toward pragmatic strategic realism.',
    },
    relevanceToday: {
      title: '6. Why Does It Matter Today?',
      summary: 'Informs 21st-century Line of Actual Control posture, Border Roads Organisation infrastructure, and defense procurement auditing.',
    },
  },
  fourLayers: {
    whatHappened: 'Documented 1962 border hostilities and unilateral ceasefire.',
    whatEvidenceShows: 'MEA White Papers I–VI, parliamentary debates, and Henderson Brooks-Bhagat Report findings.',
    whereHistoriansDisagree: 'Historiographical debates between Neville Maxwell (Forward Policy criticism) and Steven Hoffman/Srinath Raghavan (coercive diplomacy analysis).',
    whyItMatters: 'Foundational watershed moment that transformed Indian defense planning and strategic autonomy.',
  },
  sources: CHAPTER_1_SOURCES.slice(3, 7),
  claims: CHAPTER_5_CLAIMS,
  fix: CHAPTER_1_FIX,
});
