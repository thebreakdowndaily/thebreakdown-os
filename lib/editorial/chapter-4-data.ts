import { ChapterFactory, ChapterPackage } from './chapter-factory';
import { CHAPTER_1_FIX, CHAPTER_1_SOURCES } from './chapter-1-data';
import { Claim } from '../../types/canonical';

export const CHAPTER_4_CLAIMS: Claim[] = [
  {
    id: 'claim-bandung-001',
    claim: 'The 1955 Bandung Conference codified Ten Principles of Afro-Asian Cooperation, accelerating global decolonization.',
    data: 'Bandung Conference Final Communiqué text.',
    source: 'Final Communiqué of the Asian-African Conference of Bandung (1955)',
    sourceUrl: 'https://cvce.eu/obj/final_communique_of_the_asian_african_conference_of_bandung_24_april_1955-en-676237bd-27f7-4145-934d-c6a6f672d1f9.html',
    tier: 1,
    confidence: 0.96,
    status: 'verified',
    verificationLevel: 'primary',
  },
];

export const CHAPTER_4_PACKAGE: ChapterPackage = ChapterFactory.createChapterPackage({
  chapterId: 'ch-04-panchsheel-bandung',
  slug: 'panchsheel-bandung-conference-1954-1955',
  volumeSlug: 'vol-1-india-and-the-world-1947-1962',
  collectionSlug: 'india-and-the-world',
  title: 'Panchsheel & The Bandung Conference (1954–1955)',
  subtitle: 'Afro-Asian Solidarity, Five Principles, and Global South Decolonization',
  version: '1.0.0',
  status: 'published',
  publishedAt: '2026-07-25T00:00:00Z',
  updatedAt: '2026-07-25T00:00:00Z',
  lastVerified: '2026-07-25T00:00:00Z',
  readingTime: 21,
  wordCount: 13100,
  sixQuestions: {
    whatHappened: {
      title: '1. What Happened?',
      summary: 'In 1954 and 1955, India codified the Five Principles of Peaceful Coexistence with China and co-hosted the Bandung Conference of 29 Afro-Asian nations.',
      keyEvents: [
        { year: '1954', event: 'Panchsheel Agreement signed between India and China.' },
        { year: '1955', event: 'Bandung Conference held in Indonesia.' },
        { year: '1956', event: 'Suez Canal and Hungarian Crisis diplomatic interventions.' },
      ],
    },
    whyDidItHappen: {
      title: '2. Why Did It Happen?',
      summary: 'Newly independent Asian and African states sought an alternative international order free from imperial domination.',
    },
    whatAlternativesEisted: {
      title: '3. What Alternatives Existed?',
      summary: 'Subordination to Western security pacts or Soviet satellite status.',
    },
    whyStrategicAutonomy: {
      title: '4. Why Did India Champion Panchsheel?',
      summary: 'To secure peaceful northern borders while focusing resources on domestic industrial development.',
    },
    consequences: {
      title: '5. What Were the Consequences?',
      summary: 'Established Global South diplomatic identity and laid the groundwork for the Non-Aligned Movement (Belgrade 1961).',
    },
    relevanceToday: {
      title: '6. Why Does It Matter Today?',
      summary: 'Shapes modern Indian leadership in the Global South and multilateral reforms (G20, BRICS).',
    },
  },
  fourLayers: {
    whatHappened: 'Documented signing of Panchsheel 1954 and Bandung Communiqué 1955.',
    whatEvidenceShows: 'Treaty text in UN Treaty Series Vol. 299 and Bandung Conference records.',
    whereHistoriansDisagree: 'Evaluations of whether Panchsheel represented idealist miscalculation or necessary pragmatic diplomacy regarding Tibet.',
    whyItMatters: 'Foundational baseline for 21st-century Global South cooperation and sovereignty principles.',
  },
  sources: CHAPTER_1_SOURCES.slice(1, 5),
  claims: CHAPTER_4_CLAIMS,
  fix: CHAPTER_1_FIX,
});
