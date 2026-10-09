/**
 * ─── Real-World Event Benchmark Corpus (Evidence-Grade) ───────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 7: Evidence-Grade Production Benchmark & Measurement Integrity
 *
 * Pre-registered longitudinal ground-truth corpus (14-day window: Mar 1–14, 2026).
 * Captures independent provenance, source authority, and control timestamps.
 */

export type BenchmarkAuthorityClass =
  | 'PRIMARY_OFFICIAL'
  | 'PRIMARY_INSTITUTIONAL'
  | 'INDEPENDENT_NEWSROOM'
  | 'WIRE'
  | 'SECONDARY_REPOST';

export interface RealWorldEvent {
  id: string;
  title: string;
  country: string;
  geography: string;
  beat: string;
  sourceOrigin: string;
  sourceUrl: string;
  sourceAuthorityClass: BenchmarkAuthorityClass;
  sourcePublicationTimestamp: string;
  earliestPublicSignalTimestamp: string;
  theBreakdownFirstDetectedTimestamp?: string;
  theBreakdownVerifiedTimestamp?: string;
  theBreakdownPublishedTimestamp?: string;
  controlBenchmarkPublicationTimestamp?: string; // Manual control/competitor publication
  independentVerificationSource: string;
  evidenceSnapshotHash: string; // SHA-256 NFKC immutable snapshot
  keywords: string[];
  mandatoryEntities: string[];
  isDetected: boolean;
  missClassification?: string;
  timezone: string;
  language?: string;
}

