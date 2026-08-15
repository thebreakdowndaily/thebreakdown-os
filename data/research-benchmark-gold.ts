/**
 * ─── RIE v1.1 — Gold Benchmark Corpus & Mock Index ────────────────────────────
 * Governing document: docs/research/RIE_V1_1_SOURCE_EXPANSION_STANDARD.md
 *
 * This file houses the gold standard benchmark topics, their expected facts and
 * events, and the mock index used to evaluate retrieval.
 */

import type { BenchmarkCorpus } from '@/lib/intel/research/benchmark/types';
import type { ResearchSourceClass, ResearchSourceType } from '@/types/research-intelligence';

export const BENCHMARK_SNAPSHOT_DATE = '2026-08-15T12:00:00.000Z';

export interface MockDocument {
  url: string;
  title: string;
  content: string;
  publisher: string;
  publishedAt: string;
  /** When this document became available in the search space. Enforces temporal boundaries. */
  availableAt: string;
  sourceType: ResearchSourceType;
  sourceClass: ResearchSourceClass;
  language: 'en' | 'hi' | 'ml';
}

// ── 1. Gold Source definitions ────────────────────────────────────────────────

const VERIFICATION_SEED = {
  verifiedAt: '2026-08-15T00:00:00.000Z',
  evidenceLevel: 'A' as const,
  note: 'Validated against primary government registers.',
};

