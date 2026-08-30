/**
 * ─── Demand Intelligence Fixture Data ────────────────────────────────────────
 *
 * Realistic Hindi/English search demand data modeled on AnswerThePublic-style
 * search intelligence for Indian policy, governance, and foreign-policy topics.
 *
 * Governing document: docs/editorial/story-selection-framework.md
 *
 * 40 demand opportunities: ~25 English, ~15 Hindi
 * Coverage distribution: ~8 fully_covered, ~10 partially_covered, ~12 gap, ~10 uncovered
 * Trend distribution: ~15 rising, ~8 stable, ~8 declining, ~9 spike
 */

import type {
  DemandOpportunity,
  DemandSummaryMetrics,
  DemandCategory,
} from '@/types/demand-intelligence';

export const DEMAND_OPPORTUNITIES: DemandOpportunity[] = [
  // ── ENGLISH — Foreign Policy ──────────────────────────────────────────────
  {
    id: 'demand-001',
    primaryQuery: { text: 'India China border dispute 2026', language: 'en', monthlyVolume: 74000 },
    relatedQueries: [
      { text: 'India China border map', language: 'en', monthlyVolume: 31000 },
      { text: 'Aksai Chin dispute explained', language: 'en', monthlyVolume: 12400 },
      { text: 'Line of Actual Control explained', language: 'en', monthlyVolume: 18200 },
    ],
    totalMonthlyVolume: 135600,
    trend: 'rising',
    category: 'foreign_policy',
    intent: 'what',
    coverageState: 'gap',
    coverageReason: 'Coverage exists for 2025 Galwan aftermath but lacks updates on 2026 buffer zone agreements and troop withdrawals.',
    existingCoverage: ['The Long Shadow of Galwan', 'Sino-Indian Relations: Foundations'],
    gapScore: 65,
    suggestedResearchBrief: 'Investigate the status of the new buffer zones established in early 2026 along the LAC, including satellite imagery analysis and MEA statements.',
    suggestedResearchQuestions: [
      'What are the exact coordinates and protocols of the 2026 buffer zones?',
      'How has local nomadic herding been affected by the 2026 agreements?',
      'What is the current force posture at Depsang and Demchok?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-002',
    primaryQuery: { text: 'India US trade deal explained', language: 'en', monthlyVolume: 33500 },
    relatedQueries: [
      { text: 'US India semiconductor pact', language: 'en', monthlyVolume: 14200 },
      { text: 'iCET agreement details', language: 'en', monthlyVolume: 8900 },
      { text: 'India US tariffs 2026', language: 'en', monthlyVolume: 11300 },
    ],
    totalMonthlyVolume: 67900,
    trend: 'spike',
    category: 'economy',
    intent: 'explainer',
    coverageState: 'uncovered',
    coverageReason: 'The new high-tech trade framework was announced in July 2026. No existing coverage addresses the semiconductor and AI technology sharing dimensions.',
    existingCoverage: [],
    gapScore: 92,
    suggestedResearchBrief: 'Provide a comprehensive breakdown of the new semiconductor and AI technology sharing pact, including tariff concessions, data localization provisions, and sectoral impact analysis.',
    suggestedResearchQuestions: [
      'What concessions did India make on data localization?',
      'Which Indian tech sectors will benefit most from the pact?',
      'How does this compare to the US–Taiwan CHIPS Act partnerships?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-003',
    primaryQuery: { text: 'Non-alignment policy history', language: 'en', monthlyVolume: 22100 },
    relatedQueries: [
      { text: 'NAM origins', language: 'en', monthlyVolume: 6800 },
      { text: 'Bandung conference 1955', language: 'en', monthlyVolume: 9400 },
      { text: 'India multi-alignment strategy', language: 'en', monthlyVolume: 5300 },
    ],
    totalMonthlyVolume: 43600,
    trend: 'stable',
    category: 'history',
    intent: 'what',
    coverageState: 'partially_covered',
    coverageReason: 'Historical chapters on NAM and Bandung exist but need linking to current multi-alignment strategies and contemporary relevance.',
    existingCoverage: ['Nehruvian Worldview', 'Birth of Non-Alignment', 'Bandung Conference'],
    gapScore: 30,
    suggestedResearchBrief: 'Update the Nehruvian foreign policy series with a contemporary lens connecting the historical NAM to modern strategic autonomy.',
    suggestedResearchQuestions: [
      'How does the current administration view the legacy of NAM?',
      'What are the key differences between NAM and strategic autonomy?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-004',
    primaryQuery: { text: 'India QUAD alliance explained', language: 'en', monthlyVolume: 28700 },
    relatedQueries: [
      { text: 'QUAD members countries', language: 'en', monthlyVolume: 15400 },
      { text: 'QUAD vs NATO difference', language: 'en', monthlyVolume: 7200 },
    ],
    totalMonthlyVolume: 51300,
    trend: 'rising',
    category: 'foreign_policy',
    intent: 'explainer',
    coverageState: 'gap',
    coverageReason: 'Foundational explainer on QUAD exists but lacks 2026 maritime exercise updates and technology sharing agreements.',
    existingCoverage: ['Foundations of Strategic Autonomy'],
    gapScore: 55,
    suggestedResearchBrief: 'Create a living explainer covering QUAD evolution from dialogue to operational military and technology partnership.',
    suggestedResearchQuestions: [
      'What operational military exercises has QUAD conducted in 2026?',
      'How does the QUAD technology agenda overlap with bilateral iCET?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── ENGLISH — Defence ─────────────────────────────────────────────────────
  {
    id: 'demand-005',
    primaryQuery: { text: 'Indian defence budget 2026 breakdown', language: 'en', monthlyVolume: 28400 },
    relatedQueries: [
      { text: 'India military spending vs China', language: 'en', monthlyVolume: 11600 },
      { text: 'Rafale vs Tejas comparison', language: 'en', monthlyVolume: 8900 },
    ],
    totalMonthlyVolume: 48900,
    trend: 'rising',
    category: 'defence',
    intent: 'explainer',
    coverageState: 'gap',
    coverageReason: 'No dedicated defence budget analysis exists. The economy chapter touches on fiscal allocations but not military procurement specifics.',
    existingCoverage: [],
    gapScore: 68,
    suggestedResearchBrief: 'Build a detailed breakdown of the 2026 defence budget: capital vs revenue, Make in India procurement, and comparison with regional powers.',
    suggestedResearchQuestions: [
      'What percentage of the defence budget goes to indigenous procurement?',
      'How has the capital-to-revenue ratio changed since 2020?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-006',
    primaryQuery: { text: 'Agnipath scheme pros cons', language: 'en', monthlyVolume: 19200 },
    relatedQueries: [
      { text: 'Agniveer salary 2026', language: 'en', monthlyVolume: 22000 },
      { text: 'Agnipath scheme latest news', language: 'en', monthlyVolume: 14500 },
    ],
    totalMonthlyVolume: 55700,
    trend: 'declining',
    category: 'defence',
    intent: 'comparison',
    coverageState: 'partially_covered',
    coverageReason: 'Initial explainer exists from 2023. Needs update with 2025 retention data and veteran feedback.',
    existingCoverage: ['India\'s Wars: Modern Military Reform'],
    gapScore: 35,
    suggestedResearchBrief: 'Update the Agnipath analysis with first-cohort completion data, retention statistics, and comparisons with international short-service models.',
    suggestedResearchQuestions: [
      'What is the retention rate for the first Agniveer cohort?',
      'How do short-service commission models work in NATO countries?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── ENGLISH — Governance ──────────────────────────────────────────────────
  {
    id: 'demand-007',
    primaryQuery: { text: 'Kashmir article 370 current status', language: 'en', monthlyVolume: 41200 },
    relatedQueries: [
      { text: 'Article 370 Supreme Court verdict', language: 'en', monthlyVolume: 18500 },
      { text: 'J&K statehood restoration', language: 'en', monthlyVolume: 9200 },
    ],
    totalMonthlyVolume: 68900,
    trend: 'stable',
    category: 'governance',
    intent: 'what',
    coverageState: 'fully_covered',
    coverageReason: 'Comprehensive chapter on Article 370 with Supreme Court analysis, historical context, and current status is published and current.',
    existingCoverage: ['Kashmir 1947–48', 'Integration of Princely States', 'Article 370: Constitutional Analysis'],
    gapScore: 0,
    suggestedResearchBrief: 'No research needed — existing coverage is comprehensive and current.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-008',
    primaryQuery: { text: 'One Nation One Election explained', language: 'en', monthlyVolume: 24600 },
    relatedQueries: [
      { text: 'ONOE pros and cons', language: 'en', monthlyVolume: 8900 },
      { text: 'simultaneous elections India feasibility', language: 'en', monthlyVolume: 5400 },
    ],
    totalMonthlyVolume: 38900,
    trend: 'spike',
    category: 'governance',
    intent: 'explainer',
    coverageState: 'uncovered',
    coverageReason: 'The High Level Committee report was released in March 2026. No coverage of the constitutional amendment process or state-level implications.',
    existingCoverage: [],
    gapScore: 88,
    suggestedResearchBrief: 'Create a definitive explainer covering the constitutional amendments required, state-level impact, and comparative analysis with other democracies.',
    suggestedResearchQuestions: [
      'What constitutional amendments are needed for simultaneous elections?',
      'How would ONOE affect regional parties and federal balance?',
      'Which other democracies conduct simultaneous elections?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-009',
    primaryQuery: { text: 'Uniform Civil Code India status', language: 'en', monthlyVolume: 31800 },
    relatedQueries: [
      { text: 'UCC vs personal law', language: 'en', monthlyVolume: 12100 },
      { text: 'Uttarakhand UCC law', language: 'en', monthlyVolume: 7600 },
    ],
    totalMonthlyVolume: 51500,
    trend: 'rising',
    category: 'governance',
    intent: 'what',
    coverageState: 'partially_covered',
    coverageReason: 'Article 44 coverage exists in the constitutional analysis. Missing Uttarakhand implementation case study and the ongoing parliamentary debate.',
    existingCoverage: ['The Indian Constitution: Directive Principles'],
    gapScore: 40,
    suggestedResearchBrief: 'Expand UCC coverage with Uttarakhand implementation analysis, comparative personal law systems, and the current parliamentary status.',
    suggestedResearchQuestions: [
      'What provisions of the Uttarakhand UCC have been challenged?',
      'How do personal law boards view the proposed national UCC framework?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── ENGLISH — Judiciary ───────────────────────────────────────────────────
  {
    id: 'demand-010',
    primaryQuery: { text: 'Supreme Court collegium controversy', language: 'en', monthlyVolume: 19800 },
    relatedQueries: [
      { text: 'collegium system vs NJAC', language: 'en', monthlyVolume: 8400 },
      { text: 'judicial appointments India', language: 'en', monthlyVolume: 6100 },
    ],
    totalMonthlyVolume: 34300,
    trend: 'rising',
    category: 'judiciary',
    intent: 'what',
    coverageState: 'partially_covered',
    coverageReason: 'Constitutional chapter covers the Three Judges Cases. Missing ongoing reform debate and the 2026 stand-off over appointments.',
    existingCoverage: ['The Indian Constitution: Judiciary Chapter'],
    gapScore: 42,
    suggestedResearchBrief: 'Document the 2026 collegium controversies, government pushback, and compare with judicial appointment systems in the UK, US, and Germany.',
    suggestedResearchQuestions: [
      'How many judicial appointments has the government returned in 2026?',
      'What reforms has the Law Commission recommended?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-011',
    primaryQuery: { text: 'PIL India landmark cases list', language: 'en', monthlyVolume: 16500 },
    relatedQueries: [
      { text: 'public interest litigation history', language: 'en', monthlyVolume: 7200 },
      { text: 'PIL vs writ petition difference', language: 'en', monthlyVolume: 4800 },
    ],
    totalMonthlyVolume: 28500,
    trend: 'stable',
    category: 'judiciary',
    intent: 'list',
    coverageState: 'fully_covered',
    coverageReason: 'Comprehensive PIL analysis with landmark cases is part of the judiciary knowledge collection.',
    existingCoverage: ['The Indian Constitution: PIL and Judicial Activism'],
    gapScore: 5,
    suggestedResearchBrief: 'No major gaps. Consider adding 2026 PIL cases to the existing collection.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── ENGLISH — Economy ─────────────────────────────────────────────────────
  {
    id: 'demand-012',
    primaryQuery: { text: 'India GDP growth rate 2026', language: 'en', monthlyVolume: 45300 },
    relatedQueries: [
      { text: 'India vs China GDP comparison', language: 'en', monthlyVolume: 28700 },
      { text: 'India economic survey highlights', language: 'en', monthlyVolume: 11200 },
    ],
    totalMonthlyVolume: 85200,
    trend: 'stable',
    category: 'economy',
    intent: 'what',
    coverageState: 'fully_covered',
    coverageReason: 'GDP dataset with quarterly updates and comparison visualisations is maintained in the Indian Economy collection.',
    existingCoverage: ['Indian Economy: GDP Dashboard', 'India vs World: Growth Trajectories'],
    gapScore: 0,
    suggestedResearchBrief: 'No research needed — existing coverage includes live data feeds.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-013',
    primaryQuery: { text: 'India inflation rate food prices', language: 'en', monthlyVolume: 21400 },
    relatedQueries: [
      { text: 'onion price India why', language: 'en', monthlyVolume: 8600 },
      { text: 'CPI India 2026', language: 'en', monthlyVolume: 5100 },
    ],
    totalMonthlyVolume: 35100,
    trend: 'spike',
    category: 'economy',
    intent: 'why',
    coverageState: 'gap',
    coverageReason: 'CPI dataset exists but lacks narrative analysis of food price volatility and its political economy drivers.',
    existingCoverage: ['Indian Economy: Inflation Dashboard'],
    gapScore: 52,
    suggestedResearchBrief: 'Build a food inflation explainer connecting APMC reform, supply chain disruptions, and election-year policy responses.',
    suggestedResearchQuestions: [
      'What role do export bans play in domestic food price management?',
      'How does the MSP mechanism interact with open market prices?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-014',
    primaryQuery: { text: 'cryptocurrency regulation India 2026', language: 'en', monthlyVolume: 18900 },
    relatedQueries: [
      { text: 'crypto tax India', language: 'en', monthlyVolume: 14300 },
      { text: 'digital rupee CBDC India', language: 'en', monthlyVolume: 9800 },
    ],
    totalMonthlyVolume: 43000,
    trend: 'rising',
    category: 'economy',
    intent: 'what',
    coverageState: 'uncovered',
    coverageReason: 'No coverage of India\'s evolving crypto regulatory framework or the RBI\'s digital rupee pilot results.',
    existingCoverage: [],
    gapScore: 80,
    suggestedResearchBrief: 'Document the regulatory evolution from the 2018 RBI ban to 2026 framework, including the 30% tax regime and CBDC pilot evaluation.',
    suggestedResearchQuestions: [
      'What are the key provisions of the proposed Cryptocurrency Bill?',
      'How has the digital rupee pilot performed across participating banks?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── ENGLISH — Elections ───────────────────────────────────────────────────
  {
    id: 'demand-015',
    primaryQuery: { text: 'EVM vs ballot paper debate India', language: 'en', monthlyVolume: 26300 },
    relatedQueries: [
      { text: 'EVM tampering possible', language: 'en', monthlyVolume: 18400 },
      { text: 'VVPAT India explained', language: 'en', monthlyVolume: 9100 },
    ],
    totalMonthlyVolume: 53800,
    trend: 'declining',
    category: 'elections',
    intent: 'comparison',
    coverageState: 'partially_covered',
    coverageReason: 'EVM explainer exists but needs the 2026 Supreme Court VVPAT verdict analysis and global voting technology comparison.',
    existingCoverage: ['Indian Elections: Voting Technology'],
    gapScore: 38,
    suggestedResearchBrief: 'Update EVM analysis with the 2026 Supreme Court ruling on VVPAT verification and comparative data from Germany, Estonia, and Brazil.',
    suggestedResearchQuestions: [
      'What percentage of VVPAT slips are currently verified?',
      'Why did Germany abandon electronic voting?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-016',
    primaryQuery: { text: 'delimitation commission India 2026', language: 'en', monthlyVolume: 15800 },
    relatedQueries: [
      { text: 'delimitation impact South India', language: 'en', monthlyVolume: 8900 },
      { text: 'Lok Sabha seats increase 2026', language: 'en', monthlyVolume: 6200 },
    ],
    totalMonthlyVolume: 30900,
    trend: 'spike',
    category: 'elections',
    intent: 'what',
    coverageState: 'uncovered',
    coverageReason: 'The delimitation exercise has been politically explosive. No coverage of the North-South seat redistribution debate.',
    existingCoverage: [],
    gapScore: 90,
    suggestedResearchBrief: 'This is a foundational explainer opportunity: the delimitation debate touches representation, federalism, and population policy. Build the definitive analysis.',
    suggestedResearchQuestions: [
      'How would delimitation based on 2026 census change the Lok Sabha composition?',
      'What protections exist for states with lower population growth?',
      'How has delimitation worked in federations like Australia and Canada?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── ENGLISH — History ─────────────────────────────────────────────────────
  {
    id: 'demand-017',
    primaryQuery: { text: 'partition of India 1947 explained', language: 'en', monthlyVolume: 38900 },
    relatedQueries: [
      { text: 'Mountbatten Plan', language: 'en', monthlyVolume: 12100 },
      { text: 'Radcliffe Line drawing', language: 'en', monthlyVolume: 7400 },
    ],
    totalMonthlyVolume: 58400,
    trend: 'stable',
    category: 'history',
    intent: 'explainer',
    coverageState: 'fully_covered',
    coverageReason: 'The Partition and Its Legacies is a published Gold Standard chapter with full evidence spine.',
    existingCoverage: ['The Partition and Its Legacies', 'India\'s Strategic Inheritance'],
    gapScore: 0,
    suggestedResearchBrief: 'No research needed — this is a published Gold Standard chapter.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-018',
    primaryQuery: { text: '1962 India China war causes', language: 'en', monthlyVolume: 17600 },
    relatedQueries: [
      { text: 'Henderson Brooks report', language: 'en', monthlyVolume: 4200 },
      { text: 'Forward Policy Nehru', language: 'en', monthlyVolume: 3100 },
    ],
    totalMonthlyVolume: 24900,
    trend: 'stable',
    category: 'history',
    intent: 'why',
    coverageState: 'fully_covered',
    coverageReason: 'The 1962 War is a published chapter with primary source analysis including Maxwell and Neville.',
    existingCoverage: ['The 1962 War', 'Sino-Indian Relations', 'Lessons Learned'],
    gapScore: 0,
    suggestedResearchBrief: 'No research needed.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── ENGLISH — Society ─────────────────────────────────────────────────────
  {
    id: 'demand-019',
    primaryQuery: { text: 'caste census India debate', language: 'en', monthlyVolume: 23100 },
    relatedQueries: [
      { text: 'OBC population India', language: 'en', monthlyVolume: 9800 },
      { text: 'Mandal Commission data', language: 'en', monthlyVolume: 6200 },
    ],
    totalMonthlyVolume: 39100,
    trend: 'spike',
    category: 'society',
    intent: 'what',
    coverageState: 'uncovered',
    coverageReason: 'Highly contested political topic with no existing coverage. Data from the Bihar caste census is referenced in news but lacks analysis.',
    existingCoverage: [],
    gapScore: 85,
    suggestedResearchBrief: 'Build a comprehensive explainer: what a caste census is, historical precedents (1931, Mandal), Bihar pilot results, and political implications.',
    suggestedResearchQuestions: [
      'What methodology was used in the Bihar caste census?',
      'How would a national caste census affect reservation policy?',
      'What are the technical challenges of enumerating caste?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-020',
    primaryQuery: { text: 'lateral entry in civil services India', language: 'en', monthlyVolume: 14200 },
    relatedQueries: [
      { text: 'lateral entry UPSC controversy', language: 'en', monthlyVolume: 7800 },
      { text: 'IAS vs lateral entry comparison', language: 'en', monthlyVolume: 4100 },
    ],
    totalMonthlyVolume: 26100,
    trend: 'declining',
    category: 'governance',
    intent: 'comparison',
    coverageState: 'gap',
    coverageReason: 'The governance chapter mentions bureaucratic reform but lateral entry specifics — reservation implications, performance data — are missing.',
    existingCoverage: ['Governance: Civil Service Reform Overview'],
    gapScore: 55,
    suggestedResearchBrief: 'Create a lateral entry deep-dive: appointments made, reservation debate, performance audit of existing lateral entrants, and UK/Singapore comparisons.',
    suggestedResearchQuestions: [
      'How many lateral entry appointments have been made and in which ministries?',
      'What performance metrics exist for lateral entrants vs career civil servants?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── HINDI — Foreign Policy ────────────────────────────────────────────────
  {
    id: 'demand-021',
    primaryQuery: { text: 'भारत पाकिस्तान सम्बन्ध', language: 'hi', transliteration: 'Bharat Pakistan sambandh', monthlyVolume: 18300 },
    relatedQueries: [
      { text: 'भारत पाक युद्ध इतिहास', language: 'hi', transliteration: 'Bharat Pak yuddh itihas', monthlyVolume: 7600 },
      { text: 'कश्मीर समस्या क्या है', language: 'hi', transliteration: 'Kashmir samasya kya hai', monthlyVolume: 9200 },
    ],
    totalMonthlyVolume: 35100,
    trend: 'rising',
    category: 'foreign_policy',
    intent: 'what',
    coverageState: 'gap',
    coverageReason: 'English coverage of India-Pakistan relations is partial. Hindi-language demand for this topic is significant and entirely unserved.',
    existingCoverage: ['Kashmir 1947–48'],
    gapScore: 70,
    suggestedResearchBrief: 'Consider a Hindi explainer series on India-Pakistan relations from Partition to present, building on existing English chapters.',
    suggestedResearchQuestions: [
      'What are the key diplomatic turning points since Lahore Declaration (1999)?',
      'How does the Hindi-speaking audience frame the bilateral relationship differently from English media?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-022',
    primaryQuery: { text: 'भारत की विदेश नीति क्या है', language: 'hi', transliteration: 'Bharat ki videsh niti kya hai', monthlyVolume: 12400 },
    relatedQueries: [
      { text: 'गुटनिरपेक्ष आंदोलन', language: 'hi', transliteration: 'Gutnirpeksh andolan', monthlyVolume: 5800 },
      { text: 'भारत संयुक्त राष्ट्र सुरक्षा परिषद', language: 'hi', transliteration: 'Bharat Sanyukt Rashtra Suraksha Parishad', monthlyVolume: 3200 },
    ],
    totalMonthlyVolume: 21400,
    trend: 'rising',
    category: 'foreign_policy',
    intent: 'what',
    coverageState: 'uncovered',
    coverageReason: 'Foreign policy content is English-only. Hindi audience has no entry point for understanding India\'s strategic posture.',
    existingCoverage: [],
    gapScore: 82,
    suggestedResearchBrief: 'Build a Hindi-first foreign policy explainer covering NAM, Look East, Act East, and the current multi-alignment doctrine.',
    suggestedResearchQuestions: [
      'What primary Hindi-language sources exist for foreign policy (Rajya Sabha debates, MEA Hindi releases)?',
      'How do UPSC Hindi-medium students currently access foreign policy material?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── HINDI — Governance ────────────────────────────────────────────────────
  {
    id: 'demand-023',
    primaryQuery: { text: 'संविधान का अनुच्छेद 370 क्या है', language: 'hi', transliteration: 'Samvidhan ka anuchhed 370 kya hai', monthlyVolume: 27800 },
    relatedQueries: [
      { text: 'धारा 370 हटाने के फायदे', language: 'hi', transliteration: 'Dhara 370 hatane ke fayde', monthlyVolume: 11200 },
      { text: 'जम्मू कश्मीर विशेष दर्जा', language: 'hi', transliteration: 'Jammu Kashmir vishesh darja', monthlyVolume: 6400 },
    ],
    totalMonthlyVolume: 45400,
    trend: 'stable',
    category: 'governance',
    intent: 'what',
    coverageState: 'partially_covered',
    coverageReason: 'English Article 370 coverage is comprehensive. Hindi version would serve a massive audience but does not yet exist.',
    existingCoverage: ['Article 370: Constitutional Analysis'],
    gapScore: 35,
    suggestedResearchBrief: 'Translate and adapt the existing English Article 370 analysis for Hindi readers, adding Hindi-language primary sources (Lok Sabha debates).',
    suggestedResearchQuestions: [
      'Which Lok Sabha debates in Hindi are most relevant to the 370 revocation?',
      'What Hindi-language constitutional commentaries discuss Article 370?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-024',
    primaryQuery: { text: 'पंचायती राज व्यवस्था कैसे काम करती है', language: 'hi', transliteration: 'Panchayati Raj vyavastha kaise kaam karti hai', monthlyVolume: 16800 },
    relatedQueries: [
      { text: '73वां संविधान संशोधन', language: 'hi', transliteration: '73va samvidhan sanshodhan', monthlyVolume: 8400 },
      { text: 'ग्राम सभा और ग्राम पंचायत अंतर', language: 'hi', transliteration: 'Gram sabha aur gram panchayat antar', monthlyVolume: 5600 },
    ],
    totalMonthlyVolume: 30800,
    trend: 'rising',
    category: 'governance',
    intent: 'how',
    coverageState: 'uncovered',
    coverageReason: 'No coverage of local governance structures in Hindi. This is foundational knowledge for rural India.',
    existingCoverage: [],
    gapScore: 78,
    suggestedResearchBrief: 'Build a Hindi explainer on the three-tier panchayati raj system, 73rd Amendment, and real-world implementation challenges.',
    suggestedResearchQuestions: [
      'What is the average fund utilisation rate at the gram panchayat level?',
      'How has women\'s reservation in panchayats impacted local governance outcomes?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── HINDI — Elections ─────────────────────────────────────────────────────
  {
    id: 'demand-025',
    primaryQuery: { text: 'भारतीय चुनाव प्रणाली कैसे काम करती है', language: 'hi', transliteration: 'Bharatiya chunav pranali kaise kaam karti hai', monthlyVolume: 14600 },
    relatedQueries: [
      { text: 'EVM क्या है', language: 'hi', transliteration: 'EVM kya hai', monthlyVolume: 8200 },
      { text: 'चुनाव आयोग भारत', language: 'hi', transliteration: 'Chunav Ayog Bharat', monthlyVolume: 5900 },
    ],
    totalMonthlyVolume: 28700,
    trend: 'rising',
    category: 'elections',
    intent: 'how',
    coverageState: 'gap',
    coverageReason: 'English election explainers exist but no Hindi-language entry point for understanding the electoral system.',
    existingCoverage: ['Indian Elections: The System'],
    gapScore: 62,
    suggestedResearchBrief: 'Create a Hindi explainer covering FPTP, EVM/VVPAT, model code of conduct, and voter registration — accessible to first-time voters.',
    suggestedResearchQuestions: [
      'What is the voter registration process for Hindi-speaking first-time voters?',
      'How does the model code of conduct differ in Hindi belt states?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── HINDI — Defence ───────────────────────────────────────────────────────
  {
    id: 'demand-026',
    primaryQuery: { text: 'रक्षा बजट 2026', language: 'hi', transliteration: 'Raksha bajat 2026', monthlyVolume: 9800 },
    relatedQueries: [
      { text: 'भारतीय सेना ताकत', language: 'hi', transliteration: 'Bharatiya sena takat', monthlyVolume: 12300 },
      { text: 'तेजस लड़ाकू विमान', language: 'hi', transliteration: 'Tejas ladaku viman', monthlyVolume: 7400 },
    ],
    totalMonthlyVolume: 29500,
    trend: 'spike',
    category: 'defence',
    intent: 'what',
    coverageState: 'gap',
    coverageReason: 'Defence content is English-only. Hindi audience interested in military capability analysis has no entry point.',
    existingCoverage: [],
    gapScore: 72,
    suggestedResearchBrief: 'Create a Hindi defence budget breakdown with indigenous procurement focus (Tejas, BrahMos, INS Vikrant) for the Hindi-speaking audience.',
    suggestedResearchQuestions: [
      'What Hindi-language MOD publications exist for budget analysis?',
      'How does Rajya Raksha Mantri communicate defence priorities in Hindi?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── HINDI — Economy ───────────────────────────────────────────────────────
  {
    id: 'demand-027',
    primaryQuery: { text: 'भारत की जीडीपी कितनी है', language: 'hi', transliteration: 'Bharat ki GDP kitni hai', monthlyVolume: 22500 },
    relatedQueries: [
      { text: 'भारत vs चीन अर्थव्यवस्था', language: 'hi', transliteration: 'Bharat vs Chin arthavyavastha', monthlyVolume: 11400 },
      { text: 'भारत तीसरी सबसे बड़ी अर्थव्यवस्था', language: 'hi', transliteration: 'Bharat tisri sabse badi arthavyavastha', monthlyVolume: 6800 },
    ],
    totalMonthlyVolume: 40700,
    trend: 'stable',
    category: 'economy',
    intent: 'what',
    coverageState: 'fully_covered',
    coverageReason: 'GDP data is available via the economy dashboard. Hindi-specific narrative could be added but data layer serves the demand.',
    existingCoverage: ['Indian Economy: GDP Dashboard'],
    gapScore: 10,
    suggestedResearchBrief: 'Consider a Hindi narrative layer for the GDP dashboard explaining what the numbers mean for the common citizen.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-028',
    primaryQuery: { text: 'महंगाई दर 2026 भारत', language: 'hi', transliteration: 'Mehangai dar 2026 Bharat', monthlyVolume: 11200 },
    relatedQueries: [
      { text: 'प्याज के दाम क्यों बढ़ रहे हैं', language: 'hi', transliteration: 'Pyaaz ke daam kyun badh rahe hain', monthlyVolume: 8600 },
      { text: 'RBI ब्याज दर', language: 'hi', transliteration: 'RBI byaj dar', monthlyVolume: 5400 },
    ],
    totalMonthlyVolume: 25200,
    trend: 'spike',
    category: 'economy',
    intent: 'why',
    coverageState: 'gap',
    coverageReason: 'Inflation data exists in English. Hindi audience asking "why are onion prices rising" has no explanatory content.',
    existingCoverage: ['Indian Economy: Inflation Dashboard'],
    gapScore: 58,
    suggestedResearchBrief: 'Build a Hindi explainer connecting food inflation, APMC mandis, MSP policy, and RBI monetary response — in language accessible to non-economists.',
    suggestedResearchQuestions: [
      'What is the APMC mandi system and how does it affect food prices?',
      'How does RBI monetary policy transmit to retail prices?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── HINDI — History ───────────────────────────────────────────────────────
  {
    id: 'demand-029',
    primaryQuery: { text: 'भारत का विभाजन क्यों हुआ', language: 'hi', transliteration: 'Bharat ka vibhajan kyun hua', monthlyVolume: 19400 },
    relatedQueries: [
      { text: 'विभाजन 1947 कारण', language: 'hi', transliteration: 'Vibhajan 1947 karan', monthlyVolume: 8200 },
      { text: 'माउंटबेटन योजना', language: 'hi', transliteration: 'Mountbatten yojana', monthlyVolume: 4300 },
    ],
    totalMonthlyVolume: 31900,
    trend: 'stable',
    category: 'history',
    intent: 'why',
    coverageState: 'partially_covered',
    coverageReason: 'English Partition chapter is Gold Standard. Hindi adaptation needed for the massive Hindi-medium UPSC and school audience.',
    existingCoverage: ['The Partition and Its Legacies'],
    gapScore: 28,
    suggestedResearchBrief: 'Adapt the Gold Standard Partition chapter for Hindi readers, incorporating Hindi-language primary sources and oral histories.',
    suggestedResearchQuestions: [
      'What Hindi-language archives exist for Partition testimonies?',
      'How do NCERT Hindi textbooks currently present the Partition narrative?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── HINDI — Judiciary ─────────────────────────────────────────────────────
  {
    id: 'demand-030',
    primaryQuery: { text: 'सुप्रीम कोर्ट कैसे काम करता है', language: 'hi', transliteration: 'Supreme Court kaise kaam karta hai', monthlyVolume: 13200 },
    relatedQueries: [
      { text: 'भारत में न्यायपालिका', language: 'hi', transliteration: 'Bharat mein nyaypalika', monthlyVolume: 7100 },
      { text: 'जनहित याचिका कैसे दायर करें', language: 'hi', transliteration: 'Janhit yachika kaise dayar karein', monthlyVolume: 5600 },
    ],
    totalMonthlyVolume: 25900,
    trend: 'rising',
    category: 'judiciary',
    intent: 'how',
    coverageState: 'uncovered',
    coverageReason: 'No Hindi-language judiciary explainers exist. Massive demand from law students and civics learners.',
    existingCoverage: [],
    gapScore: 84,
    suggestedResearchBrief: 'Create a comprehensive Hindi explainer on the Indian judiciary: structure, appointment, PIL process, and landmark verdicts in accessible language.',
    suggestedResearchQuestions: [
      'What Hindi-language Supreme Court judgments are available on the court website?',
      'How do district courts operate for Hindi-speaking litigants?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── HINDI — Society ───────────────────────────────────────────────────────
  {
    id: 'demand-031',
    primaryQuery: { text: 'आरक्षण व्यवस्था भारत', language: 'hi', transliteration: 'Aarakshan vyavastha Bharat', monthlyVolume: 31200 },
    relatedQueries: [
      { text: 'OBC आरक्षण कितना प्रतिशत', language: 'hi', transliteration: 'OBC aarakshan kitna pratishat', monthlyVolume: 14500 },
      { text: 'EWS आरक्षण सुप्रीम कोर्ट', language: 'hi', transliteration: 'EWS aarakshan Supreme Court', monthlyVolume: 8900 },
    ],
    totalMonthlyVolume: 54600,
    trend: 'rising',
    category: 'society',
    intent: 'what',
    coverageState: 'gap',
    coverageReason: 'Reservation is a core knowledge gap. English content scratches the surface. Hindi audience needs a definitive, data-backed explainer.',
    existingCoverage: [],
    gapScore: 75,
    suggestedResearchBrief: 'Build the definitive Hindi reservation explainer: constitutional basis, Mandal Commission, creamy layer, EWS quota, and Supreme Court jurisprudence.',
    suggestedResearchQuestions: [
      'What is the 50% ceiling and which states have exceeded it?',
      'How has the EWS quota affected unreserved category representation?',
      'What data exists on reservation utilisation rates across categories?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── Additional English opportunities ──────────────────────────────────────
  {
    id: 'demand-032',
    primaryQuery: { text: 'India water crisis 2026', language: 'en', monthlyVolume: 27600 },
    relatedQueries: [
      { text: 'Jal Shakti Mission results', language: 'en', monthlyVolume: 6800 },
      { text: 'India river linking project', language: 'en', monthlyVolume: 8100 },
    ],
    totalMonthlyVolume: 42500,
    trend: 'spike',
    category: 'society',
    intent: 'what',
    coverageState: 'uncovered',
    coverageReason: 'Climate-water nexus is a critical gap. No coverage of the river-linking project or groundwater depletion data.',
    existingCoverage: [],
    gapScore: 88,
    suggestedResearchBrief: 'Build a comprehensive water crisis explainer: groundwater depletion maps, Jal Shakti outcomes, river-linking feasibility, and interstate disputes.',
    suggestedResearchQuestions: [
      'What is the current groundwater extraction rate vs recharge rate by state?',
      'How has Jal Jeevan Mission performed against its 2024 targets?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-033',
    primaryQuery: { text: 'India nuclear doctrine', language: 'en', monthlyVolume: 11800 },
    relatedQueries: [
      { text: 'no first use policy India', language: 'en', monthlyVolume: 6400 },
      { text: 'India nuclear triad', language: 'en', monthlyVolume: 4200 },
    ],
    totalMonthlyVolume: 22400,
    trend: 'declining',
    category: 'defence',
    intent: 'what',
    coverageState: 'fully_covered',
    coverageReason: 'Covered in the defence and strategic autonomy chapters with Pokhran analysis.',
    existingCoverage: ['Foundations of Strategic Autonomy', 'India\'s Wars: Nuclear Dimension'],
    gapScore: 5,
    suggestedResearchBrief: 'No research needed — existing coverage is current.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-034',
    primaryQuery: { text: 'Northeast India insurgency explained', language: 'en', monthlyVolume: 8900 },
    relatedQueries: [
      { text: 'Manipur crisis 2026', language: 'en', monthlyVolume: 14200 },
      { text: 'AFSPA India explained', language: 'en', monthlyVolume: 7600 },
    ],
    totalMonthlyVolume: 30700,
    trend: 'rising',
    category: 'governance',
    intent: 'explainer',
    coverageState: 'uncovered',
    coverageReason: 'Northeast India is a significant coverage blind spot across all collections.',
    existingCoverage: [],
    gapScore: 85,
    suggestedResearchBrief: 'Build a foundational Northeast India explainer: AFSPA, ethnic conflicts, peace accords, and development indicators.',
    suggestedResearchQuestions: [
      'What peace accords are currently active in Northeast India?',
      'How has AFSPA application changed since the partial withdrawal in 2022?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-035',
    primaryQuery: { text: 'India renewable energy progress', language: 'en', monthlyVolume: 15400 },
    relatedQueries: [
      { text: 'solar energy India 2026 capacity', language: 'en', monthlyVolume: 8100 },
      { text: 'India net zero target', language: 'en', monthlyVolume: 6200 },
    ],
    totalMonthlyVolume: 29700,
    trend: 'rising',
    category: 'economy',
    intent: 'what',
    coverageState: 'partially_covered',
    coverageReason: 'Renewable energy dataset exists with capacity data. Missing narrative on policy mechanisms, subsidy structure, and grid integration challenges.',
    existingCoverage: ['Indian Economy: Energy Dashboard'],
    gapScore: 45,
    suggestedResearchBrief: 'Build a renewable energy story arc: policy evolution, PLI schemes, grid integration challenges, and progress toward the 500 GW target.',
    suggestedResearchQuestions: [
      'What is the current installed renewable capacity vs the 2030 target?',
      'How is India managing grid stability with variable renewable generation?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },

  // ── Additional Hindi opportunities ────────────────────────────────────────
  {
    id: 'demand-036',
    primaryQuery: { text: 'अग्निपथ योजना क्या है', language: 'hi', transliteration: 'Agnipath yojana kya hai', monthlyVolume: 24800 },
    relatedQueries: [
      { text: 'अग्निवीर वेतन 2026', language: 'hi', transliteration: 'Agniveer vetan 2026', monthlyVolume: 18200 },
      { text: 'अग्निपथ योजना के फायदे और नुकसान', language: 'hi', transliteration: 'Agnipath yojana ke fayde aur nuksan', monthlyVolume: 9400 },
    ],
    totalMonthlyVolume: 52400,
    trend: 'declining',
    category: 'defence',
    intent: 'what',
    coverageState: 'gap',
    coverageReason: 'English Agnipath analysis exists but Hindi audience — the primary recruitment demographic — has no content.',
    existingCoverage: ['India\'s Wars: Modern Military Reform'],
    gapScore: 60,
    suggestedResearchBrief: 'Adapt and expand the Agnipath analysis for Hindi readers, adding recruitment statistics, veteran testimonies, and comparison with SSC models.',
    suggestedResearchQuestions: [
      'What is the demographic profile of Agniveer applicants by state and language?',
      'How do Hindi-language defence forums discuss the scheme?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-037',
    primaryQuery: { text: 'भारत में शिक्षा नीति 2020', language: 'hi', transliteration: 'Bharat mein shiksha niti 2020', monthlyVolume: 19600 },
    relatedQueries: [
      { text: 'NEP 2020 हिंदी में', language: 'hi', transliteration: 'NEP 2020 Hindi mein', monthlyVolume: 11400 },
      { text: '5+3+3+4 शिक्षा प्रणाली', language: 'hi', transliteration: '5+3+3+4 shiksha pranali', monthlyVolume: 7200 },
    ],
    totalMonthlyVolume: 38200,
    trend: 'rising',
    category: 'society',
    intent: 'what',
    coverageState: 'uncovered',
    coverageReason: 'NEP 2020 implementation is well into its fourth year with no coverage in Hindi or English.',
    existingCoverage: [],
    gapScore: 86,
    suggestedResearchBrief: 'Build a definitive NEP 2020 explainer: 5+3+3+4 structure, mother-tongue instruction, multidisciplinary universities, and state-level implementation status.',
    suggestedResearchQuestions: [
      'Which states have fully implemented the NEP 2020 framework?',
      'How has the mother-tongue instruction provision been received in non-Hindi states?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-038',
    primaryQuery: { text: 'लोकसभा और राज्यसभा में अंतर', language: 'hi', transliteration: 'Lok Sabha aur Rajya Sabha mein antar', monthlyVolume: 28400 },
    relatedQueries: [
      { text: 'संसद कैसे काम करती है', language: 'hi', transliteration: 'Sansad kaise kaam karti hai', monthlyVolume: 12800 },
      { text: 'बजट सत्र क्या होता है', language: 'hi', transliteration: 'Budget satra kya hota hai', monthlyVolume: 6200 },
    ],
    totalMonthlyVolume: 47400,
    trend: 'stable',
    category: 'governance',
    intent: 'comparison',
    coverageState: 'fully_covered',
    coverageReason: 'Parliamentary system explainers are part of the constitution collection — though a dedicated Hindi version would serve demand better.',
    existingCoverage: ['The Indian Constitution: Parliamentary System'],
    gapScore: 8,
    suggestedResearchBrief: 'Consider adding Hindi narrative to the existing parliamentary system content.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-039',
    primaryQuery: { text: 'भारत में बेरोजगारी दर', language: 'hi', transliteration: 'Bharat mein berojgari dar', monthlyVolume: 17600 },
    relatedQueries: [
      { text: 'युवा बेरोजगारी भारत', language: 'hi', transliteration: 'Yuva berojgari Bharat', monthlyVolume: 9200 },
      { text: 'CMIE रोजगार आंकड़े', language: 'hi', transliteration: 'CMIE rojgar ankde', monthlyVolume: 3400 },
    ],
    totalMonthlyVolume: 30200,
    trend: 'rising',
    category: 'economy',
    intent: 'what',
    coverageState: 'gap',
    coverageReason: 'Employment data exists in the economy dashboard (English). Hindi audience interested in youth unemployment has no explanatory content.',
    existingCoverage: ['Indian Economy: Employment Dashboard'],
    gapScore: 55,
    suggestedResearchBrief: 'Build a Hindi youth employment analysis: CMIE data, PLFS surveys, skill gap diagnosis, and government scheme effectiveness (PMKVY, Mudra).',
    suggestedResearchQuestions: [
      'What does the PLFS data show about urban vs rural employment trends?',
      'How effective have skill development schemes been by state?',
    ],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'demand-040',
    primaryQuery: { text: 'वैज्ञानिक दृष्टिकोण मौलिक कर्तव्य', language: 'hi', transliteration: 'Vaigyanik drishtikon maulik kartavya', monthlyVolume: 4200 },
    relatedQueries: [
      { text: 'अनुच्छेद 51A(h) क्या है', language: 'hi', transliteration: 'Anuchhed 51A(h) kya hai', monthlyVolume: 2100 },
      { text: 'मौलिक कर्तव्य सूची', language: 'hi', transliteration: 'Maulik kartavya suchi', monthlyVolume: 5800 },
    ],
    totalMonthlyVolume: 12100,
    trend: 'declining',
    category: 'society',
    intent: 'what',
    coverageState: 'fully_covered',
    coverageReason: 'Fundamental duties are covered in the constitution collection. Low demand and stable — no gap.',
    existingCoverage: ['The Indian Constitution: Fundamental Duties'],
    gapScore: 0,
    suggestedResearchBrief: 'No research needed.',
    suggestedResearchQuestions: [],
    lastAssessedAt: '2026-08-18T00:00:00Z',
  },
];

// ── Metrics computation ─────────────────────────────────────────────────────

export function computeDemandMetrics(opportunities: DemandOpportunity[]): DemandSummaryMetrics {
  let totalMonthlyVolume = 0;
  let gapCount = 0;
  let uncoveredCount = 0;
  let risingCount = 0;
  let spikeCount = 0;
  let hindiQueryCount = 0;
  let englishQueryCount = 0;

  const categoryVolumes: Partial<Record<DemandCategory, number>> = {};

  for (const opp of opportunities) {
    totalMonthlyVolume += opp.totalMonthlyVolume;

    if (opp.coverageState === 'gap') gapCount++;
    if (opp.coverageState === 'uncovered') uncoveredCount++;
    if (opp.trend === 'rising') risingCount++;
    if (opp.trend === 'spike') spikeCount++;
    if (opp.primaryQuery.language === 'hi') hindiQueryCount++;
    if (opp.primaryQuery.language === 'en') englishQueryCount++;

    categoryVolumes[opp.category] = (categoryVolumes[opp.category] ?? 0) + opp.totalMonthlyVolume;
  }

  // Find top category
  let topCategory: DemandCategory = 'foreign_policy';
  let topCategoryVolume = 0;
  for (const [cat, vol] of Object.entries(categoryVolumes)) {
    if (vol > topCategoryVolume) {
      topCategory = cat as DemandCategory;
      topCategoryVolume = vol;
    }
  }

  return {
    totalQueries: opportunities.length,
    totalMonthlyVolume,
    gapCount,
    uncoveredCount,
    risingCount,
    spikeCount,
    topCategory,
    topCategoryVolume,
    hindiQueryCount,
    englishQueryCount,
  };
}
