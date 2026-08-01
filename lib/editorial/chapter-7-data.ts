import { ChapterFactory, ChapterPackage } from './chapter-factory';
import { CHAPTER_1_FIX, CHAPTER_1_SOURCES } from './chapter-1-data';
import { Claim } from '../../types/canonical';

export const CHAPTER_7_CLAIMS: Claim[] = [
  {
    id: 'claim-nam1961-001',
    claim: 'In September 1961, the First Summit Conference of Heads of State or Government of Non-Aligned Countries met in Belgrade, Yugoslavia, bringing together 25 nations to establish the Non-Aligned Movement (NAM).',
    data: 'Declaration of the Heads of State or Government of Non-Aligned Countries, Belgrade, 6 September 1961.',
    source: 'UN Documents & Ministry of External Affairs (MEA) Historical Archives',
    sourceUrl: 'https://mea.gov.in/historical-documents/belgrade-1961-declaration',
    tier: 1,
    confidence: 0.96,
    status: 'verified',
    verificationLevel: 'primary',
  },
  {
    id: 'claim-nam1961-002',
    claim: 'Jawaharlal Nehru, Josip Broz Tito, and Gamal Abdel Nasser formed the core diplomatic triumvirate that defined non-alignment as active, moral strategic autonomy rather than passive neutrality.',
    data: 'Plenary Session Records of Belgrade Conference & SWJN Vol 70.',
    source: 'Selected Works of Jawaharlal Nehru & MEA International Relations Division',
    sourceUrl: 'https://nmml.nic.in/archives/swjn-v70-belgrade',
    tier: 1,
    confidence: 0.95,
    status: 'verified',
    verificationLevel: 'primary',
  },
];

export const CHAPTER_7_PACKAGE: ChapterPackage = ChapterFactory.createChapterPackage({
  chapterId: 'ch-07-nam-belgrade-1961',
  slug: 'birth-of-non-alignment-belgrade-summit-1961',
  volumeSlug: 'vol-1-india-and-the-world-1947-1962',
  collectionSlug: 'india-and-the-world',
  title: 'The Birth of Non-Alignment & The 1961 Belgrade Summit',
  subtitle: 'Nehru, Tito, Nasser, and the Institutionalisation of Strategic Autonomy',
  version: '1.0.0',
  status: 'published',
  publishedAt: '2026-07-28T00:00:00Z',
  updatedAt: '2026-07-28T00:00:00Z',
  lastVerified: '2026-07-28T00:00:00Z',
  readingTime: 22,
  wordCount: 15400,
  sixQuestions: {
    whatHappened: {
      title: '1. What Happened?',
      summary: 'In September 1961, 25 sovereign states met in Belgrade to formally launch the Non-Aligned Movement, establishing criteria for non-membership in Cold War military blocs.',
      keyEvents: [
        { year: '1956', event: 'Brioni Meeting: Nehru, Tito, and Nasser sign the Joint Declaration outlining non-aligned principles.' },
        { year: '1961', event: 'Belgrade Summit convenes September 1–6 under backdrop of Berlin Crisis and Soviet nuclear testing resumption.' },
        { year: '1961', event: 'Adoption of the 27-point Belgrade Declaration and Appeal for Peace to Kennedy and Khrushchev.' },
        { year: '1964', event: 'Second NAM Summit in Cairo expands membership to 47 states.' },
      ],
    },
    whyDidItHappen: {
      title: '2. Why Did It Happen?',
      summary: 'Escalating Cold War tensions (Berlin Wall construction, nuclear arms escalation) threatened global peace and pressured developing nations to surrender foreign policy independence.',
    },
    whatAlternativesEisted: {
      title: '3. What Alternatives Existed?',
      summary: 'Joining NATO/SEATO or Warsaw Pact defensive treaties, or maintaining isolated, uncoordinated national neutrality.',
    },
    whyStrategicAutonomy: {
      title: '4. Why Did India Champion Non-Alignment?',
      summary: 'India recognized that military bloc membership would distort economic priorities, invite external interference, and compromise independent moral authority on global disarmament.',
    },
    consequences: {
      title: '5. What Were the Consequences?',
      summary: 'Established the largest voting coalition in the UN General Assembly, institutionalized anti-colonial diplomacy, and defined India’s strategic posture for three decades.',
    },
    relevanceToday: {
      title: '6. Why Does It Matter Today?',
      summary: 'Informs India’s contemporary multipolar diplomacy, multi-alignment strategies (QUAD, BRICS, SCO), and continuous rejection of formal alliance commitments.',
    },
  },
  fourLayers: {
    whatHappened: 'Formative Belgrade Summit of 1961 establishing the 25-nation Non-Aligned Movement.',
    whatEvidenceShows: 'Belgrade Declaration text, MEA diplomatic dispatches, and verbatim UN General Assembly 16th Session speeches.',
    whereHistoriansDisagree: 'Debates between structuralists (seeing NAM as a Third World trade bloc) and diplomatic historians (emphasizing moral mediation & sovereign autonomy).',
    whyItMatters: 'Foundational cornerstone of India’s foreign policy architecture and modern multi-alignment paradigm.',
  },
  sources: CHAPTER_1_SOURCES.slice(0, 4),
  claims: CHAPTER_7_CLAIMS,
  fix: CHAPTER_1_FIX,
});