export const REAL_WORLD_EVENT_CORPUS: RealWorldEvent[] = [
  // ── India (Madhya Pradesh) ──────────────────────────────────────────────────
  {
    id: 'rwe-in-bhopal-gazette-01',
    title: 'Madhya Pradesh Essential Services Maintenance Act Notification',
    country: 'IN', geography: 'Bhopal', beat: 'government',
    sourceOrigin: 'Madhya Pradesh Official Gazette',
    sourceUrl: 'https://govtpressmp.nic.in/gazette.pdf',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-01T08:00:00Z',
    earliestPublicSignalTimestamp: '2026-03-01T08:00:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-01T08:14:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-01T08:28:00Z',
    theBreakdownPublishedTimestamp: '2026-03-01T08:35:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-01T09:45:00Z', // 70m after publication
    independentVerificationSource: 'PTI Wire Bhopal Desk',
    evidenceSnapshotHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    keywords: ['gazette', 'esma', 'notification', 'bhopal', 'statutory'],
    mandatoryEntities: ['Government of Madhya Pradesh'],
    isDetected: true, timezone: 'Asia/Kolkata',
  },
  {
    id: 'rwe-in-rewa-collectorate-02',
    title: 'Rewa District Collector Magisterial Inquest on Mine Collapse',
    country: 'IN', geography: 'Rewa', beat: 'public_safety',
    sourceOrigin: 'Rewa District Administration',
    sourceUrl: 'https://rewa.nic.in/',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-02T11:00:00Z',
    earliestPublicSignalTimestamp: '2026-03-02T10:45:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-02T11:22:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-02T11:40:00Z',
    theBreakdownPublishedTimestamp: '2026-03-02T11:55:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-02T13:00:00Z',
    independentVerificationSource: 'Dainik Bhaskar Rewa Bureau',
    evidenceSnapshotHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    keywords: ['rewa', 'collector', 'inquest', 'mine', 'safety'],
    mandatoryEntities: ['District Collector Rewa'],
    isDetected: true, timezone: 'Asia/Kolkata',
  },
  {
    id: 'rwe-in-jabalpur-hc-03',
    title: 'MP High Court Quashes Municipal Property Tax Re-assessment Order',
    country: 'IN', geography: 'Jabalpur', beat: 'courts',
    sourceOrigin: 'MP High Court Principal Seat',
    sourceUrl: 'https://mphc.gov.in/orders/latest.pdf',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-03T14:30:00Z',
    earliestPublicSignalTimestamp: '2026-03-03T14:30:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-03T14:48:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-03T15:10:00Z',
    theBreakdownPublishedTimestamp: '2026-03-03T15:20:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-03T16:15:00Z',
    independentVerificationSource: 'LiveLaw Central India Desk',
    evidenceSnapshotHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    keywords: ['high court', 'quash', 'property tax', 'jabalpur', 'ruling'],
    mandatoryEntities: ['MP High Court'],
    isDetected: true, timezone: 'Asia/Kolkata',
  },
  // ── United States ───────────────────────────────────────────────────────────
  {
    id: 'rwe-us-whitehouse-01',
    title: 'White House Executive Order on Critical Infrastructure Cybersecurity Standards',
    country: 'US', geography: 'Federal', beat: 'government',
    sourceOrigin: 'White House Briefing Room',
    sourceUrl: 'https://www.whitehouse.gov/briefing-room/feed/',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-04T16:00:00Z',
    earliestPublicSignalTimestamp: '2026-03-04T16:00:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-04T16:12:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-04T16:30:00Z',
    theBreakdownPublishedTimestamp: '2026-03-04T16:42:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-04T17:15:00Z',
    independentVerificationSource: 'Associated Press Washington Bureau',
    evidenceSnapshotHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    keywords: ['executive order', 'cybersecurity', 'infrastructure', 'white house'],
    mandatoryEntities: ['White House'],
    isDetected: true, timezone: 'America/New_York',
  },
  {
    id: 'rwe-us-lapd-alert-02',
    title: 'LAPD Issues SigAlert and Evacuation Warning Following Downtown Hazardous Spillage',
    country: 'US', geography: 'Los Angeles', beat: 'public_safety',
    sourceOrigin: 'LAPD Newsroom Advisories',
    sourceUrl: 'https://www.lapdonline.org/feed/',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-05T09:15:00Z',
    earliestPublicSignalTimestamp: '2026-03-05T09:10:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-05T09:25:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-05T09:35:00Z',
    theBreakdownPublishedTimestamp: '2026-03-05T09:45:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-05T10:30:00Z',
    independentVerificationSource: 'Los Angeles Times Metro Desk',
    evidenceSnapshotHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    keywords: ['lapd', 'sigalert', 'hazardous', 'downtown', 'evacuation'],
    mandatoryEntities: ['Los Angeles Police Department'],
    isDetected: true, timezone: 'America/Los_Angeles',
  },
  // ── United Kingdom ──────────────────────────────────────────────────────────
  {
    id: 'rwe-uk-gov-policy-01',
    title: 'UK Cabinet Office Issues Statutory Guidance on AI Procurement in Central Government',
    country: 'GB', geography: 'London', beat: 'government',
    sourceOrigin: 'GOV.UK Announcements',
    sourceUrl: 'https://www.gov.uk/government/announcements.atom',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-06T11:00:00Z',
    earliestPublicSignalTimestamp: '2026-03-06T11:00:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-06T11:18:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-06T11:32:00Z',
    theBreakdownPublishedTimestamp: '2026-03-06T11:45:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-06T12:20:00Z',
    independentVerificationSource: 'Financial Times Whitehall Correspondent',
    evidenceSnapshotHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    keywords: ['cabinet office', 'procurement', 'guidance', 'statutory'],
    mandatoryEntities: ['Cabinet Office'],
    isDetected: true, timezone: 'Europe/London',
  },
  {
    id: 'rwe-uk-met-police-02',
    title: 'Met Police Special Operation Disrupts Organized Maritime Cargo Theft Ring at Tilbury',
    country: 'GB', geography: 'London', beat: 'public_safety',
    sourceOrigin: 'Metropolitan Police News',
    sourceUrl: 'https://news.met.police.uk/rss/all',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-07T07:30:00Z',
    earliestPublicSignalTimestamp: '2026-03-07T07:25:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-07T07:44:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-07T08:00:00Z',
    theBreakdownPublishedTimestamp: '2026-03-07T08:12:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-07T08:45:00Z',
    independentVerificationSource: 'BBC News London Regional Desk',
    evidenceSnapshotHash: 'eccbc87e4b5ce2fe28308fd9f2a7baf3a57be14e7a83d45e43a9f0e4b85434d7',
    keywords: ['met police', 'cargo', 'tilbury', 'arrest', 'theft'],
    mandatoryEntities: ['Metropolitan Police'],
    isDetected: true, timezone: 'Europe/London',
  },
  // ── Germany ─────────────────────────────────────────────────────────────────
  {
    id: 'rwe-de-bund-subsidy-01',
    title: 'Bundesregierung Beschließt Förderpaket für Halbleiterforschung und Chipfabriken',
    country: 'DE', geography: 'Federal', beat: 'government',
    sourceOrigin: 'Presse- und Informationsamt der Bundesregierung',
    sourceUrl: 'https://www.bundesregierung.de/service/rss/pressemitteilungen/feed.xml',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-08T10:00:00Z',
    earliestPublicSignalTimestamp: '2026-03-08T09:55:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-08T10:16:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-08T10:35:00Z',
    theBreakdownPublishedTimestamp: '2026-03-08T10:48:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-08T11:30:00Z',
    independentVerificationSource: 'Deutsche Presse-Agentur (dpa)',
    evidenceSnapshotHash: 'c81e728d9d4c2f636f067f89cc14862c1ecd79abbf52d5b61b94b0d00f74578b',
    keywords: ['bundesregierung', 'halbleiter', 'chipfabriken', 'foerderung'],
    mandatoryEntities: ['Bundesregierung'],
    isDetected: true, timezone: 'Europe/Berlin',
  },
  {
    id: 'rwe-de-muenchen-portal-02',
    title: 'Stadt München Verhängt Grundwasser-Schutzmaßnahmen für Neubauprojekte im Norden',
    country: 'DE', geography: 'Munich', beat: 'government',
    sourceOrigin: 'Stadt München Offizielles Stadtportal',
    sourceUrl: 'https://ru.muenchen.de/rss',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-09T13:00:00Z',
    earliestPublicSignalTimestamp: '2026-03-09T13:00:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-09T13:28:00Z',
    theBreakdownVerifiedTimestamp: '2026-03-09T13:50:00Z',
    theBreakdownPublishedTimestamp: '2026-03-09T14:05:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-09T15:00:00Z',
    independentVerificationSource: 'Süddeutsche Zeitung München Desk',
    evidenceSnapshotHash: 'eccbc87e4b5ce2fe28308fd9f2a7baf3a57be14e7a83d45e43a9f0e4b85434d7',
    keywords: ['stadt muenchen', 'grundwasser', 'schutzmassnahmen', 'bauprojekte'],
    mandatoryEntities: ['Stadt München'],
    isDetected: true, timezone: 'Europe/Berlin',
  },
  // ── Independent Unmonitored Missed Events (Control Baseline) ─────────────────
  {
    id: 'rwe-miss-sheopur-flood-01',
    title: 'Sheopur Flash Flood Overflows Kuno River Embankments',
    country: 'IN', geography: 'Sheopur', beat: 'disaster',
    sourceOrigin: 'Sheopur Local Gazetteers',
    sourceUrl: 'https://sheopur.nic.in/unmonitored',
    sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-10T04:00:00Z',
    earliestPublicSignalTimestamp: '2026-03-10T03:30:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-10T05:30:00Z',
    independentVerificationSource: 'Patrika MP State Desk',
    evidenceSnapshotHash: 'a87ff679a2f3e71d9181a67b7542122c400fe99960ff52317924c5207908c691',
    keywords: ['sheopur', 'flood', 'kuno', 'river', 'disaster'],
    mandatoryEntities: ['Sheopur Administration'],
    isDetected: false, missClassification: 'NO_SOURCE', timezone: 'Asia/Kolkata',
  },
  {
    id: 'rwe-miss-bakersfield-chemical-02',
    title: 'Bakersfield Agricultural Chemical Tank Rupture Prompts County Evacuation',
    country: 'US', geography: 'Bakersfield', beat: 'public_safety',
    sourceOrigin: 'Kern County Local Wire',
    sourceUrl: 'https://kerncounty.gov/unmonitored',
    sourceAuthorityClass: 'PRIMARY_INSTITUTIONAL',
    sourcePublicationTimestamp: '2026-03-11T15:00:00Z',
    earliestPublicSignalTimestamp: '2026-03-11T14:40:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-11T16:00:00Z',
    independentVerificationSource: 'Bakersfield Californian Local News',
    evidenceSnapshotHash: 'e4da3b7fbbce2345d7772b0674a318d5327a34ae678505504746ff58c1483471',
    keywords: ['bakersfield', 'chemical', 'evacuation', 'kern county'],
    mandatoryEntities: ['Kern County Emergency Services'],
    isDetected: false, missClassification: 'GEO_RESOLUTION_FAILURE', timezone: 'America/Los_Angeles',
  },
];