export const BENCHMARK_GOLD_CORPUS: BenchmarkCorpus = {
  corpusId: 'corpus-v1.1-evaluation',
  corpusVersion: '1.1',
  createdBy: 'Editor-in-Chief',
  createdAt: '2026-08-15T00:00:00.000Z',
  verifiedAt: '2026-08-15T00:00:00.000Z',
  topics: [
    // ── Stable Recall Corpus (11 Topics) ──────────────────────────────────────
    {
      topicId: 'topic-dpdp-2023',
      title: 'Digital Personal Data Protection Act 2023',
      category: 'POLICY_CHANGE',
      difficulty: 'EASY',
      researchQuestion: 'How does the DPDP Act 2023 regulate data compliance, consent, and penalties in India?',
      sourceEnvironment: 'official',
      language: 'English',
      geography: 'national',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'DPDP Act 2023 received Presidential assent on August 11 2023',
        'Consent is the fundamental basis for processing personal data',
        'Establishes the Data Protection Board of India',
        'Prescribes penalties up to 250 crore rupees for non-compliance',
      ],
      expectedTimelineEvents: [
        { date: '2023-08-11', title: 'President of India assents to DPDP Act 2023' },
      ],
      goldSources: [
        {
          sourceId: 'gold-dpdp-gazette',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'The Digital Personal Data Protection Act, 2023 Gazette Notification',
          url: 'https://www.meity.gov.in/writereaddata/files/Digital-Personal-Data-Protection-Act-2023.pdf',
          publisher: 'Ministry of Electronics and Information Technology',
          sourceClass: 'PRIMARY',
          publishedAt: '2023-08-11T12:00:00.000Z',
          firstAvailableAt: '2023-08-11T14:00:00.000Z',
          reason: 'Official gazette notification published on MeitY website.',
          facts: [
            'Assent received on August 11 2023',
            'Consent required for processing',
            'Data Protection Board established',
            'Penalties up to 250 crore rupees',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-ayodhya-2019',
      title: 'Ayodhya land dispute Supreme Court verdict',
      category: 'COURT_DECISION',
      difficulty: 'HARD',
      researchQuestion: 'What were the key elements and reasoning of the Supreme Court Ayodhya verdict in 2019?',
      sourceEnvironment: 'court',
      language: 'Hindi',
      geography: 'national',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'Supreme Court awarded the entire disputed land to Hindu litigants for temple construction',
        'Directed the government to allocate 5 acres of alternative land to Sunni Waqf Board',
        'Relied in part on ASI archaeological excavation findings showing non-Islamic structures',
      ],
      expectedTimelineEvents: [
        { date: '2019-11-09', title: 'Supreme Court delivers unanimous verdict on Ayodhya land dispute' },
      ],
      goldSources: [
        {
          sourceId: 'gold-ayodhya-sc-verdict',
          category: 'COURT',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'M Siddiq (D) Thr Lrs v. Mahant Suresh Das & Ors Judgement',
          url: 'https://sci.gov.in/judgments/Ayodhya_Judgement_2019.pdf',
          publisher: 'Supreme Court of India',
          sourceClass: 'PRIMARY',
          publishedAt: '2019-11-09T10:30:00.000Z',
          firstAvailableAt: '2019-11-09T11:00:00.000Z',
          reason: 'Supreme Court official judgment text.',
          facts: [
            'Entire disputed land awarded to Hindu side',
            '5 acres alternative land for Sunni Waqf Board',
            'ASI reports admitted as evidence',
          ],
          verification: VERIFICATION_SEED,
        },
        {
          sourceId: 'gold-ayodhya-regional-media',
          category: 'REGIONAL',
          goldItemType: 'REGIONAL_SOURCE',
          title: 'अयोध्या विवाद पर सुप्रीम कोर्ट का ऐतिहासिक फैसला: हिंदू पक्ष को मिली विवादित जमीन, मुस्लिम पक्ष को मिलेगी 5 एकड़ भूमि',
          url: 'https://www.jagran.com/news/national-ayodhya-verdict-supreme-court-judgment-hindi-19747582.html',
          publisher: 'Dainik Jagran',
          sourceClass: 'GENERAL_MEDIA',
          publishedAt: '2019-11-09T11:00:00.000Z',
          firstAvailableAt: '2019-11-09T11:15:00.000Z',
          reason: 'Hindi national media reporting reflecting regional reception and details.',
          facts: [
            'विवादित भूमि पर मंदिर निर्माण की स्वीकृति',
            'मुस्लिम पक्ष को वैकल्पिक 5 एकड़ जमीन देने का निर्देश',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-rbi-2026',
      title: 'RBI MPC repo rate decision (August 2026)',
      category: 'REGULATORY_CHANGE',
      difficulty: 'EASY',
      researchQuestion: 'What policy rate stances did the RBI MPC announce in its August 2026 meeting?',
      sourceEnvironment: 'regulator',
      language: 'English',
      geography: 'national',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'RBI Monetary Policy Committee kept repo rate unchanged at 6.50%',
        'Maintained monetary policy stance of withdrawal of accommodation',
        'Projected GDP growth of 7.2% for the fiscal year',
      ],
      expectedTimelineEvents: [
        { date: '2026-08-06', title: 'RBI MPC announces status quo on repo rates' },
      ],
      goldSources: [
        {
          sourceId: 'gold-rbi-mpc-statement',
          category: 'REGULATORY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'Monetary Policy Statement 2026-27 Resolution of the Monetary Policy Committee',
          url: 'https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=58102',
          publisher: 'Reserve Bank of India',
          sourceClass: 'PRIMARY',
          publishedAt: '2026-08-06T10:00:00.000Z',
          firstAvailableAt: '2026-08-06T10:15:00.000Z',
          reason: 'RBI official press release statement.',
          facts: [
            'Repo rate unchanged at 6.50%',
            'Withdrawal of accommodation stance maintained',
            '7.2% real GDP growth projection',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-kaleshwaram-cag',
      title: 'CAG audit report on Kaleshwaram Lift Irrigation Project',
      category: 'REGULATORY_CHANGE',
      difficulty: 'HARD',
      researchQuestion: 'What financial and execution issues were identified by the CAG on Kaleshwaram project?',
      sourceEnvironment: 'regulator',
      language: 'English',
      geography: 'state',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'CAG audit report flagged massive cost escalation and financial unviability of Kaleshwaram',
        'TELANGANA state government failed to obtain mandatory environmental clearances before starting work',
        'Interest burden and operational costs of pumping water would consume significant state budget',
      ],
      expectedTimelineEvents: [
        { date: '2024-02-15', title: 'CAG Telangana Kaleshwaram audit report tabled in Assembly' },
      ],
      goldSources: [
        {
          sourceId: 'gold-kaleshwaram-cag-report',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'Report of the Comptroller and Auditor General of India on Kaleshwaram Lift Irrigation Project',
          url: 'https://cag.gov.in/uploads/download_audit_report/2023/Report_No_6_of_2023_Kaleshwaram_Telangana.pdf',
          publisher: 'Comptroller and Auditor General of India',
          sourceClass: 'PRIMARY',
          publishedAt: '2024-02-15T12:00:00.000Z',
          firstAvailableAt: '2024-02-15T13:00:00.000Z',
          reason: 'Official CAG report hosted on CAG official portal.',
          facts: [
            'Flagged cost escalation and unviability',
            'Lack of environmental clearance highlighted',
            'Unsustainable financial burden projected',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-bihar-panchayat',
      title: 'Bihar Panchayat administrative audit and funds diversion',
      category: 'POLICY_CHANGE',
      difficulty: 'MEDIUM',
      researchQuestion: 'What structural anomalies were reported in local funds allocation in Bihar Panchayats?',
      sourceEnvironment: 'regional',
      language: 'Hindi',
      geography: 'local',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'Bihar state department audit showed diversion of local development funds to block-level schemes without approval',
        'High incidence of fake beneficiary payouts under rural toilet sanitation schemes',
      ],
      expectedTimelineEvents: [
        { date: '2025-05-20', title: 'Bihar Panchayati Raj audit report highlights fund diversion' },
      ],
      goldSources: [
        {
          sourceId: 'gold-bihar-panchayat-notif',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'पंचायती राज विभाग बिहार सरकार का ऑडिट रिपोर्ट २०२५ फंड विचलन दिशानिर्देश',
          url: 'https://panchayatiraj.bih.nic.in/documents/audit-report-local-funds-2025.pdf',
          publisher: 'Panchayati Raj Department Government of Bihar',
          sourceClass: 'PRIMARY',
          publishedAt: '2025-05-20T11:00:00.000Z',
          firstAvailableAt: '2025-05-20T12:00:00.000Z',
          reason: 'Regional local language department notifications detailing funds diversion warnings.',
          facts: [
            'पंचायत फंड का ब्लॉक स्तर पर बिना मंजूरी विचलन',
            'सफाई योजनाओं में फर्जी लाभार्थियों को भुगतान की पुष्टि',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-kashmir-un-1948',
      title: 'UN Security Council Resolution 47 on Kashmir',
      category: 'COURT_DECISION',
      difficulty: 'HARD',
      researchQuestion: 'What were the conditions and sequence prescribed under UNSC Resolution 47 for Kashmir?',
      sourceEnvironment: 'court',
      language: 'English',
      geography: 'international',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'UNSC Resolution 47 of April 1948 recommended a three-step process to restore peace',
        'prescribed that Pakistan must withdraw all its nationals and military forces first',
        'prescribed that India must subsequently reduce its forces to the minimum required for law and order',
        'recommended a free plebiscite conducted under an administrator appointed by the UN Secretary-General',
      ],
      expectedTimelineEvents: [
        { date: '1948-04-21', title: 'UN Security Council adopts Resolution 47 on India-Pakistan dispute' },
      ],
      goldSources: [
        {
          sourceId: 'gold-kashmir-unres-47',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'Resolution 47 (1948) on the India-Pakistan Question',
          url: 'https://undocs.org/S/RES/47(1948)',
          publisher: 'United Nations Security Council',
          sourceClass: 'PRIMARY',
          publishedAt: '1948-04-21T00:00:00.000Z',
          firstAvailableAt: '2020-01-01T00:00:00.000Z', // Archival availability in digital index
          reason: 'Official UN documents library.',
          facts: [
            'Three-step peace recommendation',
            'Pakistan force withdrawal first',
            'India force reduction subsequently',
            'Plebiscite under UN administrator',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-wayanad-landslide',
      title: 'Wayanad landslides local disaster alert failure',
      category: 'BREAKING_EVENT',
      difficulty: 'MEDIUM',
      researchQuestion: 'Were early warnings sent before the July 2024 Wayanad landslides, and how did regional authorities respond?',
      sourceEnvironment: 'regional',
      language: 'Malayalam',
      geography: 'local',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'Wayanad landslides occurred in the early hours of July 30 2024',
        'Geological Survey of India had issued landslide warnings, but regional authorities delayed evacuations due to communication lapses',
        'Local Malayalam news outlets reported that flash flood alerts failed to reach remote estate workers in Mundakkai and Chooralmala',
      ],
      expectedTimelineEvents: [
        { date: '2024-07-30', title: 'Devastating landslides strike Wayanad district in Kerala' },
      ],
      goldSources: [
        {
          sourceId: 'gold-wayanad-malayalam-news',
          category: 'REGIONAL',
          goldItemType: 'REGIONAL_SOURCE',
          title: 'വയനാട് ഉരുൾപൊട്ടൽ: മുന്നറിയിപ്പുകൾ നൽകുന്നതിൽ വീഴ്ച വരുത്തിയെന്ന് പ്രാദേശിക റിപ്പോർട്ടുകൾ',
          url: 'https://www.mathrubhumi.com/rss/news/kerala-1.976543',
          publisher: 'Mathrubhumi Kerala',
          sourceClass: 'GENERAL_MEDIA',
          publishedAt: '2024-07-31T06:00:00.000Z',
          firstAvailableAt: '2024-07-31T06:30:00.000Z',
          reason: 'Local Malayalam news report detailing community alerts and evacuation timeline.',
          facts: [
            'ഉരുൾപൊട്ടൽ ദുരന്തം മുണ്ടക്കൈ, ചൂരൽമല പ്രദേശങ്ങളിൽ',
            'മുന്നറിയിപ്പുകൾ പ്രാദേശിക തലത്തിൽ ലഭിക്കുന്നതിൽ ഗുരുതരമായ വീഴ്ച സംഭവിച്ചു',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-panchsheel-1954',
      title: 'India-China Panchsheel Agreement 1954',
      category: 'COURT_DECISION',
      difficulty: 'MEDIUM',
      researchQuestion: 'What were the five principles of peaceful coexistence signed in the 1954 Panchsheel Agreement?',
      sourceEnvironment: 'official',
      language: 'English',
      geography: 'international',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'India and China signed the Agreement on Trade and Intercourse between Tibet Region of China and India in April 1954',
        'Panchsheel includes: Mutual respect for territorial integrity, Non-aggression, Non-interference, Equality, Peaceful coexistence',
      ],
      expectedTimelineEvents: [
        { date: '1954-04-29', title: 'India and China sign Panchsheel Treaty on trade and intercourse in Tibet' },
      ],
      goldSources: [
        {
          sourceId: 'gold-panchsheel-treaty',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'Agreement on Trade and Intercourse between Tibet Region of China and India',
          url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=Panchsheel1954',
          publisher: 'Press Information Bureau',
          sourceClass: 'PRIMARY',
          publishedAt: '1954-04-29T00:00:00.000Z',
          firstAvailableAt: '2020-01-01T00:00:00.000Z', // Digital library availability
          reason: 'PIB archival treaty records.',
          facts: [
            'Signed in April 1954 regarding Tibet Trade',
            'Five principles of peaceful coexistence defined',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-pmjay-audit',
      title: 'CAG audit report on Ayushman Bharat PMJAY',
      category: 'REGULATORY_CHANGE',
      difficulty: 'MEDIUM',
      researchQuestion: 'What irregularities were reported in the CAG audit of the Ayushman Bharat PM-JAY scheme?',
      sourceEnvironment: 'regulator',
      language: 'English',
      geography: 'national',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'CAG audit found lakhs of beneficiaries linked to a single mobile number (9999999999) under PMJAY registration database',
        'uncovered payouts issued to dead patients and claims settled for duplicate registrations',
      ],
      expectedTimelineEvents: [
        { date: '2023-08-08', title: 'CAG tables Ayushman Bharat PM-JAY audit performance report in Parliament' },
      ],
      goldSources: [
        {
          sourceId: 'gold-pmjay-audit-cag',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'Performance Audit of Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
          url: 'https://cag.gov.in/uploads/download_audit_report/2023/PMJAY_Audit_Report_2023.pdf',
          publisher: 'Comptroller and Auditor General of India',
          sourceClass: 'PRIMARY',
          publishedAt: '2023-08-08T12:00:00.000Z',
          firstAvailableAt: '2023-08-08T13:00:00.000Z',
          reason: 'Official audit report presented to Parliament.',
          facts: [
            'Mobile number anomalies in database',
            'Payouts settled for deceased beneficiaries',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-karnataka-res',
      title: 'Karnataka local candidates private jobs reservation bill',
      category: 'POLICY_CHANGE',
      difficulty: 'HARD',
      researchQuestion: 'What percentage of job reservations for local candidates in private sectors did the Karnataka bill propose?',
      sourceEnvironment: 'regional',
      language: 'English',
      geography: 'state',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'Karnataka cabinet approved a bill proposing 50 percent reservation in management positions and 75 percent in non-management jobs for local candidates in private industries',
        'Following backlash from technology companies, the government temporarily suspended bill progress',
      ],
      expectedTimelineEvents: [
        { date: '2024-07-15', title: 'Karnataka Cabinet approves local candidate job reservation bill' },
      ],
      goldSources: [
        {
          sourceId: 'gold-karnataka-bill-pr',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'Karnataka State Employment of Local Candidates in Industries and Factories Bill Cabinet Briefing',
          url: 'https://www.karnataka.gov.in/press-release/local-candidates-private-sector-employment-bill-2024.pdf',
          publisher: 'Government of Karnataka',
          sourceClass: 'PRIMARY',
          publishedAt: '2024-07-15T18:00:00.000Z',
          firstAvailableAt: '2024-07-15T18:30:00.000Z',
          reason: 'State cabinet release describing reservation details.',
          facts: [
            'Proposes 50% reservation in management roles',
            'Proposes 75% reservation in non-management roles',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-ngt-wghats',
      title: 'NGT order on Western Ghats ecologically sensitive areas',
      category: 'REGULATORY_CHANGE',
      difficulty: 'MEDIUM',
      researchQuestion: 'What directives did the National Green Tribunal issue on demarcating Western Ghats ESAs?',
      sourceEnvironment: 'regulator',
      language: 'English',
      geography: 'state',
      temporalMode: 'historical',
      primarySourceAvailability: 'available',
      expectedFacts: [
        'NGT directed MoEFCC to issue final notification on Western Ghats ESAs',
        'prohibited polluting activities in identified sensitive zones pending notification',
      ],
      expectedTimelineEvents: [
        { date: '2024-06-20', title: 'NGT issues binding order on Western Ghats ESA finalisation timeline' },
      ],
      goldSources: [
        {
          sourceId: 'gold-ngt-wghats-order',
          category: 'REGULATORY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'Directives on Western Ghats Ecologically Sensitive Areas Finalization',
          url: 'https://greentribunal.gov.in/orders/ngt-western-ghats-esa-direction-2024.pdf',
          publisher: 'National Green Tribunal',
          sourceClass: 'REGULATORY',
          publishedAt: '2024-06-20T14:00:00.000Z',
          firstAvailableAt: '2024-06-20T14:30:00.000Z',
          reason: 'NGT final order on ecological demarcation timeline.',
          facts: [
            'MoEFCC directed to issue final notification',
            'Polluting activities prohibited',
          ],
          verification: VERIFICATION_SEED,
        },
      ],
    },

    // ── Freshness/Latency Replay Corpus (4 Topics) ────────────────────────────
    {
      topicId: 'topic-mumbai-metro',
      title: 'Mumbai metro line-3 safety certificate',
      category: 'BREAKING_EVENT',
      difficulty: 'EASY',
      researchQuestion: 'When was the safety certification for Mumbai Metro line-3 issued and by whom?',
      sourceEnvironment: 'official',
      language: 'English',
      geography: 'local',
      temporalMode: 'breaking',
      primarySourceAvailability: 'available',
      goldSources: [
        {
          sourceId: 'gold-mumbai-metro-safety',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'CMRS Safety Certification for Mumbai Metro Line-3 Phase-1 Operations',
          url: 'https://cmrs.gov.in/certifications/mumbai-metro-line-3-phase-1-safety-clearance.pdf',
          publisher: 'Commissioner of Metro Railway Safety',
          sourceClass: 'PRIMARY',
          publishedAt: '2026-08-15T09:00:00.000Z',
          firstAvailableAt: '2026-08-15T09:15:30.000Z', // 15m 30s CMRS document upload and indexing delay
          reason: 'Authoritative safety clearance document required for passenger operations.',
          facts: ['CMRS safety certification issued for Mumbai Metro Line-3 Phase-1'],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-sebi-adani',
      title: 'SEBI Adani disclosures warning order',
      category: 'REGULATORY_CHANGE',
      difficulty: 'MEDIUM',
      researchQuestion: 'What disclosure anomalies were identified in the SEBI warning letter to Adani Group?',
      sourceEnvironment: 'regulator',
      language: 'English',
      geography: 'national',
      temporalMode: 'breaking',
      primarySourceAvailability: 'available',
      goldSources: [
        {
          sourceId: 'gold-sebi-adani-warning',
          category: 'REGULATORY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'SEBI Administrative Warning on Related Party Disclosures compliance',
          url: 'https://www.sebi.gov.in/sebiweb/home/warning-letters/sebi-administrative-warning-adani-disclosures.pdf',
          publisher: 'Securities and Exchange Board of India',
          sourceClass: 'REGULATORY',
          publishedAt: '2026-08-15T10:00:00.000Z',
          firstAvailableAt: '2026-08-15T10:05:10.000Z', // 5m 10s SEBI website database sync delay
          reason: 'Official warning letter detailing related-party disclosure anomalies.',
          facts: ['Administrative warning issued on related party disclosures'],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-gst-august',
      title: 'GST Ministry of Finance collections',
      category: 'ECONOMIC_DEVELOPMENT',
      difficulty: 'EASY',
      researchQuestion: 'What were the GST tax collection revenues reported for August 2026 by the Ministry of Finance?',
      sourceEnvironment: 'official',
      language: 'English',
      geography: 'national',
      temporalMode: 'breaking',
      primarySourceAvailability: 'available',
      goldSources: [
        {
          sourceId: 'gold-gst-mof-release',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'GST Revenue Collections for August 2026 hit record levels',
          url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue',
          publisher: 'Press Information Bureau',
          sourceClass: 'PRIMARY',
          publishedAt: '2026-08-15T11:00:00.000Z',
          firstAvailableAt: '2026-08-15T11:05:40.000Z', // 5m 40s PIB wire transmission and indexing delay
          reason: 'Official MoF press release on revenue collections.',
          facts: ['GST revenue collections hit record levels for August 2026'],
          verification: VERIFICATION_SEED,
        },
        {
          sourceId: 'gold-gst-independent-report',
          category: 'SECONDARY',
          goldItemType: 'INDEPENDENT_SOURCE',
          title: 'GST revenue collections hit record in August: Report',
          url: 'https://www.thehindu.com/business/Economy/gst-revenue-august-2026-official-data.html',
          publisher: 'The Hindu',
          sourceClass: 'HIGH_QUALITY_SECONDARY',
          publishedAt: '2026-08-15T11:10:00.000Z',
          firstAvailableAt: '2026-08-15T11:12:30.000Z', // 2m 30s newsroom drafting and secondary reporting delay
          reason: 'Independent secondary media corroboration of official MoF release.',
          facts: ['GST collections hit record levels for August 2026'],
          verification: VERIFICATION_SEED,
        },
      ],
    },
    {
      topicId: 'topic-mh-portfolio',
      title: 'Maharashtra Government cabinet portfolio allocation',
      category: 'POLITICAL_DEVELOPMENT',
      difficulty: 'MEDIUM',
      researchQuestion: 'What cabinet portfolios were allocated in Maharashtra, and which ministries were reassigned?',
      sourceEnvironment: 'regional',
      language: 'Hindi',
      geography: 'state',
      temporalMode: 'breaking',
      primarySourceAvailability: 'available',
      goldSources: [
        {
          sourceId: 'gold-mh-cabinet-notif',
          category: 'PRIMARY',
          goldItemType: 'PRIMARY_SOURCE',
          title: 'महाराष्ट्र कैबिनेट मंत्रियों के विभाग आवंटन की आधिकारिक अधिसूचना २०२६',
          url: 'https://maharashtra.gov.in/cabinet/portfolio-allocation-2026.pdf',
          publisher: 'Government of Maharashtra',
          sourceClass: 'PRIMARY',
          publishedAt: '2026-08-15T11:30:00.000Z',
          firstAvailableAt: '2026-08-15T11:45:20.000Z', // 15m 20s gazette file compilation and upload delay
          reason: 'Authoritative state gazette detailing cabinet portfolio assignments.',
          facts: ['महाराष्ट्र कैबिनेट मंत्रियों के विभागों का आवंटन किया गया'],
          verification: VERIFICATION_SEED,
        },
      ],
    },
  ],
};

// ── 2. Mock Search Documents (The Mock Index) ────────────────────────────────

export const BENCHMARK_MOCK_DOCUMENTS: MockDocument[] = [
  // ── DPDP Act 2023 ──
  {
    url: 'https://www.meity.gov.in/writereaddata/files/Digital-Personal-Data-Protection-Act-2023.pdf',
    title: 'The Digital Personal Data Protection Act, 2023 Gazette Notification',
    content: 'The Digital Personal Data Protection Act 2023 received Presidential assent on August 11 2023. Consent is the fundamental basis for processing personal data. The Act establishes the Data Protection Board of India and prescribes penalties up to 250 crore rupees for non-compliance.',
    publisher: 'Ministry of Electronics and Information Technology',
    publishedAt: '2023-08-11T12:00:00.000Z',
    availableAt: '2023-08-11T14:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── Ayodhya land verdict ──
  {
    url: 'https://sci.gov.in/judgments/Ayodhya_Judgement_2019.pdf',
    title: 'M Siddiq (D) Thr Lrs v. Mahant Suresh Das & Ors Judgement',
    content: 'In a unanimous verdict on November 9 2019, the Supreme Court of India awarded the entire disputed land to Hindu litigants for temple construction. It directed the Government to allocate 5 acres of alternative land to the Sunni Waqf Board. The ASI excavation report showed remnants of a non-Islamic structure.',
    publisher: 'Supreme Court of India',
    publishedAt: '2019-11-09T10:30:00.000Z',
    availableAt: '2019-11-09T11:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  {
    url: 'https://www.jagran.com/news/national-ayodhya-verdict-supreme-court-judgment-hindi-19747582.html',
    title: 'अयोध्या विवाद पर सुप्रीम कोर्ट का ऐतिहासिक फैसला: हिंदू पक्ष को मिली विवादित जमीन, मुस्लिम पक्ष को मिलेगी 5 एकड़ भूमि',
    content: 'अयोध्या विवाद पर सुप्रीम कोर्ट ने एक सर्वसम्मत फैसला सुनाया है। सुप्रीम कोर्ट ने विवादित भूमि हिंदू पक्ष को देने का आदेश दिया। सुप्रीम कोर्ट ने मुस्लिम पक्ष को 5 एकड़ वैकल्पिक भूमि आवंटित करने का आदेश दिया। ऐतिहासिक फैसले में पुरातत्व विभाग की खुदाई के सबूतों का हवाला दिया गया।',
    publisher: 'Dainik Jagran',
    publishedAt: '2019-11-09T11:00:00.000Z',
    availableAt: '2019-11-09T11:15:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'GENERAL_MEDIA',
    language: 'hi',
  },
  // ── RBI MPC repo rate ──
  {
    url: 'https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=58102',
    title: 'Monetary Policy Statement 2026-27 Resolution of the Monetary Policy Committee',
    content: 'The Monetary Policy Committee MPC kept the policy repo rate unchanged at 6.50 percent at its meeting today. Withdrawal of accommodation stance was maintained. Real GDP growth projection for 2026-27 is kept at 7.2 percent.',
    publisher: 'Reserve Bank of India',
    publishedAt: '2026-08-06T10:00:00.000Z',
    availableAt: '2026-08-06T10:15:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── Kaleshwaram Lift Irrigation CAG ──
  {
    url: 'https://cag.gov.in/uploads/download_audit_report/2023/Report_No_6_of_2023_Kaleshwaram_Telangana.pdf',
    title: 'Report of the Comptroller and Auditor General of India on Kaleshwaram Lift Irrigation Project',
    content: 'The CAG report tabled in the Telangana Assembly shows that the Kaleshwaram Lift Irrigation Project is financially unviable. Work was commenced without environmental clearances, leading to cost escalations and unsustainable power tariffs.',
    publisher: 'Comptroller and Auditor General of India',
    publishedAt: '2024-02-15T12:00:00.000Z',
    availableAt: '2024-02-15T13:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── Bihar Panchayat audit fund diversion ──
  {
    url: 'https://panchayatiraj.bih.nic.in/documents/audit-report-local-funds-2025.pdf',
    title: 'पंचायती राज विभाग बिहार सरकार का ऑडिट रिपोर्ट २०२५ फंड विचलन दिशानिर्देश',
    content: 'बिहार पंचायती राज विभाग की जांच रिपोर्ट के अनुसार विकास योजनाओं के फंड को अन्य ब्लॉक स्तर के गैर-स्वीकृत खर्चों के लिए डाइवर्ट कर दिया गया। ग्रामीण शौचालयों में बड़े स्तर पर फर्जी लाभार्थियों को भुगतान पाए जाने के बाद सुधार दिशानिर्देश जारी किए गए।',
    publisher: 'Government of Bihar',
    publishedAt: '2025-05-20T11:00:00.000Z',
    availableAt: '2025-05-20T12:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'hi',
  },
  // ── UN Resolution 47 ──
  {
    url: 'https://undocs.org/S/RES/47(1948)',
    title: 'Resolution 47 (1948) on the India-Pakistan Question',
    content: 'UNSC Resolution 47 adopted in April 1948 details a three-stage sequence. First, Pakistan must withdraw its forces and armed tribesmen. Second, India must reduce its military footprint to a minimum. Third, a free plebiscite must be organized under a UN-appointed administrator.',
    publisher: 'United Nations Security Council',
    publishedAt: '1948-04-21T00:00:00.000Z',
    availableAt: '2020-01-01T00:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── Wayanad landslides ──
  {
    url: 'https://www.mathrubhumi.com/rss/news/kerala-1.976543',
    title: 'വയനാട് ഉരുൾപൊട്ടൽ: മുന്നറിയിപ്പുകൾ നൽകുന്നതിൽ വീഴ്ച വരുത്തിയെന്ന് പ്രാദേശിക റിപ്പോർട്ടുകൾ',
    content: 'കനത്ത മഴയെത്തുടർന്ന് വയനാട്ടിലെ മുണ്ടക്കൈ, ചൂരൽമല പ്രദേശങ്ങളിൽ വൻ ഉരുൾപൊട്ടൽ ദുരന്തം സംഭവിച്ചു. മുൻകൂട്ടി മുന്നറിയിപ്പുകൾ ലഭിച്ചെങ്കിലും പ്രാദേശിക ഭരണകൂടം ആളുകളെ ഒഴിപ്പിക്കുന്നതിൽ കാലതാമസം വരുത്തിയതായി മാധ്യമങ്ങൾ റിപ്പോർട്ട് ചെയ്യുന്നു. ദുരന്തം നേരിടുന്നതിൽ അലാറം സംവിധാനങ്ങൾ പൂർണമായും പരാജയപ്പെട്ടു.',
    publisher: 'Mathrubhumi Kerala',
    publishedAt: '2024-07-31T06:00:00.000Z',
    availableAt: '2024-07-31T06:30:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'GENERAL_MEDIA',
    language: 'ml',
  },
  // ── Panchsheel 1954 ──
  {
    url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=Panchsheel1954',
    title: 'Agreement on Trade and Intercourse between Tibet Region of China and India',
    content: 'The historical treaty signed in Peking in 1954 between India and the Republic of China outlines the five principles of peaceful coexistence Panchsheel including mutual non-aggression and respect for sovereign borders.',
    publisher: 'Press Information Bureau',
    publishedAt: '1954-04-29T00:00:00.000Z',
    availableAt: '2020-01-01T00:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── PMJAY Audit CAG ──
  {
    url: 'https://cag.gov.in/uploads/download_audit_report/2023/PMJAY_Audit_Report_2023.pdf',
    title: 'Performance Audit of Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    content: 'The Comptroller and Auditor General performance report on PM-JAY found massive irregularities, including 7.5 lakh beneficiaries registered in the database under a single invalid phone number 9999999999. In addition, claims were cleared for deceased individuals and duplicate IDs.',
    publisher: 'Comptroller and Auditor General of India',
    publishedAt: '2023-08-08T12:00:00.000Z',
    availableAt: '2023-08-08T13:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── Karnataka jobs reservation bill ──
  {
    url: 'https://www.karnataka.gov.in/press-release/local-candidates-private-sector-employment-bill-2024.pdf',
    title: 'Karnataka Private Sector Local Candidates Employment Bill Cabinet Briefing',
    content: 'The Government of Karnataka cabinet approved a bill proposing 50 percent reservation in management positions and 75 percent reservation in non-management private sector roles for local candidates.',
    publisher: 'Government of Karnataka',
    publishedAt: '2024-07-15T18:00:00.000Z',
    availableAt: '2024-07-15T18:30:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── NGT Western Ghats ──
  {
    url: 'https://greentribunal.gov.in/orders/ngt-western-ghats-esa-direction-2024.pdf',
    title: 'Directives on Western Ghats Ecologically Sensitive Areas Finalization',
    content: 'The National Green Tribunal NGT directed the MoEFCC to issue its final notification on Western Ghats ESAs and prohibited all polluting activities in the ecologically sensitive zones.',
    publisher: 'National Green Tribunal',
    publishedAt: '2024-06-20T14:00:00.000Z',
    availableAt: '2024-06-20T14:30:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },

  // ──── Freshness/Latency Replay Corpus ────
  // ── Mumbai metro CMRS ──
  {
    url: 'https://cmrs.gov.in/certifications/mumbai-metro-line-3-phase-1-safety-clearance.pdf',
    title: 'CMRS Safety Certification for Mumbai Metro Line-3 Phase-1 Operations',
    content: 'The Commissioner of Metro Railway Safety CMRS safety certification was issued for Mumbai Metro Line-3 Phase-1 passenger operations after inspecting safety standards.',
    publisher: 'Commissioner of Metro Railway Safety',
    publishedAt: '2026-08-15T09:00:00.000Z',
    availableAt: '2026-08-15T09:15:30.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── SEBI Adani administrative warning ──
  {
    url: 'https://www.sebi.gov.in/sebiweb/home/warning-letters/sebi-administrative-warning-adani-disclosures.pdf',
    title: 'SEBI Administrative Warning on Related Party Disclosures compliance',
    content: 'SEBI issued an administrative warning letter to the Adani Group regarding compliance anomalies in related party disclosures.',
    publisher: 'Securities and Exchange Board of India',
    publishedAt: '2026-08-15T10:00:00.000Z',
    availableAt: '2026-08-15T10:05:10.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── GST revenue release ──
  {
    url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue',
    title: 'GST Revenue Collections for August 2026 hit record levels',
    content: 'Ministry of Finance press release: GST revenue collections hit record levels for August 2026, showing solid growth in collections.',
    publisher: 'Press Information Bureau',
    publishedAt: '2026-08-15T11:00:00.000Z',
    availableAt: '2026-08-15T11:05:40.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'en',
  },
  // ── GST revenue Hindu corroboration ──
  {
    url: 'https://www.thehindu.com/business/Economy/gst-revenue-august-2026-official-data.html',
    title: 'GST revenue collections hit record in August: Report',
    content: 'The Hindu: Goods and services tax tax GST collections for August 2026 hit record levels, Ministry of Finance reports.',
    publisher: 'The Hindu',
    publishedAt: '2026-08-15T11:10:00.000Z',
    availableAt: '2026-08-15T11:12:30.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    language: 'en',
  },
  // ── MH cabinet notification ──
  {
    url: 'https://maharashtra.gov.in/cabinet/portfolio-allocation-2026.pdf',
    title: 'महाराष्ट्र कैबिनेट मंत्रियों के विभाग आवंटन की आधिकारिक अधिसूचना २०२६',
    content: 'महाराष्ट्र कैबिनेट मंत्रियों के विभागों का आवंटन किया गया है। गृह विभाग और वित्त विभाग सहित सभी महत्वपूर्ण प्रभार आधिकारिक अधिसूचना द्वारा बांटे गए।',
    publisher: 'Government of Maharashtra',
    publishedAt: '2026-08-15T11:30:00.000Z',
    availableAt: '2026-08-15T11:45:20.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'PRIMARY',
    language: 'hi',
  },

  // ── Noise and syndicated copies ──
  {
    url: 'https://aninews.in/news/rbi-mpc-august-2026-repo-rate-unchanged-at-65-percent',
    title: 'RBI MPC keeps policy repo rate unchanged at 6.50% (reprint)',
    content: 'The Reserve Bank of India kept the policy repo rate unchanged at 6.50 percent in its August 2026 meeting. The MPC projected real GDP growth of 7.2 percent for fiscal year 2026-27, maintaining its stance on withdrawal of accommodation.',
    publisher: 'Asian News International',
    publishedAt: '2026-08-06T10:20:00.000Z',
    availableAt: '2026-08-06T10:25:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'SPECIALIST_MEDIA',
    language: 'en',
  },
  {
    url: 'https://economictimes.indiatimes.com/news/economy/policy/rbi-holds-repo-rate-at-6-5-projects-7-2-gdp-growth',
    title: 'RBI holds repo rate at 6.50% in August meeting',
    content: 'Reserve Bank of India governor announced that the repo rate is held at 6.50 percent, and real GDP growth is projected at 7.2 percent for 2026-27. Stance on withdrawal of accommodation is maintained.',
    publisher: 'The Economic Times',
    publishedAt: '2026-08-06T10:30:00.000Z',
    availableAt: '2026-08-06T10:35:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    language: 'en',
  },
  {
    url: 'https://example.com/unrelated-news-1',
    title: 'Stock market indices fluctuate amid global tech earnings results',
    content: 'Global technology stocks fluctuated today following quarterly earnings reports from major tech companies showing mixed results on cloud computing revenues.',
    publisher: 'General Media',
    publishedAt: '2026-08-14T09:00:00.000Z',
    availableAt: '2026-08-14T09:00:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'GENERAL_MEDIA',
    language: 'en',
  },
];

// ── 3. Simple Token-Matching Search Helper ───────────────────────────────────

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Pure deterministic query search over the mock index (respecting simulatedTime) */
export function queryMockIndex(
  queryText: string,
  simulatedTimeIso: string,
  allowedDomains?: string[]
): MockDocument[] {
  const queryTokens = queryText
    .split(/\s+/)
    .map(normalizeToken)
    .filter((t) => t.length > 2);
  const nowTime = new Date(simulatedTimeIso).getTime();

  const scored = BENCHMARK_MOCK_DOCUMENTS.map((doc) => {
    // 1. Enforce temporal boundary: availableAt <= simulatedNow
    const availableTime = new Date(doc.availableAt).getTime();
    if (availableTime > nowTime) return null;

    // 2. Enforce domain constraints if active
    if (allowedDomains && allowedDomains.length > 0) {
      try {
        const docHost = new URL(doc.url).hostname.replace(/^www\./, '').toLowerCase();
        const allowed = allowedDomains.some((d) => docHost.includes(d.toLowerCase()) || d.toLowerCase().includes(docHost));
        if (!allowed) return null;
      } catch {
        return null;
      }
    }

    // 3. Score overlap on query tokens
    const titleText = doc.title.toLowerCase();
    const contentText = doc.content.toLowerCase();
    const publisherText = doc.publisher.toLowerCase();

    let matchCount = 0;
    for (const token of queryTokens) {
      if (titleText.includes(token) || contentText.includes(token) || publisherText.includes(token)) {
        matchCount += 1;
      }
    }

    // Require at least one token overlap (or match if empty query tokens as fallback)
    if (queryTokens.length > 0 && matchCount === 0) return null;

    return { doc, matchCount };
  })
  .filter((x): x is { doc: MockDocument; matchCount: number } => x !== null);

  // Sort by matchCount desc, preserving chronological fallback for tie breaks
  scored.sort((a, b) => b.matchCount - a.matchCount);

  return scored.map((x) => x.doc);
}
