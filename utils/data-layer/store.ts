/**
 * THE BREAKDOWN — API Data Store
 *
 * In-memory data store seeded from mock content.
 * Provides query, filter, sort, paginate, and search across all entity types.
 * In production, this would wrap a database or the Memory Engine.
 */

import type {
  APIStory, APIEntity, APITopic, APITimeline, APICountry, APIOrganization, APIFix,
  APIGraphQuery, APIGraphNode, APIGraphLink, APIStatistics,
  APIListResponse, APIRelatedEntity,
} from './types';

/* ── Internal Store ────────────────────────────────────────────────── */

interface DataStore {
  stories: Map<string, APIStory>;
  entities: Map<string, APIEntity>;
  topics: Map<string, APITopic>;
  countries: Map<string, APICountry>;
  organizations: Map<string, APIOrganization>;
  timelines: Map<string, APITimeline>;
  fixes: Map<string, APIFix>;
}

let store: DataStore | null = null;

/* ── Seed Data ─────────────────────────────────────────────────────── */

function seed(): DataStore {
  const stories = new Map<string, APIStory>();
  const entities = new Map<string, APIEntity>();
  const topics = new Map<string, APITopic>();
  const countries = new Map<string, APICountry>();
  const organizations = new Map<string, APIOrganization>();
  const timelines = new Map<string, APITimeline>();
  const fixes = new Map<string, APIFix>();

  // ── Stories ───────────────────────────────────────────────────────

  const story1: APIStory = {
    id: 'mgnrega-reform',
    slug: 'mgnrega-reform',
    headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment',
    summary: 'Two decades of India\'s flagship rural employment guarantee scheme — what the data reveals about wage trends, participation, and economic impact across states.',
    publishedAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
    readingTime: 12,
    wordCount: 4200,
    author: { name: 'Anjali Sharma', bio: 'Senior Investigative Journalist covering rural development and policy.' },
    evidenceScore: 92,
    category: 'economy',
    tags: ['MGNREGA', 'rural employment', 'policy analysis', 'social schemes', 'NREGA'],
    keyPoints: [
      'MGNREGA completed 20 years of operation in 2026',
      'Annual budget allocation has grown 5x since inception',
      'Women participation has increased from 40% to 55%',
      'Average wage growth has lagged behind inflation in most states',
    ],
    timeline: [
      { date: '2006-02-02', title: 'MGNREGA Enacted', description: 'Parliament passes the National Rural Employment Guarantee Act.', source: 'PRS Legislative' },
      { date: '2008-04-01', title: 'Phase 1 Completion', description: 'Scheme covers 200 most backward districts.', source: 'MoRD' },
      { date: '2013-09-01', title: 'Enhanced Wage Structure', description: 'Wage rates revised with CPI-AL linkage.', source: 'Gazette Notification' },
      { date: '2020-04-01', title: 'COVID-19 Surge', description: 'Demand for work surges 40% during pandemic.', source: 'MoRD Annual Report' },
      { date: '2026-02-02', title: '20th Anniversary', description: 'Cumulative expenditure over ₹8 lakh crore.', source: 'The Breakdown' },
    ],
    facts: [
      { label: 'Total Person-Days Generated', value: '3,850 crore', source: 'MoRD Dashboard' },
      { label: 'Average Wage (2025-26)', value: '₹267/day', source: 'MoRD' },
      { label: 'Active Workers', value: '14.2 crore', source: 'NREGA MIS' },
      { label: 'Women Participation', value: '55.3%', source: 'Annual Report 2025-26' },
    ],
    claims: [
      { claim: 'MGNREGA wage rates are higher than market wages in most states.', source: 'Government of India', verification: 'misleading', explanation: 'In 12 of 28 states, MGNREGA wages are lower than prevailing market wages.', confidence: 0.88 },
      { claim: 'The scheme has lifted 2 crore families above poverty line.', source: 'World Bank Study 2024', verification: 'true', explanation: 'Multiple academic studies corroborate this finding.', confidence: 0.82 },
    ],
    sources: [
      { name: 'Ministry of Rural Development Annual Report 2025-26', url: 'https://rural.gov.in', type: 'government', tier: 1 },
      { name: 'NREGA MIS Dashboard', url: 'https://nrega.nic.in', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'MGNREGA Budget Allocation Over Time', data: [
        { year: '2006-07', amount: 11300 }, { year: '2011-12', amount: 40000 },
        { year: '2016-17', amount: 47500 }, { year: '2020-21', amount: 111500 },
        { year: '2025-26', amount: 86000 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'Who is eligible for MGNREGA work?', answer: 'Any adult rural household member willing to do unskilled manual work at the notified wage rate is eligible.' },
      { question: 'What is the guaranteed number of days of employment?', answer: 'The Act guarantees 100 days of employment per household per financial year.' },
    ],
    relatedStories: [
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: 'UPI\'s role in rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization', description: 'Nodal ministry for MGNREGA implementation.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  const story2: APIStory = {
    id: 'digital-payments-boom',
    slug: 'digital-payments-boom',
    headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution',
    summary: 'How UPI transformed rural financial inclusion, with transaction volumes growing 400% in three years.',
    publishedAt: '2026-06-12T08:00:00Z',
    updatedAt: '2026-06-12T08:00:00Z',
    readingTime: 8,
    author: { name: 'Vikram Patel', bio: 'Technology and policy correspondent.' },
    evidenceScore: 88,
    category: 'technology',
    tags: ['UPI', 'digital payments', 'rural India', 'fintech', 'NPCI'],
    keyPoints: [
      'UPI transactions in rural areas grew 400% since 2023',
      'Feature phone-based UPI drove adoption in remote areas',
      '18 crore feature phone UPI users as of 2026',
    ],
    timeline: [
      { date: '2016-04-11', title: 'UPI Launched', description: 'NPCI launches Unified Payments Interface.', source: 'NPCI' },
      { date: '2020-01-01', title: 'UPI 2.0 Released', description: 'Feature phone support added via USSD 2.0.', source: 'NPCI' },
      { date: '2023-06-01', title: 'Rural UPI Crosses ₹5L Cr', description: 'Annual rural UPI transactions cross ₹5 lakh crore.', source: 'NPCI Annual Report' },
      { date: '2026-03-01', title: 'Rural UPI at ₹12L Cr', description: 'Rural UPI transactions reach ₹12 lakh crore annually.', source: 'The Breakdown Analysis' },
    ],
    facts: [
      { label: 'Rural UPI Transactions (2025-26)', value: '₹12 lakh crore', source: 'NPCI' },
      { label: 'Feature Phone UPI Users', value: '18 crore', source: 'NPCI Annual Report' },
      { label: 'Year-on-Year Growth', value: '63%', source: 'NPCI' },
    ],
    claims: [{ claim: 'UPI has eliminated the urban-rural digital payments divide.', source: 'Industry Report 2025', verification: 'misleading', explanation: 'Urban transactions still account for 68% of total UPI volume.', confidence: 0.75 }],
    sources: [{ name: 'NPCI Annual Report 2025-26', url: 'https://npci.org.in', type: 'government', tier: 1 }],
    charts: [
      { type: 'line', title: 'Rural UPI Transaction Growth (₹L Cr)', data: [
        { year: '2020-21', amount: 1.2 }, { year: '2021-22', amount: 2.5 },
        { year: '2022-23', amount: 5.1 }, { year: '2023-24', amount: 8.3 },
        { year: '2024-25', amount: 10.8 }, { year: '2025-26', amount: 12 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'How does UPI work on feature phones?', answer: 'UPI works on feature phones via USSD codes (*99#) and NPCI\'s UPI123Pay service.' },
    ],
    relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' }],
    relatedEntities: [
      { id: 'npci', slug: 'npci', name: 'NPCI', type: 'organization', description: 'National Payments Corporation of India.' },
      { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization', description: 'India\'s central bank.' },
    ],
  };

  const story3: APIStory = {
    id: 'pm-fasal-bima-claims',
    slug: 'pm-fasal-bima-claims',
    headline: 'PM Fasal Bima Yojana: The Claims That Never Reached Farmers',
    summary: 'Investigation into delayed and unpaid crop insurance claims across six states.',
    publishedAt: '2026-06-05T06:00:00Z',
    updatedAt: '2026-06-05T06:00:00Z',
    readingTime: 15,
    wordCount: 5200,
    author: { name: 'Anjali Sharma', bio: 'Senior Investigative Journalist' },
    evidenceScore: 97,
    category: 'policy',
    tags: ['crop insurance', 'agriculture', 'farmer welfare', 'PMFBY'],
    keyPoints: [
      'Over 40% of claims delayed beyond 60 days in 4 states',
      'Farmers in Maharashtra and Karnataka worst affected',
      'Claims settlement ratio declined from 85% to 63% in 3 years',
    ],
    timeline: [
      { date: '2016-01-13', title: 'PMFBY Launched', description: 'PM Fasal Bima Yojana launched to replace existing crop insurance schemes.', source: 'PIB' },
      { date: '2020-02-01', title: 'Revised Guidelines', description: 'Government revises PMFBY guidelines to speed up claims.', source: 'Ministry of Agriculture' },
      { date: '2024-08-15', title: 'CAG Report Flags Delays', description: 'CAG report highlights systemic delays in claim settlement.', source: 'CAG Report' },
      { date: '2026-04-01', title: 'Investigation Published', description: 'The Breakdown publishes investigation across 6 states.', source: 'The Breakdown' },
    ],
    facts: [
      { label: 'Claims Pending Beyond 60 Days', value: '42%', source: 'State Govt Data' },
      { label: 'Farmers Affected', value: '1.2 crore', source: 'CAG Report 2024' },
      { label: 'Total Premium Collected', value: '₹29,000 crore', source: 'Annual Report' },
      { label: 'Claims Actually Paid', value: '₹13,400 crore', source: 'Annual Report' },
    ],
    claims: [
      { claim: 'Insurance companies are deliberately delaying claim settlements to earn interest.', source: 'Farmer Unions', verification: 'unverifiable', explanation: 'While delays are documented, intent cannot be verified without regulatory investigation.', confidence: 0.6 },
      { claim: 'States are not contributing their share of premium on time.', source: 'Union Agriculture Ministry', verification: 'true', explanation: '4 states have pending premium contributions exceeding ₹2,000 crore.', confidence: 0.85 },
    ],
    sources: [
      { name: 'CAG Report on PMFBY 2024', url: 'https://cag.gov.in', type: 'government', tier: 1 },
      { name: 'State Government Data Compilation', url: '', type: 'primary', tier: 2 },
    ],
    charts: [
      { type: 'bar', title: 'Claims Settlement Ratio by State (2025-26)', data: [
        { state: 'Maharashtra', ratio: 45 }, { state: 'Karnataka', ratio: 52 },
        { state: 'Rajasthan', ratio: 68 }, { state: 'UP', ratio: 71 },
        { state: 'MP', ratio: 65 }, { state: 'Punjab', ratio: 78 },
      ], xKey: 'state', yKey: 'ratio' },
      { type: 'line', title: 'Claims Settlement Trend', data: [
        { year: '2020-21', ratio: 85 }, { year: '2021-22', ratio: 79 },
        { year: '2022-23', ratio: 72 }, { year: '2023-24', ratio: 68 },
        { year: '2024-25', ratio: 63 },
      ], xKey: 'year', yKey: 'ratio' },
    ],
    faq: [
      { question: 'What is the claim settlement timeline under PMFBY?', answer: 'Claims must be settled within 60 days of harvest. Delays beyond this attract penal interest at 12% per annum.' },
      { question: 'Who implements PMFBY?', answer: 'The scheme is implemented by empaneled insurance companies, with premium shared by farmer, central, and state governments.' },
    ],
    relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' }],
    relatedEntities: [
      { id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture', type: 'organization', description: 'Nodal ministry.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country' },
      { id: 'cag', slug: 'cag', name: 'Comptroller and Auditor General', type: 'organization', description: 'Supreme audit institution.' },
    ],
  };

  stories.set(story1.slug, story1);
  stories.set(story2.slug, story2);
  stories.set(story3.slug, story3);

  // ── Entities ──────────────────────────────────────────────────────

  const entityData: APIEntity[] = [
    {
      id: 'mgnrega', slug: 'mgnrega', name: 'Mahatma Gandhi National Rural Employment Guarantee Act',
      type: 'policy', description: 'India\'s flagship rural employment guarantee scheme.',
      aliases: ['MGNREGA', 'NREGA', 'Rural Employment Scheme'], storyCount: 24, updatedAt: '2026-06-15T10:00:00Z',
      timeline: story1.timeline, statistics: { 'Total Person-Days': '385 crore', 'Active Workers': '14.2 crore', 'Average Wage': '₹267/day' },
      relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: '', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' }],
      relatedEntities: [{ id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' }],
      faq: story1.faq,
    },
    {
      id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development',
      type: 'organization', description: 'Nodal ministry responsible for rural development policies and programmes.',
      aliases: ['MoRD', 'Rural Development Ministry'], storyCount: 56, updatedAt: '2026-06-15T10:00:00Z',
      timeline: [], statistics: { 'Schemes Managed': '15', 'Annual Budget': '₹1.5 lakh crore' },
      relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: '', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' }],
      relatedEntities: [{ id: 'mgnrega', slug: 'mgnrega', name: 'MGNREGA', type: 'policy' }],
      faq: [],
    },
    {
      id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India',
      type: 'organization', description: 'India\'s central banking institution controlling monetary policy and currency issuance.',
      aliases: ['RBI', 'Central Bank of India'], storyCount: 89, updatedAt: '2026-06-10T14:00:00Z',
      timeline: [
        { date: '1935-04-01', title: 'RBI Established', description: 'Reserve Bank of India was established under the RBI Act 1934.' },
        { date: '1949-01-01', title: 'Nationalized', description: 'RBI was nationalized and became a state-owned institution.' },
      ],
      statistics: { 'Policy Rate': '6.25%', 'GDP Forecast': '6.8%', 'Inflation Target': '4.0%', 'Forex Reserves': '$650 billion' },
      relatedStories: [{ slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: '', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' }],
      relatedEntities: [{ id: 'npci', slug: 'npci', name: 'NPCI', type: 'organization' }],
      faq: [],
    },
    {
      id: 'npci', slug: 'npci', name: 'National Payments Corporation of India',
      type: 'organization', description: 'An umbrella organisation for operating retail payment and settlement systems in India.',
      aliases: ['NPCI'], storyCount: 34, updatedAt: '2026-06-12T08:00:00Z',
      timeline: [
        { date: '2008-12-01', title: 'NPCI Established', description: 'NPCI was incorporated as a not-for-profit company.' },
        { date: '2016-04-11', title: 'UPI Launched', description: 'Unified Payments Interface was launched.' },
      ],
      statistics: { 'UPI Monthly Transactions': '12 billion', 'Total Members': '120+', 'RTP System': 'IMPS' },
      relatedStories: [{ slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: '', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' }],
      relatedEntities: [{ id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization' }],
      faq: [],
    },
    {
      id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture and Farmers Welfare',
      type: 'organization', description: 'Nodal ministry for agriculture policy and farmer welfare programmes.',
      aliases: ['Ministry of Agriculture', 'MoA&FW'], storyCount: 42, updatedAt: '2026-06-05T06:00:00Z',
      timeline: [], statistics: { 'Schemes Managed': '20+', 'Annual Budget': '₹1.2 lakh crore' },
      relatedStories: [{ slug: 'pm-fasal-bima-claims', headline: 'PMFBY Investigation', summary: '', publishedAt: '2026-06-05T06:00:00Z', readingTime: 15, evidenceScore: 97, category: 'policy' }],
      relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
      faq: [],
    },
    {
      id: 'cag', slug: 'cag', name: 'Comptroller and Auditor General of India',
      type: 'organization', description: 'Supreme audit institution of India, auditing government accounts.',
      aliases: ['CAG', 'CAG India'], storyCount: 18, updatedAt: '2026-06-05T06:00:00Z',
      timeline: [], statistics: { 'Reports Published (2025-26)': '72', 'Audited Expenditure': '₹80 lakh crore' },
      relatedStories: [{ slug: 'pm-fasal-bima-claims', headline: 'PMFBY Investigation', summary: '', publishedAt: '2026-06-05T06:00:00Z', readingTime: 15, evidenceScore: 97, category: 'policy' }],
      relatedEntities: [],
      faq: [],
    },
    {
      id: 'india', slug: 'india', name: 'India',
      type: 'country', description: 'Republic of India — world\'s most populous democracy and fastest-growing major economy.',
      aliases: ['Republic of India', 'Bharat', 'Hindustan'], storyCount: 150, updatedAt: '2026-07-01T00:00:00Z',
      timeline: [
        { date: '1947-08-15', title: 'Independence', description: 'India gains independence from British rule.' },
        { date: '1950-01-26', title: 'Republic', description: 'Constitution of India comes into effect.' },
      ],
      statistics: { 'Population': '145 crore', 'GDP': '$4.2 trillion', 'GDP Growth': '6.8%', 'Literacy Rate': '77.7%' },
      relatedStories: [
        { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: '', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
        { slug: 'pm-fasal-bima-claims', headline: 'PMFBY Investigation', summary: '', publishedAt: '2026-06-05T06:00:00Z', readingTime: 15, evidenceScore: 97, category: 'policy' },
      ],
      relatedEntities: [
        { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization' },
        { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' },
      ],
      faq: [
        { question: 'What is India\'s current GDP rank?', answer: 'India is the 5th largest economy by nominal GDP and 3rd by PPP.' },
      ],
    },
  ];

  entityData.forEach((e) => {
    entities.set(e.slug, e);
    if (e.type === 'country') countries.set(e.slug, e);
    if (e.type === 'organization') organizations.set(e.slug, e);
  });

  // ── Topics ────────────────────────────────────────────────────────

  const topicDefs = [
    { slug: 'economy', name: 'Economy & Finance', description: 'Indian economy, fiscal policy, GDP, inflation, and economic reforms.', stories: [story1, story2], entities: ['rbi'] },
    { slug: 'technology', name: 'Technology & Digital India', description: 'Digital transformation, fintech, UPI, and technology policy.', stories: [story2], entities: ['npci'] },
    { slug: 'policy', name: 'Policy & Governance', description: 'Government policies, schemes, and public administration.', stories: [story1, story3], entities: ['ministry-of-rural-development', 'ministry-of-agriculture', 'cag'] },
    { slug: 'agriculture', name: 'Agriculture & Rural Development', description: 'Agriculture policy, crop insurance, rural employment, and farmer welfare.', stories: [story1, story3], entities: ['ministry-of-agriculture', 'mgnrega', 'india'] },
    { slug: 'digital-payments', name: 'Digital Payments & Fintech', description: 'UPI, digital banking, financial inclusion, and payment systems.', stories: [story2], entities: ['npci', 'rbi'] },
  ];

  topicDefs.forEach((t) => {
    const storySlugs = t.stories.map((s) => ({ slug: s.slug, headline: s.headline, summary: s.summary, publishedAt: s.publishedAt, readingTime: s.readingTime, evidenceScore: s.evidenceScore, category: s.category }));
    const entityList = t.entities.map((eid) => {
      const ent = entities.get(eid);
      return ent ? { id: ent.id, slug: ent.slug, name: ent.name, type: ent.type } : null;
    }).filter(Boolean) as APIRelatedEntity[];

    topics.set(t.slug, {
      id: t.slug, slug: t.slug, name: t.name, description: t.description,
      storyCount: t.stories.length, entityCount: entityList.length, updatedAt: '2026-07-01T00:00:00Z',
      stories: storySlugs, entities: entityList,
    });
  });

  // ── Timelines ─────────────────────────────────────────────────────

  const timelineDefs = [
    {
      id: 'mgnrega-timeline', title: 'MGNREGA — Two Decades of Rural Employment',
      description: 'Key milestones in India\'s flagship rural employment scheme.', category: 'economy',
      events: story1.timeline, storySlugs: ['mgnrega-reform'], dateRange: { start: '2006-02-02', end: '2026-02-02' },
    },
    {
      id: 'upi-timeline', title: 'UPI — The Digital Payments Revolution',
      description: 'The evolution of India\'s Unified Payments Interface.', category: 'technology',
      events: story2.timeline, storySlugs: ['digital-payments-boom'], dateRange: { start: '2016-04-11', end: '2026-03-01' },
    },
    {
      id: 'pmfby-timeline', title: 'PMFBY — Crop Insurance in India',
      description: 'Timeline of India\'s crop insurance scheme.', category: 'policy',
      events: story3.timeline, storySlugs: ['pm-fasal-bima-claims'], dateRange: { start: '2016-01-13', end: '2026-04-01' },
    },
  ];

  timelineDefs.forEach((t) => timelines.set(t.id, t));

  // ── The Fix — Seed Solutions ──────────────────────────────────────

  const fix1: APIFix = {
    id: 'fix-mgnrega-reform', slug: 'fix-mgnrega-reform', storySlug: 'mgnrega-reform',
    headline: 'Fixing MGNREGA: 5 Reforms to Make Rural Employment Work',
    summary: 'Two decades of data reveal clear pathways to fix India\'s flagship rural employment scheme — from wage indexation to digital fund tracking.',
    publishedAt: '2026-06-16T10:00:00Z', updatedAt: '2026-06-16T10:00:00Z',
    readingTime: 14, author: { name: 'Anjali Sharma' }, evidenceScore: 91,
    tags: ['MGNREGA', 'rural employment', 'policy reform', 'wages', 'governance'],
    problem: {
      title: 'MGNREGA wage rates have not kept pace with inflation',
      content: 'Despite 20 years of operation, MGNREGA wage rates are indexed to CPI-AL but revisions are delayed by 6-18 months. In 12 of 28 states, scheme wages fall below prevailing market rates, reducing the scheme\'s effectiveness as both a safety net and a wage floor.',
      supportingData: [{ label: 'States where MGNREGA wage < market wage', value: '12 of 28' }, { label: 'Average revision delay', value: '14 months' }],
    },
    whoIsAffected: {
      title: '14.2 crore active workers, disproportionately women and marginalised communities',
      content: 'MGNREGA provides employment to 14.2 crore households, with women constituting 55.3% of all person-days. SC/ST households account for 38% of participation. Delayed wage revisions and payment disruptions disproportionately impact these groups.',
      supportingData: [{ label: 'Active workers', value: '14.2 crore' }, { label: 'Women participation', value: '55.3%' }, { label: 'SC/ST share', value: '38%' }],
    },
    rootCauses: {
      title: 'Delayed wage indexation, fund flow inefficiencies, and lack of asset durability',
      content: 'Three structural issues: (1) Wage indexation linked to CPI-AL lacks automatic adjustment mechanism, causing erosion of real wages. (2) Fund flow from Centre to districts takes 45-90 days, delaying wage payments. (3) Only 42% of created assets are maintained beyond 3 years.',
      supportingData: [{ label: 'Fund flow delay (Centre to district)', value: '45-90 days' }, { label: 'Assets maintained beyond 3 years', value: '42%' }],
    },
    evidence: {
      title: 'CAG reports and academic studies confirm systemic delays',
      content: 'CAG Report 2024 found that 68% of audited districts had delayed wage payments exceeding 15 days. ILO study (2025) documented that real MGNREGA wages have declined 8% since 2018. World Bank analysis shows every ₹1 spent on MGNREGA generates ₹1.32 in rural income.',
      supportingData: [{ label: 'Districts with delayed wages', value: '68%' }, { label: 'Real wage decline since 2018', value: '8%' }, { label: 'Income multiplier', value: '₹1.32' }],
    },
    stakeholders: [
      { name: 'Ministry of Rural Development', type: 'government', role: 'Scheme implementation', interest: 'Improving scheme efficiency and outcomes', stance: 'supports' },
      { name: 'State Governments', type: 'government', role: 'State-level implementation', interest: 'Reducing financial burden while maintaining scheme', stance: 'mixed' },
      { name: 'MGNREGA Workers', type: 'citizen', role: 'Beneficiaries', interest: 'Timely wages, better asset creation', stance: 'supports' },
      { name: 'Gram Panchayats', type: 'government', role: 'Local implementation', interest: 'Autonomy and timely fund release', stance: 'supports' },
      { name: 'CAG', type: 'government', role: 'Audit oversight', interest: 'Ensuring fund utilisation and accountability' },
    ],
    existingSolutions: [
      { name: 'Direct Benefit Transfer (DBT)', description: 'Wage payments directly to bank accounts was introduced in 2017-18, reducing leakage but not delays.', status: 'active', effectiveness: 'medium', source: 'MoRD Annual Report' },
      { name: 'Social Audit System', description: 'Village-level social audits mandated in 2010 to improve transparency and asset quality.', status: 'active', effectiveness: 'low', source: 'CAG Report 2024' },
      { name: 'e-FMS (Electronic Fund Management System)', description: 'Launched 2015 to track fund flows digitally, but state-level bottlenecks persist.', status: 'active', effectiveness: 'medium', source: 'NREGA MIS' },
    ],
    globalExamples: [
      { country: 'Brazil', policy: 'Bolsa Família conditional cash transfer', description: 'Brazil\'s conditional cash transfer programme uses a unified registry (Cadastro Único) to coordinate benefits across 40+ programmes, reducing administrative overhead by 60%.', outcome: 'Reduced poverty by 15% in 5 years with lower administrative costs.', source: 'World Bank', applicableToIndia: true },
      { country: 'Ethiopia', policy: 'Productive Safety Net Programme (PSNP)', description: 'Ethiopia\'s public works programme links employment to asset creation with a dedicated maintenance budget (15% of project cost).', outcome: 'Asset retention rate of 78% after 5 years vs 42% in India.', source: 'IFPRI Study', applicableToIndia: true },
      { country: 'South Africa', policy: 'Community Work Programme (CWP)', description: 'Uses a hybrid wage model — base wage + performance bonus tied to asset quality metrics.', outcome: 'Asset quality scores improved 34% in pilot districts.', source: 'DPME South Africa', applicableToIndia: false },
    ],
    recommendedActions: [
      { title: 'Automatic wage indexation', description: 'Link MGNREGA wages to CPI-AL with automatic quarterly revision, eliminating political delays.', priority: 'critical', timeframe: 'immediate', actors: ['MoRD', 'Ministry of Finance'] },
      { title: 'Real-time fund flow tracking', description: 'Extend e-FMS with blockchain-based tracking from Centre to Gram Panchayat, with SMS alerts for every stage.', priority: 'high', timeframe: 'short-term', actors: ['MoRD', 'NeGD', 'States'] },
      { title: 'Asset maintenance mandate', description: 'Set aside 15% of project costs for maintenance, tied to release of subsequent project instalments.', priority: 'high', timeframe: 'medium-term', actors: ['MoRD', 'Gram Panchayats'] },
      { title: 'Performance-linked wage bonus', description: 'Introduce 5-10% wage bonus for high-quality asset creation, measured by NDVI (satellite) and social audits.', priority: 'medium', timeframe: 'medium-term', actors: ['MoRD', 'ISRO', 'State Govts'] },
    ],
    citizenActions: [
      { title: 'Demand social audits', description: 'Workers can demand social audits of their Gram Panchayat\'s MGNREGA works every 6 months.', priority: 'high', timeframe: 'immediate', actors: ['MGNREGA Workers', 'Civil Society'] },
      { title: 'Form worker collectives', description: 'Organise into worker committees to collectively monitor wage payments and asset quality.', priority: 'medium', timeframe: 'short-term', actors: ['Citizens', 'NGOs'] },
      { title: 'Use MNREGA MIS app', description: 'Check wage payment status, worksite details, and file complaints via the official NREGA MIS mobile app.', priority: 'medium', timeframe: 'immediate', actors: ['Workers', 'Digital Literacy Volunteers'] },
    ],
    governmentActions: [
      { title: 'Pass MGNREGA Amendment Bill', description: 'Amend the Act to include automatic wage indexation, asset maintenance fund, and digital fund flow mandate.', priority: 'critical', timeframe: 'short-term', actors: ['Parliament', 'MoRD'] },
      { title: 'Clear pending state share', description: 'Release pending state government contributions of ₹3,200 crore to clear wage arrears.', priority: 'critical', timeframe: 'immediate', actors: ['State Finance Depts', 'MoRD'] },
      { title: 'Integrate with GIS platform', description: 'Geo-tag all MGNREGA assets on Bhuvan portal for satellite-based monitoring of asset quality and longevity.', priority: 'high', timeframe: 'medium-term', actors: ['MoRD', 'ISRO', 'NeGD'] },
    ],
    metricsToTrack: [
      { name: 'Average wage payment delay', currentValue: '45 days', targetValue: '<15 days', dataSource: 'NREGA MIS', updateFrequency: 'Monthly' },
      { name: 'Asset maintenance rate', currentValue: '42%', targetValue: '>70%', dataSource: 'CAG/Social Audits', updateFrequency: 'Annual' },
      { name: 'Real wage growth', currentValue: '-8% (since 2018)', targetValue: '>0% (positive)', dataSource: 'CPI-AL vs Wage', updateFrequency: 'Quarterly' },
      { name: 'Women participation rate', currentValue: '55.3%', targetValue: '60%', dataSource: 'MoRD Dashboard', updateFrequency: 'Annual' },
      { name: 'Fund flow time (Centre to GP)', currentValue: '45-90 days', targetValue: '<21 days', dataSource: 'e-FMS Tracking', updateFrequency: 'Monthly' },
    ],
    relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment of rural employment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' }],
    relatedEntities: [
      { id: 'mgnrega', slug: 'mgnrega', name: 'MGNREGA', type: 'policy', description: 'Rural employment guarantee scheme.' },
      { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' },
    ],
  };

  const fix2: APIFix = {
    id: 'fix-pmfby-claims', slug: 'fix-pmfby-claims', storySlug: 'pm-fasal-bima-claims',
    headline: 'The Fix: How to Fix Crop Insurance in India',
    summary: 'A comprehensive reform roadmap for PMFBY — from reducing claim settlement time to mandatory loss assessment within 30 days.',
    publishedAt: '2026-06-06T06:00:00Z', updatedAt: '2026-06-06T06:00:00Z',
    readingTime: 12, author: { name: 'Anjali Sharma' }, evidenceScore: 94,
    tags: ['PMFBY', 'crop insurance', 'claims', 'agriculture', 'farmer welfare'],
    problem: {
      title: '42% of crop insurance claims remain unpaid beyond 60 days',
      content: 'The PM Fasal Bima Yojana (PMFBY), India\'s flagship crop insurance scheme, has a systemic claims settlement crisis. Our investigation across 6 states found 42% of claims delayed beyond the mandated 60-day period, leaving 1.2 crore farmers in financial distress.',
      supportingData: [{ label: 'Claims delayed beyond 60 days', value: '42%' }, { label: 'Farmers affected', value: '1.2 crore' }, { label: 'Claim settlement ratio decline (3 years)', value: '85% to 63%' }],
    },
    whoIsAffected: {
      title: '1.2 crore farmers across 6 states, worst in Maharashtra and Karnataka',
      content: 'Small and marginal farmers (holding <2 hectares) constitute 86% of affected claimants. Maharashtra and Karnataka have the worst records, with claim settlement ratios of 45% and 52% respectively.',
      supportingData: [{ label: 'Small/marginal farmers affected', value: '86%' }, { label: 'Maharashtra settlement ratio', value: '45%' }, { label: 'Karnataka settlement ratio', value: '52%' }],
    },
    rootCauses: {
      title: 'Insurance company discretion, state premium delays, and lack of automatic assessment',
      content: 'Three systemic failures: (1) Insurance companies have discretion to delay claims with minimal penalties. (2) 4 states have pending premium contributions exceeding ₹2,000 crore. (3) Loss assessment relies on manual crop cutting experiments (CCEs) that take 60-90 days, far beyond the 30-day ideal.',
      supportingData: [{ label: 'Pending state premium contributions', value: '₹2,000+ crore' }, { label: 'Loss assessment time (manual)', value: '60-90 days' }, { label: 'Companies in default', value: '5 of 12 empaneled' }],
    },
    evidence: {
      title: 'CAG report + state data confirm systemic delays and insurer non-compliance',
      content: 'CAG Report 2024 found insurance companies held ₹4,200 crore in unclaimed premium reserves. State government data shows claims pending for 6-18 months in 34% of sampled districts. ICRIER study estimates farmers lose ₹12,000 crore annually in delayed claims.',
      supportingData: [{ label: 'Unclaimed premium reserves', value: '₹4,200 crore' }, { label: 'Farmer annual loss from delays', value: '₹12,000 crore' }],
    },
    stakeholders: [
      { name: 'Ministry of Agriculture', type: 'government', role: 'Scheme oversight', interest: 'Improving claim settlement metrics', stance: 'supports' },
      { name: 'Insurance Companies', type: 'private-sector', role: 'Risk assessment and payout', interest: 'Profitability, minimal payouts', stance: 'opposes' },
      { name: 'Farmers', type: 'citizen', role: 'Beneficiaries', interest: 'Timely and fair claim settlement', stance: 'supports' },
      { name: 'State Governments', type: 'government', role: 'Premium contribution', interest: 'Fiscal management, farmer welfare', stance: 'mixed' },
      { name: 'IRDAI', type: 'government', role: 'Insurance regulator', interest: 'Regulatory compliance, consumer protection' },
    ],
    existingSolutions: [
      { name: 'PMFBY 2.0 Guidelines (2020)', description: 'Revised guidelines mandated 60-day claim settlement and penal interest of 12% p.a. for delays.', status: 'active', effectiveness: 'low', source: 'Ministry of Agriculture' },
      { name: 'Crop Insurance Portal', description: 'Centralised portal for claim tracking launched in 2021, but adoption is low and data is not real-time.', status: 'active', effectiveness: 'low', source: 'PMFBY Website' },
      { name: 'MahaSBY (State-level)', description: 'Maharashtra\'s own crop insurance scheme with simplified claim process, 30-day settlement guarantee.', status: 'active', effectiveness: 'high', source: 'Maharashtra Govt' },
    ],
    globalExamples: [
      { country: 'USA', policy: 'Federal Crop Insurance Act (FCIP)', description: 'US crop insurance is public-private with government acting as reinsurer. Claims automatically triggered by satellite-based yield data — no manual assessment needed.', outcome: '90% of claims settled within 30 days, 99% within 60 days.', source: 'USDA RMA', applicableToIndia: true },
      { country: 'China', policy: 'Centralised Crop Insurance Scheme', description: 'China uses mandatory area-yield indexing with automatic satellite assessment. Claims are paid within 15 days of harvest date.', outcome: 'Claim settlement ratio of 92%, average payout time 18 days.', source: 'World Bank Agricultural Insurance', applicableToIndia: true },
      { country: 'Kenya', policy: 'Kilimo Salama (index-based insurance)', description: 'Weather-index based insurance with automatic payouts via mobile money (M-Pesa). No claims process — payout triggered when weather station data crosses threshold.', outcome: '98% farmer satisfaction, zero claims disputes.', source: 'Syngenta Foundation', applicableToIndia: false },
    ],
    recommendedActions: [
      { title: 'Mandate satellite-based loss assessment', description: 'Replace manual CCEs with satellite NDVI-based yield assessment by 2027. Pending that, enforce 30-day assessment deadline with penal interest of 18% p.a.', priority: 'critical', timeframe: 'immediate', actors: ['Ministry of Agriculture', 'ISRO', 'IRDAI'] },
      { title: 'Auto-trigger claims for insured areas', description: 'Implement area-yield index insurance where claims are auto-triggered when district-level yield falls below threshold — no individual assessment needed.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Agriculture', 'Insurance Companies', 'State Govts'] },
      { title: 'Deduct state premium from central transfers', description: 'Enable automatic deduction of state premium share from Finance Commission devolution, eliminating state-level payment bottlenecks.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Finance', 'Ministry of Agriculture'] },
      { title: 'Create insurance company blacklist', description: 'IRDAI to maintain public blacklist of insurers with >30% claims pending beyond 60 days — bar new business until compliance.', priority: 'critical', timeframe: 'immediate', actors: ['IRDAI', 'Ministry of Agriculture'] },
    ],
    citizenActions: [
      { title: 'File complaints on PMFBY portal', description: 'Register delayed claims on the central PMFBY portal — complaints tagged to insurance companies have a mandated 7-day response.', priority: 'high', timeframe: 'immediate', actors: ['Farmers', 'Village Level Entrepreneurs'] },
      { title: 'Form farmer claim support groups', description: 'Organise village-level groups to collectively file claims and track status through the portal.', priority: 'medium', timeframe: 'short-term', actors: ['Farmers', 'Farmer Producer Organisations'] },
    ],
    governmentActions: [
      { title: 'Pass Crop Insurance (Reform) Bill', description: 'Legislate mandatory satellite assessment, auto-claims, 30-day settlement deadline, and penal provisions for insurers.', priority: 'critical', timeframe: 'short-term', actors: ['Parliament', 'Ministry of Agriculture'] },
      { title: 'Clear pending state premiums immediately', description: 'Use central devolution to settle ₹2,000+ crore in pending state premium contributions within 30 days.', priority: 'critical', timeframe: 'immediate', actors: ['Ministry of Finance', 'State Govts'] },
      { title: 'Launch NAIP (National Agricultural Insurance Platform)', description: 'Integrated platform combining satellite data, weather stations, registration, and auto-claims — pilot in 3 states by 2027.', priority: 'high', timeframe: 'medium-term', actors: ['NeGD', 'ISRO', 'IMD', 'Ministry of Agriculture'] },
    ],
    metricsToTrack: [
      { name: 'Claim settlement ratio', currentValue: '63%', targetValue: '>90%', dataSource: 'PMFBY Dashboard', updateFrequency: 'Quarterly' },
      { name: 'Average claim settlement time', currentValue: '72 days', targetValue: '<30 days', dataSource: 'PMFBY MIS', updateFrequency: 'Monthly' },
      { name: 'Satellite-based assessments', currentValue: '5% of total', targetValue: '>50%', dataSource: 'ISRO/NDVI', updateFrequency: 'Annual' },
      { name: 'States with auto-deduction enabled', currentValue: '0', targetValue: 'All states', dataSource: 'Finance Commission', updateFrequency: 'Annual' },
      { name: 'Penal interest paid to farmers', currentValue: 'Unknown', targetValue: 'Tracked and published', dataSource: 'IRDAI', updateFrequency: 'Quarterly' },
    ],
    relatedStories: [{ slug: 'pm-fasal-bima-claims', headline: 'PMFBY: Claims That Never Reached Farmers', summary: 'Investigation into unpaid claims.', publishedAt: '2026-06-05T06:00:00Z', readingTime: 15, evidenceScore: 97, category: 'policy' }],
    relatedEntities: [
      { id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture', type: 'organization' },
      { id: 'cag', slug: 'cag', name: 'CAG', type: 'organization' },
    ],
  };

  fixes.set(fix1.slug, fix1);
  fixes.set(fix2.slug, fix2);

  return { stories, entities, topics, countries, organizations, timelines, fixes };
}

/* ── Store Initialization ───────────────────────────────────────────── */

export function getStore(): DataStore {
  if (!store) {
    store = seed();
  }
  return store;
}

/* ── Query Utilities ────────────────────────────────────────────────── */

interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  category?: string;
  tag?: string;
  type?: string;
  author?: string;
}

function paginate<T>(items: T[], params: QueryParams): APIListResponse<T> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return { data, meta: { total, page, pageSize, totalPages } };
}

function searchFilter<T extends Record<string, unknown>>(items: T[], query: string, fields: (keyof T)[]): T[] {
  if (!query) return items;
  const lower = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const val = item[field];
      return val ? String(val).toLowerCase().includes(lower) : false;
    })
  );
}

function sortItems<T extends Record<string, unknown>>(items: T[], field: string, order: 'asc' | 'desc' = 'desc'): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : Number(aVal) - Number(bVal);
    return order === 'desc' ? -cmp : cmp;
  });
}

/* ── Public API ─────────────────────────────────────────────────────── */

export function getStories(params: QueryParams = {}): APIListResponse<APIStory> {
  const s = getStore();
  let items = Array.from(s.stories.values());

  if (params.category) items = items.filter((st) => st.category === params.category);
  if (params.tag) items = items.filter((st) => st.tags.includes(params.tag));
  if (params.author) items = items.filter((st) => st.author.name.toLowerCase().includes(params.author.toLowerCase()));
  if (params.search) items = searchFilter(items, params.search, ['headline', 'summary', 'tags']);
  if (params.sort) items = sortItems(items, params.sort, params.order);

  return paginate(items, params);
}

export function getStory(slug: string): APIStory | null {
  return getStore().stories.get(slug) || null;
}

export function getEntities(params: QueryParams = {}): APIListResponse<APIEntity> {
  const s = getStore();
  let items = Array.from(s.entities.values());

  if (params.type) items = items.filter((e) => e.type === params.type);
  if (params.search) items = searchFilter(items, params.search, ['name', 'description', 'aliases']);
  if (params.sort) items = sortItems(items, params.sort, params.order);

  return paginate(items, params);
}

export function getEntity(slug: string): APIEntity | null {
  return getStore().entities.get(slug) || null;
}

export function getTopics(params: QueryParams = {}): APIListResponse<APITopic> {
  const s = getStore();
  let items = Array.from(s.topics.values());

  if (params.search) items = searchFilter(items, params.search, ['name', 'description']);
  if (params.sort) items = sortItems(items, params.sort, params.order);

  return paginate(items, params);
}

export function getTopic(slug: string): APITopic | null {
  return getStore().topics.get(slug) || null;
}

export function getTimelines(params: QueryParams = {}): APIListResponse<APITimeline> {
  const s = getStore();
  let items = Array.from(s.timelines.values());

  if (params.category) items = items.filter((t) => t.category === params.category);
  if (params.search) items = searchFilter(items, params.search, ['title', 'description']);
  if (params.sort) items = sortItems(items, params.sort, params.order);

  return paginate(items, params);
}

export function getTimeline(id: string): APITimeline | null {
  return getStore().timelines.get(id) || null;
}

export function getCountries(params: QueryParams = {}): APIListResponse<APICountry> {
  const s = getStore();
  let items = Array.from(s.countries.values());

  if (params.search) items = searchFilter(items, params.search, ['name', 'description']);
  if (params.sort) items = sortItems(items, params.sort, params.order);

  return paginate(items, params);
}

export function getCountry(slug: string): APICountry | null {
  return getStore().countries.get(slug) || null;
}

export function getOrganizations(params: QueryParams = {}): APIListResponse<APIOrganization> {
  const s = getStore();
  let items = Array.from(s.organizations.values());

  if (params.search) items = searchFilter(items, params.search, ['name', 'description']);
  if (params.sort) items = sortItems(items, params.sort, params.order);

  return paginate(items, params);
}

export function getOrganization(slug: string): APIOrganization | null {
  return getStore().organizations.get(slug) || null;
}

/* ── The Fix Queries ────────────────────────────────────────────────── */

export function getFixes(params: QueryParams = {}): APIListResponse<APIFix> {
  const s = getStore();
  let items = Array.from(s.fixes.values());

  if (params.search) items = searchFilter(items, params.search, ['headline', 'summary', 'tags']);
  if (params.sort) items = sortItems(items, params.sort, params.order);

  return paginate(items, params);
}

export function getFix(slug: string): APIFix | null {
  return getStore().fixes.get(slug) || null;
}

/* ── Graph Queries ──────────────────────────────────────────────────── */

export function getGraph(params: { type?: string; entity?: string } = {}): APIGraphQuery {
  const s = getStore();
  const nodes: Map<string, APIGraphNode> = new Map();
  const links: APIGraphLink[] = [];

  // Build graph from story ↔ entity relationships
  s.stories.forEach((story) => {
    nodes.set(story.slug, { id: story.slug, label: story.headline.slice(0, 40), type: 'story', group: story.category, size: story.evidenceScore / 10 });

    story.relatedEntities.forEach((re) => {
      nodes.set(re.id, { id: re.id, label: re.name, type: re.type, group: re.type, size: re.type === 'country' ? 15 : 8 });
      if (params.type && re.type !== params.type) return;
      links.push({ source: story.slug, target: re.id, type: 'mentions', weight: 3 });
    });

    if (params.entity) {
      story.relatedEntities
        .filter((re) => re.id === params.entity || re.slug === params.entity)
        .forEach((re) => {
          story.relatedEntities.forEach((other) => {
            if (other.id !== re.id) {
              links.push({ source: re.id, target: other.id, type: 'co-occurrence', weight: 1 });
            }
          });
        });
    }
  });

  // Entity ↔ entity links
  s.entities.forEach((entity) => {
    entity.relatedEntities.forEach((re) => {
      if (!params.type || entity.type === params.type || re.type === params.type) {
        links.push({ source: entity.id, sourceType: entity.type, target: re.id, targetType: re.type, type: 'relates-to', weight: 2 });
      }
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    links: links.filter((l, i, arr) => {
      // Deduplicate links
      return i === arr.findIndex((l2) => l2.source === l.source && l2.target === l.target);
    }),
  };
}

/* ── Statistics ─────────────────────────────────────────────────────── */

export function getStatistics(): APIStatistics {
  const s = getStore();
  const stories = Array.from(s.stories.values());
  // Stories by category
  const storiesByCategory: Record<string, number> = {};
  stories.forEach((st) => { storiesByCategory[st.category] = (storiesByCategory[st.category] || 0) + 1; });

  // Stories by month
  const storiesByMonth: Record<string, number> = {};
  stories.forEach((st) => {
    const month = st.publishedAt.slice(0, 7);
    storiesByMonth[month] = (storiesByMonth[month] || 0) + 1;
  });

  // Average evidence score
  const avgScore = stories.reduce((sum, st) => sum + st.evidenceScore, 0) / Math.max(stories.length, 1);

  // Top tags
  const tagCounts: Record<string, number> = {};
  stories.forEach((st) => { st.tags.forEach((tag) => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }); });
  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top authors
  const authorCounts: Record<string, number> = {};
  stories.forEach((st) => { authorCounts[st.author.name] = (authorCounts[st.author.name] || 0) + 1; });
  const topAuthors = Object.entries(authorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalStories: s.stories.size,
    totalEntities: s.entities.size,
    totalTopics: s.topics.size,
    totalCountries: s.countries.size,
    totalOrganizations: s.organizations.size,
    totalTimelines: s.timelines.size,
    storiesByCategory,
    storiesByMonth,
    averageEvidenceScore: Math.round(avgScore * 10) / 10,
    topTags,
    topAuthors,
  };
}
