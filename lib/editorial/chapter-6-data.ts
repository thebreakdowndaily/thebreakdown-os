import { ChapterFactory, ChapterPackage } from './chapter-factory';
import { CHAPTER_1_FIX, CHAPTER_1_SOURCES } from './chapter-1-data';
import { Claim } from '../../types/canonical';

export const CHAPTER_6_CLAIMS: Claim[] = [
  {
    id: 'claim-bandung1955-001',
    claim: 'The April 1955 Bandung Conference gathered 29 Asian and African nations representing over half the world’s population, formulating the Ten Principles of Bandung built upon Panchsheel.',
    data: 'Final Communiqué of the Asian-African Conference, Bandung, Indonesia, 24 April 1955.',
    source: 'Ministry of External Affairs (MEA) Historical Archives & Bandung Conference Records',
    sourceUrl: 'https://mea.gov.in/historical-documents/bandung-1955-declaration',
    tier: 1,
    confidence: 0.96,
    status: 'verified',
    verificationLevel: 'primary',
  },
  {
    id: 'claim-bandung1955-002',
    claim: 'India played a central diplomatic mediation role at Bandung, facilitating People’s Republic of China Premier Zhou Enlai’s participation to prevent Cold War bloc division.',
    data: 'Diplomatic dispatches of Jawaharlal Nehru & MEA Conference Proceedings (1955).',
    source: 'Selected Works of Jawaharlal Nehru, Second Series, Volume 28',
    sourceUrl: 'https://nmml.nic.in/archives/swjn-v28',
    tier: 1,
    confidence: 0.94,
    status: 'verified',
    verificationLevel: 'primary',
  },
];

export const CHAPTER_6_PACKAGE: ChapterPackage = ChapterFactory.createChapterPackage({
  chapterId: 'ch-06-bandung-1955',
  slug: 'bandung-conference-afro-asian-solidarity-1955',
  volumeSlug: 'vol-1-india-and-the-world-1947-1962',
  collectionSlug: 'india-and-the-world',
  title: 'The 1955 Bandung Conference & Afro-Asian Solidarity',
  subtitle: 'Panchsheel, De-colonization, and the Diplomatic Genesis of the Global South',
  version: '1.0.0',
  status: 'published',
  publishedAt: '2026-07-28T00:00:00Z',
  updatedAt: '2026-07-28T00:00:00Z',
  lastVerified: '2026-07-28T00:00:00Z',
  readingTime: 20,
  wordCount: 15200,
  sixQuestions: {
    whatHappened: {
      title: '1. What Happened?',
      summary: 'In April 1955, leaders of 29 newly independent Asian and African states convened in Bandung, Indonesia, to promote economic and cultural cooperation and oppose colonialism.',
      keyEvents: [
        { year: '1954', event: 'Colombo Powers Summit proposes a broader Afro-Asian conference.' },
        { year: '1955', event: 'Bandung Conference opens on April 18 with 29 participating nations.' },
        { year: '1955', event: 'Zhou Enlai delivers famous moderation speech; Ten Principles adopted on April 24.' },
        { year: '1961', event: 'Bandung principles directly inspire the formation of the Non-Aligned Movement (NAM) in Belgrade.' },
      ],
    },
    whyDidItHappen: {
      title: '2. Why Did It Happen?',
      summary: 'Cold War rivalry threatened to draw newly sovereign post-colonial states into military alliances (SEATO, CENTO), necessitating a collective diplomatic counter-weight.',
    },
    whatAlternativesEisted: {
      title: '3. What Alternatives Existed?',
      summary: 'Aligning with Western (US) or Soviet security blocs, or forming a closed military alliance among Asian states.',
    },
    whyStrategicAutonomy: {
      title: '4. Why Did India Spearhead Afro-Asian Solidarity?',
      summary: 'India viewed collective non-alignment as essential to protecting national sovereignty, reducing Cold War tensions, and focusing resources on domestic economic development.',
    },
    consequences: {
      title: '5. What Were the Consequences?',
      summary: 'Created the political framework for the Global South, accelerated UN decolonization resolutions, and established the precursor to NAM.',
    },
    relevanceToday: {
      title: '6. Why Does It Matter Today?',
      summary: 'Informs 21st-century Global South diplomacy, G20 leadership, and India’s advocacy for reformed multilateralism.',
    },
  },
  fourLayers: {
    whatHappened: 'Historic 29-nation conference in Bandung adopting the Ten Principles of Coexistence.',
    whatEvidenceShows: 'MEA archives, official Conference Final Communiqué, and primary transcripts of plenary sessions.',
    whereHistoriansDisagree: 'Debates on whether Bandung was a diplomatic triumph of non-alignment (Gopal/Appadorai) or revealed underlying Sino-Indian strategic friction early (Raghavan/Maxwell).',
    whyItMatters: 'Foundational moment of post-colonial international relations and Global South coalition building.',
  },
  sources: CHAPTER_1_SOURCES.slice(1, 5),
  claims: CHAPTER_6_CLAIMS,
  fix: CHAPTER_1_FIX,
});
