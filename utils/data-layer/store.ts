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
    heroImage: '/images/stories/mgnrega-20.jpg',
    publishedAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
    readingTime: 12,
    wordCount: 4200,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 92,
    category: 'economy',
    tags: ['MGNREGA', 'rural employment', 'policy analysis', 'social schemes', 'NREGA'],
    relatedTopicIds: ['economy', 'policy', 'agriculture', 'employment'],
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
      { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development',image: '/images/entities/ministry-of-rural-development.jpg',  type: 'organization', description: 'Nodal ministry for MGNREGA implementation.' },
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  const story2: APIStory = {
    id: 'digital-payments-boom',
    slug: 'digital-payments-boom',
    headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution',
    summary: 'How UPI transformed rural financial inclusion, with transaction volumes growing 400% in three years.',
    heroImage: '/images/stories/digital-payments.jpg',
    publishedAt: '2026-06-12T08:00:00Z',
    updatedAt: '2026-06-12T08:00:00Z',
    readingTime: 8,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 88,
    category: 'technology',
    tags: ['UPI', 'digital payments', 'rural India', 'fintech', 'NPCI'],
    relatedTopicIds: ['economy', 'technology', 'digital-payments', 'agriculture'],
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
    heroImage: '/images/stories/fasal-bima.jpg',
    publishedAt: '2026-06-05T06:00:00Z',
    updatedAt: '2026-06-05T06:00:00Z',
    readingTime: 15,
    wordCount: 5200,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 97,
    category: 'policy',
    tags: ['crop insurance', 'agriculture', 'farmer welfare', 'PMFBY'],
    relatedTopicIds: ['policy', 'agriculture'],
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

  // ── Story 4: Semiconductor PLI ────────────────────────────────────

  const story4: APIStory = {
    id: 'semiconductor-pli',
    slug: 'semiconductor-pli',
    headline: "India's ₹1.2 Lakh Crore Semiconductor Push: Can the Dream Take Silicon?",
    summary: "India's expanded semiconductor PLI scheme promises to cover the full value chain, but the Vedanta-Foxconn JV collapse and a growing talent gap raise questions about execution readiness.",
    heroImage: '/images/stories/semiconductor-pli.jpg',
    publishedAt: '2026-07-01T06:00:00Z',
    updatedAt: '2026-07-01T06:00:00Z',
    readingTime: 14,
    wordCount: 4800,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 85,
    category: 'technology',
    tags: ['semiconductor', 'PLI', 'manufacturing', 'electronics', 'Make in India'],
    relatedTopicIds: ['technology', 'employment', 'semiconductor', 'geopolitics'],
    keyPoints: [
      '₹1.2 lakh crore expanded PLI scheme covers full semiconductor value chain',
      '5 fabrication plants proposed under the revised scheme',
      'Vedanta-Foxconn JV collapse highlights execution risks',
      'Talent gap of over 50,000 semiconductor engineers identified',
    ],
    timeline: [
      { date: '2021-12-15', title: '₹76,000 Crore PLI Announced', description: 'Government approves ₹76,000 crore PLI scheme for semiconductor and display manufacturing.', source: 'PIB' },
      { date: '2022-04-01', title: 'Applications Open', description: 'Semiconductor India Programme invites applications from companies to set up fabrication units.', source: 'MeitY' },
      { date: '2024-06-10', title: 'Vedanta-Foxconn JV Collapses', description: 'Joint venture between Vedanta and Foxconn to set up a $19.5 billion semiconductor fab dissolves.', source: 'Company Statements' },
      { date: '2025-09-01', title: 'Revised PLI Scheme Announced', description: 'Government expands PLI outlay to ₹1.2 lakh crore, covering design, fabrication, packaging, and testing.', source: 'Union Cabinet' },
      { date: '2026-03-15', title: 'CCEA Approves 5 Fab Proposals', description: 'Cabinet Committee on Economic Affairs approves 5 new fabrication plant proposals.', source: 'PIB' },
    ],
    facts: [
      { label: 'Total PLI Outlay', value: '₹1.2 lakh crore', source: 'Union Cabinet' },
      { label: 'Jobs Projected', value: '1.75 lakh direct and indirect', source: 'MeitY Impact Assessment' },
      { label: 'Fiscal Incentive Period', value: '6 years', source: 'Scheme Guidelines' },
    ],
    claims: [
      { claim: 'India can become a global semiconductor manufacturing hub by 2030.', source: 'Government Press Release', verification: 'misleading', explanation: 'India currently holds 0% of global semiconductor fabrication capacity. Achieving hub status requires over $50 billion in sustained investment and at least a decade of policy continuity.', confidence: 0.82 },
      { claim: 'The semiconductor PLI scheme has attracted investment commitments worth ₹1.5 lakh crore.', source: 'MeitY Annual Report 2025-26', verification: 'true', explanation: 'Cumulative investment commitments from approved applicants total ₹1.48 lakh crore as of March 2026, verifying this claim.', confidence: 0.9 },
    ],
    sources: [
      { name: 'MeitY Annual Report 2025-26', url: 'https://meity.gov.in', type: 'government', tier: 1 },
      { name: 'Union Cabinet Press Release', url: 'https://pib.gov.in', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'Semiconductor PLI Outlay Over Time (₹ Crore)', data: [
        { year: '2021-22', amount: 76000 }, { year: '2022-23', amount: 76000 },
        { year: '2023-24', amount: 76000 }, { year: '2024-25', amount: 76000 },
        { year: '2025-26', amount: 120000 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What is the Semiconductor PLI scheme?', answer: 'It is a production-linked incentive scheme aimed at attracting semiconductor fabrication, packaging, and design investments with fiscal incentives of up to 50% of project cost.' },
      { question: 'Which companies have committed to setting up fabs in India?', answer: 'Tata Electronics, CG Power (in partnership with Renesas), and the Murugappa Group are among approved applicants. The Vedanta-Foxconn joint venture was scrapped in June 2024.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment', summary: 'Two decades of India\'s flagship rural employment guarantee scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution', summary: 'How UPI transformed rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development',image: '/images/entities/ministry-of-rural-development.jpg',  type: 'organization', description: 'Nodal ministry.' },
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 5: DPDP Bill ────────────────────────────────────────────

  const story5: APIStory = {
    id: 'dpdp-bill',
    slug: 'dpdp-bill',
    headline: 'Digital Personal Data Protection: India\'s Privacy Law Comes of Age',
    summary: 'From the landmark right to privacy judgment to the 2026 amendments, India\'s journey toward comprehensive data protection legislation has been long and contentious.',
    heroImage: '/images/stories/dpdp-bill.jpg',
    publishedAt: '2026-07-05T08:00:00Z',
    updatedAt: '2026-07-05T08:00:00Z',
    readingTime: 11,
    wordCount: 3800,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 90,
    category: 'policy',
    tags: ['data protection', 'privacy', 'DPDP Act', 'technology regulation', 'digital rights'],
    relatedTopicIds: ['technology', 'cybersecurity', 'policy'],
    keyPoints: [
      'Supreme Court declared right to privacy a fundamental right in 2017',
      'DPDP Act 2023 received presidential assent after 6 years of deliberation',
      '2026 amendments expanded regulatory scope and compliance requirements',
      'Tech companies face fines up to ₹250 crore for non-compliance',
    ],
    timeline: [
      { date: '2017-08-24', title: 'Right to Privacy Judgment', description: 'Supreme Court in Justice K.S. Puttaswamy case declares right to privacy a fundamental right under Article 21.', source: 'Supreme Court of India' },
      { date: '2018-07-27', title: 'Srikrishna Committee Report', description: 'BN Srikrishna-led committee submits draft Personal Data Protection Bill to the government.', source: 'MeitY' },
      { date: '2019-12-11', title: 'PDP Bill Introduced', description: 'Personal Data Protection Bill 2019 introduced in Lok Sabha, later referred to Joint Parliamentary Committee.', source: 'PRS Legislative' },
      { date: '2023-08-11', title: 'DPDP Act Receives Assent', description: 'Digital Personal Data Protection Act 2023 receives presidential assent, replacing the 2019 bill.', source: 'Gazette of India' },
      { date: '2026-03-20', title: '2026 Amendments Pass Lok Sabha', description: 'Amendments to DPDP Act passed in Lok Sabha, expanding data fiduciary obligations and cross-border data flow rules.', source: 'Lok Sabha Digital Records' },
    ],
    facts: [
      { label: 'Maximum Fine for Non-Compliance', value: '₹250 crore', source: 'DPDP Act 2023' },
      { label: 'Implementation Timeline', value: '24 months from notification', source: 'MeitY' },
      { label: 'Exempted Government Agencies', value: '15 notified agencies', source: 'Central Government Notification' },
    ],
    claims: [
      { claim: 'India\'s DPDP Act imposes the highest data privacy fines in the world.', source: 'Industry Association Report', verification: 'misleading', explanation: 'While ₹250 crore is significant, EU GDPR fines can reach €20 million or 4% of global turnover, which is substantially higher for large tech firms.', confidence: 0.85 },
      { claim: 'The DPDP Act exempts government agencies from all provisions.', source: 'Digital Rights Advocacy Group', verification: 'true', explanation: 'Section 17 of the Act allows the central government to exempt any instrumentality of the state by notification, and 15 agencies have been exempted as of 2026.', confidence: 0.88 },
    ],
    sources: [
      { name: 'Digital Personal Data Protection Act 2023', url: 'https://meity.gov.in/dpdp', type: 'government', tier: 1 },
      { name: 'PRS Legislative Analysis', url: 'https://prsindia.org', type: 'research', tier: 2 },
    ],
    charts: [],
    faq: [
      { question: 'Who does the DPDP Act apply to?', answer: 'The Act applies to the processing of digital personal data within India and to data processed outside India if it relates to offering goods or services to individuals in India.' },
      { question: 'What rights do citizens have under the DPDP Act?', answer: 'Citizens have the right to access, correct, erase personal data, and the right to grievance redressal. Data fiduciaries must obtain explicit consent before processing personal data.' },
    ],
    relatedStories: [
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution', summary: 'How UPI transformed rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 6: RBI Repo Rate ────────────────────────────────────────

  const story6: APIStory = {
    id: 'rbi-repo-rate',
    slug: 'rbi-repo-rate',
    headline: 'RBI Repo Rate: Decoding Monetary Policy in a Changing Economy',
    summary: 'With the repo rate at 6.50% after 250 bps of cumulative hikes, India\'s monetary policy faces the challenge of balancing inflation control with growth support.',
    heroImage: '/images/stories/rbi-repo-rate.jpg',
    publishedAt: '2026-07-08T06:00:00Z',
    updatedAt: '2026-07-08T06:00:00Z',
    readingTime: 10,
    wordCount: 3500,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 91,
    category: 'economy',
    tags: ['RBI', 'repo rate', 'monetary policy', 'inflation', 'interest rates'],
    relatedTopicIds: ['economy'],
    keyPoints: [
      'Repo rate at 6.50% after cumulative 250 bps hike since May 2022',
      'MPC maintained pause through 2024 before first rate cut in 2025',
      'Inflation targeting framework completed 10 years of operation',
      'Forex reserves crossed $650 billion in 2026',
    ],
    timeline: [
      { date: '2016-10-04', title: 'Monetary Policy Committee Formed', description: 'MPC established under amended RBI Act with inflation targeting mandate of 4% ±2%.', source: 'RBI' },
      { date: '2022-05-04', title: 'Unscheduled Rate Hike', description: 'RBI hikes repo rate by 40 bps in an unscheduled meeting to 4.40%, starting the tightening cycle.', source: 'RBI Press Release' },
      { date: '2023-04-06', title: 'Rate Pause Begins', description: 'MPC pauses after delivering cumulative 250 bps hike; repo rate held at 6.50%.', source: 'RBI MPC Minutes' },
      { date: '2025-06-05', title: 'First Rate Cut', description: 'MPC cuts repo rate by 25 bps to 6.25% as growth concerns outweigh inflation.', source: 'RBI MPC Minutes' },
      { date: '2026-04-08', title: 'Status Quo Maintained', description: 'MPC keeps repo rate at 6.25% with accommodative stance amid global uncertainty.', source: 'RBI' },
    ],
    facts: [
      { label: 'Current Repo Rate', value: '6.25%', source: 'RBI MPC' },
      { label: 'CPI Inflation (2025-26)', value: '4.8%', source: 'MoSPI' },
      { label: 'GDP Growth (2025-26)', value: '6.8%', source: 'RBI' },
      { label: 'Forex Reserves', value: '$650 billion', source: 'RBI' },
    ],
    claims: [
      { claim: 'The inflation targeting framework has successfully kept CPI inflation within the 2-6% band since 2016.', source: 'RBI Annual Report', verification: 'true', explanation: 'In 8 of 10 years since 2016, headline CPI inflation has remained within the 2-6% tolerance band. Breaches occurred only in 2020 (supply shocks) and 2022 (commodity price surge).', confidence: 0.92 },
      { claim: 'RBI\'s rate hikes have significantly boosted bank deposit growth.', source: 'Banking Industry Report', verification: 'misleading', explanation: 'Despite 250 bps of rate hikes, deposit growth has remained sluggish at 8-10% YoY, lagging behind credit growth of 14-16%.', confidence: 0.78 },
    ],
    sources: [
      { name: 'RBI Monetary Policy Report', url: 'https://rbi.org.in', type: 'government', tier: 1 },
      { name: 'MPC Minutes Archive', url: 'https://rbi.org.in/mpc', type: 'government', tier: 1 },
    ],
    charts: [],
    faq: [
      { question: 'What is the repo rate?', answer: 'The repo rate is the rate at which the Reserve Bank of India lends money to commercial banks. It is the key policy rate used to control inflation and stimulate growth.' },
      { question: 'How does the repo rate affect common citizens?', answer: 'Repo rate changes affect loan EMIs, deposit interest rates, and overall economic growth. A higher repo rate makes loans expensive and saving attractive, helping control inflation.' },
    ],
    relatedStories: [
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution', summary: 'How UPI transformed rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India',image: '/images/entities/rbi.jpg',  type: 'organization', description: 'India\'s central bank.' },
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 7: Climate Finance ──────────────────────────────────────

  const story7: APIStory = {
    id: 'climate-finance',
    slug: 'climate-finance',
    headline: "India's ₹11 Lakh Crore Climate Finance Challenge",
    summary: "As India pursues its net zero 2070 target, a massive climate finance gap threatens to slow the renewable energy transition and adaptation efforts.",
    heroImage: '/images/stories/climate-finance.jpg',
    publishedAt: '2026-07-10T06:00:00Z',
    updatedAt: '2026-07-10T06:00:00Z',
    readingTime: 13,
    wordCount: 4400,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 87,
    category: 'environment',
    tags: ['climate change', 'renewable energy', 'climate finance', 'net zero', 'COP'],
    relatedTopicIds: ['environment', 'geopolitics'],
    keyPoints: [
      'India requires ₹11 lakh crore annually to meet climate goals by 2030',
      'Renewable energy capacity reached 220 GW in 2026',
      'International climate finance shortfall estimated at $85 billion per year',
      'Net zero 2070 target requires transformational shift in energy infrastructure',
    ],
    timeline: [
      { date: '2015-12-12', title: 'Paris Agreement Signed', description: 'India signs Paris Agreement, commits to reducing emission intensity by 33-35% by 2030 from 2005 levels.', source: 'UNFCCC' },
      { date: '2021-11-02', title: 'COP26 Net Zero Pledge', description: 'PM Modi announces India\'s net zero by 2070 target at COP26 in Glasgow, along with 500 GW RE by 2030.', source: 'PMO India' },
      { date: '2023-09-09', title: 'G20 Presidency Climate Push', description: 'Under its G20 presidency, India pushes for reform of multilateral climate finance architecture.', source: 'G20 Secretariat' },
      { date: '2026-06-15', title: 'Revised NDCs Submitted', description: 'India submits enhanced NDCs to UNFCCC with updated emission intensity reduction target of 45% by 2030.', source: 'UNFCCC' },
    ],
    facts: [
      { label: 'Renewable Energy Capacity', value: '220 GW', source: 'MNRE' },
      { label: 'Annual Climate Finance Required', value: '₹11 lakh crore', source: 'CEEW Analysis' },
      { label: 'Emission Intensity Reduction Target', value: '45% by 2030', source: 'Revised NDC' },
    ],
    claims: [
      { claim: 'India is on track to achieve 500 GW of renewable energy capacity by 2030.', source: 'Government Press Release', verification: 'misleading', explanation: 'At the current installation rate of 18 GW/year, India would reach approximately 380 GW by 2030 — falling short of the 500 GW target by 24%.', confidence: 0.84 },
      { claim: 'Developed countries have failed to deliver the promised $100 billion in annual climate finance.', source: 'Climate Action Network', verification: 'true', explanation: 'OECD data confirms that developed countries only delivered $83.3 billion in 2020, and the $100 billion goal was first met only in 2022 — two years after the 2020 deadline.', confidence: 0.9 },
    ],
    sources: [
      { name: 'Ministry of New and Renewable Energy Dashboard', url: 'https://mnre.gov.in', type: 'government', tier: 1 },
      { name: 'CEEW Climate Finance Study 2025', url: 'https://ceew.in', type: 'research', tier: 2 },
    ],
    charts: [
      { type: 'line', title: 'India\'s Renewable Energy Capacity Growth (GW)', data: [
        { year: '2015', amount: 36 }, { year: '2017', amount: 62 },
        { year: '2019', amount: 87 }, { year: '2021', amount: 110 },
        { year: '2023', amount: 152 }, { year: '2026', amount: 220 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What is India\'s net zero target?', answer: 'India committed to achieving net zero emissions by 2070 at COP26 in Glasgow. This means balancing the amount of greenhouse gases emitted with the amount removed from the atmosphere.' },
      { question: 'What is climate finance and why is it important for India?', answer: 'Climate finance refers to funding for climate mitigation and adaptation projects. India requires significant international and domestic investment to transition to renewable energy and build climate-resilient infrastructure.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment', summary: 'Two decades of India\'s flagship rural employment guarantee scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 8: Education Budget ─────────────────────────────────────

  const story8: APIStory = {
    id: 'education-budget',
    slug: 'education-budget',
    headline: 'Education Budget: Widening Gap Between Spending and Learning Outcomes',
    summary: 'India\'s education budget has grown 40% in five years, but learning outcomes continue to decline — raising fundamental questions about expenditure efficiency.',
    heroImage: '/images/stories/education-budget.jpg',
    publishedAt: '2026-07-14T06:00:00Z',
    updatedAt: '2026-07-14T06:00:00Z',
    readingTime: 9,
    wordCount: 3100,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 83,
    category: 'policy',
    tags: ['education', 'budget', 'NEP 2020', 'learning outcomes', 'policy analysis'],
    relatedTopicIds: ['policy', 'education', 'health'],
    keyPoints: [
      'Education budget increased 40% over 5 years to ₹1.48 lakh crore',
      'NEP 2020 implementation faces delays in 14 states',
      'Learning outcomes continue to decline despite increased spending',
      'Higher education receives 40% of budget, school education 60%',
    ],
    timeline: [
      { date: '2020-07-30', title: 'NEP 2020 Approved', description: 'National Education Policy 2020 approved by Union Cabinet, replacing the 34-year-old NPE 1986.', source: 'PIB' },
      { date: '2021-02-01', title: 'Budget Allocation Boosted', description: 'Education budget increased by 20% to ₹93,224 crore in FY2021-22.', source: 'Union Budget' },
      { date: '2023-06-15', title: 'NEP Mid-Term Review', description: 'Government conducts mid-term review of NEP implementation, identifies gaps in 14 states.', source: 'Ministry of Education' },
      { date: '2025-02-01', title: 'Budget 2025-26 Allocation', description: 'Education allocation reaches ₹1.48 lakh crore, with focus on digital infrastructure and teacher training.', source: 'Union Budget' },
    ],
    facts: [
      { label: 'Total Education Budget (2025-26)', value: '₹1.48 lakh crore', source: 'Union Budget' },
      { label: 'Education as Percentage of GDP', value: '2.9%', source: 'Economic Survey' },
      { label: 'School Education Share', value: '60%', source: 'Budget Documents' },
      { label: 'Higher Education Share', value: '40%', source: 'Budget Documents' },
    ],
    claims: [],
    sources: [
      { name: 'Union Budget Documents', url: 'https://indiabudget.gov.in', type: 'government', tier: 1 },
      { name: 'Economic Survey 2025-26', url: 'https://indiabudget.gov.in/economicsurvey', type: 'government', tier: 1 },
    ],
    charts: [],
    faq: [
      { question: 'What is NEP 2020?', answer: 'The National Education Policy 2020 is India\'s first education policy of the 21st century, replacing NPE 1986. It aims to transform India\'s education system with a focus on multidisciplinary learning, early childhood education, and vocational training.' },
      { question: 'How does India\'s education spending compare globally?', answer: 'India spends 2.9% of GDP on education, below the global average of 4.4% and far below the 6% recommended by the National Education Policy 1968 and the Kothari Commission.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment', summary: 'Two decades of India\'s flagship rural employment guarantee scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 9: Groundwater Depletion ────────────────────────────────

  const story9: APIStory = {
    id: 'groundwater-depletion',
    slug: 'groundwater-depletion',
    headline: 'India\'s Groundwater Crisis: 62% of Districts Sound the Alarm',
    summary: 'Groundwater depletion threatens India\'s food and water security as 62% of districts face critical or over-exploited groundwater levels, driven primarily by agricultural irrigation.',
    heroImage: '/images/stories/groundwater-depletion.jpg',
    publishedAt: '2026-07-18T06:00:00Z',
    updatedAt: '2026-07-18T06:00:00Z',
    readingTime: 11,
    wordCount: 3900,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 88,
    category: 'environment',
    tags: ['groundwater', 'water crisis', 'agriculture', 'irrigation', 'water policy'],
    relatedTopicIds: ['environment', 'agriculture'],
    keyPoints: [
      '62% of districts report critical or over-exploited groundwater levels',
      'Agriculture accounts for 89% of total groundwater extraction',
      'Groundwater tables declining at 0.5 metres per year across north India',
      'Policy gaps in groundwater regulation persist despite multiple schemes',
    ],
    timeline: [
      { date: '2012-02-01', title: 'National Aquifer Mapping Launched', description: 'CGWB launches NAQUIM (National Aquifer Mapping and Management) programme to map groundwater resources.', source: 'CGWB' },
      { date: '2015-06-01', title: 'Atal Bhujal Yojana Launched', description: 'Central scheme for sustainable groundwater management with community participation launched with World Bank support.', source: 'Ministry of Jal Shakti' },
      { date: '2019-06-28', title: 'Chennai Water Crisis', description: 'Chennai runs out of water, with reservoirs drying up, highlighting the severity of India\'s groundwater crisis.', source: 'News Reports' },
      { date: '2022-03-22', title: 'Jal Shakti Abhiyan Intensified', description: 'Government launches intensified groundwater conservation mission under Jal Shakti Abhiyan.', source: 'Ministry of Jal Shakti' },
    ],
    facts: [
      { label: 'Districts with Critical/Over-Exploited Groundwater', value: '62%', source: 'CGWB Annual Report 2025' },
      { label: 'Agriculture Share of Groundwater Extraction', value: '89%', source: 'CGWB' },
      { label: 'Annual Groundwater Decline Rate (North India)', value: '0.5 metres/year', source: 'NASA-CGWB Study' },
    ],
    claims: [],
    sources: [
      { name: 'CGWB Annual Report 2025', url: 'https://cgwb.gov.in', type: 'government', tier: 1 },
      { name: 'NASA-CGWB Groundwater Study', url: 'https://nasa.gov', type: 'research', tier: 2 },
    ],
    charts: [
      { type: 'line', title: 'Groundwater Level Trends in North India (Metres Below Ground Level)', data: [
        { year: '2010', depth: 15 }, { year: '2013', depth: 18 },
        { year: '2016', depth: 22 }, { year: '2019', depth: 27 },
        { year: '2022', depth: 33 }, { year: '2025', depth: 38 },
      ], xKey: 'year', yKey: 'depth' },
    ],
    faq: [
      { question: 'What causes groundwater depletion in India?', answer: 'The primary cause is unsustainable extraction for agriculture, facilitated by free or heavily subsidized electricity for pumps. Rapid urbanization and industrialization also contribute significantly.' },
      { question: 'What policies exist to address groundwater depletion?', answer: 'Key policies include the Atal Bhujal Yojana (community-led groundwater management), Jal Shakti Abhiyan (water conservation), and the Model Groundwater Bill for state-level regulation. However, enforcement remains weak.' },
    ],
    relatedStories: [
      { slug: 'climate-finance', headline: 'India\'s ₹11 Lakh Crore Climate Finance Challenge', summary: 'Climate finance gap threatens renewable transition.', publishedAt: '2026-07-10T06:00:00Z', readingTime: 13, evidenceScore: 87, category: 'environment' },
    ],
    relatedEntities: [
      { id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture and Farmers Welfare',image: '/images/entities/ministry-of-agriculture.jpg',  type: 'organization', description: 'Nodal ministry.' },
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 10: Ration Digitization ─────────────────────────────────

  const story10: APIStory = {
    id: 'ration-digitization',
    slug: 'ration-digitization',
    headline: 'Digitizing PDS: How Technology Plugged the Leakage in India\'s Food Security Net',
    summary: 'Aadhaar seeding and ePoS deployment have reduced leakage in India\'s Public Distribution System from 40% to under 10%, but coverage gaps persist.',
    heroImage: '/images/stories/ration-digitization.jpg',
    publishedAt: '2026-07-22T06:00:00Z',
    updatedAt: '2026-07-22T06:00:00Z',
    readingTime: 10,
    wordCount: 3500,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 86,
    category: 'economy',
    tags: ['PDS', 'digitization', 'Aadhaar', 'food security', 'One Nation One Ration Card'],
    relatedTopicIds: ['economy', 'policy', 'agriculture'],
    keyPoints: [
      'PDS leakage rate reduced from 40% to under 10% through digitization',
      '5 lakh ePoS devices deployed at fair price shops nationwide',
      'ONORC achieves 100% interstate portability coverage',
      '99.5% of ration cards seeded with Aadhaar',
    ],
    timeline: [
      { date: '2013-09-10', title: 'National Food Security Act', description: 'NFSA enacted, legalising right to food and covering 67% of India\'s population for subsidized food grains.', source: 'PRS Legislative' },
      { date: '2018-01-01', title: 'Digitization Push Begins', description: 'Government mandates Aadhaar seeding of PDS databases and deploys ePoS devices at fair price shops.', source: 'Ministry of Consumer Affairs' },
      { date: '2020-01-01', title: 'ONORC Launched Nationally', description: 'One Nation One Ration Card scheme launched to enable interstate portability of ration benefits.', source: 'PIB' },
      { date: '2023-02-01', title: 'Universal ONORC Coverage', description: 'ONORC achieves 100% coverage across all states and union territories, serving 81 crore beneficiaries.', source: 'Ministry of Consumer Affairs' },
    ],
    facts: [
      { label: 'Leakage Rate Pre-Digitization', value: '40%', source: 'NIPFP Study 2015' },
      { label: 'Current Leakage Rate', value: '<10%', source: 'World Bank Assessment 2025' },
      { label: 'ePoS Devices Deployed', value: '5 lakh', source: 'PDS Dashboard' },
      { label: 'Aadhaar-Seeded Ration Cards', value: '99.5%', source: 'UIDAI' },
    ],
    claims: [
      { claim: 'Digitization has eliminated all leakages in the PDS system.', source: 'Government Press Release', verification: 'misleading', explanation: 'While leakage has been significantly reduced from ~40% to under 10%, pilferage continues through ghost cards in states with incomplete Aadhaar seeding and manual reconciliation loopholes.', confidence: 0.81 },
      { claim: 'ONORC has benefited over 50 crore interstate migrant workers.', source: 'Ministry of Consumer Affairs', verification: 'true', explanation: 'Government data shows 50.7 crore portable transactions recorded under ONORC between 2020 and 2026, supporting this claim.', confidence: 0.87 },
    ],
    sources: [
      { name: 'Ministry of Consumer Affairs Annual Report', url: 'https://consumeraffairs.gov.in', type: 'government', tier: 1 },
      { name: 'World Bank PDS Assessment 2025', url: 'https://worldbank.org', type: 'research', tier: 2 },
    ],
    charts: [],
    faq: [
      { question: 'What is One Nation One Ration Card?', answer: 'ONORC is a scheme that enables beneficiaries to avail subsidized food grains from any fair price shop in India using their existing ration card, eliminating the need for physical movement of ration cards.' },
      { question: 'How does ePoS help reduce PDS leakage?', answer: 'Electronic Point of Sale devices installed at fair price shops authenticate beneficiaries via Aadhaar, record transactions in real-time, and prevent diversion of subsidized grains to the open market.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment', summary: 'Two decades of India\'s flagship rural employment guarantee scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution', summary: 'How UPI transformed rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development',image: '/images/entities/ministry-of-rural-development.jpg',  type: 'organization', description: 'Nodal ministry.' },
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 11: Anganwadi / ICDS ───────────────────────────────────────

  const story11: APIStory = {
    id: 'anganwadi-icds',
    slug: 'anganwadi-icds',
    headline: 'Anganwadi Centres: India\'s Frontline Nutrition Workers Are Burning Out',
    summary: 'India\'s Integrated Child Development Services (ICDS) runs 14 lakh anganwadi centres serving 10 crore beneficiaries, but frontline workers face wage delays, infrastructure gaps, and mounting workloads.',
    heroImage: '/images/stories/anganwadi.jpg',
    publishedAt: '2026-07-28T06:00:00Z',
    updatedAt: '2026-07-28T06:00:00Z',
    readingTime: 11,
    wordCount: 3800,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 84,
    category: 'health',
    tags: ['ICDS', 'anganwadi', 'nutrition', 'child development', 'women empowerment', 'health policy'],
    relatedTopicIds: ['health', 'policy'],
    keyPoints: [
      'India operates 14 lakh anganwadi centres serving 10 crore beneficiaries',
      'Anganwadi workers receive honorarium of ₹10,000/month, below minimum wage in most states',
      '40% of anganwadi centres lack functional toilets and drinking water',
      'ICDS budget grew 25% in 5 years but remains under 0.3% of GDP',
    ],
    timeline: [
      { date: '1975-10-02', title: 'ICDS Launched', description: 'Integrated Child Development Services launched as India\'s flagship nutrition and early childhood programme.', source: 'Ministry of Women and Child Development' },
      { date: '2006-03-01', title: 'Universal Coverage', description: 'ICDS expanded to cover all 6,000+ community development blocks across India.', source: 'MWCD Annual Report' },
      { date: '2017-12-01', title: 'POSHAN Abhiyaan Launched', description: 'National Nutrition Mission (POSHAN Abhiyaan) launched to combat malnutrition with targeted interventions.', source: 'NITI Aayog' },
      { date: '2022-03-08', title: 'Anganwadi Worker Honorarium Revised', description: 'Government increases anganwadi worker honorarium to ₹10,000/month amidst nationwide protests.', source: 'MWCD Press Release' },
      { date: '2025-09-15', title: 'ICDS Digitisation Push', description: 'All anganwadi centres equipped with smartphones for real-time nutrition tracking under ICDS-CAS.', source: 'MWCD' },
    ],
    facts: [
      { label: 'Total Anganwadi Centres', value: '14 lakh', source: 'MWCD Dashboard' },
      { label: 'Beneficiaries Covered', value: '10 crore', source: 'ICDS Annual Report' },
      { label: 'Anganwadi Worker Honorarium', value: '₹10,000/month', source: 'MWCD' },
      { label: 'Centres Without Toilets', value: '40%', source: 'CAG Audit 2024' },
      { label: 'ICDS Budget (2025-26)', value: '₹21,200 crore', source: 'Union Budget' },
    ],
    claims: [
      { claim: 'Anganwadi workers earn wages comparable to MGNREGA workers.', source: 'Social Welfare Department', verification: 'misleading', explanation: 'While MGNREGA wages average ₹267/day for 100 days, anganwadi workers receive a fixed monthly honorarium of ₹10,000 — roughly ₹333/day but with no guaranteed days, pensions, or benefits.', confidence: 0.86 },
      { claim: 'India has reduced stunting among children under 5 from 48% to 35% since 2006.', source: 'UNICEF India Report', verification: 'true', explanation: 'NFHS-5 (2019-21) data shows stunting declined from 48% (NFHS-3, 2005-06) to 35.5%, though progress has slowed in the last 5 years.', confidence: 0.88 },
    ],
    sources: [
      { name: 'Ministry of Women and Child Development Annual Report', url: 'https://wcd.gov.in', type: 'government', tier: 1 },
      { name: 'CAG Report on ICDS 2024', url: 'https://cag.gov.in', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'ICDS Budget Allocation Over Time (₹ Crore)', data: [
        { year: '2020-21', amount: 17600 }, { year: '2021-22', amount: 18500 },
        { year: '2022-23', amount: 19200 }, { year: '2023-24', amount: 20000 },
        { year: '2024-25', amount: 20500 }, { year: '2025-26', amount: 21200 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What services do anganwadi centres provide?', answer: 'Anganwadi centres provide six services: supplementary nutrition, pre-school education, health check-ups, immunisation, referral services, and nutrition and health education for women.' },
      { question: 'Who runs anganwadi centres?', answer: 'Each centre is managed by an anganwadi worker (AWW) and assisted by an anganwadi helper (AWH), both women selected from the local community.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment of rural employment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
      { slug: 'ration-digitization', headline: 'Digitizing PDS', summary: 'Aadhaar and ePoS impact on food security.', publishedAt: '2026-07-22T06:00:00Z', readingTime: 10, evidenceScore: 86, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'ministry-of-women-and-child-development', slug: 'ministry-of-women-and-child-development', name: 'Ministry of Women and Child Development',image: '/images/entities/ministry-of-women-and-child-development.jpg',  type: 'organization', description: 'Nodal ministry for ICDS implementation.' },
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 12: Supply Chain Shift ────────────────────────────────────

  const story12: APIStory = {
    id: 'supply-chain-shift',
    slug: 'supply-chain-shift',
    headline: 'The Great Supply Chain Shift: Can India Capture the China+1 Opportunity?',
    summary: 'As global companies diversify away from China, India has attracted $85 billion in FDI since 2023 — but infrastructure gaps and policy inconsistency threaten to squander the moment.',
    heroImage: '/images/stories/supply-chain-shift.jpg',
    publishedAt: '2026-08-01T06:00:00Z',
    updatedAt: '2026-08-01T06:00:00Z',
    readingTime: 13,
    wordCount: 4500,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 90,
    category: 'economy',
    tags: ['supply chain', 'China+1', 'manufacturing', 'FDI', 'infrastructure', 'Make in India'],
    relatedTopicIds: ['economy', 'semiconductor', 'infrastructure', 'geopolitics'],
    keyPoints: [
      'India attracted $85 billion in FDI between 2023 and 2026 from supply chain relocation',
      'Electronics manufacturing PLI schemes drove $25 billion in committed investment',
      'Infrastructure gaps — port turnaround time 2x global average, power costs 30% higher than China',
      '14 states have launched separate semiconductor and electronics manufacturing incentive schemes',
    ],
    timeline: [
      { date: '2020-04-01', title: 'Post-COVID Supply Chain Rethink', description: 'COVID-19 disruptions expose over-reliance on Chinese supply chains, triggering global diversification strategies.', source: 'WEF Analysis' },
      { date: '2021-05-12', title: 'PLI Scheme Expansion', description: 'India expands PLI schemes to 14 sectors with ₹1.97 lakh crore outlay to attract manufacturing investments.', source: 'PIB' },
      { date: '2023-06-01', title: 'Apple Supply Chain Shift', description: 'Apple ramps up iPhone production in India to 14% of global output, with Foxconn, Wistron, and Pegatron expanding facilities.', source: 'Industry Reports' },
      { date: '2024-09-20', title: 'India-Middle East-Europe Corridor', description: 'IMEC logistics corridor announced at G20, positioning India as a transshipment hub between Asia and Europe.', source: 'PMO India' },
      { date: '2026-04-15', title: 'FDI Crosses $85 Billion', description: 'Cumulative FDI from supply chain relocation investments crosses $85 billion since 2023.', source: 'DPIIT Annual Report' },
    ],
    facts: [
      { label: 'FDI from Supply Chain Relocation (2023-26)', value: '$85 billion', source: 'DPIIT' },
      { label: 'Apple iPhone Production in India', value: '14% of global', source: 'Industry Reports' },
      { label: 'Port Turnaround Time (India vs Global Avg)', value: '48 hrs vs 24 hrs', source: 'World Bank Logistics' },
      { label: 'Industrial Power Cost vs China', value: '30% higher', source: 'CII Study' },
      { label: 'PLI Scheme Outlay', value: '₹1.97 lakh crore', source: 'Union Budget' },
    ],
    claims: [
      { claim: 'India has surpassed Vietnam as the top alternative manufacturing destination to China.', source: 'World Bank Investment Report', verification: 'true', explanation: 'India received $85 billion in FDI from supply chain relocation since 2023 vs Vietnam\'s $45 billion in the same period, though Vietnam has higher ease of doing business scores.', confidence: 0.83 },
      { claim: 'India\'s logistics infrastructure is globally competitive.', source: 'Ministry of Commerce', verification: 'misleading', explanation: 'India ranks 38th on the World Bank Logistics Performance Index. Port turnaround time (48 hrs) is double the global average (24 hrs), and logistics costs are 14% of GDP vs 8% in developed economies.', confidence: 0.79 },
    ],
    sources: [
      { name: 'DPIIT Annual Report 2025-26', url: 'https://dpiit.gov.in', type: 'government', tier: 1 },
      { name: 'World Bank Logistics Performance Index 2025', url: 'https://worldbank.org', type: 'research', tier: 2 },
    ],
    charts: [
      { type: 'bar', title: 'FDI Inflows from Supply Chain Relocation ($ Billion)', data: [
        { year: '2020', amount: 12 }, { year: '2021', amount: 18 },
        { year: '2022', amount: 22 }, { year: '2023', amount: 28 },
        { year: '2024', amount: 30 }, { year: '2025', amount: 27 },
      ], xKey: 'year', yKey: 'amount' },
      { type: 'line', title: 'Apple iPhone Production in India (% of Global)', data: [
        { year: '2021', share: 1.2 }, { year: '2022', share: 3.5 },
        { year: '2023', share: 7.0 }, { year: '2024', share: 10.5 },
        { year: '2025', share: 12.0 }, { year: '2026', share: 14.0 },
      ], xKey: 'year', yKey: 'share' },
    ],
    faq: [
      { question: 'What is the China+1 strategy?', answer: 'China+1 is a global business strategy where companies diversify their manufacturing and supply chain operations beyond China to a second country, typically in Asia, to reduce risk from geopolitical tensions and supply disruptions.' },
      { question: 'Which sectors are benefiting most from supply chain relocation to India?', answer: 'Electronics and mobile manufacturing lead the trend, followed by automotive components, pharmaceuticals, chemicals, and textile manufacturing. Apple, Samsung, Dell, and Tesla suppliers have all expanded Indian operations.' },
    ],
    relatedStories: [
      { slug: 'semiconductor-pli', headline: 'India\'s Semiconductor Push', summary: 'Can the ₹1.2 lakh crore PLI scheme deliver.', publishedAt: '2026-07-01T06:00:00Z', readingTime: 14, evidenceScore: 85, category: 'technology' },
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: 'UPI\'s role in financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'ministry-of-finance', slug: 'ministry-of-finance', name: 'Ministry of Finance',image: '/images/entities/ministry-of-finance.jpg',  type: 'organization', description: 'Nodal ministry for PLI schemes and FDI policy.' },
      { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization', description: 'India\'s central bank regulating FDI inflows.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 13: Ethanol Backlash ──────────────────────────────────────

  const story13: APIStory = {
    id: 'ethanol-backlash',
    slug: 'ethanol-backlash',
    headline: 'E20 Backlash: India\'s Ethanol Push and the Consumer Revolt That Followed',
    summary: 'India achieved 20% ethanol blending five years ahead of schedule, but motorists report mileage drops of up to 12%, the food-versus-fuel debate resurfaces, and a Supreme Court PIL challenges the rollout.',
    heroImage: '/images/stories/ethanol-backlash.jpg',
    publishedAt: '2026-08-05T06:00:00Z',
    updatedAt: '2026-08-05T06:00:00Z',
    readingTime: 14,
    wordCount: 4800,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 89,
    category: 'environment',
    tags: ['ethanol', 'E20', 'biofuel', 'energy policy', 'consumer rights', 'food security', 'greenlash'],
    relatedTopicIds: ['environment', 'agriculture'],
    keyPoints: [
      'India achieved 20% ethanol blending target by April 2025, five years ahead of the 2030 deadline',
      '66% of vehicle owners surveyed report mileage drops exceeding 10% after E20 adoption',
      'Sugar diversion to ethanol has contributed to sugar prices rising from ₹40/kg to ₹45/kg since 2023',
      'Supreme Court dismissed a PIL against the rollout but acknowledged the need for monitoring',
      'Global greenlash pattern mirrors pushback against rushed environmental policies in France and elsewhere',
    ],
    timeline: [
      { date: '2003-01-01', title: 'EBP Programme Launched', description: 'India launches Ethanol Blended Petrol programme at 5% blending.', source: 'MoPNG' },
      { date: '2018-06-01', title: '20% Target Set', description: 'National Policy on Biofuels sets 20% ethanol blending target by 2030.', source: 'PIB' },
      { date: '2022-06-01', title: '10% Blending Achieved', description: 'India reaches 10% ethanol blending milestone ahead of schedule.', source: 'MoPNG' },
      { date: '2025-04-01', title: 'Nationwide E20 Rollout', description: 'India achieves 20% ethanol blending nationwide, 5 years ahead of target.', source: 'PIB' },
      { date: '2025-08-12', title: 'SC Dismisses PIL', description: 'Supreme Court dismisses PIL challenging E20 rollout.', source: 'The Hindu' },
      { date: '2026-07-05', title: 'Survey Flags Backlash', description: 'LocalCircles survey: 53% call rollout disastrous, 66% report mileage drop.', source: 'LocalCircles' },
    ],
    facts: [
      { label: 'Ethanol Blending Rate (2025)', value: '20%', source: 'MoPNG' },
      { label: 'Original Target Year', value: '2030', source: 'National Biofuel Policy' },
      { label: 'Sugar Price Increase (2023-25)', value: '₹40/kg to ₹45/kg', source: 'ISMA' },
      { label: 'Consumer-Reported Mileage Drop', value: '8-12% for older vehicles', source: 'LocalCircles Survey' },
      { label: 'Vehicles Not E20-Compliant', value: '~30 crore', source: 'SIAM Estimate' },
    ],
    claims: [
      { claim: 'E20 petrol causes only 1-2% mileage reduction in four-wheelers.', source: 'MoPNG Official Statement', verification: 'misleading', explanation: 'ARAI tests show 1-6% drop for compliant vehicles; independent surveys report 8-12% drops for older non-compliant vehicles. Nearly 30 crore vehicles on Indian roads are not E20-compliant.', confidence: 0.82 },
      { claim: 'Ethanol blending saved India $19.3 billion in foreign exchange.', source: 'MoPNG Annual Report', verification: 'true', explanation: 'Government data confirms cumulative forex savings of $19.3 billion, with ₹1.06 lakh crore in farmer payments.', confidence: 0.88 },
      { claim: 'Sugar diversion for ethanol has caused retail sugar prices to spike.', source: 'Consumer Groups', verification: 'true', explanation: 'Sugar prices rose from ₹40/kg (May 2023) to ₹45/kg (May 2025) as 4 million tonnes of sugar-equivalent was diverted to ethanol.', confidence: 0.78 },
    ],
    sources: [
      { name: 'MoPNG Ethanol Blending Dashboard', url: 'https://mopng.gov.in', type: 'government', tier: 1 },
      { name: 'LocalCircles Survey on E20 Impact', url: 'https://localcircles.com', type: 'research', tier: 2 },
      { name: 'ARAI Vehicle Compatibility Study', url: 'https://araiindia.com', type: 'research', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'India\'s Ethanol Blending Rate (% of Petrol)', data: [
        { year: '2014', rate: 1.5 }, { year: '2020', rate: 5.0 },
        { year: '2022', rate: 10.0 }, { year: '2024', rate: 15.0 },
        { year: '2025', rate: 19.5 }, { year: '2026', rate: 20.0 },
      ], xKey: 'year', yKey: 'rate' },
      { type: 'line', title: 'Retail Sugar Price (₹/kg)', data: [
        { year: '2020', price: 36 }, { year: '2021', price: 38 },
        { year: '2022', price: 40 }, { year: '2023', price: 42 },
        { year: '2024', price: 44 }, { year: '2025', price: 45 },
      ], xKey: 'year', yKey: 'price' },
    ],
    faq: [
      { question: 'What is E20 fuel?', answer: 'E20 is petrol blended with 20% ethanol by volume. India achieved nationwide E20 availability in April 2025, five years ahead of its original 2030 target.' },
      { question: 'Does E20 damage older engines?', answer: 'Older vehicles may experience accelerated wear of rubber seals, fuel lines, and gaskets. Vehicles manufactured after April 2023 are designed to be E20-compliant.' },
    ],
    relatedStories: [
      { slug: 'climate-finance', headline: 'India\'s Climate Finance Challenge', summary: '₹11 lakh crore annual requirement.', publishedAt: '2026-07-10T06:00:00Z', readingTime: 13, evidenceScore: 87, category: 'environment' },
      { slug: 'groundwater-depletion', headline: 'India\'s Groundwater Crisis', summary: 'Water-intensive crop impact.', publishedAt: '2026-07-18T06:00:00Z', readingTime: 11, evidenceScore: 88, category: 'environment' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 14: EWS Quota UPSC Investigation ──────────────────────────

  const story14: APIStory = {
    id: 'ews-quota-upsc-investigation',
    slug: 'ews-quota-upsc-investigation',
    headline: 'Who Really Gets the EWS Quota? An Investigation into UPSC\'s 104 Selections',
    summary: 'An investigation into all 104 candidates selected under the 10% EWS quota in Civil Services 2025 finds IIT graduates, private school alumni, and business family children — raising fundamental questions about targeting and due diligence.',
    heroImage: '/images/stories/ews-quota-upsc.jpg',
    publishedAt: '2026-08-08T06:00:00Z',
    updatedAt: '2026-08-08T06:00:00Z',
    readingTime: 12,
    wordCount: 4200,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 94,
    category: 'policy',
    tags: ['EWS quota', 'UPSC', 'reservation', 'civil services', 'constitutional law', 'social justice'],
    relatedTopicIds: ['policy', 'education'],
    keyPoints: [
      '104 candidates selected under EWS quota in Civil Services 2025 — 10.9% of total 958 selections',
      'At least 67 of 104 candidates (64.4%) attended premium coaching institutes with fees up to ₹2.65 lakh/year',
      '44.4% attended private schools charging ₹45,000-₹1.5 lakh annual fees',
      '26.9% had parents running active businesses; 9.6% held corporate jobs',
      '14 candidates held IIT/NIT graduate or postgraduate degrees',
    ],
    timeline: [
      { date: '2019-01-01', title: '103rd Amendment Passed', description: 'Parliament passes 103rd Amendment providing 10% EWS reservation.', source: 'PRS Legislative' },
      { date: '2022-11-07', title: 'SC Upholds EWS Quota', description: 'Supreme Court by 3:2 majority upholds constitutional validity of EWS quota.', source: 'Supreme Court of India' },
      { date: '2026-03-06', title: 'CSE 2025 Results Declared', description: '958 candidates recommended; 104 under EWS quota for 1,087 vacancies.', source: 'UPSC' },
      { date: '2026-06-19', title: 'Investigation Published', description: 'Indian Express investigation of all 104 EWS-selected candidates reveals profile mismatches.', source: 'The Indian Express' },
    ],
    facts: [
      { label: 'Total CSE 2025 Selections', value: '958', source: 'UPSC' },
      { label: 'EWS Quota Selections', value: '104 (10.9%)', source: 'UPSC' },
      { label: 'EWS Income Ceiling', value: '₹8 lakh/year', source: 'DoPT' },
      { label: 'Premium Coaching Users', value: '64.4% of EWS selects', source: 'Indian Express' },
      { label: 'Private School Background', value: '44.4%', source: 'Indian Express' },
      { label: 'Business Family Background', value: '26.9%', source: 'Indian Express' },
      { label: 'IIT/NIT Graduates', value: '14 candidates', source: 'Indian Express' },
    ],
    claims: [
      { claim: 'The EWS quota primarily benefits the truly economically disadvantaged.', source: 'Government Statement', verification: 'misleading', explanation: 'While some genuine beneficiaries exist, the investigation found 64.4% used premium coaching (fees up to ₹2.65 lakh) and 27% had business family backgrounds — inconsistent with the ₹8 lakh income ceiling.', confidence: 0.87 },
      { claim: 'The 103rd Amendment breaches the 50% reservation ceiling.', source: 'Petitioners', verification: 'true', explanation: 'The Indira Sawhney judgment set a 50% ceiling. The 103rd Amendment adds 10% EWS on top, taking total reservation to ~60%. The SC upheld it 3:2; dissenting judges cited the ceiling breach.', confidence: 0.92 },
    ],
    sources: [
      { name: 'Indian Express Investigation (June 2026)', url: 'https://indianexpress.com/article/express-exclusive/ews-quota-civil-services-exam-2025-investigation-10746897/', type: 'news', tier: 1 },
      { name: 'UPSC CSE 2025 Final Result', url: 'https://upsc.gov.in', type: 'government', tier: 1 },
      { name: 'Supreme Court Judgment — Janhit Abhiyan 2022', url: 'https://sc.gov.in', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'bar', title: 'EWS Candidates by Background Profile (%)', data: [
        { label: 'Premium Coaching', value: 64.4 }, { label: 'Private Schooling', value: 44.4 },
        { label: 'Business Family', value: 26.9 }, { label: 'Delhi University', value: 26.0 },
        { label: 'IIT/NIT', value: 13.5 }, { label: 'Corporate Job', value: 9.6 },
      ], xKey: 'label', yKey: 'value' },
      { type: 'bar', title: 'UPSC CSE 2025 Selections by Category', data: [
        { label: 'General', value: 317 }, { label: 'OBC', value: 306 },
        { label: 'SC', value: 158 }, { label: 'EWS', value: 104 }, { label: 'ST', value: 73 },
      ], xKey: 'label', yKey: 'value' },
    ],
    faq: [
      { question: 'What is the EWS quota?', answer: 'The EWS quota provides 10% reservation in government jobs and education for general-category candidates with annual family income below ₹8 lakh.' },
      { question: 'Has the Supreme Court upheld the EWS quota?', answer: 'Yes, by a 3:2 majority in November 2022. Two dissenting judges held that economic criteria alone cannot justify reservation.' },
    ],
    relatedStories: [
      { slug: 'education-budget',
    headline: 'Education Budget: Spending vs Learning', summary: 'Gap between education spending and outcomes.', publishedAt: '2026-07-14T06:00:00Z', readingTime: 9, evidenceScore: 83, category: 'policy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 22: US-Iran Relations ────────────────────────────────────

  const story22: APIStory = {
    id: 'us-iran-relations',
    slug: 'us-iran-relations',
    headline: 'US-Iran Relations: From Maximum Pressure to Nuclear Negotiations',
    summary: 'As the 2026 US-Iran nuclear talks enter a decisive phase, The Breakdown examines the decades-long trajectory of confrontation, diplomacy, and the geopolitical stakes for the Middle East and India.',
    heroImage: '/images/stories/education-budget.jpg',
    publishedAt: '2026-07-18T06:00:00Z',
    updatedAt: '2026-07-18T06:00:00Z',
    readingTime: 14,
    wordCount: 4800,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 89,
    category: 'politics',
    tags: ['US-Iran', 'nuclear deal', 'JCPOA', 'Middle East', 'sanctions', 'geopolitics'],
    relatedTopicIds: ['geopolitics', 'policy'],
    keyPoints: [
      '2026 Vienna talks aim to restore JCPOA with enhanced verification protocols',
      'Iran enriches uranium at 60% purity, weeks from weapons-grade threshold',
      'Maximum pressure sanctions reduced Iran oil exports by 80% since 2018',
      'India pivots to alternative energy sources amid Persian Gulf volatility',
    ],
    timeline: [
      { date: '2015-07-14', title: 'JCPOA Signed', description: 'Iran and P5+1 sign Joint Comprehensive Plan of Action, limiting Iran\'s nuclear program in exchange for sanctions relief.', source: 'UN Security Council' },
      { date: '2018-05-08', title: 'US Withdraws from JCPOA', description: 'President Trump withdraws US from the nuclear deal, reimposing sweeping sanctions on Iran.', source: 'White House' },
      { date: '2020-01-03', title: 'Soleimani Assassinated', description: 'US drone strike kills Quds Force commander Qasem Soleimani in Baghdad, escalating tensions.', source: 'US Department of Defense' },
      { date: '2021-04-06', title: 'Vienna Talks Begin', description: 'Iran and P5+1 begin negotiations to restore JCPOA compliance in Vienna.', source: 'EU External Action Service' },
      { date: '2025-11-15', title: 'Breakthrough Framework', description: 'US and Iran agree on framework for enhanced JCPOA with stricter IAEA inspections and extended sunset clauses.', source: 'State Department' },
      { date: '2026-06-20', title: '2026 Final Round Talks', description: 'Final round of negotiations underway in Vienna with focus on sanctions sequencing and verification mechanisms.', source: 'The Breakdown Analysis' },
    ],
    facts: [
      { label: 'Iran Uranium Enrichment Level', value: '60%', source: 'IAEA' },
      { label: 'Oil Export Reduction Since 2018', value: '80%', source: 'IEA' },
      { label: 'Indian Oil Imports from Iran (Pre-Sanctions)', value: '12% of total', source: 'PPAC' },
      { label: 'Strait of Hormuz Oil Transit', value: '21 million barrels/day', source: 'US EIA' },
    ],
    claims: [
      { claim: 'Iran\'s nuclear program is for peaceful purposes only.', source: 'Government of Iran', verification: 'misleading', explanation: 'IAEA reports confirm Iran has enriched uranium to 60% purity, far beyond the 3.67% needed for civilian nuclear power and consistent with weapons-grade enrichment capability.', confidence: 0.91 },
      { claim: 'US sanctions on Iran have successfully curtailed its regional proxy network funding.', source: 'US Treasury Department', verification: 'true', explanation: 'Treasury estimates Iran\'s budget for proxy forces (Hezbollah, Houthis, Iraqi militias) declined by 40% from $16 billion to $9.6 billion annually between 2018-2025.', confidence: 0.78 },
    ],
    sources: [
      { name: 'IAEA Verification Reports', url: 'https://iaea.org', type: 'international', tier: 1 },
      { name: 'US Energy Information Administration', url: 'https://eia.gov', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'Iran Oil Exports (mb/d)', data: [
        { year: '2017', amount: 2.5 }, { year: '2018', amount: 1.8 },
        { year: '2019', amount: 0.5 }, { year: '2020', amount: 0.4 },
        { year: '2021', amount: 0.6 }, { year: '2023', amount: 1.0 },
        { year: '2025', amount: 1.4 }, { year: '2026', amount: 1.6 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What is the JCPOA?', answer: 'The Joint Comprehensive Plan of Action (JCPOA), signed in 2015, limits Iran\'s nuclear program in exchange for sanctions relief. The US withdrew in 2018, and negotiations to restore it have been ongoing since 2021.' },
      { question: 'Why does US-Iran tension matter for India?', answer: 'India imports 80% of its oil from the Middle East. US-Iran tensions directly affect oil prices, the viability of the Chabahar port project, and India\'s strategic balancing between the US and Iran.' },
    ],
    relatedStories: [
      { slug: 'supply-chain-shift',
    headline: 'The Great Supply Chain Shift', summary: 'India\'s China+1 opportunity in manufacturing.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'un', slug: 'un', name: 'United Nations',image: '/images/entities/un.jpg',  type: 'organization', description: 'International organization.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  // ── Story 23: India's Education System Crisis ──────────────────────

  const story23: APIStory = {
    id: 'indian-education-crisis',
    slug: 'indian-education-crisis',
    headline: 'India\'s Education Paradox: Rising Enrolment, Falling Learning — What Went Wrong?',
    summary: 'While near-universal enrolment has been achieved at the primary level, India\'s education system faces a crisis of quality — half of Class 5 students cannot read a Class 2 textbook. An investigation into the systemic failures behind the learning poverty trap.',
    heroImage: '/images/stories/supply-chain-shift.jpg',
    publishedAt: '2026-07-22T06:00:00Z',
    updatedAt: '2026-07-22T06:00:00Z',
    readingTime: 16,
    wordCount: 5500,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 93,
    category: 'policy',
    tags: ['education', 'learning outcomes', 'ASER', 'NEP 2020', 'school education', 'teacher training'],
    relatedTopicIds: ['policy', 'education'],
    keyPoints: [
      'Near-universal enrolment (97%) at primary level masks a learning crisis',
      'Only 50% of Class 5 students can read a Class 2 level text (ASER 2025)',
      'Teacher shortage of 1.2 million positions across government schools',
      'NEP 2020 implementation hampered by state-level capacity and funding gaps',
      'Private school enrolment share rose from 30% to 47% in a decade',
    ],
    timeline: [
      { date: '1986-08-01', title: 'National Policy on Education 1986', description: 'NPE 1986 adopted, focusing on universal access, quality improvement, and equality in education.', source: 'Ministry of Education' },
      { date: '2002-12-01', title: '86th Constitutional Amendment', description: 'Article 21A inserted, making free and compulsory education a fundamental right for children aged 6-14.', source: 'Parliament of India' },
      { date: '2009-04-01', title: 'RTE Act Comes Into Force', description: 'Right to Education Act operationalises Article 21A, mandating free schooling, no-detention policy, and 25% reservation for disadvantaged groups in private schools.', source: 'Ministry of Education' },
      { date: '2020-07-30', title: 'NEP 2020 Approved', description: 'National Education Policy 2020 replaces NPE 1986, introducing 5+3+3+4 structure, vocational integration, and mother tongue instruction.', source: 'PIB' },
      { date: '2025-01-15', title: 'ASER 2025 Report', description: 'Annual Status of Education Report shows learning outcomes declining for third consecutive year despite increased budget allocation.', source: 'ASER Centre/Pratham' },
      { date: '2026-03-01', title: 'Parliamentary Committee on Education', description: 'Standing Committee on Education submits report calling for urgent remedial measures including teacher recruitment drive and learning outcome targets.', source: 'Lok Sabha Secretariat' },
    ],
    facts: [
      { label: 'Enrolment Rate (Primary)', value: '97%', source: 'UDISE+ 2024-25' },
      { label: 'Class 5 Students Reading at Class 2 Level', value: '50.3%', source: 'ASER 2025' },
      { label: 'Teacher Vacancies', value: '12 lakh', source: 'MoE Dashboard' },
      { label: 'Pupil-Teacher Ratio (Primary)', value: '26:1', source: 'UDISE+ 2024-25' },
      { label: 'Education Spend as % of GDP', value: '2.9%', source: 'Economic Survey' },
    ],
    claims: [
      { claim: 'The no-detention policy under RTE has improved learning outcomes by reducing dropout rates.', source: 'Ministry of Education, 2019', verification: 'misleading', explanation: 'While dropout rates declined from 8% to 4%, ASER data shows learning outcomes actually worsened during the no-detention period (2010-2019), with Grade 5 reading ability declining from 53% to 47%.', confidence: 0.86 },
      { claim: 'India\'s teacher shortage has been fully addressed through the Samagra Shiksha Abhiyan.', source: 'Government Press Release 2024', verification: 'false', explanation: 'As of 2025, there are 1.2 million teacher vacancies across government schools. Recruitment under Samagra Shiksha has filled only 35% of sanctioned positions.', confidence: 0.88 },
      { claim: 'Private schools in India outperform government schools in learning outcomes when controlled for socio-economic factors.', source: 'Annual Status of Education Report 2024', verification: 'true', explanation: 'ASER data shows private school students score 12-18% higher in reading and math, and this gap persists even when controlling for parental income and education levels.', confidence: 0.82 },
    ],
    sources: [
      { name: 'ASER Centre Reports 2024-25', url: 'https://asercentre.org', type: 'research', tier: 1 },
      { name: 'Unified District Information System for Education (UDISE+)', url: 'https://udiseplus.gov.in', type: 'government', tier: 1 },
      { name: 'National Education Policy 2020', url: 'https://nep2020.gov.in', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'Student Learning Outcomes Trend (2012-2025)', data: [
        { year: '2012', reading: 47, math: 26 }, { year: '2014', reading: 48, math: 26 },
        { year: '2016', reading: 48, math: 28 }, { year: '2018', reading: 50, math: 28 },
        { year: '2020', reading: 46, math: 25 }, { year: '2022', reading: 42, math: 23 },
        { year: '2024', reading: 43, math: 25 }, { year: '2025', reading: 50, math: 31 },
      ], xKey: 'year', yKey: 'reading' },
    ],
    faq: [
      { question: 'What is the ASER report?', answer: 'The Annual Status of Education Report (ASER) is a nationwide household survey conducted by Pratham that measures children\'s foundational reading and arithmetic skills. It is India\'s largest citizen-led survey on education outcomes.' },
      { question: 'How does India\'s education spending compare internationally?', answer: 'India spends 2.9% of GDP on education, well below the global average of 4.4% and the 6% recommended by the Kothari Commission (1964-66) and reaffirmed in NEP 2020.' },
      { question: 'What are the key reforms under NEP 2020?', answer: 'NEP 2020 introduces a 5+3+3+4 curriculum structure (replacing 10+2), early childhood education integration, vocational training from Class 6, mother tongue instruction until Class 5, and a multidisciplinary approach to higher education.' },
    ],
    relatedStories: [
      { slug: 'education-budget',
    headline: 'Education Budget: Spending vs Learning', summary: 'Gap between education spending and outcomes.', publishedAt: '2026-07-14T06:00:00Z', readingTime: 9, evidenceScore: 83, category: 'policy' },
      { slug: 'ews-quota', headline: 'EWS Quota: Economic Reservation Debate', summary: 'Supreme Court upholds 10% EWS quota.', publishedAt: '2026-07-16T06:00:00Z', readingTime: 11, evidenceScore: 87, category: 'policy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
      { id: 'un', slug: 'un', name: 'United Nations', type: 'organization', description: 'UN agencies track SDG 4 education indicators.' },
    ],
  };

  // ── Story 24: Income Inequality in India ────────────────────────────

  const story24: APIStory = {
    id: 'income-inequality-india',
    slug: 'income-inequality-india',
    headline: 'Income Inequality in India: The Top 1% Now Owns 40% of the Wealth',
    summary: 'India\'s income inequality has reached levels not seen since the colonial era — the top 1% holds 40% of national wealth while the bottom 50% holds just 13%. An examination of the structural drivers behind India\'s Gini coefficient trajectory.',
    heroImage: '/images/stories/education-budget.jpg',
    publishedAt: '2026-07-26T06:00:00Z',
    updatedAt: '2026-07-26T06:00:00Z',
    readingTime: 15,
    wordCount: 5100,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 94,
    category: 'economy',
    tags: ['inequality', 'wealth gap', 'Gini coefficient', 'economic policy', 'income distribution', 'taxation'],
    relatedTopicIds: ['economy', 'policy'],
    keyPoints: [
      'Top 1% owns 40.1% of national wealth, among the highest globally',
      'Bottom 50% share declined from 20% to 13% over two decades',
      'Gini coefficient rose from 0.38 (2005) to 0.47 (2025) for income',
      'Corporate tax cuts and regressive GST structure worsened inequality',
      'Rural-urban income gap widened to 2.8x in 2025 from 2.1x in 2015',
    ],
    timeline: [
      { date: '2006-01-01', title: 'Inequality Begins Rising', description: 'Post-liberalisation growth accelerates but benefits accrue disproportionately to top income deciles. Gini starts multi-year climb from 0.33.', source: 'World Income Inequality Database' },
      { date: '2014-01-01', title: 'Consumption Inequality Gap Widens', description: 'NSSO data shows consumption inequality rising as urban-rural divide expands with services-led growth.', source: 'NSSO Consumption Surveys' },
      { date: '2017-07-01', title: 'GST Implementation', description: 'GST with multiple slabs and regressive structure disproportionately impacts lower-income households who spend a higher share of income on essentials.', source: 'NIPFP Analysis' },
      { date: '2019-09-20', title: 'Corporate Tax Rate Cut', description: 'Government slashes corporate tax rate from 30% to 22%, reducing government revenue by ₹1.45 lakh crore annually and benefiting large corporations.', source: 'Union Budget Documents' },
      { date: '2023-12-01', title: 'World Inequality Lab Report', description: 'World Inequality Lab report shows India\'s top 10% captured 57% of national income in 2023, among the highest share globally.', source: 'World Inequality Lab' },
      { date: '2026-02-15', title: 'Parliamentary Debate on Inequality', description: 'Opposition parties force debate on rising inequality, citing Oxfam and World Inequality Lab data. Government defends growth-first approach.', source: 'Lok Sabha Debates' },
    ],
    facts: [
      { label: 'Top 1% Wealth Share', value: '40.1%', source: 'World Inequality Lab 2025' },
      { label: 'Bottom 50% Wealth Share', value: '13%', source: 'World Inequality Lab 2025' },
      { label: 'Income Gini Coefficient (2025)', value: '0.47', source: 'SBI Economic Research' },
      { label: 'Rural-Urban Income Ratio', value: '1:2.8', source: 'NSSO 2024-25' },
      { label: 'Number of Billionaires (2026)', value: '185', source: 'Forbes India' },
    ],
    claims: [
      { claim: 'Poverty reduction in India has lifted 415 million people out of poverty since 2005.', source: 'UN MDG Report', verification: 'true', explanation: 'UN and World Bank data confirm that India achieved the MDG target of halving poverty ahead of schedule. However, the poverty line threshold ($2.15/day 2017 PPP) masks the precarious economic status of those just above it.', confidence: 0.9 },
      { claim: 'India\'s direct tax-to-GDP ratio is among the highest in emerging economies, indicating progressive taxation.', source: 'Government Economic Survey 2025-26', verification: 'misleading', explanation: 'While direct tax-to-GDP ratio at 6.3% is respectable, the effective tax incidence on the wealthy is low due to exemptions, capital gains preference, and corporate tax cuts. Only 2% of Indians pay income tax.', confidence: 0.84 },
      { claim: 'Wealth inequality in India is now higher than during the British colonial period.', source: 'World Inequality Lab 2024', verification: 'true', explanation: 'World Inequality Lab data shows the top 1% wealth share at 40.1% (2024), surpassing the estimated 37% during the British Raj (1930s). India\'s current inequality level is among the highest in Asia.', confidence: 0.87 },
    ],
    sources: [
      { name: 'World Inequality Lab — India Report 2025', url: 'https://wir2025.wid.world', type: 'research', tier: 1 },
      { name: 'Oxfam India — Inequality Report', url: 'https://oxfamindia.org', type: 'research', tier: 2 },
      { name: 'SBI Economic Research Reports', url: 'https://sbi.co.in', type: 'research', tier: 2 },
    ],
    charts: [
      { type: 'line', title: 'Top 1% Wealth Share Over Time (%)', data: [
        { year: '2000', share: 33 }, { year: '2005', share: 34 },
        { year: '2010', share: 36 }, { year: '2015', share: 37 },
        { year: '2020', share: 39 }, { year: '2025', share: 40 },
      ], xKey: 'year', yKey: 'share' },
      { type: 'bar', title: 'Income Share by Decile (2025)', data: [
        { decile: 'Top 10%', share: 57 }, { decile: 'Top 1%', share: 22 },
        { decile: 'Middle 40%', share: 30 }, { decile: 'Bottom 50%', share: 13 },
      ], xKey: 'decile', yKey: 'share' },
    ],
    faq: [
      { question: 'What is the Gini coefficient?', answer: 'The Gini coefficient measures income or wealth inequality on a scale of 0 (perfect equality) to 1 (perfect inequality). India\'s income Gini of 0.47 places it among the most unequal countries in Asia.' },
      { question: 'What are the main drivers of rising inequality in India?', answer: 'Key drivers include: (1) Services-led growth that disproportionately benefits skilled workers, (2) Regressive taxation structure (GST falls heavily on consumption), (3) Corporate tax cuts reducing fiscal capacity for welfare spending, (4) Asset price inflation benefiting wealthy asset-holders, and (5) Inadequate investment in public education and healthcare.' },
      { question: 'How does India\'s inequality compare to other countries?', answer: 'India\'s top 1% wealth share (40.1%) is higher than the US (34%), China (30%), and Brazil (38%), but lower than Russia (43%). India\'s bottom 50% share (13%) is among the lowest globally.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform',
    headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment of rural employment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
      { slug: 'ration-digitization', headline: 'Digitizing PDS', summary: 'Aadhaar and ePoS impact on food security.', publishedAt: '2026-07-22T06:00:00Z', readingTime: 10, evidenceScore: 86, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
      { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization', description: 'India\'s central bank.' },
      { id: 'imf', slug: 'imf', name: 'International Monetary Fund', type: 'organization', description: 'International financial institution.' },
    ],
  };

  // ── Story 25: India-China Issues ───────────────────────────────────

  const story25: APIStory = {
    id: 'india-china-border-tensions',
    slug: 'india-china-border-tensions',
    headline: 'India-China at the Crossroads: Four Years After Galwan, the Border Remains the Flashpoint',
    summary: 'Despite 20 rounds of military talks, India and China remain locked in the most intense border confrontation in five decades — with 60,000 troops deployed on each side and a broader strategic rivalry reshaping Asia.',
    heroImage: '/images/stories/mgnrega-reform.jpg',
    publishedAt: '2026-07-30T06:00:00Z',
    updatedAt: '2026-07-30T06:00:00Z',
    readingTime: 17,
    wordCount: 5800,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 92,
    category: 'politics',
    tags: ['India-China', 'border dispute', 'Galwan', 'LAC', 'military standoff', 'geopolitics', 'Asia'],
    relatedTopicIds: ['geopolitics', 'policy'],
    keyPoints: [
      '60,000 troops deployed on each side of LAC, highest since 1962 war',
      '20 rounds of military talks failed to achieve complete disengagement',
      'India-China bilateral trade reached $136 billion in 2025 despite tensions',
      'China constructed 500+ structures including helipads within 10 km of LAC',
    ],
    timeline: [
      { date: '1962-10-20', title: 'Sino-Indian War', description: 'China launches surprise offensive across LAC, capturing Aksai Chin. India suffers decisive military defeat.', source: 'Ministry of Defence' },
      { date: '1993-09-07', title: 'Peace and Tranquility Agreement', description: 'India and China sign agreement to maintain peace along LAC pending final resolution of border dispute.', source: 'MEA India' },
      { date: '2017-06-16', title: 'Doklam Standoff', description: 'Chinese PLA builds road in Doklam area claimed by Bhutan. 73-day standoff ensues with Indian troops.', source: 'MEA India' },
      { date: '2020-06-15', title: 'Galwan Valley Clash', description: 'Violent clash at Galwan Valley leaves 20 Indian and 45+ Chinese soldiers dead — worst conflict since 1962.', source: 'Indian Army' },
      { date: '2022-09-01', title: 'Patrol Point 15 Face-off', description: 'Fresh confrontation at Patrolling Point 15 in Gogra-Hot Springs area as China refuses to revert to pre-Galwan positions.', source: 'The Hindu' },
      { date: '2025-10-25', title: 'Wen Jiabao-like Thaw Attempts', description: 'India-China Special Representatives meet in Beijing for first border talks since 2019, but no breakthrough achieved.', source: 'MEA India' },
      { date: '2026-06-01', title: 'troops at 60,000 each side', description: 'Military deployment on both sides reaches 60,000 troops, with China operating new forward air bases in Hotan and Shigatse.', source: 'IISS Military Balance' },
    ],
    facts: [
      { label: 'Troops Deployed on Each Side of LAC', value: '60,000', source: 'IISS 2026' },
      { label: 'Indian Casualties at Galwan (2020)', value: '20 killed', source: 'Indian Army' },
      { label: 'India-China Bilateral Trade (2025)', value: '$136 billion', source: 'Ministry of Commerce' },
      { label: 'China\'s Military Infrastructure within 10 km of LAC', value: '500+ structures', source: 'SATP/C4ADS Analysis' },
      { label: 'Length of LAC', value: '3,488 km', source: 'MEA India' },
    ],
    claims: [
      { claim: 'India\'s infrastructure development along the border now matches China\'s pace.', source: 'Ministry of Defence, 2025', verification: 'misleading', explanation: 'While India has accelerated border road construction under the Border Infrastructure Organisation, China still outpaces India 3:1 in road construction, operates 7 dual-use airfields within striking distance, and has built 500+ hardened structures. India\'s capability gap is narrowing but remains significant.', confidence: 0.85 },
      { claim: 'Chinese incursions across the LAC have decreased since the Galwan clash.', source: 'Government Briefing 2025', verification: 'true', explanation: 'India\'s proactive posture and year-round deployment has reduced PLA patrol incursions from 237 (2019) to 74 (2025). However, incursions now involve larger formations and longer durations.', confidence: 0.82 },
      { claim: 'India\'s Act East policy has successfully reduced Chinese influence in India\'s neighbourhood.', source: 'MEA Annual Report 2025-26', verification: 'misleading', explanation: 'While India has deepened ties with ASEAN, Japan, Australia, and Pacific Island nations, China remains the largest trading partner for most South Asian countries and has invested $50 billion in CPEC and $12 billion in Myanmar infrastructure since 2020.', confidence: 0.78 },
    ],
    sources: [
      { name: 'IISS Military Balance 2026', url: 'https://iiss.org', type: 'research', tier: 1 },
      { name: 'Ministry of External Affairs Annual Report', url: 'https://mea.gov.in', type: 'government', tier: 1 },
      { name: 'C4ADS Analysis of LAC Infrastructure', url: 'https://c4ads.org', type: 'research', tier: 2 },
    ],
    charts: [
      { type: 'bar', title: 'India-China PLA Incursions Along LAC', data: [
        { year: '2014', incursions: 51 }, { year: '2016', incursions: 89 },
        { year: '2018', incursions: 148 }, { year: '2020', incursions: 324 },
        { year: '2022', incursions: 102 }, { year: '2024', incursions: 88 },
        { year: '2025', incursions: 74 },
      ], xKey: 'year', yKey: 'incursions' },
    ],
    faq: [
      { question: 'What is the Line of Actual Control (LAC)?', answer: 'The LAC is the de facto border between India and China, stretching 3,488 km. Unlike a formally demarcated international boundary, the LAC is based on mutual perception and historical claims, leading to frequent disputes over troop positions.' },
      { question: 'What happened at Galwan Valley in 2020?', answer: 'On June 15-16, 2020, a violent physical confrontation between Indian and Chinese soldiers at Galwan Valley resulted in 20 Indian and at least 45 Chinese casualties. It was the first fatal military clash between the two countries since 1967 and led to a dramatic escalation of deployments along the LAC.' },
      { question: 'Why does India-China border tension matter for the global economy?', answer: 'India and China together account for 36% of the world\'s population and 20% of global GDP. A sustained conflict could disrupt global supply chains, energy markets, and shipping lanes in the Indian Ocean, affecting trade worth $7 trillion annually.' },
    ],
    relatedStories: [
      { slug: 'supply-chain-shift',
    headline: 'The Great Supply Chain Shift', summary: 'India\'s China+1 opportunity in manufacturing.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
      { id: 'un', slug: 'un', name: 'United Nations', type: 'organization', description: 'International organization.' },
    ],
  };

  // ── Story 26: India's Foreign Policy ────────────────────────────────

  const story26: APIStory = {
    id: 'indias-foreign-policy',
    slug: 'indias-foreign-policy',
    headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment',
    summary: 'As India celebrates 80 years of independence, its foreign policy has undergone a fundamental transformation — from Nehruvian idealism to pragmatic multi-alignment, balancing the US, China, Russia, and the Global South.',
    heroImage: '/images/stories/supply-chain-shift.jpg',
    publishedAt: '2026-08-05T06:00:00Z',
    updatedAt: '2026-08-05T06:00:00Z',
    readingTime: 18,
    wordCount: 6200,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 90,
    category: 'politics',
    tags: ['foreign policy', 'multi-alignment', 'India-US', 'India-Russia', 'Global South', 'UNSC', 'neighbourhood first'],
    relatedTopicIds: ['geopolitics', 'policy'],
    keyPoints: [
      'India\'s foreign policy evolved from non-alignment to multi-alignment and strategic autonomy',
      'India-US bilateral trade crossed $200 billion in 2025',
      'India-Russia defence ties remain strong despite Western sanctions pressure',
      'Act East policy deepened engagement with ASEAN, Japan, Australia',
      'Neighbourhood First policy faces challenges from China\'s encirclement strategy',
      'India emerged as voice of Global South through G20 presidency and Voice of Global South summits',
    ],
    timeline: [
      { date: '1947-08-15', title: 'Independent India\'s Foreign Policy', description: 'India gains independence with Nehru as first PM, establishing non-alignment as the cornerstone of foreign policy.', source: 'MEA India' },
      { date: '1955-04-18', title: 'Bandung Conference', description: 'India co-founds the Non-Aligned Movement at the Bandung Conference, emerging as a leader of the post-colonial world.', source: 'UN Archives' },
      { date: '1971-08-09', title: 'Indo-Soviet Treaty', description: 'India signs 20-year Treaty of Peace, Friendship and Cooperation with USSR, solidifying Cold War alignment with the Soviet bloc.', source: 'MEA India' },
      { date: '1991-01-01', title: 'Look East Policy Launched', description: 'India launches Look East policy under PM Narasimha Rao to deepen economic and strategic ties with Southeast Asia.', source: 'MEA India' },
      { date: '2005-07-18', title: 'India-US Civil Nuclear Deal', description: 'PM Manmohan Singh and President Bush announce civil nuclear deal, ending India\'s nuclear isolation and transforming US-India relationship.', source: 'White House' },
      { date: '2014-05-26', title: 'Modi Doctrine Emerges', description: 'Modi government prioritises active neighbourhood diplomacy, Act East, and strategic partnerships with US, Japan, Australia, and Israel.', source: 'MEA India' },
      { date: '2023-09-09', title: 'G20 Presidency Success', description: 'India\'s G20 presidency yields New Delhi Leaders\' Declaration, inclusion of African Union in G20, and Voice of Global South Summit institutionalisation.', source: 'PMO India' },
      { date: '2025-12-01', title: 'India-US Defence Pact', description: 'India and US sign landmark defence industrial cooperation roadmap covering jet engines, drones, and maritime domain awareness.', source: 'US Department of Defense' },
      { date: '2026-01-26', title: 'Republic Day with Quad Leaders', description: 'Quad leaders attend India\'s Republic Day as chief guests, signalling Indo-Pacific strategic alignment.', source: 'MEA India' },
    ],
    facts: [
      { label: 'India-US Bilateral Trade (2025)', value: '$200+ billion', source: 'US Trade Representative' },
      { label: 'India-Russia Defence Imports (2020-25)', value: '$15 billion', source: 'SIPRI' },
      { label: 'Indian Diaspora (Worldwide)', value: '35 million', source: 'MEA' },
      { label: 'Diplomatic Missions Abroad', value: '190+', source: 'MEA India' },
      { label: 'Countries Covered by Act East', value: '11 ASEAN + 4 Quad partners', source: 'MEA India' },
    ],
    claims: [
      { claim: 'India has successfully reduced its dependence on Russian military hardware imports.', source: 'Ministry of Defence, 2025', verification: 'true', explanation: 'Russia\'s share of Indian defence imports declined from 70% (2010-2014) to 45% (2020-2025), with the US, France, and Israel filling the gap. However, Russia remains India\'s largest defence supplier.', confidence: 0.86 },
      { claim: 'India\'s neighbourhood first policy has resulted in improved bilateral ties with all South Asian neighbours.', source: 'MEA Annual Report 2025-26', verification: 'misleading', explanation: 'While ties with Bhutan and Bangladesh have strengthened, relations with Pakistan remain frozen post-2019, Nepal\'s political ties have fluctuated, and Maldives\' "India Out" campaign (2023-24) damaged bilateral relations before the 2025 thaw.', confidence: 0.83 },
      { claim: 'India\'s G20 presidency amplified the voice of developing countries in global governance.', source: 'Observer Research Foundation, 2023', verification: 'true', explanation: 'India secured the inclusion of the African Union as a permanent G20 member, hosted two Voice of Global South Summits, and placed climate finance, debt restructuring, and Global South priorities on the G20 agenda.', confidence: 0.9 },
    ],
    sources: [
      { name: 'Ministry of External Affairs Annual Reports', url: 'https://mea.gov.in', type: 'government', tier: 1 },
      { name: 'SIPRI Arms Transfers Database', url: 'https://sipri.org', type: 'research', tier: 1 },
      { name: 'Observer Research Foundation (ORF)', url: 'https://orfonline.org', type: 'research', tier: 2 },
    ],
    charts: [
      { type: 'line', title: 'India\'s Defence Import Sources (2010-2025)', data: [
        { year: '2010', russia: 75, us: 8, france: 5, israel: 7, others: 5 },
        { year: '2015', russia: 65, us: 12, france: 8, israel: 8, others: 7 },
        { year: '2020', russia: 55, us: 18, france: 12, israel: 8, others: 7 },
        { year: '2025', russia: 45, us: 22, france: 15, israel: 10, others: 8 },
      ], xKey: 'year', yKey: 'russia' },
    ],
    faq: [
      { question: 'What is India\'s multi-alignment foreign policy?', answer: 'Multi-alignment is India\'s strategy of maintaining strategic partnerships with multiple major powers simultaneously — the US (defence, technology), Russia (defence, energy), Japan and Australia (Indo-Pacific), and the EU (trade, climate) — without formal alliance commitments, preserving strategic autonomy.' },
      { question: 'What is the Quad?', answer: 'The Quadrilateral Security Dialogue (Quad) is a strategic forum comprising India, the US, Japan, and Australia. Focused on Indo-Pacific maritime security, supply chain resilience, critical technology, and climate action, the Quad has evolved from a 2007 proposal to a ministerial-level grouping with annual summits.' },
      { question: 'How does India balance its relationship with the US and Russia?', answer: 'India maintains a carefully calibrated balancing act: deepening strategic partnership with the US through I2U2, Quad, and defence pacts while preserving its traditional Russian defence supply relationship. India has not joined the Western sanctions regime against Russia, citing national interest, while also not providing military support to Russia\'s war effort.' },
      { question: 'What is India\'s Act East policy?', answer: 'The Act East policy, evolved from the 1991 Look East policy, aims to deepen India\'s economic, strategic, and cultural engagement with the ASEAN region, East Asia, and the Pacific. It covers 11 ASEAN countries plus Quad partners, focusing on connectivity, trade, maritime security, and countering China\'s influence.' },
    ],
    relatedStories: [
      { slug: 'india-china-border-tensions', headline: 'India-China at the Crossroads', summary: 'Border flashpoint and broader rivalry.', publishedAt: '2026-07-30T06:00:00Z', readingTime: 17, evidenceScore: 92, category: 'politics' },
      { slug: 'us-iran-relations', headline: 'US-Iran Relations', summary: 'Nuclear talks and geopolitical stakes.', publishedAt: '2026-07-18T06:00:00Z', readingTime: 14, evidenceScore: 89, category: 'politics' },
      { slug: 'supply-chain-shift', headline: 'The Great Supply Chain Shift', summary: 'India\'s China+1 opportunity.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
      { id: 'un', slug: 'un', name: 'United Nations', type: 'organization', description: 'International organization.' },
      { id: 'g20', slug: 'g20', name: 'G20', type: 'organization', description: 'Group of Twenty.' },
      { id: 'brics', slug: 'brics', name: 'BRICS', type: 'organization', description: 'Brazil-Russia-India-China-South Africa grouping.' },
    ],
  };

  stories.set(story1.slug, story1);
  stories.set(story2.slug, story2);
  stories.set(story3.slug, story3);
  stories.set(story4.slug, story4);
  stories.set(story5.slug, story5);
  stories.set(story6.slug, story6);
  stories.set(story7.slug, story7);
  stories.set(story8.slug, story8);
  stories.set(story9.slug, story9);
  stories.set(story10.slug, story10);
  stories.set(story11.slug, story11);
  stories.set(story12.slug, story12);
  stories.set(story13.slug, story13);
  stories.set(story14.slug, story14);
  stories.set(story22.slug, story22);
  stories.set(story23.slug, story23);
  stories.set(story24.slug, story24);
  stories.set(story25.slug, story25);
  stories.set(story26.slug, story26);

  const story15: APIStory = {
    id: 'satluj-ban',
    slug: 'satluj-ban',
    relatedTopicIds: ['policy'],
    relatedEntityIds: ['india'],
    headline: 'The Satluj Files: Censored, Released, Removed — The 48-Hour Life of India\'s Most Controversial Film',
    summary: 'Diljit Dosanjh\'s biopic of human rights activist Jaswant Singh Khalra survived 127 CBFC cuts, three title changes, and a pulled TIFF premiere — only to be taken down by ZEE5 within 48 hours of release. An investigation into India\'s censorship machinery and the story it tried to bury.',
    heroImage: '/images/stories/satluj-ban.jpg',
    publishedAt: '2026-07-08T06:00:00Z',
    updatedAt: '2026-07-08T06:00:00Z',
    readingTime: 15,
    wordCount: 5200,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 91,
    category: 'policy',
    tags: ['Satluj', 'Diljit Dosanjh', 'Jaswant Singh Khalra', 'CBFC', 'censorship', 'freedom of speech', 'OTT regulation', 'Punjab militancy', 'human rights'],
    keyPoints: [
      'Satluj was released on ZEE5 on July 3, 2026 and removed within 48 hours after I&B Ministry cited security concerns under IT Rules 2021',
      'The film faced 127 CBFC-demanded cuts, including removing Jaswant Singh Khalra\'s name and renaming "Punjab Police" to just "Police"',
      'The title changed three times: Ghallughara → Punjab \'95 → Satluj, and was pulled from TIFF 2023 after government intervention',
      'Jaswant Singh Khalra documented 25,000 illegal killings and secret cremations by Punjab Police (1984-1994); he was abducted and murdered in 1995',
      'Six police officers were convicted for Khalra\'s murder in 2005; life sentences upheld by Supreme Court in 2011',
      'The CBFC does not regulate OTT — yet the government used IT Rules 2021 to take down the film, exposing a regulatory grey zone',
    ],
    timeline: [
      { date: '1952-11-02', title: 'Jaswant Singh Khalra Born', description: 'Born in Khalra village, Tarn Taran district, Punjab.', source: 'Ensaaf' },
      { date: '1984-06-01', title: 'Operation Blue Star', description: 'Catalyses the Punjab insurgency.', source: 'Government of India' },
      { date: '1995-01-01', title: 'Khalra Publishes Cremation Ground Findings', description: 'Documents 2,000+ unclaimed bodies cremated at municipal grounds (1984-1994).', source: 'Press Conference Records' },
      { date: '1995-09-06', title: 'Khalra Abducted and Murdered', description: 'Taken by Punjab Police, tortured, killed, body disposed in Sutlej river.', source: 'CBI Investigation' },
      { date: '2005-11-18', title: 'Six Policemen Convicted', description: 'Patiala court convicts six police officials for abduction and murder.', source: 'Patiala Sessions Court' },
      { date: '2007-10-16', title: 'Life Sentences Upheld by High Court', description: 'Punjab & Haryana High Court enhances sentences to life imprisonment.', source: 'High Court Judgment' },
      { date: '2011-11-01', title: 'Supreme Court Upholds Convictions', description: 'Prithpal Singh vs State of Punjab — CBI evidence of systematic extrajudicial executions.', source: 'Supreme Court of India' },
      { date: '2022-11-01', title: 'Film Submitted to CBFC', description: 'RSVP Movies submits Punjab \'95 for certification.', source: 'RSVP Movies' },
      { date: '2023-07-04', title: 'CBFC Demands 21 Cuts', description: 'A certificate granted but 21 edits demanded.', source: 'Bombay High Court Filings' },
      { date: '2023-08-01', title: 'Pulled from TIFF 2023', description: 'Withdrawn from Toronto International Film Festival after government intervention.', source: 'Deadline Hollywood' },
      { date: '2024-09-01', title: 'Revision Committee Demands 127 Cuts', description: 'Total cuts escalated to 127, including removing Khalra\'s name.', source: 'Midday Reports' },
      { date: '2026-07-03', title: 'Satluj Released Uncut on ZEE5', description: 'Released quietly without CBFC certification under new title Satluj.', source: 'ZEE5' },
      { date: '2026-07-05', title: 'ZEE5 Removes Satluj', description: 'I&B Ministry notice citing security concerns; film removed within 48 hours.', source: 'ZEE5 Official Statement' },
    ],
    facts: [
      { label: 'CBFC Cuts Demanded', value: '127', source: 'Midday Reports' },
      { label: 'Title Changes', value: '3', source: 'Multiple Reports' },
      { label: 'Runtime on ZEE5', value: '~48 hours', source: 'The Breakdown' },
      { label: 'Documented Illegal Cremations', value: '25,000', source: 'Khalra Investigation' },
      { label: 'Police Officers Convicted', value: '6', source: 'Patiala Sessions Court' },
    ],
    claims: [
      { claim: 'The CBFC has the authority to regulate content on OTT streaming platforms.', source: 'Common Misconception', verification: 'false', explanation: 'The CBFC is a statutory body under the Cinematograph Act, 1952, which only governs films exhibited in theatres. OTT platforms are regulated under Part III of the IT Rules 2021 — a separate framework.', confidence: 0.95 },
      { claim: 'Jaswant Singh Khalra\'s investigation documented 25,000 illegal killings by Punjab Police.', source: 'Khalra Investigation', verification: 'true', explanation: 'Corroborated by CBI investigations and Supreme Court in Prithpal Singh vs State of Punjab (2011).', confidence: 0.91 },
      { claim: 'Satluj was released without any certification process being completed, violating IT Rules.', source: 'I&B Ministry', verification: 'misleading', explanation: 'The film was submitted to CBFC in 2022 but remained in unresolved dispute. OTT platforms are legally separate from CBFC jurisdiction. The IT Rules require age classification — not CBFC pre-clearance.', confidence: 0.84 },
    ],
    sources: [
      { name: 'Prithpal Singh vs State of Punjab — Supreme Court (2011)', url: 'https://main.sci.gov.in', type: 'government', tier: 1 },
      { name: 'CBI Investigation Records — Khalra Case', url: 'https://cbi.gov.in', type: 'government', tier: 1 },
      { name: 'IT Rules 2021 — OTT Code of Ethics', url: 'https://meity.gov.in', type: 'government', tier: 1 },
      { name: 'Ensaaf — Khalra Case Documentation', url: 'https://ensaaf.org', type: 'research', tier: 1 },
      { name: 'Human Rights Watch — Protecting the Killers (2007)', url: 'https://hrw.org', type: 'research', tier: 1 },
    ],
    charts: [
      { type: 'bar', title: 'Major CBFC Censorship Cases (Cuts Demanded)', data: [{ label: 'Satluj', value: 127 }, { label: 'Udta Punjab', value: 89 }, { label: 'Padmavati', value: 26 }], xKey: 'label', yKey: 'value' },
    ],
    faq: [
      { question: 'Who was Jaswant Singh Khalra?', answer: 'A human rights activist who documented 25,000 illegal killings by Punjab Police during the militancy era (1984-1994). He was abducted and murdered by police in 1995. Six officers were convicted.' },
      { question: 'Why did the CBFC demand 127 cuts?', answer: 'The CBFC demanded removal of Khalra\'s name, references to Punjab Police, Indira Gandhi, and the title "Punjab \'95" — despite the story being documented in Supreme Court judgments.' },
      { question: 'Does the CBFC regulate OTT?', answer: 'No. OTT is regulated under IT Rules 2021 — a self-regulatory framework, not CBFC pre-certification.' },
    ],
    relatedStories: [
      { slug: 'ews-quota-upsc-investigation',
    headline: 'Who Really Gets the EWS Quota?', summary: 'Investigation into UPSC EWS selections.', publishedAt: '2026-08-08T06:00:00Z', readingTime: 12, evidenceScore: 94, category: 'policy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story15.slug, story15);

  // ── Story 16: India-US Relations ─────────────────────────────────────

  const story16: APIStory = {
    id: 'india-us-relations',
    slug: 'india-us-relations',
    headline: 'India-US Relations: From Nuclear Deal to Critical Technology Partnership',
    summary: 'The India-US strategic partnership has deepened across defence, technology, trade, and people-to-people ties over the past two decades, driven by shared concerns about China\'s rise and converging geopolitical interests.',
    heroImage: '/images/stories/ews-quota-upsc-investigation.jpg',
    publishedAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
    readingTime: 16,
    wordCount: 5500,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 91,
    category: 'geopolitics',
    tags: ['India-US relations', 'defence partnership', 'iCET', 'QUAD', 'H1B', 'trade', 'Indo-Pacific'],
    relatedTopicIds: ['geopolitics'],
    keyPoints: [
      'India-US bilateral trade crossed $200 billion in 2025, making the US India\'s largest trading partner',
      'Four foundational defence agreements signed since 2016 enable intelligence sharing and military interoperability',
      'The Initiative on Critical and Emerging Technologies (iCET) launched in 2023 covers AI, semiconductors, space, and quantum computing',
      'Indian diaspora in the US has grown to 4.5 million, the highest-skilled immigrant group by income',
      'Persistent tariff disputes and H1B visa restrictions remain key friction points',
    ],
    timeline: [
      { date: '2005-07-18', title: 'Civil Nuclear Deal', description: 'US-India Civil Nuclear Cooperation Agreement announced by PM Manmohan Singh and President George W. Bush, ending India\'s nuclear isolation.', source: 'MEA Archives' },
      { date: '2008-10-08', title: 'NSG Waiver', description: 'Nuclear Suppliers Group grants India a special waiver to engage in civilian nuclear trade despite not signing the NPT.', source: 'NTI' },
      { date: '2016-08-29', title: 'Logistics Agreement Signed', description: 'LEMOA (Logistics Exchange Memorandum of Agreement) signed, allowing mutual access to military bases for supplies.', source: 'US DoD' },
      { date: '2018-09-06', title: 'First 2+2 Dialogue', description: 'First India-US 2+2 Ministerial Dialogue (Defence + External Affairs) held in New Delhi.', source: 'MEA' },
      { date: '2023-01-31', title: 'iCET Launch', description: 'Initiative on Critical and Emerging Technologies launched to co-develop AI, semiconductors, space, and 5G/6G.', source: 'White House' },
      { date: '2025-09-15', title: 'Trade Crosses $200 Billion', description: 'India-US bilateral trade surpasses $200 billion for the first time, with the US becoming India\'s top trading partner.', source: 'US Census Bureau' },
    ],
    facts: [
      { label: 'Bilateral Trade (2025)', value: '$204 billion', source: 'US Census Bureau' },
      { label: 'Defence Agreements Signed', value: '4 (LEMOA, COMCASA, BECA, GSOMIA)', source: 'US DoD' },
      { label: 'Indian-American Population', value: '4.5 million', source: 'US Census 2024' },
      { label: 'US FDI into India (cumulative)', value: '$60 billion+', source: 'DPIIT' },
      { label: 'US Arms Sales to India (2016-26)', value: '$25 billion+', source: 'SIPRI' },
    ],
    claims: [
      { claim: 'The US is India\'s most reliable defence partner, supplying cutting-edge military technology.', source: 'Ministry of Defence', verification: 'true', explanation: 'The US has supplied C-17, C-130, P-8I, Apache, Chinook, and MQ-9B drones. Total defence deals exceed $25 billion since 2016.', confidence: 0.88 },
      { claim: 'India-US trade relations are free of barriers and disputes.', source: 'US Chamber of Commerce', verification: 'misleading', explanation: 'India imposed retaliatory tariffs on $1.4 billion of US goods in 2019. US concerns remain on India\'s data localization, digital services tax, and medical device price caps. WTO disputes on solar cells and shrimp continue.', confidence: 0.75 },
      { claim: 'The H4 EAD rule allows Indian spouses to work freely in the US.', source: 'Community Reports', verification: 'unverifiable', explanation: 'The H4 EAD rule (permitting H1B spouses to work) is under legal challenge and has been subject to proposed revocation under multiple administrations. Its future remains uncertain.', confidence: 0.65 },
    ],
    sources: [
      { name: 'US State Department — US-India Relations Fact Sheet', url: 'https://state.gov/us-india-relations', type: 'government', tier: 1 },
      { name: 'SIPRI Arms Transfers Database', url: 'https://sipri.org/databases/armstransfers', type: 'research', tier: 1 },
      { name: 'US Census Bureau Trade Data', url: 'https://census.gov/foreign-trade', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'India-US Bilateral Trade ($ Billion)', data: [
        { year: '2015', amount: 104 }, { year: '2017', amount: 115 },
        { year: '2019', amount: 146 }, { year: '2021', amount: 152 },
        { year: '2023', amount: 191 }, { year: '2025', amount: 204 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What are the four foundational defence agreements between India and the US?', answer: 'LEMOA (Logistics Exchange, 2016), COMCASA (Communications Compatibility and Security, 2018), BECA (Basic Exchange and Cooperation Agreement for geo-spatial intelligence, 2020), and GSOMIA (General Security of Military Information Agreement, 2002).' },
      { question: 'What is the significance of iCET for India?', answer: 'iCET enables co-production of GE F414 jet engines for Tejas Mk2, collaboration on AI and semiconductors, and joint space missions between ISRO and NASA — a level of technology sharing the US typically reserves for closest allies.' },
    ],
    relatedStories: [
      { slug: 'supply-chain-shift',
    headline: 'The Great Supply Chain Shift', summary: 'India\'s China+1 opportunity in manufacturing.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
      { slug: 'semiconductor-pli', headline: 'India\'s Semiconductor Push', summary: 'PLI scheme analysis.', publishedAt: '2026-07-01T06:00:00Z', readingTime: 14, evidenceScore: 85, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'quad', slug: 'quad', name: 'Quad', type: 'organization', description: 'Quadrilateral Security Dialogue.' },
      { id: 'g20', slug: 'g20', name: 'G20', type: 'organization', description: 'Group of Twenty.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story16.slug, story16);

  // ── Story 17: India-Indonesia Relations ──────────────────────────────

  const story17: APIStory = {
    id: 'india-indonesia-relations',
    slug: 'india-indonesia-relations',
    headline: 'India-Indonesia: How Maritime Neighbours Are Reshaping the Indo-Pacific',
    summary: 'India and Indonesia share 2,000 years of civilisational links and are now deepening a Comprehensive Strategic Partnership focused on maritime security, trade, and countering Chinese influence in Southeast Asia.',
    heroImage: '/images/stories/supply-chain-shift.jpg',
    publishedAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z',
    readingTime: 12,
    wordCount: 4200,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 87,
    category: 'geopolitics',
    tags: ['India-Indonesia', 'maritime security', 'ASEAN', 'Indo-Pacific', 'trade', 'Act East'],
    relatedTopicIds: ['geopolitics'],
    keyPoints: [
      'India and Indonesia upgraded ties to Comprehensive Strategic Partnership during PM Modi\'s Jakarta visit in 2025',
      'Bilateral trade grew to $35 billion in 2025, driven by coal, palm oil, and machinery exports',
      'Joint military exercises (IND-INDO CORPAT, Garuda Shakti) have expanded to all three services',
      'India has offered $1 billion in defence credit and co-production of BrahMos missiles to Indonesia',
      'Indonesia\'s stance on the South China Sea and Myanmar crisis shapes India\'s ASEAN strategy',
    ],
    timeline: [
      { date: '1950-03-03', title: 'Diplomatic Ties Established', description: 'India and Indonesia establish formal diplomatic relations, with India supporting Indonesian independence.', source: 'MEA' },
      { date: '2005-11-01', title: 'Strategic Partnership', description: 'India-Indonesia relations upgraded to Strategic Partnership during PM Manmohan Singh\'s visit.', source: 'MEA' },
      { date: '2018-05-30', title: 'Defence Cooperation Agreement', description: 'Comprehensive defence cooperation agreement signed during PM Modi\'s visit to Jakarta.', source: 'MEA' },
      { date: '2022-07-01', title: 'India-Indonesia Maritime Exercise', description: 'First bilateral maritime exercise IND-INDO CORPAT held in the Indian Ocean.', source: 'Indian Navy' },
      { date: '2025-01-25', title: 'Comprehensive Strategic Partnership', description: 'Ties upgraded to Comprehensive Strategic Partnership; India offers $1 billion defence credit line.', source: 'MEA' },
    ],
    facts: [
      { label: 'Bilateral Trade (2025)', value: '$35 billion', source: 'Ministry of Commerce' },
      { label: 'Indian Diaspora in Indonesia', value: '1,20,000', source: 'MEA' },
      { label: 'Indian Investment in Indonesia', value: '$1.5 billion+', source: 'KBRI Jakarta' },
      { label: 'Joint Military Exercises', value: '6+ per year', source: 'Indian Navy' },
    ],
    claims: [
      { claim: 'India\'s Act East Policy has significantly strengthened ties with Indonesia.', source: 'MEA White Paper', verification: 'true', explanation: 'High-level visits have increased from 2 per year (2010-14) to 8 per year (2020-25). Defence cooperation, maritime patrols, and trade have all grown substantially.', confidence: 0.84 },
      { claim: 'Indonesia is the most important partner for India\'s Indo-Pacific strategy.', source: 'Strategic Analyst', verification: 'unverifiable', explanation: 'While Indonesia is crucial as ASEAN\'s largest economy and a maritime neighbour, India\'s Indo-Pacific strategy also prioritises Japan, Australia, Vietnam, and the US equally.', confidence: 0.70 },
    ],
    sources: [
      { name: 'MEA — India-Indonesia Relations', url: 'https://mea.gov.in/india-indonesia', type: 'government', tier: 1 },
      { name: 'ASEAN Secretariat Reports', url: 'https://asean.org', type: 'international', tier: 2 },
    ],
    charts: [
      { type: 'line', title: 'India-Indonesia Trade ($ Billion)', data: [
        { year: '2015', amount: 16 }, { year: '2017', amount: 18 },
        { year: '2019', amount: 21 }, { year: '2021', amount: 25 },
        { year: '2023', amount: 31 }, { year: '2025', amount: 35 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What is the Sabang port agreement between India and Indonesia?', answer: 'In 2018, India signed an MoU to develop the Sabang deep-sea port in Aceh, Sumatra, giving India a strategic foothold at the mouth of the Malacca Strait — one of the world\'s busiest shipping lanes.' },
      { question: 'How does Indonesia view China\'s Belt and Road Initiative?', answer: 'Indonesia has engaged selectively with BRI (Jakarta-Bandung high-speed railway) but has also sought to balance Chinese influence by deepening maritime cooperation with India, Japan, and the US through ASEAN centrality.' },
    ],
    relatedStories: [
      { slug: 'india-us-relations',
    headline: 'India-US Relations', summary: 'Strategic partnership deepening.', publishedAt: '2026-08-15T10:00:00Z', readingTime: 16, evidenceScore: 91, category: 'geopolitics' },
      { slug: 'india-china-relations', headline: 'India-China Relations', summary: 'Border tensions and rivalry.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
    ],
    relatedEntities: [
      { id: 'bimstec', slug: 'bimstec', name: 'BIMSTEC',image: '/images/entities/bimstec.jpg',  type: 'organization', description: 'Bay of Bengal Initiative.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story17.slug, story17);

  // ── Story 18: India-China Relations ──────────────────────────────────

  const story18: APIStory = {
    id: 'india-china-relations',
    slug: 'india-china-relations',
    headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry',
    summary: 'From the Galwan Valley clash to a widening trade deficit and competition across the Indian Ocean, the India-China relationship has reached its most volatile point since the 1962 war.',
    heroImage: '/images/stories/india-us-relations.jpg',
    publishedAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
    readingTime: 17,
    wordCount: 6000,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 93,
    category: 'geopolitics',
    tags: ['India-China', 'LAC', 'Galwan', 'border dispute', 'trade deficit', 'South China Sea', 'BRI', 'Quad'],
    relatedTopicIds: ['geopolitics'],
    keyPoints: [
      'Since the Galwan Valley clash in June 2020, over 60,000 additional Chinese troops are deployed along the LAC in Eastern Ladakh',
      'India\'s trade deficit with China has ballooned from $53 billion in 2019-20 to $85 billion in 2024-25, making China India\'s largest source of imports',
      'India has banned over 400 Chinese apps since 2020 and tightened FDI rules for neighbouring countries',
      'China\'s Belt and Road projects in Sri Lanka, Pakistan, Nepal, and Maldives are viewed by India as strategic encirclement',
      'Bilateral mechanisms remain frozen at the military commander level; no political summit since 2019',
    ],
    timeline: [
      { date: '1962-10-20', title: 'Sino-Indian War', description: 'China launches a full-scale offensive across the McMahon Line, defeating Indian forces and annexing Aksai Chin. The war shapes bilateral relations for decades.', source: 'Official History' },
      { date: '1988-12-19', title: 'Rajiv Gandhi Visit', description: 'PM Rajiv Gandhi\'s historic visit to Beijing breaks the post-war freeze. Joint Working Group on border dispute established.', source: 'MEA' },
      { date: '2013-04-15', title: 'Depsang Standoff', description: 'Chinese troops penetrate 19 km into Indian territory in the Depsang Valley, beginning a pattern of aggressive PLA patrolling.', source: 'Indian Army' },
      { date: '2017-06-16', title: 'Doklam Standoff', description: 'Chinese and Indian troops face off for 73 days in Doklam over Chinese road construction in Bhutan-India tri-junction.', source: 'MEA' },
      { date: '2020-06-15', title: 'Galwan Valley Clash', description: 'Deadliest India-China military clash in 45 years — 20 Indian and at least 45 Chinese soldiers killed in hand-to-hand combat in the Galwan Valley.', source: 'Indian Army' },
      { date: '2025-10-01', title: 'Disengagement Progress', description: 'India and China complete disengagement at Depsang and Demchok after 4 years of negotiations, but large PLA troop presence persists.', source: 'MEA Statements' },
    ],
    facts: [
      { label: 'Trade Deficit with China (2024-25)', value: '$85 billion', source: 'Ministry of Commerce' },
      { label: 'Chinese Troops on LAC (2020 vs 2026)', value: '50,000 → 1,20,000', source: 'Indian Army Intelligence' },
      { label: 'Chinese FDI Rejected Since 2020', value: '$50 billion+', source: 'DPIIT' },
      { label: 'Indian Students in China', value: '23,000 (down from 2 lakh)', source: 'MEA' },
      { label: 'Bilateral Summit Since 2019', value: 'None', source: 'MEA' },
    ],
    claims: [
      { claim: 'India\'s ban on Chinese apps has permanently reduced Chinese digital influence in India.', source: 'Government of India', verification: 'true', explanation: 'TikTok, UC Browser, and 400+ banned apps lost access to 1.2 billion users. Chinese app market share in India fell from 43% (2019) to under 5% (2025). However, Chinese hardware brands (Xiaomi, Vivo, Oppo) still dominate Indian smartphone market.', confidence: 0.82 },
      { claim: 'China\'s Belt and Road Initiative is purely an economic development programme.', source: 'Chinese Foreign Ministry', verification: 'misleading', explanation: 'BRI projects in Hambantota (Sri Lanka), CPEC (Pakistan), and Gwadar are structured with debt traps, strategic port access, and military applications. Sri Lanka\'s Hambantota port was leased to China for 99 years after failing to repay BRI loans.', confidence: 0.91 },
      { claim: 'PLA troop levels along the LAC have returned to pre-2020 levels after disengagement.', source: 'PLA Spokesperson', verification: 'false', explanation: 'Satellite imagery confirms 60,000-70,000 additional Chinese troops remain permanently stationed in depth along the LAC, with new infrastructure including hardened bunkers, helipads, and logistics depots built since 2020.', confidence: 0.93 },
    ],
    sources: [
      { name: 'Indian Army Western Command Situation Reports', url: 'https://indianarmy.nic.in', type: 'government', tier: 1 },
      { name: 'IPCS — India-China Border Studies', url: 'https://ipcs.org', type: 'research', tier: 2 },
      { name: 'SIPRI — China-India Military Balance', url: 'https://sipri.org', type: 'research', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'India-China Trade Deficit ($ Billion)', data: [
        { year: '2016-17', amount: 51 }, { year: '2017-18', amount: 57 },
        { year: '2018-19', amount: 53 }, { year: '2019-20', amount: 52 },
        { year: '2020-21', amount: 44 }, { year: '2021-22', amount: 69 },
        { year: '2022-23', amount: 76 }, { year: '2023-24', amount: 80 },
        { year: '2024-25', amount: 85 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What is the Line of Actual Control (LAC)?', answer: 'The LAC is the de facto border between India and China, spanning 3,488 km from Ladakh to Arunachal Pradesh. It is not a legally demarcated boundary and is divided into three sectors: Western (Ladakh), Middle (Uttarakhand-Himachal), and Eastern (Arunachal Pradesh-Sikkim).' },
      { question: 'Why has India rejected China\'s proposal for a complete troop disengagement?', answer: 'India insists that disengagement must be followed by de-escalation and restoration of the status quo ante as of April 2020. China\'s proposals would legitimise its new forward deployments and infrastructure built since the Galwan clash, which India considers unacceptable.' },
    ],
    relatedStories: [
      { slug: 'india-us-relations',
    headline: 'India-US Relations', summary: 'Strategic partnership deepening.', publishedAt: '2026-08-15T10:00:00Z', readingTime: 16, evidenceScore: 91, category: 'geopolitics' },
      { slug: 'india-russia-relations', headline: 'India-Russia Relations', summary: 'Enduring defence partnership.', publishedAt: '2026-08-25T10:00:00Z', readingTime: 14, evidenceScore: 90, category: 'geopolitics' },
      { slug: 'supply-chain-shift', headline: 'The Great Supply Chain Shift', summary: 'China+1 opportunity for India.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'sco', slug: 'sco', name: 'SCO',image: '/images/entities/sco.jpg',  type: 'organization', description: 'Shanghai Cooperation Organisation.' },
      { id: 'brics', slug: 'brics', name: 'BRICS', type: 'organization', description: 'BRICS grouping.' },
      { id: 'quad', slug: 'quad', name: 'Quad', type: 'organization', description: 'Quadrilateral Security Dialogue.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story18.slug, story18);

  // ── Story 19: India-Europe Relations ─────────────────────────────────

  const story19: APIStory = {
    id: 'india-europe-relations',
    slug: 'india-europe-relations',
    headline: 'India and Europe: A Strategic Partnership Searching for Substance',
    summary: 'As the EU seeks to diversify away from China and India looks West for technology and investment, the India-EU strategic partnership is gaining momentum — but trade negotiations, carbon policy, and differing worldviews on Russia remain obstacles.',
    heroImage: '/images/stories/india-us-relations.jpg',
    publishedAt: '2026-08-22T10:00:00Z',
    updatedAt: '2026-08-22T10:00:00Z',
    readingTime: 14,
    wordCount: 4800,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 88,
    category: 'geopolitics',
    tags: ['India-EU', 'FTA', 'CBAM', 'trade', 'technology', 'strategic partnership', 'Russia-Ukraine'],
    relatedTopicIds: ['geopolitics'],
    keyPoints: [
      'India-EU bilateral trade reached $135 billion in 2025, making the EU India\'s second-largest trading partner',
      'Free Trade Agreement negotiations, relaunched in 2022 after a 9-year pause, remain deadlocked over tariffs, data adequacy, and intellectual property',
      'The EU\'s Carbon Border Adjustment Mechanism (CBAM) could cost Indian steel and aluminium exporters $2-4 billion annually if implemented fully',
      'India\'s continued energy imports from Russia post-Ukraine conflict has created friction with several EU member states',
      'The India-Middle East-Europe Corridor (IMEC), announced at the 2023 G20, offers a transformative connectivity alternative to China\'s BRI',
    ],
    timeline: [
      { date: '2004-11-01', title: 'Strategic Partnership', description: 'India and the EU establish a Strategic Partnership during the 5th India-EU Summit in The Hague.', source: 'EEAS' },
      { date: '2007-06-01', title: 'FTA Negotiations Begin', description: 'India-EU Broad-based Trade and Investment Agreement (BTIA) negotiations formally launched.', source: 'European Commission' },
      { date: '2013-06-01', title: 'FTA Talks Suspended', description: 'Negotiations collapse over disagreements on tariffs, data security, and market access for Indian professionals and EU wines and automobiles.', source: 'EC Trade' },
      { date: '2020-07-15', title: 'India-EU Summit Revival', description: 'India-EU Leaders\' Summit held virtually, agreeing to resume FTA negotiations and launch a Connectivity Partnership.', source: 'EEAS' },
      { date: '2022-06-01', title: 'FTA Talks Relaunched', description: 'EU-India FTA negotiations relaunched after 9 years. Trade and Technology Council (TTC) also established.', source: 'European Commission' },
      { date: '2023-09-09', title: 'IMEC Announced', description: 'India-Middle East-Europe Corridor announced at G20 as an alternative connectivity project linking India to Europe via the Middle East.', source: 'PMO India' },
    ],
    facts: [
      { label: 'India-EU Trade (2025)', value: '$135 billion', source: 'European Commission' },
      { label: 'EU FDI into India (cumulative)', value: '$120 billion+', source: 'DPIIT' },
      { label: 'Indian Students in Europe', value: '1.2 lakh+', source: 'UNESCO' },
      { label: 'EU as % of India\'s Exports', value: '16.5%', source: 'DGFT' },
      { label: 'FTA Negotiation Rounds Completed', value: '9 (since 2022 relaunch)', source: 'EC Trade' },
    ],
    claims: [
      { claim: 'The EU\'s CBAM will help India decarbonise its heavy industry.', source: 'European Commission', verification: 'misleading', explanation: 'While CBAM may incentivise cleaner production, it acts as a de facto carbon tariff. Indian steel and aluminium exports face 20-35% additional costs. India has raised concerns at the WTO about CBAM violating common but differentiated responsibilities (CBDR) under the Paris Agreement.', confidence: 0.78 },
      { claim: 'The India-EU FTA will be concluded by 2025.', source: 'European Commission', verification: 'false', explanation: 'As of mid-2026, the FTA remains unratified. Key sticking points persist on EU demands for lower auto and wine tariffs, stricter IP protections (data exclusivity for pharmaceuticals), and India\'s insistence on easier visa access for professionals and data adequacy status.', confidence: 0.85 },
    ],
    sources: [
      { name: 'European External Action Service — India', url: 'https://eeas.europa.eu/india', type: 'international', tier: 1 },
      { name: 'European Commission Trade — EU-India FTA', url: 'https://ec.europa.eu/trade/india', type: 'government', tier: 1 },
      { name: 'CII — India-EU Trade Reports', url: 'https://cii.in', type: 'industry', tier: 2 },
    ],
    charts: [
      { type: 'line', title: 'India-EU Bilateral Trade ($ Billion)', data: [
        { year: '2015', amount: 88 }, { year: '2017', amount: 95 },
        { year: '2019', amount: 105 }, { year: '2021', amount: 98 },
        { year: '2023', amount: 125 }, { year: '2025', amount: 135 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What is the CBAM and how does it affect India?', answer: 'The Carbon Border Adjustment Mechanism is an EU regulation imposing a carbon price on imports of steel, aluminium, cement, fertilisers, electricity, and hydrogen from 2026. India, as the world\'s third-largest steel producer, could face $2-4 billion in annual export cost increases.' },
      { question: 'What is the India-EU Trade and Technology Council (TTC)?', answer: 'The TTC, launched in 2022, is a ministerial-level forum covering strategic technologies (AI, semiconductors, 5G/6G), green energy, and trade. It serves as a platform to align on digital standards, data governance, and supply chain resilience.' },
    ],
    relatedStories: [
      { slug: 'india-uk-relations',
    headline: 'India-UK Relations', summary: 'Colonial ties to strategic partnership.', publishedAt: '2026-08-23T10:00:00Z', readingTime: 13, evidenceScore: 86, category: 'geopolitics' },
      { slug: 'supply-chain-shift', headline: 'The Great Supply Chain Shift', summary: 'India\'s China+1 opportunity.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'imf', slug: 'imf', name: 'IMF',image: '/images/entities/imf.jpg',  type: 'organization', description: 'International Monetary Fund.' },
      { id: 'wto', slug: 'wto', name: 'WTO', type: 'organization', description: 'World Trade Organization.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story19.slug, story19);

  // ── Story 20: India-UK Relations ─────────────────────────────────────

  const story20: APIStory = {
    id: 'india-uk-relations',
    slug: 'india-uk-relations',
    headline: 'India-UK Relations: Beyond Colonial History to a Modern Strategic Partnership',
    summary: 'The India-UK relationship has reinvented itself through a Comprehensive Strategic Partnership, FTA negotiations, and robust diaspora links — but difficult conversations on historical reparations, migration, and trade-offs persist.',
    heroImage: '/images/stories/india-uk-relations.jpg',
    publishedAt: '2026-08-23T10:00:00Z',
    updatedAt: '2026-08-23T10:00:00Z',
    readingTime: 13,
    wordCount: 4500,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 86,
    category: 'geopolitics',
    tags: ['India-UK', 'FTA', 'diaspora', 'Commonwealth', 'defence', 'migration', 'colonial history'],
    relatedTopicIds: ['geopolitics'],
    keyPoints: [
      'India-UK bilateral trade reached $50 billion in 2025, with an FTA aimed at doubling this by 2030',
      'The 2030 Roadmap (2021) elevated ties to a Comprehensive Strategic Partnership covering health, climate, trade, defence, and migration',
      'The UK is the largest G20 investor in India, with cumulative FDI of $35 billion+',
      'The Indian diaspora in the UK numbers 1.8 million — the largest ethnic minority group — including PM Rishi Sunak',
      'FTA negotiations have stalled on UK demands for whisky tariffs, legal services access, and stricter visa rules for Indian students',
    ],
    timeline: [
      { date: '1947-08-15', title: 'Independence', description: 'India gains independence from British rule. The India-Pakistan partition leads to the largest mass migration in history.', source: 'British Library' },
      { date: '1950-01-26', title: 'Republic Within Commonwealth', description: 'India becomes a republic but remains a member of the Commonwealth — the first republic to do so.', source: 'Commonwealth Secretariat' },
      { date: '2004-09-01', title: 'Strategic Partnership', description: 'India-UK relations upgraded to Strategic Partnership with focus on defence, civil nuclear cooperation, and education.', source: 'UK FCDO' },
      { date: '2021-05-04', title: '2030 Roadmap', description: 'India and UK adopt the 2030 Roadmap — a Comprehensive Strategic Partnership with 10-year targets across trade, defence, health, and climate.', source: 'MEA' },
      { date: '2022-01-13', title: 'FTA Negotiations Launch', description: 'India-UK Free Trade Agreement negotiations formally launched with an aim to conclude by Diwali 2022 (missed).', source: 'UK DIT' },
      { date: '2026-03-01', title: 'FTA Round 14', description: '14th round of FTA negotiations concludes with progress on rules of origin and services, but tariffs and migration remain unresolved.', source: 'UK DIT' },
    ],
    facts: [
      { label: 'Bilateral Trade (2025)', value: '$50 billion', source: 'UK DIT' },
      { label: 'UK FDI into India (cumulative)', value: '$35 billion+', source: 'DPIIT' },
      { label: 'Indian Diaspora in UK', value: '1.8 million', source: 'UK Census 2021' },
      { label: 'Indian Students in UK', value: '1,70,000', source: 'UK Home Office' },
      { label: 'FTA Negotiation Rounds', value: '14 (since 2022)', source: 'UK DIT' },
    ],
    claims: [
      { claim: 'The India-UK FTA will be the most comprehensive trade deal India has ever signed with a Western country.', source: 'UK Secretary of State for Trade', verification: 'true', explanation: 'The proposed FTA covers goods, services, investment, digital trade, IPR, and government procurement — broader than India\'s earlier FTAs with ASEAN, Japan, and South Korea.', confidence: 0.80 },
      { claim: 'British colonial rule was beneficial for India\'s economic development.', source: 'Revisionist Historians', verification: 'false', explanation: 'Multiple economic historians (Maddison, Tharoor, Banerjee) estimate that Britain extracted £9.2 trillion (in 2020 values) from India through 200 years of colonial rule. India\'s share of global GDP fell from 23% (1700) to 3% (1947). India\'s per capita income stagnated while Britain\'s grew 10x.', confidence: 0.95 },
    ],
    sources: [
      { name: 'UK FCDO — India-UK Relations', url: 'https://gov.uk/india-uk', type: 'government', tier: 1 },
      { name: 'MEA — India-UK Bilateral Relations', url: 'https://mea.gov.in/india-uk', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'India-UK Bilateral Trade ($ Billion)', data: [
        { year: '2015', amount: 28 }, { year: '2017', amount: 30 },
        { year: '2019', amount: 32 }, { year: '2021', amount: 38 },
        { year: '2023', amount: 45 }, { year: '2025', amount: 50 },
      ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What is the India-UK 2030 Roadmap?', answer: 'Adopted in May 2021, the 2030 Roadmap is a 10-year Comprehensive Strategic Partnership covering five pillars: trade and prosperity, defence and security, climate and health, people-to-people ties, and technology and innovation.' },
      { question: 'Why has the India-UK FTA taken so long?', answer: 'Key sticking points include UK demands for whisky and wine tariff reductions (currently 150%), liberalisation of legal and financial services, stricter data protection standards, and India\'s demand for easier visa access for students and professionals. The UK also seeks commitments on climate provisions.' },
    ],
    relatedStories: [
      { slug: 'india-europe-relations',
    headline: 'India and Europe', summary: 'Strategic partnership with the EU.', publishedAt: '2026-08-22T10:00:00Z', readingTime: 14, evidenceScore: 88, category: 'geopolitics' },
      { slug: 'india-us-relations', headline: 'India-US Relations', summary: 'From nuclear deal to iCET.', publishedAt: '2026-08-15T10:00:00Z', readingTime: 16, evidenceScore: 91, category: 'geopolitics' },
    ],
    relatedEntities: [
      { id: 'commonwealth', slug: 'commonwealth', name: 'Commonwealth of Nations',image: '/images/entities/commonwealth.jpg',  type: 'organization', description: 'Commonwealth of Nations.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story20.slug, story20);

  // ── Story 21: India-Russia Relations ─────────────────────────────────

  const story21: APIStory = {
    id: 'india-russia-relations',
    slug: 'india-russia-relations',
    headline: 'India-Russia: The Enduring Partnership Tested by War and Realignment',
    summary: 'India\'s oldest strategic partnership is navigating the Ukraine war, a dramatic surge in oil imports, Western sanctions pressure, and Russia\'s deepening embrace of China — all while defence dependency keeps the relationship anchored.',
    heroImage: '/images/stories/india-europe-relations.jpg',
    publishedAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-08-25T10:00:00Z',
    readingTime: 14,
    wordCount: 5000,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 90,
    category: 'geopolitics',
    tags: ['India-Russia', 'defence', 'oil imports', 'Ukraine war', 'S-400', 'Kudankulam', 'BRICS', 'SCO'],
    relatedTopicIds: ['geopolitics'],
    keyPoints: [
      'Russia supplied 60-65% of India\'s military equipment historically, though this has declined to ~45% as India diversifies to US, France, and Israel',
      'India\'s oil imports from Russia surged from 2% to 35% of total crude imports after the Ukraine war, saving an estimated $15 billion annually',
      'The S-400 Triumf air defence system deal ($5.4 billion) proceeded despite US CAATSA sanctions threat, demonstrating India\'s strategic autonomy',
      'Bilateral trade reached a record $65 billion in 2025-26, driven overwhelmingly (85%) by Indian oil purchases',
      'Growing Russia-China military axis and delayed defence deliveries are pushing India toward greater diversification',
    ],
    timeline: [
      { date: '1947-08-15', title: 'Early Diplomatic Ties', description: 'India establishes diplomatic relations with the Soviet Union days after independence. USSR supports India on Kashmir at the UN.', source: 'MEA' },
      { date: '1971-08-09', title: 'Indo-Soviet Treaty', description: 'Treaty of Peace, Friendship and Cooperation signed. USSR vetoes UN resolutions on Bangladesh war and provides critical military support.', source: 'MEA' },
      { date: '2000-10-03', title: 'Strategic Partnership', description: 'Declaration on Strategic Partnership signed during President Putin\'s visit to India.', source: 'MEA' },
      { date: '2018-10-05', title: 'S-400 Deal Signed', description: 'India signs $5.4 billion deal for five S-400 Triumf air defence systems, despite US CAATSA sanctions threat.', source: 'MOD' },
      { date: '2022-02-24', title: 'Ukraine War Begins', description: 'Russia invades Ukraine. India abstains from UN resolutions condemning Russia, increases oil imports from 2% to 35% of total crude imports.', source: 'UN General Assembly' },
      { date: '2025-12-01', title: 'Bilateral Trade Record', description: 'India-Russia trade reaches $65 billion, driven primarily by Indian crude oil purchases.', source: 'Ministry of Commerce' },
    ],
    facts: [
      { label: 'Bilateral Trade (2025-26)', value: '$65 billion', source: 'Ministry of Commerce' },
      { label: 'Indian Oil Imports from Russia', value: '35% of total crude', source: 'PPAC' },
      { label: 'Russian Defence Equipment Share', value: '~45% (down from 65%)', source: 'SIPRI 2025' },
      { label: 'Nuclear Reactors (Kudankulam)', value: '6 (2 operational, 4 under construction)', source: 'NPCIL' },
      { label: 'S-400 Systems Delivered', value: '3 of 5 regiments', source: 'MOD' },
    ],
    claims: [
      { claim: 'India\'s oil imports from Russia are not violating Western sanctions.', source: 'Government of India', verification: 'true', explanation: 'India has not breached G7 price cap mechanisms and buys Russian oil at discounted rates ($10-15/barrel below Brent). EU nations including France, Italy, and Spain also continue importing Russian refined products.', confidence: 0.90 },
      { claim: 'Russia remains India\'s most reliable defence partner regardless of the Ukraine war.', source: 'Russian Embassy, New Delhi', verification: 'misleading', explanation: 'While Russia has historically been India\'s primary defence supplier, deliveries of S-400 systems have been delayed, spare parts availability dropped by 40% since 2022, and Russia has prioritised its own military needs. India\'s defence imports from Russia fell to 36% (2020-24) from 62% (2014-18).', confidence: 0.85 },
    ],
    sources: [
      { name: 'MEA — India-Russia Bilateral Relations', url: 'https://mea.gov.in/india-russia', type: 'government', tier: 1 },
      { name: 'SIPRI — India Arms Imports Trend', url: 'https://sipri.org/databases/armstransfers', type: 'research', tier: 1 },
      { name: 'PPAC — Indian Crude Oil Import Data', url: 'https://ppac.gov.in', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'India-Russia Trade ($ Billion)', data: [
        { year: '2016-17', amount: 10 }, { year: '2018-19', amount: 12 },
        { year: '2020-21', amount: 8 }, { year: '2021-22', amount: 14 },
        { year: '2022-23', amount: 49 }, { year: '2023-24', amount: 58 },
        { year: '2024-25', amount: 62 }, { year: '2025-26', amount: 65 },
      ], xKey: 'year', yKey: 'amount' },
      { type: 'bar', title: 'Russia\'s Share of Indian Arms Imports (%)', data: [
        { period: '2009-13', share: 76 }, { period: '2014-18', share: 62 },
        { period: '2019-23', share: 36 },
      ], xKey: 'period', yKey: 'share' },
    ],
    faq: [
      { question: 'How has the Ukraine war affected India-Russia relations?', answer: 'The war created a paradox: India deepened economic ties through massive discounted oil purchases (saving $15 billion annually), but defence deliveries slowed, Russia\'s reliability was questioned, and India accelerated diversification to US, French, and Israeli defence equipment. India\'s neutral diplomatic stance at the UN reflected its balancing act between Western ties and Russian partnership.' },
      { question: 'What is the future of India\'s defence dependency on Russia?', answer: 'India\'s defence dependency on Russia is declining structurally. Indigenous production (Tejas, Arjun, INS Vikrant) and Western partnerships (GE F414 engines, Rafale, MQ-9B drones) are reducing reliance. However, Russia remains critical for nuclear submarines, hypersonic missiles, and S-400 systems where no alternative exists.' },
    ],
    relatedStories: [
      { slug: 'india-china-relations', headline: 'India-China Relations', summary: 'Border tensions and rivalry.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
      { slug: 'india-us-relations', headline: 'India-US Relations', summary: 'Strategic partnership deepening.', publishedAt: '2026-08-15T10:00:00Z', readingTime: 16, evidenceScore: 91, category: 'geopolitics' },
    ],
    relatedEntities: [
      { id: 'brics', slug: 'brics', name: 'BRICS',image: '/images/entities/brics.jpg',  type: 'organization', description: 'BRICS grouping.' },
      { id: 'sco', slug: 'sco', name: 'SCO', type: 'organization', description: 'Shanghai Cooperation Organisation.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story21.slug, story21);

  // ── Story 27: 81 Crore Aadhaar Data Breach ─────────────────────────

  const story27: APIStory = {
    id: '81-crore-data-breach',
    slug: '81-crore-data-breach',
    headline: '81.5 Crore Aadhaar Records Exposed: Inside India\'s Biggest Data Breach',
    heroImage: '/images/stories/aadhaar-sc.jpg',
    summary: 'In October 2023, a threat actor put 815 million Indian citizen records — names, Aadhaar numbers, passport details — up for sale at $80,000. The breach, believed to originate from ICMR\'s COVID-19 testing database, became India\'s largest data leak, testing the country\'s new data protection regime.',
    publishedAt: '2026-07-09T08:00:00Z',
    updatedAt: '2026-07-09T08:00:00Z',
    readingTime: 14,
    wordCount: 4800,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 94,
    category: 'technology',
    tags: ['data breach', 'Aadhaar', 'cybersecurity', 'ICMR', 'data privacy', 'DPDP Act', 'identity theft', 'dark web'],
    keyPoints: [
      '815 million (81.5 crore) Indian citizen records posted for sale on Breach Forums on October 9, 2023',
      'Data includes Aadhaar numbers, passport details, names, phone numbers, and addresses',
      'Suspected source: ICMR\'s COVID-19 testing database collected during the pandemic',
      'Threat actor "pwn0001" offered the dataset for $80,000 — less than $0.0001 per record',
      'US cybersecurity firm Resecurity\'s HUNTER unit discovered and verified the breach',
      'CBI launched investigation; CERT-In and Indian cyber agencies engaged',
      'The breach became the first major test of India\'s DPDP Act 2023',
      'Triggered AEPS (Aadhaar-enabled payment system) fraud and identity theft concerns',
    ],
    timeline: [
      { date: '2020-03-01', title: 'ICMR COVID-19 Testing Database', description: 'ICMR begins aggregating nationwide COVID-19 testing data, collecting Aadhaar and passport details for result delivery.', source: 'ICMR Press Release' },
      { date: '2023-10-09', title: 'Data Posted on Breach Forums', description: 'Threat actor "pwn0001" posts 815 million Indian citizen records for sale at $80,000 on Breach Forums.', source: 'Resecurity' },
      { date: '2023-10-10', title: 'Resecurity HUNTER Discovers Breach', description: 'Resecurity\'s HUNTER threat intelligence unit detects the listing and begins analysis of sample records.', source: 'Resecurity Blog' },
      { date: '2023-10-12', title: 'Sample Records Verified', description: 'Resecurity verifies sample records through the government\'s "Verify Aadhaar" portal, confirming authenticity.', source: 'Resecurity' },
      { date: '2023-10-15', title: 'Indian Authorities Notified', description: 'Resecurity alerts CERT-In and Indian law enforcement agencies about the massive data breach.', source: 'Resecurity' },
      { date: '2023-10-20', title: 'CBI Investigation Launched', description: 'CBI registers a case and begins investigating the breach, focusing on data provenance and responsible parties.', source: 'CBI Statement' },
      { date: '2023-11-01', title: 'DPDP Act Test', description: 'The breach becomes the first major test of the Digital Personal Data Protection Act 2023, passed just two months prior.', source: 'MeitY' },
      { date: '2024-01-15', title: 'AEPS Fraud Reports Surface', description: 'Multiple reports emerge of Aadhaar-enabled Payment System (AEPS) fraud linked to the leaked data.', source: 'RBI Financial Stability Report' },
      { date: '2024-06-01', title: 'Parliamentary Committee Summons', description: 'Parliamentary committee on IT summons MeitY, UIDAI, and ICMR officials for deposition on the breach.', source: 'Parliament Records' },
    ],
    facts: [
      { label: 'Total Records Compromised', value: '81.5 crore (815 million)', source: 'Resecurity' },
      { label: 'Price Asked for Full Dataset', value: '$80,000 (~₹67 lakh)', source: 'Breach Forums' },
      { label: 'Price Per Record', value: '~$0.0001 (< 1 paisa)', source: 'The Breakdown Analysis' },
      { label: 'Threat Actor Alias', value: 'pwn0001', source: 'Resecurity' },
      { label: 'Suspected Data Source', value: 'ICMR COVID-19 Testing Database', source: 'Multiple Reports' },
      { label: 'India\'s DPDP Act Fine Limit', value: '₹250 crore', source: 'DPDP Act 2023' },
    ],
    claims: [
      { claim: 'The data breach originated from ICMR\'s COVID-19 testing database.', source: 'Resecurity & Multiple Media Reports', verification: 'true', explanation: 'Multiple cybersecurity researchers and media investigations traced the data structure and collection methodology to ICMR\'s COVID-19 testing registration system, which collected Aadhaar and passport details for test result delivery.', confidence: 0.82 },
      { claim: 'UIDAI\'s own systems were compromised in the breach.', source: 'Social Media Misinformation', verification: 'false', explanation: 'UIDAI clarified that its own systems were not breached. The Aadhaar numbers were obtained from a third-party database (ICMR) that collected Aadhaar data for COVID-19 testing, not from UIDAI\'s central Aadhaar database.', confidence: 0.95 },
      { claim: 'The DPDP Act 2023 would have prevented this breach had it been in force earlier.', source: 'Policy Advocacy Groups', verification: 'misleading', explanation: 'While the DPDP Act mandates stricter data protection obligations for data fiduciaries, the breach occurred in October 2023, just two months after the Act received presidential assent. Moreover, the Act\'s provisions were notified in phases, and data collection by ICMR occurred during 2020-2022, before the Act existed.', confidence: 0.78 },
      { claim: 'Aadhaar-enabled Payment System (AEPS) fraud directly increased due to this breach.', source: 'RBI Financial Stability Report Dec 2023', verification: 'true', explanation: 'The RBI\'s Financial Stability Report noted a 42% increase in AEPS fraud attempts in the quarters following the breach, with fraudsters using leaked Aadhaar numbers and biometric data to attempt unauthorized transactions.', confidence: 0.85 },
    ],
    sources: [
      { name: 'Resecurity HUNTER Report', url: 'https://www.resecurity.com/blog', type: 'research', tier: 1 },
      { name: 'CBI Investigation Records', url: 'https://cbi.gov.in', type: 'government', tier: 1 },
      { name: 'Digital Personal Data Protection Act 2023', url: 'https://meity.gov.in/dpdp', type: 'government', tier: 1 },
      { name: 'RBI Financial Stability Report', url: 'https://rbi.org.in', type: 'government', tier: 1 },
      { name: 'The Hindu Coverage', url: 'https://thehindu.com', type: 'news', tier: 2 },
    ],
    charts: [
      {
        type: 'bar', title: 'India\'s Largest Data Breaches by Records Compromised (in Crores)', data: [
          { breach: 'ICMR/Aadhaar (2023)', records: 81.5 },
          { breach: 'Telecom Users (2024)', records: 75 },
          { breach: 'Domino\'s India (2021)', records: 18 },
          { breach: 'Covaxin/Cowin (2023)', records: 15 },
          { breach: 'Air India (2021)', records: 4.5 },
          { breach: 'BigBasket (2020)', records: 2 },
          { breach: 'Mobikwik (2021)', records: 3.5 },
          { breach: 'Justdial (2023)', records: 10 },
        ], xKey: 'breach', yKey: 'records' },
      {
        type: 'line', title: 'Estimated Financial Impact of Data Breaches in India (₹ Crore)', data: [
          { year: '2019', impact: 1300 }, { year: '2020', impact: 1800 },
          { year: '2021', impact: 2400 }, { year: '2022', impact: 3200 },
          { year: '2023', impact: 5100 }, { year: '2024', impact: 6800 },
          { year: '2025', impact: 8200 },
        ], xKey: 'year', yKey: 'impact' },
    ],
    faq: [
      { question: 'How did 81.5 crore Indian records get leaked?', answer: 'A threat actor known as "pwn0001" posted the dataset on Breach Forums on October 9, 2023. The data — names, Aadhaar numbers, passport details, phone numbers, addresses — is believed to have been extracted from ICMR\'s COVID-19 testing database, which collected this information for test registration and result delivery during the pandemic.' },
      { question: 'Is my Aadhaar data safe after this breach?', answer: 'If you took a COVID-19 test in India, your data may have been compromised. However, UIDAI\'s central database was not breached. You should monitor your Aadhaar authentication history via the UIDAI portal, enable biometric locking, and be vigilant against phishing attempts using your leaked data.' },
      { question: 'What legal action was taken under the DPDP Act?', answer: 'The breach became the first major test of the recently passed DPDP Act 2023. While the Act provides for fines up to ₹250 crore for data breaches, the incident tested the government\'s enforcement capacity. The Parliamentary Committee on IT summoned MeitY and UIDAI officials, and the CBI launched a criminal investigation.' },
      { question: 'How does this compare to global data breaches?', answer: 'With 815 million records, this is among the largest data breaches in world history, comparable to the 2013 Yahoo breach (3 billion accounts) and the 2019 Collection #1 (2.7 billion records). It is the largest known breach of a government-affiliated database globally.' },
    ],
    relatedTopicIds: ['cybersecurity', 'technology', 'policy'],
    relatedStories: [
      { slug: 'dpdp-bill', headline: 'Digital Personal Data Protection: India\'s Privacy Law Comes of Age', summary: 'India\'s journey toward comprehensive data protection legislation.', publishedAt: '2026-07-05T08:00:00Z', readingTime: 11, evidenceScore: 90, category: 'policy' },
    ],
    relatedEntities: [
      { id: 'icmr', slug: 'icmr', name: 'Indian Council of Medical Research', type: 'organization', description: 'Suspected source of the data breach.' },
      { id: 'uidai', slug: 'uidai', name: 'Unique Identification Authority of India', type: 'organization', description: 'Aadhaar issuing authority.' },
      { id: 'cert-in', slug: 'cert-in', name: 'Indian Computer Emergency Response Team', type: 'organization', description: 'Incident response agency.' },
      { id: 'resecurity', slug: 'resecurity', name: 'Resecurity Inc.', type: 'organization', description: 'Cybersecurity firm that discovered the breach.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story27.slug, story27);

  // ── Story 28: BJP Mission 360 ──────────────────────────────────────

  const story28: APIStory = {
    id: 'bjp-mission-360',
    slug: 'bjp-mission-360',
    headline: 'Mission 360: Inside BJP\'s Push for a Two-Thirds Majority and the Battle Over India\'s Constitutional Future',
    heroImage: 'https://placehold.co/1200x630/151515/D4A843?text=Mission+360+BJP+Two-Thirds+Majority',
    summary: 'After the shock defeat of the delimitation-cum-women\'s reservation bill on April 17, 2026, the BJP launched a high-stakes strategy to secure 360+ Lok Sabha seats — enough for a two-thirds majority — by engineering defections, targeting regional parties, and leveraging its historic Bengal win. The outcome will determine whether the government can reshape India\'s electoral map through constitutional reform.',
    publishedAt: '2026-07-10T08:00:00Z',
    updatedAt: '2026-07-10T08:00:00Z',
    readingTime: 16,
    wordCount: 5600,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 93,
    category: 'politics',
    tags: ['Mission 360', 'BJP', 'delimitation', 'women reservation', 'One Nation One Election', 'constitutional amendment', 'NDA', 'Lok Sabha', 'West Bengal', 'TMC', 'Suvendu Adhikari'],
    keyPoints: [
      'BJP\'s Mission 360 aims to secure a two-thirds Lok Sabha majority to pass constitutional amendments on delimitation, women\'s reservation, and One Nation One Election',
      'The Constitution (131st Amendment) Bill was defeated on April 17, 2026 — 298 for, 230 against, 54 short of the required 352 votes',
      'NDA strength rose from 298 to 319 after 20 TMC MPs defected to NCPI and 6 Shiv Sena (UBT) MPs switched to the Shinde camp',
      'BJP now needs 41 more MPs and is targeting SP (37), DMK (22), NCP-Sharad (8), and remaining TMC MPs',
      'The West Bengal election landslide (BJP 206, TMC 81) in May 2026 provided political momentum and triggered defections',
      'Suvendu Adhikari became Bengal\'s first BJP CM after defeating Mamata Banerjee in Bhabanipur by 15,105 votes',
      'Two strategies: recruit 41 MPs through defections, OR reduce effective House strength by securing opposition absenteeism during voting',
      'Congress alleges the real goal is to end reservations; Jairam Ramesh called it "todh-phod ki rajniti"',
    ],
    timeline: [
      { date: '2023-09-19', title: 'Nari Shakti Vandan Adhiniyam Passed', description: 'Parliament passes 106th Constitutional Amendment reserving 33% of Lok Sabha and Assembly seats for women, tied to future delimitation.', source: 'PRS Legislative' },
      { date: '2024-06-04', title: 'Modi 3.0 Takes Office', description: 'BJP returns with 240 seats, NDA at 293 — first time Modi government without single-party majority. Two-thirds majority out of reach.', source: 'Election Commission' },
      { date: '2025-11-23', title: 'BJP Sweeps Bihar', description: 'NDA wins Bihar assembly elections in a landslide, giving Amit Shah the "Bihar model" template for Bengal.', source: 'Election Commission' },
      { date: '2025-12-05', title: 'Amit Shah\'s Operation Bengal', description: 'Shah announces "Mission 2026" for West Bengal, plans to spend maximum days in Bengal from a house in Salt Lake.', source: 'ETV Bharat' },
      { date: '2026-03-12', title: 'BJP Finalises Bengal Strategy', description: 'PM Modi and Amit Shah chair key meeting to finalise candidates and strategy for Bengal and Kerala assembly polls.', source: 'India Today' },
      { date: '2026-04-16', title: 'Delimitation Bills Introduced', description: 'Government introduces Constitution (131st Amendment) Bill, Delimitation Bill, and UT Laws Bill in Lok Sabha — proposing to increase Lok Sabha to 850 seats.', source: 'PRS Legislative' },
      { date: '2026-04-17', title: 'Bill Defeated in Lok Sabha', description: 'In a major setback, the Bill gets 298 votes for and 230 against — 54 short of the 352 required for a two-thirds majority. Opposition unites.', source: 'Lok Sabha Records' },
      { date: '2026-04-18', title: 'DMK\'s Stalin Claims Victory', description: 'Tamil Nadu CM MK Stalin declares the defeat "a fire that scorched Delhi\'s arrogance." Southern states opposed delimitation fearing seat loss.', source: 'Economic Times' },
      { date: '2026-04-28', title: 'BJP\'s 4-Pronged Bengal Strategy', description: 'BJP deploys strategy focused on demographic change, corruption, Hindu identity, and women\'s safety for Bengal polls.', source: 'OpIndia' },
      { date: '2026-05-04', title: 'BJP Wins Bengal With 206 Seats', description: 'BJP wins 206/294 seats in West Bengal, ending TMC\'s 15-year rule. Suvendu Adhikari defeats Mamata Banerjee in Bhabanipur by 15,105 votes.', source: 'Election Commission' },
      { date: '2026-05-09', title: 'Suvendu Adhikari Sworn In', description: 'Adhikari takes oath as West Bengal\'s first BJP chief minister in a ceremony featuring Bengali cultural motifs.', source: 'Economic Times' },
      { date: '2026-06-01', title: 'Centre Plans Revival of Bills', description: 'Home Ministry drafts revised delimitation legislation aimed at passing in the Monsoon Session, buoyed by Bengal victory.', source: 'Indian Express' },
      { date: '2026-06-24', title: 'Congress Alleges Conspiracy', description: 'Jairam Ramesh accuses BJP of chasing two-thirds majority to amend the Constitution and end reservations.', source: 'India Today' },
      { date: '2026-07-02', title: 'Mission 360 Revealed', description: 'BJP leadership intensifies Mission 360 strategy. NDA strength reaches 319 after 20 TMC MPs defect to NCPI, 6 Shiv Sena (UBT) MPs switch.', source: 'Bhaskar English' },
    ],
    facts: [
      { label: 'Votes Needed for Two-Thirds Majority (Apr 17)', value: '352 of 528 present', source: 'Lok Sabha' },
      { label: 'Votes Actually Received', value: '298 for, 230 against', source: 'Lok Sabha' },
      { label: 'NDA Strength After Bengal Defections', value: '319 MPs', source: 'Multiple Reports' },
      { label: 'Additional MPs Needed', value: '41', source: 'The Breakdown Analysis' },
      { label: 'BJP Seats in West Bengal (2026)', value: '206 out of 294', source: 'Election Commission' },
      { label: 'TMC Seats in West Bengal (2026)', value: '81 out of 294', source: 'Election Commission' },
      { label: 'Highest Voter Turnout in Bengal History', value: '92.47%', source: 'Election Commission' },
      { label: 'Proposed Lok Sabha Size After Delimitation', value: '850 seats', source: 'PRS Legislative' },
    ],
    claims: [
      { claim: 'The delimitation bill would have reduced southern states\' parliamentary representation.', source: 'Tamil Nadu CM MK Stalin', verification: 'true', explanation: 'Based on the 2011 census, southern states with better population control would see their share of Lok Sabha seats decline relative to northern states. Tamil Nadu\'s share would drop from 39 to approximately 31 seats if total seats increased to 850 proportionally.', confidence: 0.88 },
      { claim: 'The BJP\'s real goal in pursuing a two-thirds majority is to end reservation for SCs, STs, and OBCs.', source: 'Congress Leader Jairam Ramesh', verification: 'misleading', explanation: 'While BJP leaders like Anantkumar Hegde have spoken about "changing the Constitution to save Hinduism," the party\'s official manifesto and public statements do not call for ending reservations. The party\'s stated goal is to pass women\'s reservation, delimitation, One Nation One Election, and judicial reforms — all requiring constitutional amendments.', confidence: 0.65 },
      { claim: 'The 20 TMC MPs who joined NCPI have legally merged with the NDA through a legitimate party merger.', source: 'BJP Spokesperson', verification: 'true', explanation: 'The TMC MPs joined the Nationalist Citizens Party of India (NCPI), a Tripura-based registered unrecognised party, and then merged with the NDA. Under the anti-defection law, a merger of two-thirds of a party\'s MPs with another party is legal. The 20 MPs represent more than two-thirds of TMC\'s 29 Lok Sabha MPs.', confidence: 0.82 },
      { claim: 'The opposition united against the bill solely because of the delimitation clause, not women\'s reservation.', source: 'Opposition Leaders', verification: 'true', explanation: 'Multiple opposition leaders including Rahul Gandhi, MK Stalin, and Jairam Ramesh stated they support women\'s reservation but oppose the linkage to delimitation based on the 2011 census. Congress demanded implementing women\'s reservation on the existing 543 seats first.', confidence: 0.85 },
    ],
    sources: [
      { name: 'PRS Legislative — Constitution (131st Amendment) Bill', url: 'https://prsindia.org/billtrack/the-constitution-131st-amendment-bill-2026', type: 'research', tier: 1 },
      { name: 'Bhaskar English — Mission 360 Report', url: 'https://www.bhaskarenglish.in/national/news/bjp-mission-360-two-thirds-majority-constitutional-reforms-138340238.html', type: 'news', tier: 2 },
      { name: 'ABP News — Delimitation Bill Defeat', url: 'https://news.abplive.com/news/india/big-setback-for-govt-delimitation-bill-falls-in-lok-sabha-despite-nda-s-298-votes-1837138', type: 'news', tier: 2 },
      { name: 'Election Commission of India — 2026 Results', url: 'https://eci.gov.in', type: 'government', tier: 1 },
      { name: 'India Today — Congress Allegations', url: 'https://www.indiatoday.in/india/story/congress-bjp-two-thirds-majority-end-reservation-delimitation-constitution-amendment-jairam-ramesh-2933217-2026-06-24', type: 'news', tier: 2 },
    ],
    charts: [
      {
        type: 'bar', title: 'Lok Sabha Vote on Delimitation Bill (April 17, 2026)', data: [
          { category: 'For (NDA)', votes: 298 },
          { category: 'Against (Opposition)', votes: 230 },
          { category: 'Required (Two-Thirds)', votes: 352 },
        ], xKey: 'category', yKey: 'votes' },
      {
        type: 'bar', title: 'West Bengal Assembly Results (2026)', data: [
          { party: 'BJP', seats: 206 },
          { party: 'TMC', seats: 81 },
          { party: 'Congress', seats: 2 },
          { party: 'CPI(M)', seats: 1 },
          { party: 'Others', seats: 4 },
        ], xKey: 'party', yKey: 'seats' },
    ],
    faq: [
      { question: 'What is Mission 360?', answer: 'Mission 360 is the BJP\'s strategy to secure a two-thirds majority (360+ seats) in the Lok Sabha, enabling it to pass constitutional amendments without opposition support. The strategy involves engineering defections from opposition parties and leveraging the NDA\'s recent electoral momentum after winning West Bengal.' },
      { question: 'Why does the BJP need a two-thirds majority?', answer: 'Constitutional amendments require a two-thirds majority of members present and voting in each House of Parliament. The BJP\'s legislative agenda — delimitation (redrawing constituencies), implementing women\'s reservation, One Nation One Election, and judicial reforms — all require constitutional amendments that cannot pass without opposition support.' },
      { question: 'What is delimitation and why is it controversial?', answer: 'Delimitation is the redrawing of constituency boundaries based on population. The 1971 census freeze expires after 2026. Southern states oppose delimitation based on the 2011 census because their better population control would reduce their seat share relative to northern states. The government proposes increasing Lok Sabha from 543 to 850 seats to accommodate population growth without reducing absolute seats of any state.' },
      { question: 'How did the TMC MPs defect to the NDA?', answer: 'Twenty Trinamool Congress Lok Sabha MPs joined the Nationalist Citizens Party of India (NCPI), a Tripura-based registered unrecognised party. This move bypasses anti-defection hurdles because a merger of two-thirds of a party\'s MPs with another party is legally valid. The NCPI then aligned with the NDA, effectively boosting the ruling coalition\'s strength by 20 seats.' },
      { question: 'What happens if the government reaches 360 seats?', answer: 'If the NDA reaches a two-thirds majority, it could pass the Constitution (131st Amendment) Bill to increase Lok Sabha to 850 seats based on the 2011 census, implement women\'s reservation from the 2029 elections, advance the One Nation One Election framework, and pursue judicial reforms including a unified pension code and appointment commission.' },
    ],
    relatedTopicIds: ['policy'],
    relatedStories: [
      { slug: '81-crore-data-breach',
    headline: '81.5 Crore Aadhaar Records Exposed', summary: 'Inside India\'s biggest data breach.', publishedAt: '2026-07-09T08:00:00Z', readingTime: 14, evidenceScore: 94, category: 'technology' },
      { slug: 'india-china-border-tensions', headline: 'India-China at the Crossroads', summary: 'Border flashpoint and strategic rivalry.', publishedAt: '2026-07-30T06:00:00Z', readingTime: 17, evidenceScore: 92, category: 'politics' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story28.slug, story28);

  // ── Story 29: India 5G Rollout ─────────────────────────────────────

  const story29: APIStory = {
    id: 'india-5g-rollout',
    slug: 'india-5g-rollout',
    headline: "India's 5G Revolution: 400 Million Subscribers and Still Waiting for the Killer App",
    heroImage: '/images/stories/81-crore-data-breach.jpg',
    summary: 'India crossed 40 crore 5G subscribers in mid-2026 — the fastest 5G rollout by volume globally — but enterprise adoption remains tepid, average revenue per user is stagnant at sub-₹200, only 40% of towers are fiberized, and the industry awaits the breakthrough application that will justify the ₹5 lakh crore capital expenditure.',
    publishedAt: '2026-08-12T06:00:00Z',
    updatedAt: '2026-08-12T06:00:00Z',
    readingTime: 12,
    wordCount: 4100,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 89,
    category: 'technology',
    tags: ['5G', 'telecom', 'Jio', 'Airtel', 'spectrum', 'digital India', 'broadband'],
    keyPoints: [
      'India crossed 40 crore (400 million) 5G subscribers by mid-2026, the fastest 5G rollout by volume globally, achieving in 3.5 years what took China 5 years',
      'Average 5G download speed measured at 280 Mbps (Ookla), but average revenue per user remains below ₹200/month — the classic "more data, same revenue" trap',
      'Only 40% of India\'s 7.5 lakh telecom towers are fiberized, severely limiting 5G\'s low-latency and network slicing capabilities',
      'Cumulative 5G capex projected to cross ₹5 lakh crore by 2028; total spectrum auction proceeds have already reached ₹4.3 lakh crore',
      'Enterprise 5G use cases in manufacturing, healthcare, and smart cities remain largely pilot-stage — the transformative "killer app" has not materialised',
    ],
    timeline: [
      { date: '2021-03-01', title: '2021 Spectrum Auctions Conclude', description: 'DoT conducts India\'s largest-ever spectrum auction, raising ₹4.3 lakh crore. Jio and Airtel acquire substantial 700 MHz, 3.5 GHz, and 26 GHz spectrum.', source: 'DoT Press Release' },
      { date: '2021-08-15', title: 'Spectrum Allocation Completed', description: 'DoT completes allocation of 5G spectrum to winning bidders — Jio, Airtel, Vi, and Adani Data Networks — across 22 circles.', source: 'DoT' },
      { date: '2022-10-01', title: '5G Services Launched in 13 Cities', description: 'PM Modi launches 5G services at India Mobile Congress 2022, starting with Delhi, Mumbai, Chennai, Kolkata, Bengaluru, and 8 other cities.', source: 'PIB' },
      { date: '2023-12-01', title: '125 Million Users Milestone', description: 'India crosses 12.5 crore 5G subscribers within 14 months of launch — the fastest adoption of any generation of mobile technology in the country.', source: 'TRAI Subscription Report' },
      { date: '2024-06-01', title: 'Airtel-Jio Coverage Race Peaks', description: 'Jio and Airtel expand 5G to over 5,000 cities each, covering 85% of urban India. Jio claims True 5G (SA-ready), Airtel relies on NSA mode.', source: 'Company Statements' },
      { date: '2025-06-01', title: '300 Million Subscribers Landmark', description: 'India reaches 30 crore 5G subscribers, becoming the second-largest 5G market globally after China, which crossed 90 crore in the same period.', source: 'TRAI' },
      { date: '2026-06-01', title: '400 Million Subscribers Crossed', description: 'India\'s 5G subscriber base crosses 40 crore. But enterprise 5G contributes less than 5% of operator revenue, and the "killer app" remains elusive.', source: 'TRAI' },
    ],
    facts: [
      { label: 'Total 5G Subscribers (Mid-2026)', value: '40 crore (400 million)', source: 'TRAI' },
      { label: 'Average 5G Download Speed (India)', value: '280 Mbps', source: 'Ookla Speedtest Global Index 2026' },
      { label: 'Fiberized Telecom Towers', value: '40%', source: 'DoT Annual Report 2025-26' },
      { label: 'Cumulative 5G Capex (Projected by 2028)', value: '₹5 lakh crore', source: 'Nokia-Ericsson India Report' },
      { label: 'Total Spectrum Auction Proceeds', value: '₹4.3 lakh crore', source: 'DoT Spectrum Auction Data' },
    ],
    claims: [
      { claim: 'India is the world\'s largest mobile data consumer, with average monthly smartphone data usage exceeding 25 GB.', source: 'Nokia MBiT Report 2026', verification: 'true', explanation: 'Nokia\'s annual MBiT report confirms India\'s average smartphone data consumption at 25.6 GB/month — the highest globally — driven by affordable 5G data plans priced at approximately ₹15/GB, among the cheapest in the world.', confidence: 0.92 },
      { claim: '5G services achieved nationwide coverage across India by late 2025.', source: 'Telecom Industry Association Briefing', verification: 'misleading', explanation: 'While 5G covers over 85% of urban India, rural coverage remains at approximately 35%. Total geographical 5G coverage is below 50%. Only 40% of towers are fiberized, and significant rural coverage gaps persist across Bihar, UP East, and Northeast circles.', confidence: 0.78 },
      { claim: 'Enterprise 5G use cases in India remain in early pilot stages with minimal revenue contribution for telecom operators.', source: 'CRISIL Telecom Sector Report 2026', verification: 'true', explanation: 'Enterprise 5G accounts for less than 5% of telecom operators\' revenue as of mid-2026. Deployments in smart manufacturing, remote surgery, and precision agriculture remain pilot-stage with limited commercial scale.', confidence: 0.85 },
      { claim: 'India has deployed a full standalone (SA) 5G core network, enabling ultra-low latency applications nationwide.', source: 'Social Media and Tech Forums', verification: 'false', explanation: 'Both Jio and Airtel have deployed 5G in Non-Standalone (NSA) mode, relying on existing 4G evolved packet cores. Standalone 5G core deployment with network slicing and sub-10ms latency remains in trial phases. True SA 5G is at least 12-18 months away from commercial deployment.', confidence: 0.88 },
    ],
    sources: [
      { name: 'TRAI Telecom Subscription Reports', url: 'https://trai.gov.in', type: 'government', tier: 1 },
      { name: 'Department of Telecommunications Annual Report 2025-26', url: 'https://dot.gov.in', type: 'government', tier: 1 },
      { name: 'Ookla Speedtest Global Index — India', url: 'https://speedtest.net/global-index/india', type: 'research', tier: 2 },
      { name: 'Nokia MBiT Report 2026', url: 'https://nokia.com/networks/mbit', type: 'research', tier: 2 },
      { name: 'CRISIL Telecom Sector Annual Review 2026', url: 'https://crisil.com', type: 'research', tier: 2 },
    ],
    charts: [
      {
        type: 'line', title: 'India 5G Subscriber Growth (Crore)', data: [
          { period: 'Dec 2022', subscribers: 0.1 },
          { period: 'Jun 2023', subscribers: 5 },
          { period: 'Dec 2023', subscribers: 12.5 },
          { period: 'Jun 2024', subscribers: 20 },
          { period: 'Dec 2024', subscribers: 26 },
          { period: 'Jun 2025', subscribers: 30 },
          { period: 'Dec 2025', subscribers: 35 },
          { period: 'Jun 2026', subscribers: 40 },
        ], xKey: 'period', yKey: 'subscribers' },
      {
        type: 'bar', title: 'Average 5G Download Speed by Country (Mbps)', data: [
          { country: 'South Korea', speed: 520 },
          { country: 'UAE', speed: 380 },
          { country: 'China', speed: 350 },
          { country: 'India', speed: 280 },
          { country: 'Global Avg', speed: 260 },
          { country: 'US', speed: 220 },
          { country: 'UK', speed: 200 },
        ], xKey: 'country', yKey: 'speed' },
    ],
    faq: [
      { question: 'How much faster is 5G compared to 4G in India?', answer: 'Average 5G speeds in India are approximately 280 Mbps, roughly 8-10 times faster than average 4G speeds of 25-30 Mbps. However, real-world experience varies significantly based on location, network congestion, distance from tower, and device compatibility. In dense urban areas, 5G can exceed 500 Mbps, while in suburban areas speeds often drop to 50-100 Mbps.' },
      { question: 'Why were India\'s 5G spectrum auctions so expensive?', answer: 'India\'s 5G spectrum auction raised ₹4.3 lakh crore due to three factors: high reserve prices set by the DoT (among the highest globally), intense competition between Jio and Airtel for the premium 3.5 GHz and 26 GHz bands, and the large volume of spectrum put up for auction — 72,097 MHz across multiple bands. The high auction cost has contributed to the industry\'s ₹5 lakh crore cumulative capex burden and delayed returns on investment.' },
      { question: 'What is the "killer app" for 5G and why hasn\'t it emerged in India?', answer: 'The "killer app" refers to a use case that drives mass adoption of 5G beyond faster smartphone broadband — such as industrial automation, precision agriculture, connected healthcare, or autonomous mobility. It has not emerged in India because: (1) full standalone 5G core with network slicing is 12-18 months away, (2) only 40% of towers are fiberized, limiting backhaul capacity, (3) enterprise ecosystems and IoT device ecosystems remain underdeveloped, and (4) the Indian enterprise market for 5G solutions is still nascent outside telecom and IT services.' },
    ],
    relatedTopicIds: ['technology', 'digital-payments', 'infrastructure'],
    relatedEntityIds: ['india', 'rbi'],
    relatedStories: [
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution', summary: 'How UPI transformed rural financial inclusion and the digital payments landscape.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
      { slug: 'semiconductor-pli', headline: 'India\'s ₹1.2 Lakh Crore Semiconductor Push: Can the Dream Take Silicon?', summary: 'Analysis of India\'s semiconductor PLI scheme and manufacturing ecosystem.', publishedAt: '2026-07-01T06:00:00Z', readingTime: 14, evidenceScore: 85, category: 'technology' },
      { slug: 'supply-chain-shift',
    headline: 'The Great Supply Chain Shift: Can India Capture the China+1 Opportunity?', summary: 'India\'s manufacturing opportunity amid global supply chain diversification.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India — the world\'s second-largest telecommunications market.' },
      { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization', description: 'India\'s central bank, regulates telecom payment systems and spectrum payment terms for telecom operators.' },
    ],
  };

  stories.set(story29.slug, story29);

  // ── Story 30: India's EV Paradox ──────────────────────────────────

  const story30: APIStory = {
    id: 'india-ev-paradox',
    slug: 'india-ev-paradox',
    headline: 'India\'s EV Paradox: Rising Sales, Stalled Charging, and the \u20B94 Lakh Crore Battery Import Bill',
    heroImage: '/images/stories/supply-chain-shift.jpg',
    summary: 'EV sales have grown 4x in three years, but India\'s public charging network stands at only 26% of the official target. Meanwhile, the country\'s battery import bill is projected to hit \u20B94 lakh crore by 2030 — creating a strategic vulnerability as deep as the oil dependency EVs were meant to solve.',
    publishedAt: '2026-08-15T06:00:00Z',
    updatedAt: '2026-08-15T06:00:00Z',
    readingTime: 14,
    wordCount: 4900,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 88,
    category: 'environment',
    tags: ['EV', 'electric vehicles', 'FAME', 'batteries', 'charging infrastructure', 'PLI', 'sustainable transport', 'lithium-ion', 'import dependency'],
    keyPoints: [
      'EV sales in India grew 4x in three years from 4.2 lakh units in 2021-22 to an estimated 38.4 lakh units in 2025-26',
      'Only 12,000 public charging stations operational against the FAME-II target of 46,000 — a gap of 74%',
      'India imports 85% of lithium-ion battery cells, with cumulative import bill projected at \u20B94 lakh crore by 2030',
      'PLI ACC Battery Scheme offers \u20B918,100 crore in incentives but domestic cell manufacturing capacity stands at just 10 GWh vs projected demand of 80 GWh',
      'Total cost of ownership parity between EVs and ICE vehicles remains 3-5 years away without subsidy support',
    ],
    timeline: [
      { date: '2013-01-01', title: 'NEMMP Launched', description: 'National Electric Mobility Mission Plan 2020 launched targeting 6-7 million EV sales by 2020, with a \u20B923,000 crore investment roadmap.', source: 'DHI' },
      { date: '2015-04-01', title: 'FAME India Scheme Phase I', description: 'Faster Adoption and Manufacturing of (Hybrid &) Electric Vehicles scheme launched with \u20B9895 crore outlay for demand incentives, pilot projects, and charging infrastructure.', source: 'MoHI' },
      { date: '2019-04-01', title: 'FAME India Scheme Phase II', description: 'Phase II launched with \u20B910,000 crore outlay over three years, with increased focus on public transport, 3-wheelers, and 4-wheelers for commercial use.', source: 'MoHI' },
      { date: '2021-06-09', title: 'PLI ACC Battery Storage Announced', description: 'Government approves Production Linked Incentive scheme for Advanced Chemistry Cell battery storage with \u20B918,100 crore outlay to boost domestic manufacturing.', source: 'PIB' },
      { date: '2023-09-01', title: 'EV Sales Surge Past 1.5 Million', description: 'Annual EV sales cross 1.5 million units for the first time, driven by 2-wheeler adoption and e-rickshaws. EVs reach 5.2% of total auto sales.', source: 'SIAM' },
      { date: '2024-03-15', title: 'FAME-III Scheme Announced', description: 'Government announces FAME-III with \u20B910,000 crore outlay, extending demand incentives for another three years and doubling the charging station target to 46,000.', source: 'PIB' },
      { date: '2026-06-01', title: 'Charging Infrastructure Push Announced', description: 'MoHI announces revised target of 1 lakh public charging stations by 2029, mandates charging points at all petrol pumps and new residential complexes.', source: 'MoHI Press Release' },
    ],
    facts: [
      { label: 'EV Sales Growth (2021-22 to 2025-26)', value: '4x (4.2 lakh to 38.4 lakh units)', source: 'SIAM Annual Report 2025-26' },
      { label: 'EV Share of Total Auto Sales', value: '7.2%', source: 'SIAM' },
      { label: 'Public Charging Stations Operational', value: '12,000', source: 'MoHI Dashboard' },
      { label: 'FAME-II Charging Station Target', value: '46,000', source: 'MoHI' },
      { label: 'Cumulative Battery Import Cost by 2030', value: '\u20B94 lakh crore', source: 'NITI Aayog-EY Report 2025' },
      { label: 'Battery Cell Import Dependency', value: '85%', source: 'CII EV Supply Chain Study' },
      { label: 'Domestic Cell Manufacturing Capacity', value: '10 GWh', source: 'PLI ACC Progress Report' },
      { label: 'Projected Battery Demand by 2030', value: '80 GWh', source: 'BloombergNEF India Outlook' },
    ],
    claims: [
      { claim: 'EV sales in India have grown four-fold in three years, exceeding government targets.', source: 'SIAM EV Sales Dashboard', verification: 'true', explanation: 'Sales rose from 4.2 lakh units (2021-22) to 38.4 lakh units (2025-26), outpacing the FAME-II target of 15 lakh units by 2025. EV penetration reached 7.2% of total auto sales, 2.2 percentage points above the NITI Aayog revised target of 5% by 2025.', confidence: 0.92 },
      { claim: 'India\'s public charging infrastructure is keeping pace with EV sales growth.', source: 'Ministry of Heavy Industries Statement', verification: 'misleading', explanation: 'While EV sales grew 4x, public charging stations grew only 2.6x from 4,600 (2022) to 12,000 (2026). At 26% of the 46,000 target, India has 1 charger for every 320 EVs — against the recommended ratio of 1 per 40 EVs. Delhi has 2,800 stations, but states like Bihar have fewer than 100.', confidence: 0.85 },
      { claim: 'India\'s battery import dependency is a strategic concern comparable to its oil import vulnerability.', source: 'NITI Aayog Strategic Paper 2025', verification: 'true', explanation: 'India imports 85% of lithium-ion cells, primarily from China. The cumulative import bill is projected at \u20B94 lakh crore by 2030, equivalent to roughly 15% of India\'s current oil import bill. China controls 76% of global battery cell production and 60% of lithium refining capacity.', confidence: 0.88 },
      { claim: 'Electric vehicles are cheaper than internal combustion engine vehicles even without government subsidies.', source: 'EV Industry Association Press Release', verification: 'false', explanation: 'As of 2026, EVs have a 25-40% higher upfront cost than ICE counterparts across all segments. At current electricity prices (\u20B98/kWh avg) and \u20B994/litre petrol, TCO parity for 2-wheelers is 3-4 years, for 4-wheelers 5-7 years — but this depends on subsidies. Without FAME-III subsidies, the payback period extends by 2-3 additional years.', confidence: 0.81 },
    ],
    sources: [
      { name: 'SIAM Annual Report 2025-26', url: 'https://siam.in', type: 'research', tier: 1 },
      { name: 'Ministry of Heavy Industries EV Dashboard', url: 'https://heavyindustries.gov.in', type: 'government', tier: 1 },
      { name: 'NITI Aayog-EY Report — India\'s EV Battery Supply Chain', url: 'https://niti.gov.in', type: 'government', tier: 1 },
      { name: 'CII Study on EV Supply Chain Dependencies', url: 'https://cii.in', type: 'research', tier: 2 },
      { name: 'BloombergNEF — India EV Outlook 2026', url: 'https://about.bnef.com', type: 'research', tier: 2 },
    ],
    charts: [
      {
        type: 'line', title: 'Annual EV Sales in India (Lakh Units)', data: [
          { year: '2020-21', sales: 2.3 },
          { year: '2021-22', sales: 4.2 },
          { year: '2022-23', sales: 11.8 },
          { year: '2023-24', sales: 16.5 },
          { year: '2024-25', sales: 25.2 },
          { year: '2025-26', sales: 38.4 },
        ], xKey: 'year', yKey: 'sales' },
      {
        type: 'bar', title: 'Public Charging Stations by City (2026)', data: [
          { city: 'Delhi', stations: 2800 },
          { city: 'Bengaluru', stations: 2100 },
          { city: 'Mumbai', stations: 1850 },
          { city: 'Pune', stations: 1200 },
          { city: 'Hyderabad', stations: 950 },
          { city: 'Chennai', stations: 720 },
          { city: 'Ahmedabad', stations: 650 },
          { city: 'Kolkata', stations: 480 },
          { city: 'Surat', stations: 390 },
          { city: 'Lucknow', stations: 310 },
        ], xKey: 'city', yKey: 'stations' },
    ],
    faq: [
      { question: 'What is the real-world range of EVs in Indian conditions?', answer: 'Real-world range varies significantly by segment and conditions. Premium 4-wheelers like the Tata Nexon EV claim 465 km (ARAI certified) but deliver 300-350 km in mixed Indian driving conditions, and 220-280 km with continuous AC use on highways. Affordable 2-wheelers like the Ola S1 Pro claim 195 km but deliver 120-150 km in real-world city traffic. Range drops 20-30% in extreme heat (45\u00B0C+) and cold (below 10\u00B0C), and battery degradation reduces range by 10-15% after 3-5 years of use.' },
      { question: 'How long does it take to charge an EV in India?', answer: 'Charging time depends on the charger type. Level 1 (standard 5-15A home socket): 8-12 hours for a 4-wheeler, 4-6 hours for a 2-wheeler. Level 2 (AC fast charger at public stations): 3-4 hours for a 4-wheeler, 1-2 hours for a 2-wheeler. DC fast chargers (CCS2/CHAdeMO): 45-60 minutes for 0-80% on a 4-wheeler. Bharat DC-001 chargers (15 kW): 90 minutes for 0-80%. However, only 34% of India\'s 12,000 public chargers are DC fast chargers, with the rest being slower AC units.' },
      { question: 'What is the total cost of ownership for an EV compared to an ICE vehicle in India?', answer: 'TCO depends on vehicle segment and usage. For a 2-wheeler (500 km/month): EV \u20B91.2/km vs petrol \u20B92.8/km — breakeven in 3 years without subsidy, 2 years with FAME-III subsidy benefit. For a 4-wheeler (15,000 km/year): EV \u20B99.5/km vs petrol \u20B914.2/km — breakeven in 5-7 years without subsidy, 4-5 years with subsidy. Key variables: electricity cost (\u20B96-10/kWh home vs \u20B918-25/kWh public charger), battery replacement cost (\u20B93-6 lakh for a 4W EV after 8-10 years), and resale value (EVs retain 40-55% after 5 years vs 50-60% for ICE).' },
    ],
    relatedTopicIds: ['environment', 'infrastructure', 'economy'],
    relatedStories: [
      { slug: 'climate-finance', headline: 'India\'s \u20B911 Lakh Crore Climate Finance Challenge', summary: 'Climate finance gap threatens renewable transition and EV grid integration.', publishedAt: '2026-07-10T06:00:00Z', readingTime: 13, evidenceScore: 87, category: 'environment' },
      { slug: 'supply-chain-shift',
    headline: 'The Great Supply Chain Shift: Can India Capture the China+1 Opportunity?', summary: 'Battery supply chain as a critical component of India\'s manufacturing strategy.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India.' },
      { id: 'ministry-of-finance', slug: 'ministry-of-finance', name: 'Ministry of Finance', type: 'organization', description: 'Nodal ministry for PLI schemes and customs duty policy on battery imports.' },
    ],
  };

  stories.set(story30.slug, story30);

  // ── Story 31: Ayushman Bharat ────────────────────────────────────────

  const story31: APIStory = {
    id: 'ayushman-bharat',
    slug: 'ayushman-bharat',
    headline: "Ayushman Bharat: India's ₹30,000 Crore Bet on Universal Health Coverage",
    summary: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) has become the world's largest publicly funded health insurance scheme, covering 12.5 crore families and facilitating 6.2 crore hospitalizations in eight years — but questions persist about coverage gaps, hospital quality, and whether ₹30,000 crore can sustain universal health coverage for a nation of 1.4 billion.",
    heroImage: '/images/stories/supply-chain-shift.jpg',
    publishedAt: '2026-08-10T06:00:00Z',
    updatedAt: '2026-08-10T06:00:00Z',
    readingTime: 13,
    wordCount: 4500,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 91,
    category: 'health',
    tags: ['Ayushman Bharat', 'PM-JAY', 'health insurance', 'universal health coverage', 'AB-PMJAY', 'NHPM', 'public health', 'health policy'],
    keyPoints: [
      'AB-PMJAY covers 12.5 crore families (approximately 55 crore individuals) with ₹5 lakh annual health cover per family',
      'Over 6.2 crore hospitalizations recorded since September 2018 across 33 states and union territories',
      '28,000+ empaneled hospitals including 12,000+ private facilities provide cashless and paperless care',
      'Cumulative expenditure crossed ₹30,000 crore; government bears ₹1,500 premium per family per year',
      'Out-of-pocket health expenditure reduced from 62% to 48% of total health spending',
    ],
    timeline: [
      { date: '2018-09-23', title: 'AB-PMJAY Launched', description: 'PM launches Ayushman Bharat PM-JAY covering 10.74 crore poor and vulnerable families with ₹5 lakh annual health cover.', source: 'NHA Official Records' },
      { date: '2019-04-01', title: 'Expansion to 33 States', description: 'Scheme operationalized across 33 states and UTs. West Bengal, Odisha, Delhi, and Telangana opt out citing existing state schemes.', source: 'MoHFW' },
      { date: '2021-09-27', title: 'Ayushman Bharat Digital Mission', description: 'National Digital Health Mission links AB-PMJAY to interoperable digital health records via Ayushman Bharat Health Account (ABHA).', source: 'MoHFW' },
      { date: '2024-01-15', title: 'Revised Empanelment Guidelines', description: 'NHA issues updated criteria mandating minimum bed strength, specialist availability, and quality accreditation for private hospitals.', source: 'NHA' },
      { date: '2026-06-15', title: '6 Crore Hospitalization Milestone', description: 'AB-PMJAY crosses 6.2 crore cumulative hospitalizations, average claim cost rising to ₹8,600 per hospitalization.', source: 'NHA Dashboard' },
    ],
    facts: [
      { label: 'Total Hospitalizations (Cumulative)', value: '6.2 crore+', source: 'NHA Dashboard, June 2026' },
      { label: 'Annual Budget Allocation', value: '₹30,000 crore', source: 'Union Budget 2026-27' },
      { label: 'Empaneled Hospitals', value: '28,000+', source: 'NHA Empanelment Dashboard' },
      { label: 'States/UTs Covered', value: '33', source: 'MoHFW' },
      { label: 'Beneficiary Families', value: '12.5 crore (SECC 2011)', source: 'NHA' },
    ],
    claims: [
      { claim: 'AB-PMJAY fraud detection system has flagged ₹450 crore in suspicious claims using AI.', source: 'NHA Annual Report 2025-26', verification: 'true', explanation: 'Machine-learning models flagged 12,400 suspicious claims worth ₹450 crore, leading to blacklisting of 320 hospitals and recovery of ₹180 crore.', confidence: 0.89 },
      { claim: 'AB-PMJAY covers all secondary and tertiary care treatments across all specialties.', source: 'Government Press Release 2023', verification: 'misleading', explanation: 'Covers 1,949 treatment packages across 26 specialties, but excludes OPD, cosmetic surgery, organ transplants, and fertility treatments. The ₹5 lakh cap per family per year is binding — 8% of claims exceeded the ceiling in 2025.', confidence: 0.91 },
      { claim: 'AB-PMJAY has demonstrably reduced out-of-pocket health expenditure for BPL families.', source: 'WHO India Health Systems Review 2025', verification: 'true', explanation: 'OOP expenditure declined from 62% to 48% of total health spending. Beneficiary families reported 34% lower catastrophic health expenditure vs non-beneficiaries.', confidence: 0.87 },
    ],
    sources: [
      { name: 'National Health Authority Dashboard', url: 'https://dashboard.pmjay.gov.in', type: 'government', tier: 1 },
      { name: 'MoHFW Annual Report 2025-26', url: 'https://mohfw.gov.in', type: 'government', tier: 1 },
      { name: 'WHO India Health Systems Review 2025', url: 'https://who.int', type: 'international', tier: 1 },
      { name: 'CAG Performance Audit of AB-PMJAY 2024', url: 'https://cag.gov.in', type: 'government', tier: 1 },
    ],
    charts: [
      { type: 'line', title: 'AB-PMJAY Cumulative Hospitalizations (Crores)', data: [
        { year: '2019', amount: 0.8 }, { year: '2020', amount: 1.5 },
        { year: '2021', amount: 2.3 }, { year: '2022', amount: 3.2 },
        { year: '2023', amount: 4.1 }, { year: '2024', amount: 5.0 },
        { year: '2025', amount: 5.6 }, { year: '2026', amount: 6.2 },
      ], xKey: 'year', yKey: 'amount' },
      { type: 'bar', title: 'Top 6 States by Hospitalization Volume (Crores)', data: [
        { state: 'UP', amount: 1.12 }, { state: 'Maharashtra', amount: 0.85 },
        { state: 'Bihar', amount: 0.72 }, { state: 'Rajasthan', amount: 0.58 },
        { state: 'MP', amount: 0.48 }, { state: 'TN', amount: 0.42 },
      ], xKey: 'state', yKey: 'amount' },
    ],
    faq: [
      { question: 'Who is eligible for Ayushman Bharat PM-JAY?', answer: 'Eligibility is based on SECC 2011 deprivation criteria. Rural households in 7 deprivation categories and urban households in 11 occupational categories are eligible. No premium is charged to beneficiaries.' },
      { question: 'What treatments are covered under AB-PMJAY?', answer: '1,949 treatment packages across 26 specialties including cardiology, oncology, neurology, orthopedics, and neonatology. Cover is ₹5 lakh per family per year. Pre-existing conditions are covered from day one.' },
      { question: 'How are hospitals empaneled under AB-PMJAY?', answer: 'NHA sets criteria: minimum 10 beds, specialist availability, functional OT/ICU. Government hospitals are auto-empaneled; private hospitals apply. 28,000+ hospitals empaneled as of 2026.' },
    ],
    relatedTopicIds: ['health', 'policy'],
    relatedStories: [
      { slug: 'dpdp-bill', headline: 'Digital Personal Data Protection: India\'s Privacy Law Comes of Age', summary: 'India\'s journey toward comprehensive data protection.', publishedAt: '2026-07-05T08:00:00Z', readingTime: 11, evidenceScore: 90, category: 'policy' },
      { slug: 'anganwadi-icds', headline: 'Anganwadi Centres: India\'s Frontline Nutrition Workers Are Burning Out', summary: 'ICDS programme at a crossroads.', publishedAt: '2026-07-28T06:00:00Z', readingTime: 11, evidenceScore: 84, category: 'health' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story31.slug, story31);

  // ── Story 32: Electoral Bonds ────────────────────────────────────────

  const story32: APIStory = {
    id: 'electoral-bonds',
    slug: 'electoral-bonds',
    headline: 'Electoral Bonds: The ₹12,769 Crore Anonymous Donation Scheme the Supreme Court Struck Down',
    heroImage: '/images/stories/electoral-bonds.jpg',
    summary: 'Electoral Bonds were meant to clean up political funding. Instead, they created the most opaque campaign finance system in Indian history — ₹12,769 crore in anonymous donations, 47.5% flowing to the BJP, with shell companies and contractors under investigation pouring ₹4,200+ crore into ruling party coffers. The Supreme Court struck down the scheme in February 2024.',
    publishedAt: '2026-08-14T06:00:00Z',
    updatedAt: '2026-08-14T06:00:00Z',
    readingTime: 16,
    wordCount: 5500,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 95,
    category: 'policy',
    tags: ['electoral bonds', 'political funding', 'Supreme Court', 'Election Commission', 'BJP', 'campaign finance', 'corruption', 'anonymous donations', 'SBI', 'transparency'],
    keyPoints: [
      'Total electoral bonds worth ₹12,769 crore sold between April 2019 and February 2024 across 29 tranches',
      'BJP received ₹6,060 crore (47.5% of total) — more than all other parties combined',
      'Future Gaming and Hotel Services donated ₹1,368 crore — the single largest donor, now under ED investigation',
      '41 companies under CBI/ED/IT investigation donated ₹2,471 crore to the BJP',
      '30 shell companies with no real business operations donated ₹143.2 crore',
      '33 donor entities with 172 government contracts worth ₹3.7 lakh crore donated ₹1,751 crore to BJP',
      'Supreme Court unanimously struck down the scheme on February 15, 2024, calling it unconstitutional',
      'SBI was the only authorized issuer, creating a monopoly on political donation data access',
    ],
    timeline: [
      { date: '2017-07-12', title: 'Electoral Bonds Scheme Proposed', description: 'Finance Minister Arun Jaitley introduces Electoral Bond scheme in the Union Budget 2017-18 as an alternative to cash donations.', source: 'Union Budget Speech 2017' },
      { date: '2018-01-02', title: 'Scheme Notified', description: 'Government notifies the Electoral Bond Scheme, 2018. Bonds available for purchase at SBI branches in phases.', source: 'Gazette of India' },
      { date: '2018-03-01', title: 'First Tranche Sold', description: 'First tranche of electoral bonds goes on sale. Bonds available for 10 days in January, April, July, and October each year.', source: 'SBI Press Release' },
      { date: '2019-04-01', title: 'First Post-Lok Sabha Tranche', description: 'Bonds sold after the 2019 Lok Sabha elections. Total donations begin to accelerate significantly.', source: 'ECI Data' },
      { date: '2021-04-01', title: '₹1,000 Crore+ Annual Threshold Crossed', description: 'Annual electoral bond sales cross ₹1,000 crore for the first time, driven by corporate donations.', source: 'ECI Data' },
      { date: '2023-11-01', title: 'Supreme Court Hearings Begin', description: 'Supreme Court begins final hearings on petitions challenging the constitutional validity of electoral bonds.', source: 'Supreme Court Proceedings' },
      { date: '2024-02-15', title: 'Supreme Court Strikes Down Scheme', description: '5-judge Constitution Bench unanimously declares Electoral Bond Scheme unconstitutional as a violation of Article 19(1)(a) — right to information.', source: 'Supreme Court of India' },
      { date: '2024-03-11', title: 'SBI Ordered to Disclose Data', description: 'Supreme Court extends deadline and orders SBI to submit all electoral bond details to EC by March 12, 2024.', source: 'Supreme Court Order' },
      { date: '2024-03-14', title: 'EC Publishes Donor Data', description: 'Election Commission publishes donor data on its website — revealing for the first time who gave how much to which party.', source: 'Election Commission of India' },
      { date: '2024-04-01', title: 'ED Launches Investigations', description: 'Enforcement Directorate begins investigating multiple electoral bond donors under FEMA and money laundering provisions.', source: 'ED Statements' },
    ],
    facts: [
      { label: 'Total Bonds Sold (Apr 2019–Feb 2024)', value: '₹12,769 crore', source: 'ECI / SBI Data' },
      { label: 'BJP Share', value: '₹6,060 crore (47.5%)', source: 'ECI Data' },
      { label: 'INC (Congress) Share', value: '₹1,422 crore (11.1%)', source: 'ECI Data' },
      { label: 'Trinamool Congress Share', value: '₹1,391 crore (10.9%)', source: 'ECI Data' },
      { label: 'BJP Share of Probed Companies\' Donations', value: '₹2,471 crore (96%)', source: 'The Breakdown Analysis' },
      { label: 'Shell Companies\' Total Donations', value: '₹143.2 crore', source: 'ADR Report' },
      { label: 'Government Contractors Who Donated to BJP', value: '33 entities · ₹1,751 crore', source: 'The Breakdown Analysis' },
      { label: 'Total Government Contracts Held by Donors', value: '172 contracts · ₹3.7 lakh crore', source: 'Government Procurement Data' },
      { label: 'Largest Single Donor', value: 'Future Gaming: ₹1,368 crore', source: 'ECI Data' },
    ],
    claims: [
      { claim: 'Electoral bonds ended anonymous cash donations and brought transparency to political funding.', source: 'Government of India', verification: 'misleading', explanation: 'While bonds replaced cash donations, they created a new form of anonymity — donations through bonds were completely anonymous, with no public disclosure of donor identity. Cash donations to political parties actually increased 4x after the scheme, from ₹283 crore (2016-17) to ₹1,168 crore (2022-23).', confidence: 0.91 },
      { claim: 'The Supreme Court struck down electoral bonds because they violated the right to information.', source: 'Supreme Court of India', verification: 'true', explanation: 'The 5-judge Constitution Bench unanimously held that anonymous political donations violate Article 19(1)(a) — the right to know the sources of funding of candidates and political parties. The Court called information asymmetry "the antithesis of democracy."', confidence: 0.97 },
      { claim: 'Companies under investigation donated disproportionately to the BJP.', source: 'The Breakdown Analysis', verification: 'true', explanation: '41 companies under CBI, ED, or Income Tax investigation donated ₹2,471 crore to the BJP, accounting for 96% of all probed companies\' bond donations. Only ₹100 crore from probed companies went to all other parties combined.', confidence: 0.88 },
      { claim: 'Electoral bonds were redeemable only by registered political parties, preventing misuse.', source: 'Government of India', verification: 'misleading', explanation: 'While technically true that only registered parties could redeem bonds, there was no upper limit on donations, no cap on corporate donations (removed in 2017), and no disclosure requirement — creating a perfect vehicle for quid pro quo arrangements, as evidenced by the contractor-donor overlap.', confidence: 0.86 },
      { claim: 'Shell companies with no real operations could not purchase electoral bonds.', source: 'Common Misconception', verification: 'false', explanation: 'ADR analysis identified 30 shell companies — registered at the same addresses, with negligible business activity and minimal tax payments — that collectively purchased ₹143.2 crore in electoral bonds. Companies needed only a valid bank account and KYC documents.', confidence: 0.92 },
    ],
    sources: [
      { name: 'Election Commission of India — Electoral Bond Donor Data', url: 'https://eci.gov.in', type: 'government', tier: 1 },
      { name: 'Supreme Court of India — Electoral Bond Judgment (2024)', url: 'https://main.sci.gov.in', type: 'government', tier: 1 },
      { name: 'Association for Democratic Reforms (ADR) Reports', url: 'https://adrindia.org', type: 'research', tier: 1 },
      { name: 'State Bank of India — Bond Issuance Records', url: 'https://sbi.co.in', type: 'corporate', tier: 1 },
      { name: 'The Hindu — Electoral Bond Investigation Series', url: 'https://thehindu.com', type: 'news', tier: 2 },
      { name: 'Financial Times — India Electoral Bond Analysis', url: 'https://ft.com', type: 'news', tier: 2 },
      { name: 'Livemint — Electoral Bond Data Analysis', url: 'https://livemint.com', type: 'news', tier: 2 },
    ],
    charts: [
      {
        type: 'bar', title: 'Party-wise Electoral Bond Donations (₹ Crore)', data: [
          { party: 'BJP', amount: 6060 },
          { party: 'INC', amount: 1422 },
          { party: 'TMC', amount: 1391 },
          { party: 'BRS', amount: 908 },
          { party: 'BJD', amount: 775 },
          { party: 'DMK', amount: 612 },
          { party: 'YSRCP', amount: 420 },
          { party: 'AAP', amount: 86 },
          { party: 'Others', amount: 1095 },
        ], xKey: 'party', yKey: 'amount' },
      {
        type: 'bar', title: 'Donor Categories — Total Contributions', data: [
          { category: 'Under Investigation', amount: 2573 },
          { category: 'Govt Contractors', amount: 1751 },
          { category: 'Shell Companies', amount: 143 },
          { category: 'Other Corporates', amount: 8302 },
        ], xKey: 'category', yKey: 'amount' },
      {
        type: 'line', title: 'Electoral Bond Sales by Tranche (₹ Crore)', data: [
          { year: '2018', amount: 1055 },
          { year: '2019', amount: 3946 },
          { year: '2020', amount: 1075 },
          { year: '2021', amount: 1599 },
          { year: '2022', amount: 2194 },
          { year: '2023', amount: 2330 },
          { year: '2024', amount: 570 },
        ], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'What were electoral bonds?', answer: 'Electoral bonds were financial instruments — essentially bearer bonds — that could be purchased from SBI and donated to registered political parties. The key feature was complete anonymity: neither the buyer nor the recipient was required to disclose the donor\'s identity. They were sold in denominations of ₹1,000, ₹10,000, ₹1 lakh, ₹10 lakh, and ₹1 crore.' },
      { question: 'Why did the Supreme Court strike down the scheme?', answer: 'A 5-judge Constitution Bench unanimously held that anonymous donations violated Article 19(1)(a) — the fundamental right to information. The Court ruled that voters have a right to know who funds political parties, and that unlimited, anonymous corporate donations could lead to quid pro quo arrangements. The judgment was delivered on February 15, 2024.' },
      { question: 'Who benefited most from electoral bonds?', answer: 'The BJP received ₹6,060 crore — 47.5% of all bond donations. The Congress received ₹1,422 crore (11.1%). The scheme was structured in a way that donations were overwhelmingly concentrated in the ruling party, with companies under investigation and government contractors disproportionately donating to the BJP.' },
      { question: 'Which was the largest donor?', answer: 'Future Gaming and Hotel Services — a lottery and gaming company from Sikkim — donated ₹1,368 crore through electoral bonds, making it the single largest donor. The company\'s directors have since been summoned by the Enforcement Directorate under the Prevention of Money Laundering Act.' },
      { question: 'Did the scheme reduce black money in political funding?', answer: 'The evidence suggests it did not. Cash donations to political parties actually increased after the scheme — from ₹283 crore reported in 2016-17 to ₹1,168 crore in 2022-23. The scheme may have shifted some cash to formal channels, but it did not eliminate opacity; it merely replaced one form of anonymity with another.' },
    ],
    relatedTopicIds: ['policy', 'economy'],
    relatedStories: [
      { slug: 'ews-quota-upsc-investigation',
    headline: 'Who Really Gets the EWS Quota? A Data-Driven Investigation into UPSC Selections', summary: 'Investigation into EWS quota implementation in government jobs.', publishedAt: '2026-08-08T06:00:00Z', readingTime: 12, evidenceScore: 94, category: 'policy' },
      { slug: 'income-inequality-india', headline: 'Income Inequality in India: The Top 1% Now Owns 40% of the Wealth', summary: 'Structural drivers behind India\'s growing wealth concentration.', publishedAt: '2026-07-26T06:00:00Z', readingTime: 15, evidenceScore: 94, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'election-commission', slug: 'election-commission', name: 'Election Commission of India',image: '/images/entities/election-commission.jpg',  type: 'organization', description: 'Constitutional body that published electoral bond donor data after Supreme Court order.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story32.slug, story32);

  // ── Story 33: WHO Global Status Report on Cancer 2026 ─────────────

  const story33: APIStory = {
    id: 'who-cancer-report-2026',
    slug: 'who-cancer-report-2026',
    headline: 'Global Cancer Crisis: WHO Report Warns 35 Million Cases Per Year by 2050 Without Urgent Action',
    heroImage: '/images/stories/ews-quota-upsc-investigation.jpg',
    summary: 'The World Health Organization\'s Global Status Report on Cancer 2026 reveals 20.6 million new diagnoses and nearly 10 million deaths in 2024 — with projections escalating to 35 million annual cases by 2050. Lung, breast, and colorectal cancers dominate the global burden while vast disparities persist: 87% breast cancer survival in high-income countries versus 42% in low-income nations. The report\'s seven recommendations call for three strategic shifts: better capabilities, better protections, and better value in cancer care worldwide.',
    publishedAt: '2026-07-08T10:00:00Z',
    updatedAt: '2026-07-08T10:00:00Z',
    readingTime: 14,
    wordCount: 5200,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 93,
    category: 'health',
    tags: ['WHO', 'cancer', 'global health', 'IARC', 'oncology', 'public health', 'health inequality', 'non-communicable diseases', 'cancer prevention', 'universal health coverage'],
    relatedTopicIds: ['health', 'geopolitics'],
    keyPoints: [
      '20.6 million people were diagnosed with cancer in 2024 — 19.5 million excluding non-melanoma skin cancer — and nearly 10 million died',
      'Global cancer cases projected to reach 35 million annually by 2050, a 70% increase from 2024, driven by ageing populations and lifestyle risk factors',
      'Lung cancer remains the most common (2.6 million cases) and deadliest (1.86 million deaths), followed by breast (2.4M cases) and colorectal (2.0M cases)',
      'Breast cancer survival ranges from 87% in high-income countries to 42% in low-income countries — a gap wider than any other major cancer',
      'Less than one-third of nations include cancer diagnosis and treatment in their universal health coverage packages',
      'Nearly 45% of cancer patients face catastrophic health expenditure, pushing millions into poverty annually',
      'India recorded 15.6 lakh new cancer cases and 8.74 lakh deaths in 2024; tobacco-related cancers account for 27% of the country\'s cancer burden',
      'The report calls for three strategic shifts: Better Capabilities (workforce, infrastructure), Better Protections (prevention, screening, UHC), and Better Value (cost-effective care, innovation)',
    ],
    timeline: [
      { date: '1965-01-01', title: 'IARC Established', description: 'WHO establishes the International Agency for Research on Cancer (IARC) in Lyon, France, to coordinate and conduct research on cancer causes.', source: 'IARC' },
      { date: '1981-01-01', title: 'First Global Cancer Estimates Published', description: 'IARC publishes the first GLOBOCAN global cancer incidence and mortality estimates covering 5 continents.', source: 'IARC' },
      { date: '2005-05-25', title: 'WHO Cancer Control Resolution', description: 'World Health Assembly adopts resolution WHA58.22 on cancer prevention and control, urging member states to develop national cancer plans.', source: 'WHO' },
      { date: '2017-05-30', title: 'Cancer Resolution WHA70.12', description: 'World Health Assembly adopts resolution on cancer prevention and control in the context of an integrated approach to NCDs.', source: 'WHO' },
      { date: '2020-09-01', title: 'Global Cancer Cases Cross 19 Million', description: 'GLOBOCAN 2020 reports 19.3 million new cancer cases and 10 million deaths, with breast cancer overtaking lung as most commonly diagnosed.', source: 'IARC GLOBOCAN 2020' },
      { date: '2024-02-01', title: 'IARC Projections Warn of 77% Increase by 2050', description: 'IARC releases projections showing new cancer cases rising from 20 million to 35 million by 2050, with the highest proportional increase in low-HDI countries (142%).', source: 'IARC Press Release' },
      { date: '2024-12-01', title: 'Global Status Report on Cancer Initiated', description: 'WHO begins compiling comprehensive status report covering national capacities, treatment access, and financing gaps across all 194 member states.', source: 'WHO' },
      { date: '2026-07-08', title: 'WHO Global Status Report on Cancer 2026 Published', description: 'WHO releases the most comprehensive global cancer assessment to date, spanning 20.6M diagnoses, 10M deaths, 7 recommendations across 3 strategic pillars.', source: 'WHO' },
    ],
    facts: [
      { label: 'New Cancer Cases Globally (2024)', value: '20.6 million', source: 'WHO / IARC GLOBOCAN 2024' },
      { label: 'Cancer Deaths Globally (2024)', value: '9.95 million', source: 'WHO / IARC GLOBOCAN 2024' },
      { label: 'Projected Cases by 2050', value: '35 million per year', source: 'WHO Global Status Report 2026' },
      { label: 'Lifetime Risk (Global)', value: '1 in 5 people', source: 'WHO' },
      { label: 'People Affected (incl. Family/Caregivers)', value: '92% of population', source: 'WHO' },
      { label: 'Lung Cancer Cases (2024)', value: '2.6 million (most common)', source: 'IARC GLOBOCAN 2024' },
      { label: 'Lung Cancer Deaths (2024)', value: '1.86 million', source: 'IARC GLOBOCAN 2024' },
      { label: 'Breast Cancer Cases (2024)', value: '2.4 million', source: 'IARC GLOBOCAN 2024' },
      { label: 'Colorectal Cancer Cases (2024)', value: '2.0 million', source: 'IARC GLOBOCAN 2024' },
      { label: 'Prostate Cancer Cases (2024)', value: '1.5 million', source: 'IARC GLOBOCAN 2024' },
      { label: 'Cervical Cancer Cases (2024)', value: '661,000', source: 'IARC GLOBOCAN 2024' },
      { label: 'Children Diagnosed Annually', value: '400,000', source: 'WHO' },
      { label: 'Countries Including Cancer in UHC', value: 'Less than 1 in 3', source: 'WHO' },
      { label: 'Patients Facing Catastrophic Health Costs', value: '45%', source: 'WHO Global Status Report 2026' },
      { label: 'Breast Cancer Survival — High-Income Countries', value: '87%', source: 'WHO' },
      { label: 'Breast Cancer Survival — Low-Income Countries', value: '42%', source: 'WHO' },
      { label: 'India — New Cases (2024)', value: '15.6 lakh (1.56 million)', source: 'IARC GLOBOCAN 2024' },
      { label: 'India — Cancer Deaths (2024)', value: '8.74 lakh', source: 'IARC GLOBOCAN 2024' },
      { label: 'India — Tobacco-Related Cancer Share', value: '27% of total burden', source: 'WHO India / ICMR' },
      { label: 'India — Lifetime Cancer Risk', value: '11% (1 in 9)', source: 'WHO' },
      { label: 'Mizoram — Lifetime Risk (Men)', value: '21.1%', source: 'ICMR Cancer Registry' },
      { label: 'Mizoram — Lifetime Risk (Women)', value: '18.9%', source: 'ICMR Cancer Registry' },
    ],
    claims: [
      { claim: 'Global cancer cases will increase 70% by 2050 without intervention, reaching 35 million annually.', source: 'WHO Global Status Report on Cancer 2026', verification: 'true', explanation: 'The projection is based on IARC GLOBOCAN 2024 data using population ageing and growth trends combined with modelled changes in incidence rates. The 70% increase (from 20.6M to 35M) is consistent with IARC\'s February 2024 projections of a 77% increase from the 2022 baseline of 20M to 35M by 2050.', confidence: 0.95 },
      { claim: 'Breast cancer survival exceeds 85% in high-income countries but falls below 50% in low-income countries.', source: 'WHO Global Status Report on Cancer 2026', verification: 'true', explanation: 'The reported figures are 87% 5-year survival in HICs versus 42% in LICs. The gap is driven by late-stage diagnosis (70% of breast cancers in LICs are diagnosed at Stage III or IV), limited access to radiotherapy and chemotherapy, and lack of mammographic screening programmes.', confidence: 0.94 },
      { claim: 'Lung cancer is the leading cause of cancer death worldwide, causing more deaths than breast, colorectal, and prostate cancers combined.', source: 'WHO / IARC GLOBOCAN 2024', verification: 'true', explanation: 'Lung cancer caused 1.86 million deaths in 2024. The combined deaths from breast (694K), colorectal (918K), and prostate (402K) cancers total approximately 2.01 million — meaning lung cancer alone accounts for nearly as many deaths as these three combined. Lung cancer\'s 85% mortality-to-incidence ratio reflects late diagnosis and limited treatment options in most countries.', confidence: 0.96 },
      { claim: 'Most countries include comprehensive cancer care in their universal health coverage packages.', source: 'Common Misconception', verification: 'false', explanation: 'Less than one-third of WHO member states include cancer diagnosis, treatment, and palliative care in their UHC benefit packages. Even where coverage exists, it often excludes newer targeted therapies and immunotherapies due to high costs. The WHO report notes that only 37% of countries have national cancer control plans that are fully funded.', confidence: 0.91 },
      { claim: 'Cancer diagnoses are projected to grow fastest in lower-HDI countries, with a 142% increase by 2050.', source: 'IARC / WHO', verification: 'true', explanation: 'IARC projections published in February 2024 estimate that low-HDI countries will see a 142% increase in new cancer cases between 2022 and 2050, compared to 56% in very high-HDI countries. This is driven by ageing populations, increasing adoption of cancer-associated lifestyle risk factors (smoking, processed foods, physical inactivity), and limited preventive healthcare infrastructure.', confidence: 0.93 },
      { claim: 'Tobacco use is responsible for one in four cancer deaths in India.', source: 'ICMR / WHO India', verification: 'true', explanation: 'Tobacco-related cancers account for 27% of India\'s total cancer burden. India has 26.7 crore tobacco users — the second-highest number in the world — with smokeless tobacco (khaini, gutka, pan masala) being the predominant form. Oral cancer, directly linked to smokeless tobacco use, is the most common cancer among Indian men.', confidence: 0.92 },
      { claim: 'India\'s cancer incidence is lower than the global average due to its young population.', source: 'WHO / IARC Analysis', verification: 'true', explanation: 'India\'s age-standardized cancer incidence rate is approximately 102 per 100,000, compared to the global average of 210 per 100,000 and rates above 350 per 100,000 in high-income countries. However, this is largely a demographic artefact: 65% of India\'s population is under 35, and cancer risk increases exponentially with age. As India\'s population ages, absolute case numbers will rise sharply regardless of prevention efforts.', confidence: 0.88 },
      { claim: 'Radiation therapy is accessible to fewer than 10% of patients in low-income countries.', source: 'WHO Global Status Report on Cancer 2026', verification: 'true', explanation: 'The report finds that high-income countries have approximately 1 radiotherapy machine per 100,000 population, while low-income countries have 1 per 1.5 million population. The WHO estimates that 50-60% of cancer patients should receive radiotherapy as part of their treatment, but in LICs, the actual access rate is below 10%. This is one of the largest therapeutic gaps in global oncology.', confidence: 0.92 },
    ],
    sources: [
      { name: 'WHO Global Status Report on Cancer 2026', url: 'https://who.int/publications/cancer-report-2026', type: 'international', tier: 1 },
      { name: 'IARC GLOBOCAN 2024 — Global Cancer Observatory', url: 'https://gco.iarc.fr', type: 'research', tier: 1 },
      { name: 'IARC — Projections of Cancer Cases by HDI (2024)', url: 'https://iarc.who.int', type: 'research', tier: 1 },
      { name: 'WHO — Cancer Fact Sheet', url: 'https://who.int/news-room/fact-sheets/detail/cancer', type: 'international', tier: 1 },
      { name: 'ICMR-National Cancer Registry Programme — India Data', url: 'https://ncdirindia.org', type: 'government', tier: 1 },
      { name: 'WHO India — Cancer Country Profile 2024', url: 'https://who.int/india/health-topics/cancer', type: 'international', tier: 1 },
      { name: 'Lancet Oncology — Global Cancer Disparities Series (2025)', url: 'https://thelancet.com/journals/lanonc', type: 'research', tier: 2 },
      { name: 'World Bank — UHC Service Coverage Index', url: 'https://worldbank.org/uhc', type: 'international', tier: 1 },
    ],
    charts: [
      {
        type: 'bar', title: 'Top 10 Most Common Cancers Worldwide (2024) — New Cases', data: [
          { cancer: 'Lung', cases: 2600000 },
          { cancer: 'Breast', cases: 2400000 },
          { cancer: 'Colorectal', cases: 2000000 },
          { cancer: 'Prostate', cases: 1500000 },
          { cancer: 'Stomach', cases: 968000 },
          { cancer: 'Liver', cases: 866000 },
          { cancer: 'Cervical', cases: 661000 },
          { cancer: 'Oesophageal', cases: 511000 },
          { cancer: 'Thyroid', cases: 500000 },
          { cancer: 'Bladder', cases: 478000 },
        ], xKey: 'cancer', yKey: 'cases' },
      {
        type: 'bar', title: 'Cancer Deaths by Type (2024)', data: [
          { cancer: 'Lung', deaths: 1860000 },
          { cancer: 'Colorectal', deaths: 918000 },
          { cancer: 'Liver', deaths: 758000 },
          { cancer: 'Breast', deaths: 694000 },
          { cancer: 'Stomach', deaths: 660000 },
          { cancer: 'Pancreatic', deaths: 489000 },
          { cancer: 'Oesophageal', deaths: 445000 },
          { cancer: 'Prostate', deaths: 402000 },
          { cancer: 'Cervical', deaths: 350000 },
          { cancer: 'Leukaemia', deaths: 311000 },
        ], xKey: 'cancer', yKey: 'deaths' },
      {
        type: 'bar', title: 'Breast Cancer 5-Year Survival: High-Income vs Low-Income Countries', data: [
          { country_group: 'High Income (e.g. US, Japan, Sweden)', survival: 87 },
          { country_group: 'Upper-Middle Income (e.g. Brazil, China)', survival: 72 },
          { country_group: 'Lower-Middle Income (e.g. India, Indonesia)', survival: 56 },
          { country_group: 'Low Income (e.g. Uganda, Nepal)', survival: 42 },
        ], xKey: 'country_group', yKey: 'survival' },
      {
        type: 'line', title: 'Projected Global Cancer Cases (2024–2050)', data: [
          { year: 2024, projected: 20.6 },
          { year: 2030, projected: 23.5 },
          { year: 2035, projected: 26.1 },
          { year: 2040, projected: 28.9 },
          { year: 2045, projected: 31.9 },
          { year: 2050, projected: 35.0 },
        ], xKey: 'year', yKey: 'projected' },
      {
        type: 'bar', title: 'Projected % Increase in Cancer Cases by HDI Level (2022–2050)', data: [
          { hdi_group: 'Low HDI', increase: 142 },
          { hdi_group: 'Medium HDI', increase: 99 },
          { hdi_group: 'High HDI', increase: 82 },
          { hdi_group: 'Very High HDI', increase: 56 },
        ], xKey: 'hdi_group', yKey: 'increase' },
      {
        type: 'bar', title: 'India — Top 5 Cancers by Incidence (2024)', data: [
          { cancer_type: 'Breast (Female)', cases: 194000 },
          { cancer_type: 'Oral (Male & Female)', cases: 143000 },
          { cancer_type: 'Cervical (Female)', cases: 130000 },
          { cancer_type: 'Lung (Male & Female)', cases: 122000 },
          { cancer_type: 'Colorectal', cases: 85000 },
        ], xKey: 'cancer_type', yKey: 'cases' },
      {
        type: 'bar', title: 'Radiotherapy Access Gap: Machines per Million Population', data: [
          { region: 'High-Income Countries', machines_per_million: 10 },
          { region: 'Upper-Middle Income', machines_per_million: 4 },
          { region: 'Lower-Middle Income', machines_per_million: 1.5 },
          { region: 'Low-Income Countries', machines_per_million: 0.67 },
        ], xKey: 'region', yKey: 'machines_per_million' },
    ],
    faq: [
      { question: 'What is the WHO Global Status Report on Cancer 2026?', answer: 'It is the most comprehensive global assessment of the cancer burden ever published by the World Health Organization. Released July 8, 2026, it covers incidence and mortality data from GLOBOCAN 2024 across all 194 WHO member states, analyses national capacities for cancer prevention, diagnosis, and treatment, and presents seven recommendations organized around three strategic shifts: Better Capabilities, Better Protections, and Better Value.' },
      { question: 'How many people get cancer each year?', answer: '20.6 million people were diagnosed with cancer in 2024 (19.5 million excluding non-melanoma skin cancer). Nearly 10 million died. The WHO projects this will rise to 35 million new cases annually by 2050 — a 70% increase driven primarily by population ageing and growth.' },
      { question: 'Which cancers kill the most people?', answer: 'Lung cancer is the deadliest, causing 1.86 million deaths in 2024 — more than breast, prostate, and cervical cancers combined. Colorectal (918,000 deaths), liver (758,000), and breast (694,000) round out the top five.' },
      { question: 'Why is the cancer burden growing so fast?', answer: 'Three drivers: (1) Population ageing — cancer risk rises steeply with age, and the global population over 60 is projected to double by 2050; (2) Adoption of cancer-associated lifestyles — tobacco use, processed diets, physical inactivity, and alcohol consumption are rising in low- and middle-income countries; (3) Air pollution — classified as a Group 1 carcinogen, ambient and household air pollution contributes to rising lung cancer rates in non-smoking populations, particularly in Asia.' },
      { question: 'What is the survival gap between rich and poor countries?', answer: 'The gap is widest for breast cancer: 87% 5-year survival in high-income countries versus 42% in low-income countries. For all cancers combined, survival in high-income countries is roughly double that in low-income countries. The gap is driven by late-stage diagnosis (70% of cancers in LICs are caught at Stage III or IV), limited access to surgery, radiotherapy, and chemotherapy, and near-zero access to newer targeted therapies and immunotherapies.' },
      { question: 'What is India\'s cancer situation?', answer: 'India recorded 15.6 lakh new cancer cases and 8.74 lakh deaths in 2024. The lifetime risk is 11% (1 in 9), though Mizoram has the highest state-level risk at 21% for men and 19% for women. Oral cancer is the most common cancer among Indian men (linked to smokeless tobacco use), while breast cancer is the most common among women. Tobacco-related cancers account for 27% of India\'s total cancer burden.' },
      { question: 'What are the WHO\'s three strategic shifts?', answer: 'The report recommends three shifts: (1) Better Capabilities — investing in oncology workforce training, expanding radiotherapy infrastructure, and strengthening cancer registries; (2) Better Protections — implementing proven prevention measures (tobacco taxes, HPV vaccination, hepatitis B vaccination, air pollution control), expanding screening programmes, and including cancer in UHC packages; (3) Better Value — using cost-effectiveness analysis to prioritize interventions, negotiating bulk pricing for essential cancer medicines, and leveraging innovation platforms for affordable diagnostics.' },
      { question: 'How many children get cancer?', answer: 'Approximately 400,000 children are diagnosed with cancer each year. In high-income countries, childhood cancer survival exceeds 80%, but in low-income countries, it falls below 30%. The gap is largely due to delayed diagnosis, limited paediatric oncology expertise, and lack of access to essential chemotherapy drugs.' },
    ],
    relatedStories: [
      { slug: 'ayushman-bharat', headline: 'Ayushman Bharat: The World\'s Largest Health Insurance Experiment at 10', summary: 'How India\'s flagship health insurance scheme addresses cancer treatment access for 55 crore beneficiaries.', publishedAt: '2026-08-08T06:00:00Z', readingTime: 14, evidenceScore: 91, category: 'health' },
      { slug: 'anganwadi-icds', headline: 'Anganwadi Centres: India\'s Frontline Nutrition Workers Are Burning Out', summary: 'Malnutrition and its link to non-communicable disease risk in India.', publishedAt: '2026-07-28T06:00:00Z', readingTime: 11, evidenceScore: 84, category: 'health' },
    ],
    relatedEntities: [
      { id: 'who', slug: 'who', name: 'World Health Organization',image: '/images/entities/who.jpg',  type: 'organization', description: 'Publisher of the Global Status Report on Cancer 2026.' },
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story33.slug, story33);

  // ── Story 34: US-Iran War / Strait of Hormuz Crisis ─────────────────

  const story34: APIStory = {
    id: 'us-iran-war-strait-of-hormuz',
    slug: 'us-iran-war-strait-of-hormuz',
    headline: 'The Strait of Hormuz War: How the US-Iran Conflict Broke Global Energy Markets',
    summary: 'The US-Iran war that began February 28, 2026 has become the most disruptive geopolitical event since the Iraq invasion. With the Strait of Hormuz effectively closed for over 130 days, 20 million barrels per day of oil trade severed, and Brent crude oscillating between $77 and $98 per barrel, the conflict has exposed India\'s structural vulnerability: 46% of crude imports, 50% of LNG, and 90% of LPG transit the Gulf corridor. The ceasefire collapsed July 9 after US strikes on 90 Iranian targets, Trump declaring the deal "over," and Iran retaliating against US bases in Bahrain and Kuwait. India has activated its RELIEF scheme and accelerated oil diversification — but the deeper question is whether any hedge can replace the world\'s most critical energy chokepoint.',
    heroImage: '/images/stories/us-iran-war-strait-of-hormuz.jpg',
    publishedAt: '2026-07-11T12:00:00Z',
    updatedAt: '2026-07-11T12:00:00Z',
    readingTime: 16,
    wordCount: 5600,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 92,
    category: 'geopolitics',
    tags: ['US-Iran War', 'Strait of Hormuz', 'oil prices', 'energy security', 'Middle East', 'India energy', 'geopolitics', 'supply chain', 'Brent crude', 'modi diplomacy'],
    relatedTopicIds: ['geopolitics', 'economy'],
    keyPoints: [
      'War began February 28 when Israel killed Supreme Leader Khamenei with US intelligence support, triggering a two-month air war and Iran\'s seizure of the Strait of Hormuz',
      'Strait of Hormuz traffic collapsed by 95% — from 130-140 vessels per day to fewer than 10; over 600 vessels including 325 oil tankers stranded in the Gulf',
      'Brent crude hit $98/barrel at peak; US gasoline up 40% since war began; India\'s oil import bill rose an estimated $2.5 billion per month',
      'A 60-day MOU ceasefire in late June collapsed July 7-9 after Iran struck three commercial vessels and the US retaliated hitting 90+ targets',
      'India imports 46% of crude oil, 50% of LNG, and 90% of LPG from Gulf producers via the Hormuz corridor — the highest proportionate exposure of any major economy',
      'India launched the ₹1 trillion RELIEF scheme for Gulf shipping disruption and expanded oil imports from Russia (2.66M bpd in June, up 39% from May) and UAE',
      'PM Modi\'s three-nation tour (Indonesia, Australia, New Zealand, July 6-11) focused on Indo-Pacific maritime security and energy diversification',
      'Analysts project Brent could reach $170-200/barrel if the strait remains closed for a sustained period with no diplomatic resolution',
    ],
    timeline: [
      { date: '2026-02-28', title: 'War Begins: Khamenei Killed', description: 'Israel, with US intelligence support, kills Supreme Leader Ayatollah Ali Khamenei. US launches two-month air war against Iran. Iran\'s IRGC seizes control of the Strait of Hormuz.', source: 'ABC News / CENTCOM' },
      { date: '2026-03-01', title: 'Strait of Hormuz Closed', description: 'Iran\'s Revolutionary Guards Navy asserts military control over the strait. Daily vessel crossings collapse from 130-140 to fewer than 10. 600+ vessels stranded.', source: 'Strait of Hormuz Monitor' },
      { date: '2026-04-08', title: 'Ceasefire Agreed', description: 'US and Iran agree to a two-week ceasefire mediated by Pakistan. Iran agrees to reopen the strait. Both sides claim victory.', source: 'ABC News' },
      { date: '2026-04-09', title: 'Ceasefire Collapses Within Hours', description: 'Israel attacks Lebanon. Iran re-closes the strait, accusing Israel of violating ceasefire terms. US-Iran trade conflicting statements.', source: 'ABC News / Reuters' },
      { date: '2026-04-11', title: 'US Naval Blockade', description: 'US-Iran talks in Pakistan fail. US announces naval blockade of the strait and begins mine-clearing operations. Iran warns military vessels will be treated as ceasefire breach.', source: 'Global Security' },
      { date: '2026-06-08', title: 'Iran Strikes US Bases', description: 'Iran launches ballistic missiles at Israel after Israeli strike on Lebanon. Iran strikes US bases in Bahrain, Kuwait, and Jordan. Brent crude surges toward $98/barrel.', source: 'CNBC / Kurdistan24' },
      { date: '2026-06-29', title: '60-Day MOU Signed', description: 'US and Iran sign Memorandum of Understanding extending the ceasefire framework for 60 days. Iran agrees to limited transit under quota system, charging estimated $1M per vessel.', source: 'ABC News / EU Council' },
      { date: '2026-07-04', title: 'Khamenei Funeral Held', description: 'Multi-day state funeral for Khamenei across Tehran, Qom, Mashhad, Najaf and Karbala. Talks formally paused until July 9. New Supreme Leader Mojtaba Khamenei\'s status uncertain.', source: 'Strait of Hormuz Monitor' },
      { date: '2026-07-07', title: 'Iran Strikes Commercial Vessels', description: 'Iran attacks three commercial ships in the strait. US retaliates with strikes on 80+ Iranian targets. Trump declares ceasefire "over" at NATO summit in Ankara.', source: 'Global Security / ABC News' },
      { date: '2026-07-09', title: 'Full Escalation', description: 'US hits 90 targets across southern and northeast Iran, including two bridges. Iran retaliates striking 85 US military sites in Bahrain and Kuwait. Treasury revokes Iran oil sanctions waiver.', source: 'ABC News / Global Security' },
    ],
    facts: [
      { label: 'Days Since War Began', value: '130+', source: 'Strait of Hormuz Monitor' },
      { label: 'Pre-War Daily Vessel Crossings', value: '130-140', source: 'LSEG / Kpler' },
      { label: 'Current Daily Crossings', value: '~10 (down 95%)', source: 'Strait of Hormuz Monitor' },
      { label: 'Vessels Stranded in Gulf', value: '600+ (325 tankers)', source: 'Mappr / IMO' },
      { label: 'Oil Transit Through Hormuz', value: '~20M barrels/day (20% of global)', source: 'US EIA' },
      { label: 'Brent Crude Peak (2026)', value: '$98/barrel', source: 'CNBC / ICE' },
      { label: 'Brent Crude Post-Ceasefire Low', value: '$76-77/barrel', source: 'Discovery Alert' },
      { label: 'US Gasoline Price Increase', value: '40% since Feb 28', source: 'AAA / CNBC' },
      { label: 'India Crude Imports via Hormuz', value: '46% of total', source: 'Discovery Alert / PPAC' },
      { label: 'India LNG Imports via Hormuz', value: '50%+', source: 'Discovery Alert' },
      { label: 'India LPG Imports via Hormuz', value: '90%', source: 'Discovery Alert' },
      { label: 'India Oil Imports from Russia (June)', value: '2.66M bpd (up 39%)', source: 'Kpler / Times Now' },
      { label: 'India Oil Imports from UAE (June)', value: '6.36 lakh bpd (near record)', source: 'Kpler / Times Now' },
      { label: 'Stranded Sailors in Danger Zone', value: '~11,000', source: 'IMO' },
      { label: 'Freight Surcharges on Gulf Routes', value: 'Up to $3,000/FEU', source: 'SeaVantage' },
    ],
    claims: [
      { claim: 'The Strait of Hormuz carries approximately 20% of global seaborne oil trade daily.', source: 'US Energy Information Administration', verification: 'true', explanation: 'EIA data confirms approximately 20-21 million barrels per day transit the strait, representing roughly 20% of global petroleum liquids consumption and 25% of total seaborne oil trade. This is consistent across multiple independent sources including IEA and LSEG.', confidence: 0.97 },
      { claim: 'India has diversified 70% of its crude imports away from the Hormuz corridor.', source: 'Ministry of Petroleum and Natural Gas Secretary Neeraj Mittal', verification: 'true', explanation: 'As of March 2026, approximately 70% of India\'s crude imports arrive via alternative maritime routes, up from 55% the previous year. However, this statistic masks continued indirect exposure: alternative routes still source Gulf crude that transits other chokepoints, and LPG dependence remains at 90%.', confidence: 0.85 },
      { claim: 'Brent crude could reach $170-200 per barrel if the strait remains fully closed.', source: 'Multiple Analyst Models', verification: 'true', explanation: 'Scenario modelling by multiple analysts projects Brent crude reaching $170-200 per barrel within weeks to months under a sustained full closure, depending on SPR deployment and non-Gulf producer response. Historical analogues (1973 embargo: prices quadrupled) support these projections.', confidence: 0.78 },
      { claim: 'The ceasefire MOU was working until Israel\'s actions in Lebanon sabotaged it.', source: 'Iranian Officials', verification: 'misleading', explanation: 'The ceasefire was always fragile. While Israeli strikes on Lebanon (April 8 and June 8) triggered Iranian responses, the MOU\'s collapse on July 7 was preceded by Iran striking three commercial vessels — an act that directly violated the strait reopening terms. Both sides contributed to the breakdown.', confidence: 0.82 },
      { claim: 'India\'s oil import costs have increased by $2.5 billion per month since the war began.', source: 'The Breakdown Estimate', verification: 'true', explanation: 'Based on India importing ~4.4M bpd crude oil and crude prices averaging ~$25/barrel higher since Feb 28 compared to pre-war levels, the additional monthly import cost is approximately $2.5 billion. This is consistent with industry analyst estimates.', confidence: 0.80 },
      { claim: 'The IRGC is charging $1 million+ per vessel to transit the strait.', source: 'SeaVantage / Strait of Hormuz Monitor', verification: 'true', explanation: 'Multiple shipping intelligence sources report Iran is limiting crossings and charging tolls reported to exceed $1 million per vessel. Iran\'s chief negotiator Ghalibaf confirmed on July 6 that the strait will "never return to pre-war status" and that Iran agreed not to charge transit fees for 60 days only "at the insistence of Gulf Arab states."', confidence: 0.84 },
      { claim: 'The US Senate passed a war-powers resolution against the conflict.', source: 'Congressional Record', verification: 'true', explanation: 'The Senate voted 50-48 on June 23, 2026 to pass a war-powers resolution directing the President to remove US forces from hostilities absent a declaration of war. The administration\'s position that hostilities "have terminated" was directly contradicted by the July 7-9 resumption of sustained strikes.', confidence: 0.91 },
    ],
    sources: [
      { name: 'ABC News — US-Iran Ceasefire Timeline', url: 'https://abcnews.com/us-iran-ceasefire-timeline', type: 'news', tier: 1 },
      { name: 'Strait of Hormuz Monitor — Crisis Timeline', url: 'https://hormuzstraitmonitor.com/crisis-timeline/', type: 'research', tier: 1 },
      { name: 'Global Security — Iran War 2026 Day 131 Update', url: 'https://globalsecurity.org/military/ops/iran-war-oprep.htm', type: 'research', tier: 1 },
      { name: 'US Energy Information Administration — Strait of Hormuz', url: 'https://eia.gov', type: 'government', tier: 1 },
      { name: 'SeaVantage — Strait of Hormuz Crisis Shipping Impact', url: 'https://seavantage.com/blog/strait-of-hormuz-crisis-2026', type: 'industry', tier: 2 },
      { name: 'Discovery Alert — India Oil Imports & Strait of Hormuz', url: 'https://discoveryalert.com.au', type: 'research', tier: 2 },
      { name: 'Kpler / Times Now — India Oil Import Data', url: 'https://timesnownews.com', type: 'news', tier: 2 },
      { name: 'CNBC — Oil Markets & Iran War Coverage', url: 'https://cnbc.com', type: 'news', tier: 1 },
      { name: 'IEA — Energy Infrastructure Damage Assessment', url: 'https://iea.org', type: 'international', tier: 1 },
      { name: 'Mappr — Strait of Hormuz Crisis 2026 Interactive Map', url: 'https://mappr.co/strait-of-hormuz-crisis-2026/', type: 'research', tier: 2 },
    ],
    charts: [
      {
        type: 'line', title: 'Brent Crude Oil Price Volatility (Jan-Jul 2026)', data: [
          { month: 'Jan', price: 74 }, { month: 'Feb', price: 72 },
          { month: 'Mar', price: 88 }, { month: 'Apr', price: 94 },
          { month: 'May', price: 85 }, { month: 'Jun', price: 96 },
          { month: 'Jul 7', price: 98 }, { month: 'Jul 10', price: 93 },
        ], xKey: 'month', yKey: 'price' },
      {
        type: 'bar', title: 'India\'s Oil Import Dependence on Hormuz Corridor', data: [
          { commodity: 'Crude Oil', dependence_pct: 46 },
          { commodity: 'LNG (Natural Gas)', dependence_pct: 50 },
          { commodity: 'LPG (Cooking Gas)', dependence_pct: 90 },
        ], xKey: 'commodity', yKey: 'dependence_pct' },
      {
        type: 'bar', title: 'Top Hormuz-Dependent Economies (Crude Imports)', data: [
          { country: 'China', share_of_hormuz_flows: 37.7 },
          { country: 'India', share_of_hormuz_flows: 14.7 },
          { country: 'South Korea', share_of_hormuz_flows: 12.0 },
          { country: 'Japan', share_of_hormuz_flows: 10.9 },
        ], xKey: 'country', yKey: 'share_of_hormuz_flows' },
      {
        type: 'bar', title: 'India\'s Crude Import Diversification (Sources)', data: [
          { source: 'Russia (June 2026)', bpd: 2660000 },
          { source: 'Iraq (Pre-War Avg)', bpd: 1000000 },
          { source: 'Saudi Arabia (Pre-War Avg)', bpd: 800000 },
          { source: 'UAE (June 2026)', bpd: 636000 },
          { source: 'Kuwait', bpd: 400000 },
          { source: 'Others', bpd: 500000 },
        ], xKey: 'source', yKey: 'bpd' },
      {
        type: 'line', title: 'Strait of Hormuz Daily Vessel Transits (2026)', data: [
          { month: 'Jan', transits: 135 }, { month: 'Feb 28', transits: 120 },
          { month: 'Mar', transits: 8 }, { month: 'Apr', transits: 12 },
          { month: 'May', transits: 25 }, { month: 'Jun', transits: 35 },
          { month: 'Jul 7', transits: 10 },
        ], xKey: 'month', yKey: 'transits' },
    ],
    faq: [
      { question: 'What started the 2026 US-Iran War?', answer: 'On February 28, 2026, Israel killed Supreme Leader Ayatollah Ali Khamenei with US intelligence support. The US and Israel launched a two-month air war against Iran. Iran\'s Revolutionary Guards responded by seizing control of the Strait of Hormuz, blocking the passage of oil tankers and commercial vessels through the world\'s most critical energy chokepoint.' },
      { question: 'What is the current status of the conflict?', answer: 'As of July 11, the conflict is in its most dangerous phase since March. A 60-day ceasefire MOU signed June 29 collapsed July 7-9 after Iran struck three commercial vessels in the strait and the US retaliated hitting 90 targets across Iran. Trump declared the ceasefire "over" at the NATO summit in Ankara. Iran struck US bases in Bahrain and Kuwait. The Treasury revoked Iran\'s oil sanctions waiver. No new talks are scheduled.' },
      { question: 'How has this affected oil prices?', answer: 'Brent crude has oscillated violently between $74 and $98 per barrel since the war began. Prices spiked ~$20/barrel in the first week of the war. US gasoline prices rose 40%. Analysts project $170-200/barrel if the strait remains fully closed. Freight surcharges of up to $3,000 per container have been applied on Gulf-linked routes.' },
      { question: 'How is India affected?', answer: 'India is the third-largest energy importer globally and disproportionately exposed: 46% of crude, 50% of LNG, and 90% of LPG transit the Hormuz corridor. The additional monthly oil import cost is approximately $2.5 billion. India has activated the ₹1 trillion RELIEF scheme, expanded Russian oil imports to 2.66M bpd (up 39%), and PM Modi\'s three-nation tour focused on maritime security.' },
      { question: 'What is India doing to diversify away from Hormuz?', answer: 'India has expanded from 27 to approximately 40 crude suppliers. Russian oil imports surged to 2.66M bpd in June. UAE imports hit near-record 6.36 lakh bpd. About 70% of crude imports now arrive via alternative routes, up from 55% pre-war. However, LPG dependence remains at 90% with no short-term alternative — a critical vulnerability for 330 million LPG-dependent households.' },
      { question: 'Could the Strait of Hormuz remain closed long-term?', answer: 'Iran\'s chief negotiator Ghalibaf stated on July 6 that the strait is "one of our greatest strategic instruments of power" and will "never return to pre-war status." Iran has effectively established a toll system. The strait remains the most contested strategic chokepoint in the world, with no stable diplomatic resolution in sight.' },
      { question: 'What are the broader economic consequences?', answer: 'Global supply chains are severely disrupted: the Cape of Good Hope rerouting adds 10-14 days per voyage. Port congestion at Singapore, Colombo, Nhava Sheva, and Mundra. War risk surcharges up to $1,500/TEU. Asian stock markets fell sharply on each escalation. Japan\'s Nikkei fell 4%+ on the June 8 escalation. S&P 500 futures declined.' },
      { question: 'What diplomatic solutions are possible?', answer: 'Pakistan had served as the primary mediator for the April ceasefire and June MOU. The EU and Gulf Arab states continue to push for negotiations. However, Iran has conditioned peace with Washington on a ceasefire in Lebanon, and the US Senate\'s war-powers resolution (50-48 vote June 23) reflects domestic opposition. The NATO summit in Ankara (July 7-8) failed to produce a breakthrough.' },
    ],
    relatedStories: [
      { slug: 'us-iran-relations',
    headline: 'US-Iran Relations: From Maximum Pressure to Nuclear Negotiations', summary: 'The diplomatic track preceding the war: JCPOA negotiations, sanctions, and the path to the 2026 Vienna talks.', publishedAt: '2026-07-18T06:00:00Z', readingTime: 14, evidenceScore: 89, category: 'politics' },
      { slug: 'supply-chain-shift', headline: 'The Great Supply Chain Shift', summary: 'How the Hormuz crisis is accelerating India\'s energy diversification and China+1 manufacturing strategy.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India',image: '/images/entities/india.jpg',  type: 'country', description: 'Republic of India — disproportionately exposed to Hormuz disruption.' },
      { id: 'un', slug: 'un', name: 'United Nations', type: 'organization', description: 'IMO called for protection of mariners; UN Security Council deadlocked.' },
    ],
  };

  stories.set(story34.slug, story34);

  // ── Story 35: EPF Scheme 2026 ─────────────────────────────────────

  const story35: APIStory = {
    id: 'epf-scheme-2026',
    slug: 'epf-scheme-2026',
    headline: 'EPF Scheme 2026: India Replaces 74-Year-Old Retirement Law Under New Social Security Code',
    summary: 'India\'s retirement framework underwent its most significant legal overhaul in seven decades when the EPF Scheme 2026 replaced the 1952 scheme effective June 29, replacing two legacy pension schemes and bringing 8 crore+ subscribers under the Code on Social Security, 2020. While the headline contribution rate stays at 12% and the interest rate at 8.25%, the new framework introduces stricter governance for exempted trusts, consolidates 13 withdrawal categories into 3, mandates 20-day pension claim settlement with 12% interest penalty for delays, and gives the government power to temporarily defer contributions during national emergencies. For most subscribers, nothing changes on day one — but the compliance architecture has been rewritten.',
    heroImage: '/images/stories/us-iran-relations.jpg',
    publishedAt: '2026-07-11T10:00:00Z',
    updatedAt: '2026-07-11T10:00:00Z',
    readingTime: 14,
    wordCount: 5000,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 91,
    category: 'economy',
    tags: ['EPF', 'EPS', 'EDLI', 'Social Security Code', 'retirement', 'labour code', 'EPFO', 'pension', 'India economy', 'provident fund'],
    relatedTopicIds: ['economy', 'policy'],
    keyPoints: [
      'EPF Scheme 2026 replaces the 1952 scheme under the Code on Social Security, 2020 — the most consequential legal overhaul of India\'s retirement framework in 74 years',
      'Employee contribution rate unchanged at 12% of wages; mandatory minimum ₹1,800/month for those earning ₹15,000+; EPF interest rate held at 8.25% for FY 2025-26',
      '13 partial withdrawal categories consolidated into 3 simplified buckets: illness, education-marriage, and housing',
      'EPS-95 and the 1971 Family Pension Scheme replaced by unified EPS 2026; formula unchanged, minimum pension stays at ₹1,000/month',
      'Pension claims must be settled within 20 days; EPFO faces 12% interest penalty for delays beyond this window without sufficient cause',
      'Exempted private PF trusts face stricter governance: mandatory digital disclosures, annual audits, dematerialised investments, and trustee eligibility rules',
      'Central government can temporarily reduce or defer EPF contributions for up to 3 months during pandemics, epidemics, and national disasters',
      'EPFO assets exceeded ₹28.34 lakh crore as of March 2025, with 1.22 crore new members enrolled in FY 2024-25',
    ],
    timeline: [
      { date: '1952-01-01', title: 'EPF Scheme 1952 Enacted', description: 'The Employees\' Provident Funds and Miscellaneous Provisions Act, 1952 established India\'s mandatory retirement savings framework for organised-sector workers.', source: 'EPFO' },
      { date: '1971-01-01', title: 'Employees\' Family Pension Scheme', description: 'Government introduces the Family Pension Scheme, 1971, providing pension benefits to families of deceased EPF members.', source: 'EPFO' },
      { date: '1995-11-16', title: 'EPS-95 Replaces FPS-71', description: 'Employees\' Pension Scheme, 1995 replaces the 1971 Family Pension Scheme, introducing the current pension formula and 8.33% employer contribution structure.', source: 'EPFO' },
      { date: '2020-09-28', title: 'Code on Social Security Passed', description: 'Parliament passes the Code on Social Security, 2020, consolidating 9 social security laws including EPF, EPS, and EDLI into a single legal framework.', source: 'Ministry of Labour and Employment' },
      { date: '2025-11-21', title: 'Labour Codes Come Into Force', description: 'The Code on Social Security, 2020 and three other labour codes take effect, replacing nine older labour statutes in one stroke.', source: 'Ministry of Labour and Employment' },
      { date: '2026-03-03', title: 'EPFO Board Approves New Schemes', description: 'EPFO\'s Central Board of Trustees approves EPF Scheme 2026, EPS 2026, and EDLI 2026. Interest rate maintained at 8.25% for FY 2025-26 despite global uncertainty from the Iran war.', source: 'OneIndia / EPFO' },
      { date: '2026-06-29', title: 'EPF Scheme 2026 Notified', description: 'Ministry of Labour notifies EPF Scheme 2026 (G.S.R. 525(E)), EPS 2026 (G.S.R. 527(E)), and EDLI 2026 (G.S.R. 526(E)) in the Official Gazette, replacing the 1952 framework.', source: 'Gazette of India' },
      { date: '2026-07-01', title: 'Scheme Takes Effect', description: 'EPF Scheme 2026 comes into full effect. Existing subscribers automatically transition. New employees enrolled under the new framework from this date.', source: 'Moneycontrol / ET' },
    ],
    facts: [
      { label: 'EPF Subscribers', value: '8 crore+', source: 'EPFO Annual Report' },
      { label: 'EPFO Total Assets (March 2025)', value: '₹28.34 lakh crore', source: 'EPFO' },
      { label: 'EPF Interest Rate (FY 2025-26)', value: '8.25%', source: 'EPFO CBT' },
      { label: 'Employee Contribution Rate', value: '12% of wages', source: 'EPF Scheme 2026' },
      { label: 'Employer Contribution Rate', value: '12% of wages (3.67% EPF + 8.33% EPS + 0.50% EDLI)', source: 'EPF Scheme 2026' },
      { label: 'Mandatory Minimum Contribution', value: '₹1,800/month', source: 'EPF Scheme 2026' },
      { label: 'Statutory Wage Ceiling', value: '₹15,000/month', source: 'EPF Scheme 2026' },
      { label: 'Pension Claim Settlement Deadline', value: '20 days', source: 'EPS 2026' },
      { label: 'Penalty for EPFO Delay', value: '12% interest per annum', source: 'EPS 2026' },
      { label: 'Minimum Monthly Pension', value: '₹1,000 (unchanged)', source: 'EPS 2026' },
      { label: 'New Members Enrolled (FY 2024-25)', value: '1,22,89,244', source: 'EPFO' },
      { label: 'New Establishments Covered (FY 2024-25)', value: '2,86,894', source: 'EPFO' },
      { label: 'Claims Settled (FY 2024-25)', value: '6,01,59,608', source: 'EPFO' },
      { label: 'Pensioners Served', value: '81,48,490', source: 'EPFO' },
      { label: 'EPFO Income Deficit (FY 2025-26)', value: '₹944 crore', source: 'EPFO CBT' },
      { label: 'Inoperative Accounts (₹1,000 or less)', value: '1.33 lakh accounts (₹5.68 crore)', source: 'EPFO' },
    ],
    claims: [
      { claim: 'The EPF Scheme 2026 changes the employee contribution rate from 12% to a new rate.', source: 'Social Media Rumours', verification: 'false', explanation: 'The employee contribution rate remains unchanged at 12% of wages for most establishments (10% for notified establishments). The new scheme formalizes the existing ₹15,000 wage ceiling and ₹1,800 mandatory minimum contribution. No rate change was introduced.', confidence: 0.97 },
      { claim: 'The EPF interest rate of 8.25% for FY 2025-26 is risk-free and guaranteed by the government.', source: 'Common Understanding', verification: 'true', explanation: 'The EPF interest rate is set annually by the Central Board of Trustees and notified by the government. While not statutorily guaranteed like a bond coupon, the government has never defaulted on EPF interest payments. EPFO\'s assets of ₹28.34 lakh crore provide substantial backing. The rate significantly outperforms bank FDs (SBI 5-year FD: ~6-6.5%).', confidence: 0.88 },
      { claim: 'EPS pension will be processed within 20 days or EPFO pays 12% interest penalty.', source: 'EPS 2026 Notification', verification: 'true', explanation: 'EPS 2026 mandates that pension claims must be settled within 20 days of application. If EPFO delays without sufficient cause, it must pay 12% interest per annum on the delayed amount. This is a significant governance improvement over EPS-95, which had no statutory claim timeline.', confidence: 0.93 },
      { claim: 'The minimum monthly pension under EPS 2026 has been increased from ₹1,000.', source: 'Speculation', verification: 'false', explanation: 'The minimum monthly pension remains at ₹1,000, unchanged from EPS-95. Labour unions and experts had demanded an increase to at least ₹3,000-5,000. The notification does not address this long-standing demand.', confidence: 0.95 },
      { claim: 'Existing EPF subscribers need to re-register under the new scheme.', source: 'Misinformation', verification: 'false', explanation: 'Existing EPF subscribers under the 1952 scheme are automatically transitioned to the 2026 scheme. There is no requirement for re-registration, new KYC, or any action from existing members. Account balances and accumulated benefits continue without interruption.', confidence: 0.98 },
      { claim: 'The government can temporarily reduce EPF contributions during emergencies.', source: 'EPF Scheme 2026 Notification', verification: 'true', explanation: 'The new scheme gives the central government power to temporarily reduce or defer EPF contributions for up to 3 months during pandemics, epidemics, and national disasters. This is a new provision not present in the 1952 scheme, providing fiscal flexibility during crises.', confidence: 0.94 },
      { claim: 'EPF tax-free compounding generates significantly more wealth than bank FDs over long periods.', source: 'Financial Analysis', verification: 'true', explanation: 'A worker investing ₹3,000 monthly for 30 years accumulates approximately ₹47 lakh in EPF at 8.25% versus ~₹33 lakh in a bank FD at 6.5% — a 42% gap of over ₹14 lakh. This gap widens further when accounting for EPF\'s tax-free compounding versus taxable FD interest.', confidence: 0.91 },
    ],
    sources: [
      { name: 'EPF Scheme 2026 — Gazette Notification G.S.R. 525(E)', url: 'https://labour.gov.in', type: 'government', tier: 1 },
      { name: 'EPS 2026 — Gazette Notification G.S.R. 527(E)', url: 'https://labour.gov.in', type: 'government', tier: 1 },
      { name: 'EDLI 2026 — Gazette Notification G.S.R. 526(E)', url: 'https://labour.gov.in', type: 'government', tier: 1 },
      { name: 'Economic Times — EPF Scheme 2026 Analysis', url: 'https://economictimes.indiatimes.com/wealth/invest/epf-scheme-2026-replaces-epf-scheme-1952', type: 'news', tier: 1 },
      { name: 'Moneycontrol — EPF Scheme 2026 Changes', url: 'https://moneycontrol.com/news/business/personal-finance/epf-scheme-2026-notified', type: 'news', tier: 1 },
      { name: 'WION — India\'s New EPF Rules 2026 Explained', url: 'https://wionews.com/india-news/epf-scheme-2026-new-pf-rules', type: 'news', tier: 2 },
      { name: 'Kustodian — EPF Scheme 2026 Complete Guide', url: 'https://kustodian.life/provident-fund/epfo-latest-news/epf-scheme-2026', type: 'industry', tier: 2 },
      { name: 'EPFO Annual Report 2024-25', url: 'https://epfindia.gov.in', type: 'government', tier: 1 },
      { name: 'Mint — EPS 2026 Replaces EPS-95', url: 'https://livemint.com/money/personal-finance/eps2026-replaces-eps-95', type: 'news', tier: 1 },
      { name: 'Code on Social Security, 2020 — Ministry of Labour', url: 'https://labour.gov.in', type: 'government', tier: 1 },
    ],
    charts: [
      {
        type: 'bar', title: 'EPF vs Bank FD: ₹3,000/month for 30 Years', data: [
          { investment_type: 'EPF at 8.25%', corpus: 4700000 },
          { investment_type: 'Bank FD at 6.5%', corpus: 3300000 },
        ], xKey: 'investment_type', yKey: 'corpus' },
      {
        type: 'bar', title: 'EPFO Key Operational Metrics (FY 2024-25)', data: [
          { metric: 'New Members Enrolled (lakhs)', count: 122.9 },
          { metric: 'New Establishments (thousands)', count: 286.9 },
          { metric: 'Claims Settled (crores)', count: 6.02 },
          { metric: 'Pensioners Served (lakhs)', count: 81.5 },
        ], xKey: 'metric', yKey: 'count' },
      {
        type: 'bar', title: 'EPF Contribution Structure (Monthly, ₹15,000 Wage)', data: [
          { component: 'Employee EPF (12%)', amount: 1800 },
          { component: 'Employer EPF (3.67%)', amount: 550 },
          { component: 'Employer EPS (8.33%)', amount: 1250 },
          { component: 'Employer EDLI (0.50%)', amount: 75 },
        ], xKey: 'component', yKey: 'amount' },
      {
        type: 'line', title: 'EPF Interest Rate Trend (2019-2026)', data: [
          { year: '2019-20', rate: 8.50 }, { year: '2020-21', rate: 8.50 },
          { year: '2021-22', rate: 8.10 }, { year: '2022-23', rate: 8.15 },
          { year: '2023-24', rate: 8.25 }, { year: '2024-25', rate: 8.25 },
          { year: '2025-26', rate: 8.25 },
        ], xKey: 'year', yKey: 'rate' },
    ],
    faq: [
      { question: 'What is the EPF Scheme 2026?', answer: 'The Employees\' Provident Funds Scheme, 2026, notified on June 29, 2026, replaces the 74-year-old EPF Scheme 1952 as the legal framework governing provident fund contributions, accounts, and withdrawals for India\'s organised-sector workforce. It is the first major overhaul of EPF law and brings the scheme under the Code on Social Security, 2020.' },
      { question: 'Do I need to take any action as an existing EPF member?', answer: 'No. Existing EPF subscribers under the 1952 scheme automatically become members under the 2026 scheme. Your UAN, account balance, and accumulated benefits continue without interruption. There is no requirement to re-register or submit new documents.' },
      { question: 'What actually changed for employees?', answer: 'The contribution rate (12%), wage ceiling (₹15,000), and interest rate (8.25%) remain unchanged. The main changes are: 13 partial withdrawal categories simplified to 3 (illness, education-marriage, housing); stricter governance for exempted private PF trusts; digital compliance formalized; and the government can temporarily reduce contributions during national emergencies.' },
      { question: 'What changed for pension (EPS)?', answer: 'EPS 2026 replaces EPS-95 and the 1971 Family Pension Scheme. The pension formula, minimum pension (₹1,000), and contribution structure (8.33% employer) stay the same. Key improvements: pension claims must be settled within 20 days; EPFO pays 12% interest penalty for delays; and the higher-pension framework (post-Supreme Court) now has firmer statutory footing.' },
      { question: 'Is the EPF interest rate changing under the new scheme?', answer: 'No. The EPF interest rate remains at 8.25% for FY 2025-26, as recommended by the EPFO Central Board of Trustees in March 2026. The rate is set annually and is independent of the scheme change. EPF has consistently outperformed bank FDs by 1.75-2% annually.' },
      { question: 'What is the VISHWAS and AMNESTY compliance window?', answer: 'The EPF Scheme 2026 introduces three time-bound compliance windows: (1) Enrolment Campaign — deadline October 31, 2026 for enrolling previously uncovered employees; (2) VISHWAS — voluntary disclosure of disputed damages; (3) AMNESTY — for informal PF trusts to regularize compliance. These are available for 6 months from notification, extendable by 6 more.' },
      { question: 'How does the government\'s emergency power to reduce contributions work?', answer: 'The new scheme allows the central government to temporarily reduce or defer EPF contributions for up to 3 months during pandemics, epidemics, and national disasters. This provision did not exist under the 1952 scheme. It provides fiscal flexibility during crises without permanently changing the contribution structure.' },
      { question: 'What happens to exempted PF trusts under the new scheme?', answer: 'Exempted private PF trusts face significantly stricter governance: mandatory electronic accounting, annual audits, dematerialised investments, investment reporting, online disclosures, penalties for delayed reporting, and formal procedures for renewing exemptions. Trusts cannot declare interest rates exceeding the central government rate by more than 2%.' },
    ],
    relatedStories: [
      { slug: 'rbi-repo-rate', headline: 'RBI Holds Repo Rate: Inflation Targeting in an Uncertain Global Economy', summary: 'How monetary policy intersects with social security and retirement savings in India\'s macroeconomic framework.', publishedAt: '2026-07-25T06:00:00Z', readingTime: 12, evidenceScore: 88, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
    ],
  };

  stories.set(story35.slug, story35);

  /* ── Story 36: Youth Mental Health Crisis ───────────────────────────── */

  const story36: APIStory = {
    id: 'youth-mental-health-crisis',
    slug: 'youth-mental-health-crisis',
    headline: 'Youth Mental Health Crisis in India: Understanding Rising Suicide Rates',
    summary: 'India lost 13,044 children aged 14–18 to suicide in 2023 — a 36% increase from 2019. This data-driven investigation examines the systemic failures in mental health infrastructure, the pressure cooker of academic expectations, and the policy gaps that leave 1.5 crore adolescents without access to care.',
    heroImage: '/images/entities/india.jpg',
    publishedAt: '2026-07-11T12:00:00Z',
    updatedAt: '2026-07-11T12:00:00Z',
    readingTime: 12,
    wordCount: 4200,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 91,
    category: 'health',
    tags: ['mental health', 'teen suicide', 'adolescent mental health', 'NCRB', 'education policy', 'public health', 'depression', 'bullying', 'India health crisis'],
    relatedTopicIds: ['health', 'education', 'policy'],
    keyPoints: [
      'India reported 13,044 student suicides in 2023 — the highest ever recorded, a 36% rise from 2019',
      '1 in 7 Indian adolescents meets criteria for depression; only 12% of schools have a counsellor',
      'India has 0.3 child psychiatrists per 100,000 population — 97% below the WHO recommendation',
      'Academic pressure remains the single largest trigger, cited in 25% of cases',
      'Only 3% of India\'s health budget goes to mental health; Tele-MANAS helpline received 15 lakh calls in 2 years',
    ],
    timeline: [
      { date: '2017-04-01', title: 'Mental Healthcare Act Enacted', description: 'Guarantees right to mental healthcare for all Indians, prohibits discrimination, mandates insurance coverage for mental illness.', source: 'Ministry of Law' },
      { date: '2020-07-30', title: 'NEP 2020 Mandates School Counsellors', description: 'National Education Policy 2020 calls for counsellors in every school and life skills education as part of the curriculum.', source: 'Ministry of Education' },
      { date: '2022-10-10', title: 'Tele-MANAS Helpline Launched', description: 'National mental health helpline launched on World Mental Health Day, providing 24/7 tele-counselling in 20 languages.', source: 'Ministry of Health' },
      { date: '2022-12-01', title: 'Lancet Study Highlights India Depression Crisis', description: 'Lancet Child & Adolescent Health estimates 13.7% depression prevalence among Indian adolescents aged 15–19.', source: 'The Lancet' },
      { date: '2023-09-01', title: 'NCRB Reports Record Student Suicides', description: 'NCRB\'s Accidental Deaths & Suicides in India 2023 reports 13,044 student suicides — the highest figure in a decade.', source: 'NCRB' },
      { date: '2024-03-15', title: 'RTI Reveals Counsellor Gap', description: 'Ministry of Education RTI response confirms only 12% of government schools have a counsellor, most untrained.', source: 'MoE RTI' },
      { date: '2025-04-10', title: 'Parliamentary Panel Recommends Screening', description: 'Parliamentary standing committee on health recommends mandatory annual mental health screening in all schools.', source: 'Parliament' },
      { date: '2026-03-01', title: 'Mental Health Bill Proposes Mandatory Screening', description: 'Mental Health (Amendment) Bill 2026 introduced, proposing mandatory screening in schools and colleges.', source: 'Ministry of Health' },
    ],
    facts: [
      { label: 'Student Suicides (2023)', value: '13,044', source: 'NCRB' },
      { label: 'Increase Since 2019', value: '36%', source: 'NCRB' },
      { label: 'Adolescents with Depression', value: '1 in 7', source: 'Lancet 2022' },
      { label: 'Schools with Counsellors', value: '12%', source: 'MoE RTI 2024' },
      { label: 'Child Psychiatrists per 100k', value: '0.3', source: 'WHO Atlas 2023' },
      { label: 'Health Budget for Mental Health', value: '3%', source: 'NHM 2023' },
      { label: 'Tele-MANAS Calls Received', value: '15 lakh', source: 'MoH Dashboard' },
      { label: 'Districts with DMHP', value: '30%', source: 'MoH' },
      { label: 'Top Suicide State', value: 'Maharashtra (1,571)', source: 'NCRB' },
      { label: 'Age Group Most Affected', value: '16–17 years', source: 'NCRB' },
    ],
    claims: [
      { claim: 'Student suicides in India increased by over 35% between 2019 and 2023.', source: 'NCRB ADSI Reports 2019 & 2023', verification: 'true', explanation: 'NCRB\'s Accidental Deaths & Suicides in India reports 9,600 student suicides in 2019 vs 13,044 in 2023 — a 35.9% increase. The trajectory shows consistent year-over-year growth with no single-year decline.', confidence: 0.96 },
      { claim: 'Only 12% of government schools in India have a counsellor.', source: 'Ministry of Education RTI Response 2024', verification: 'true', explanation: 'RTI response filed by The Breakdown to the Ministry of Education confirmed that only 12% of government schools have a counsellor. The majority of these counsellors are untrained in adolescent mental health.', confidence: 0.93 },
      { claim: 'Academic pressure is the leading cause of student suicides in India.', source: 'NCRB ADSI 2023', verification: 'true', explanation: 'NCRB data shows "failure in examination" and "academic pressure" as the most commonly cited cause at 25% of cases. However, experts caution that this may be the proximate trigger rather than root cause.', confidence: 0.88 },
      { claim: 'India has sufficient child psychiatrists to meet WHO standards.', source: 'Common Misconception', verification: 'false', explanation: 'WHO recommends 1 child psychiatrist per 10,000 population. India has 0.3 per 100,000 — a staggering 97% deficit. This translates to a gap of approximately 3,000 child psychiatrists.', confidence: 0.97 },
      { claim: 'The Mental Healthcare Act 2017 guarantees free mental healthcare for all.', source: 'Legal Provisions', verification: 'true', explanation: 'Section 21(4) of the Mental Healthcare Act, 2017 states that "every person with mental illness shall have a right to access mental health services at affordable cost". However, implementation varies widely by state.', confidence: 0.90 },
      { claim: 'Social media is a leading documented cause of student suicides.', source: 'Media Narratives', verification: 'misleading', explanation: 'While social media is often cited anecdotally, NCRB data does not list it as a separate category. Bullying (including cyberbullying) accounts for 12% of cases. The ICMR survey found 42% of adolescents feel "constantly judged" online, creating indirect pressure.', confidence: 0.78 },
      { claim: 'Tele-MANAS has received over 15 lakh calls since launch.', source: 'Ministry of Health Dashboard', verification: 'true', explanation: 'The Tele-MANAS helpline (launched October 2022) has cumulatively received over 15 lakh calls as of March 2026, averaging approximately 1,200 calls per day. This indicates massive unmet demand for mental health support.', confidence: 0.92 },
    ],
    sources: [
      { name: 'NCRB Accidental Deaths & Suicides in India 2023', url: 'https://ncrb.gov.in', type: 'government', tier: 1 },
      { name: 'National Mental Health Survey 2015–16 (NIMHANS)', url: 'https://nimhans.ac.in', type: 'government', tier: 1 },
      { name: 'Lancet Child & Adolescent Health — India Depression Prevalence 2022', url: 'https://thelancet.com', type: 'journal', tier: 1 },
      { name: 'ICMR Adolescent Health Survey 2023', url: 'https://icmr.gov.in', type: 'government', tier: 1 },
      { name: 'WHO Mental Health Atlas 2023', url: 'https://who.int', type: 'international', tier: 1 },
      { name: 'Ministry of Education RTI Response — School Counsellors 2024', url: 'https://education.gov.in', type: 'government', tier: 1 },
      { name: 'Tele-MANAS Ministry of Health Dashboard 2024', url: 'https://telemanas.mohfw.gov.in', type: 'government', tier: 2 },
      { name: 'Mental Healthcare Act, 2017', url: 'https://legislative.gov.in', type: 'government', tier: 1 },
      { name: 'National Education Policy 2020', url: 'https://education.gov.in', type: 'government', tier: 1 },
      { name: 'UNESCO Global Education Monitoring Report 2023', url: 'https://unesco.org', type: 'international', tier: 2 },
    ],
    charts: [
      {
        type: 'bar', title: 'Student Suicides in India (2019–2023)', data: [
          { year: '2019', count: 9600 }, { year: '2020', count: 9813 },
          { year: '2021', count: 10532 }, { year: '2022', count: 11896 },
          { year: '2023', count: 13044 },
        ], xKey: 'year', yKey: 'count' },
      {
        type: 'bar', title: 'Triggers of Student Suicides (India, 2023)', data: [
          { trigger: 'Academic Pressure', percentage: 25 },
          { trigger: 'Family Problems', percentage: 20 },
          { trigger: 'Mental Illness', percentage: 18 },
          { trigger: 'Bullying', percentage: 12 },
          { trigger: 'Relationship Issues', percentage: 8 },
          { trigger: 'Other/Unknown', percentage: 17 },
        ], xKey: 'trigger', yKey: 'percentage' },
      {
        type: 'bar', title: 'Age-wise Youth Suicide Breakdown (2023)', data: [
          { age: '14–15 years', count: 3124 },
          { age: '16–17 years', count: 5217 },
          { age: '18 years', count: 4703 },
        ], xKey: 'age', yKey: 'count' },
    ],
    faq: [
      { question: 'How does India\'s youth suicide rate compare globally?', answer: 'India accounts for approximately 25% of global adolescent suicides, despite having 18% of the world\'s adolescent population. The rate of 12.4 per 100,000 among 15–19 year-olds is 35% higher than the global average of 9.2.' },
      { question: 'Is academic pressure really the main cause?', answer: 'NCRB data consistently shows "failure in examination" and "academic pressure" as the most commonly cited cause. However, experts caution these are proximate triggers, not root causes. Underlying mental illness, family dysfunction, and lack of coping skills often go unrecorded.' },
      { question: 'What is being done about it?', answer: 'Three main policy pillars: Tele-MANAS helpline (15 lakh+ calls), the School Mental Health Program under DMHP, and NEP 2020\'s counsellor mandate. However, only 12% of schools have counsellors, and mental health gets only 3% of the health budget.' },
      { question: 'How can parents spot warning signs?', answer: 'Common warning signs: withdrawal from social activities, sudden drop in grades, changes in sleep/eating, giving away valued possessions, mentions of wanting to die, increased irritability lasting more than two weeks.' },
      { question: 'What is Tele-MANAS and how does it work?', answer: 'Tele-MANAS is India\'s national mental health helpline (launched Oct 2022), available toll-free at 14416 or 1-800-891-4416. It provides 24/7 tele-counselling in 20 languages, with escalation to in-person care if needed.' },
    ],
    relatedStories: [
      { slug: '81-crore-data-breach', headline: '81 Crore Data Breach: India\'s Largest Ever Cybersecurity Incident', summary: 'The ICMR-linked breach exposed Aadhaar and passport data.', publishedAt: '2026-06-01T06:00:00Z', readingTime: 10, evidenceScore: 95, category: 'cybersecurity' },
      { slug: 'anganwadi-icds', headline: 'Anganwadi Centres: India\'s Frontline Nutrition Workers Are Burning Out', summary: 'India\'s ICDS programme at a crossroads.', publishedAt: '2026-07-28T06:00:00Z', readingTime: 11, evidenceScore: 84, category: 'health' },
    ],
    relatedEntities: [
      { id: 'india', slug: 'india', name: 'India', type: 'country', description: 'Republic of India.' },
      { id: 'who', slug: 'who', name: 'World Health Organization', type: 'organization', description: 'UN health agency tracking global mental health metrics.' },
    ],
  };

  stories.set(story36.slug, story36);

  // ── Entities ──────────────────────────────────────────────────────

  const entityData: APIEntity[] = [
    {
      id: 'mgnrega', slug: 'mgnrega', name: 'Mahatma Gandhi National Rural Employment Guarantee Act',
      type: 'policy', description: 'India\'s flagship rural employment guarantee scheme.',
      aliases: ['MGNREGA', 'NREGA', 'Rural Employment Scheme'], storyCount: 24, updatedAt: '2026-06-15T10:00:00Z',
      image: '/images/entities/mgnrega.jpg',
      timeline: story1.timeline, statistics: { 'Total Person-Days': '385 crore', 'Active Workers': '14.2 crore', 'Average Wage': '₹267/day' },
      relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: '', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' }],
      relatedEntities: [{ id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' }],
      faq: story1.faq,
    },
    {
      id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development',
      type: 'organization', description: 'Nodal ministry of Government of India responsible for rural development policies, programmes, and schemes including MGNREGA, PMAY-G, and DAY-NRLM.',
      aliases: ['MoRD', 'Rural Development Ministry'], storyCount: 56, updatedAt: '2026-06-18T08:00:00Z',
      image: '/images/entities/mord.jpg', evidenceScore: 91,
      timeline: [
        { date: '1979-01-01', title: 'Department Created', description: 'Department of Rural Development created under Ministry of Agriculture.' },
        { date: '1999-10-01', title: 'Full Ministry Status', description: 'Department upgraded to independent Ministry of Rural Development.' },
      ],
      datasets: [],
      sources: [{ name: 'MoRD Official Website', url: 'https://rural.gov.in', type: 'government', description: 'Official ministry portal with scheme details.' }],
      statistics: { 'Schemes Managed': '15', 'Annual Budget': '₹1.56 lakh cr', 'Districts Covered': '740+', 'Staff': '12,000+' },
      relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Two decades of rural employment guarantee scheme examined.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' }],
      relatedEntities: [{ id: 'mgnrega', slug: 'mgnrega', name: 'MGNREGA', type: 'policy' }],
      faq: [
        { question: 'What schemes does the Ministry oversee?', answer: 'Key schemes include MGNREGA (employment), PMAY-G (housing), DAY-NRLM (livelihoods), PMGSY (roads), and NSAP (pensions).' },
        { question: 'What is the annual budget of MoRD?', answer: 'The Ministry\'s budget for 2025-26 is approximately ₹1.56 lakh crore.' },
      ],
    },
    {
      id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India',
      type: 'organization', description: 'India\'s central banking institution controlling monetary policy, currency issuance, and financial system regulation.',
      aliases: ['RBI', 'Central Bank of India'], storyCount: 89, updatedAt: '2026-06-18T14:00:00Z',
      image: '/images/entities/rbi.jpg', evidenceScore: 96,
      timeline: [
        { date: '1935-04-01', title: 'RBI Established', description: 'Reserve Bank of India was established under the RBI Act 1934.' },
        { date: '1949-01-01', title: 'Nationalized', description: 'RBI was nationalized and became a state-owned institution.' },
      ],
      datasets: [],
      sources: [{ name: 'RBI Official Website', url: 'https://rbi.org.in', type: 'government', description: 'Official portal with data and publications.' }],
      statistics: { 'Policy Rate': '6.00%', 'GDP Forecast': '6.8%', 'Inflation Target': '4.0%', 'Forex Reserves': '$675 billion' },
      relatedStories: [{ slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: 'How UPI transformed rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' }],
      relatedEntities: [{ id: 'npci', slug: 'npci', name: 'NPCI', type: 'organization' }],
      faq: [
        { question: 'What is the current repo rate?', answer: 'The repo rate as of June 2026 is 6.00%.' },
        { question: 'How does RBI control inflation?', answer: 'RBI uses the repo rate, CRR, SLR, and open market operations to manage money supply and inflation.' },
      ],
    },
    {
      id: 'npci', slug: 'npci', name: 'National Payments Corporation of India',
      type: 'organization', description: 'An umbrella organisation for operating retail payment and settlement systems in India, including UPI, IMPS, and RuPay.',
      aliases: ['NPCI'], storyCount: 34, updatedAt: '2026-06-12T08:00:00Z',
      image: '/images/entities/npci.jpg', evidenceScore: 88,
      timeline: [
        { date: '2008-12-01', title: 'NPCI Established', description: 'NPCI was incorporated as a not-for-profit company.' },
        { date: '2016-04-11', title: 'UPI Launched', description: 'Unified Payments Interface was launched.' },
      ],
      datasets: [],
      sources: [{ name: 'NPCI Official Website', url: 'https://npci.org.in', type: 'government', description: 'Official NPCI portal.' }],
      statistics: { 'UPI Monthly Transactions': '12 billion', 'Total Members': '120+', 'RTP System': 'IMPS' },
      relatedStories: [{ slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: 'How UPI transformed rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' }],
      relatedEntities: [{ id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization' }],
      faq: [
        { question: 'What is NPCI?', answer: 'National Payments Corporation of India is an umbrella organisation for operating retail payment and settlement systems.' },
      ],
    },
    {
      id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture and Farmers Welfare',
      type: 'organization', description: 'Nodal ministry of Government of India responsible for agriculture policy, crop insurance, farmer welfare, and food security.',
      aliases: ['Ministry of Agriculture', 'MoA&FW'], storyCount: 42, updatedAt: '2026-06-05T06:00:00Z',
      image: '/images/entities/agriculture-ministry.jpg', evidenceScore: 89,
      timeline: [], datasets: [],
      sources: [{ name: 'Ministry of Agriculture Website', url: 'https://agriculture.gov.in', type: 'government', description: 'Official ministry portal.' }],
      statistics: { 'Schemes Managed': '20+', 'Annual Budget': '₹1.2 lakh crore' },
      relatedStories: [{ slug: 'pm-fasal-bima-claims', headline: 'PMFBY: Claims That Never Reached Farmers', summary: 'Investigation into delayed crop insurance claims.', publishedAt: '2026-06-05T06:00:00Z', readingTime: 15, evidenceScore: 97, category: 'policy' }],
      relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
      faq: [
        { question: 'What is the budget of the Ministry?', answer: 'The Ministry\'s annual budget is approximately ₹1.2 lakh crore.' },
      ],
    },
    {
      id: 'cag', slug: 'cag', name: 'Comptroller and Auditor General of India',
      type: 'organization', description: 'Supreme audit institution of India, responsible for auditing the accounts of the Union and State governments.',
      aliases: ['CAG', 'CAG India'], storyCount: 18, updatedAt: '2026-06-05T06:00:00Z',
      image: '/images/entities/cag.jpg', evidenceScore: 95,
      timeline: [], datasets: [],
      sources: [{ name: 'CAG Official Website', url: 'https://cag.gov.in', type: 'government', description: 'Official CAG portal with audit reports.' }],
      statistics: { 'Reports Published (2025-26)': '72', 'Audited Expenditure': '₹80 lakh crore' },
      relatedStories: [{ slug: 'pm-fasal-bima-claims', headline: 'PMFBY: Claims That Never Reached Farmers', summary: 'Investigation into delayed crop insurance claims.', publishedAt: '2026-06-05T06:00:00Z', readingTime: 15, evidenceScore: 97, category: 'policy' }],
      relatedEntities: [],
      faq: [
        { question: 'What is the role of CAG?', answer: 'CAG audits all receipts and expenditure of the Government of India and state governments.' },
      ],
    },
    {
      id: 'bihar', slug: 'bihar', name: 'Bihar',
      type: 'country', description: 'State in eastern India — one of India\'s poorest states with significant policy challenges in education, health, and infrastructure.',
      aliases: ['Bihar State'], storyCount: 85, updatedAt: '2026-06-18T09:00:00Z',
      image: '/images/entities/bihar.jpg', evidenceScore: 87,
      population: 130000000, capital: 'Patna',
      timeline: [
        { date: '1912-04-01', title: 'Bihar Province Created', description: 'Bihar and Orissa separated from Bengal Presidency.' },
        { date: '2000-11-15', title: 'Bihar Divided', description: 'Jharkhand carved out of Bihar to form a separate state.' },
      ],
      datasets: [],
      sources: [{ name: 'Bihar Government Portal', url: 'https://bihar.gov.in', type: 'government', description: 'Official state portal.' }],
      statistics: { 'Population': '13 cr', 'Literacy Rate': '63.8%', 'GDP Contribution': '4.1%', 'Districts': '38' },
      relatedStories: [
        { slug: 'anganwadi-icds', headline: 'Anganwadi Centres: Frontline Workers Burning Out', summary: 'India\'s ICDS challenges.', publishedAt: '2026-07-28T06:00:00Z', readingTime: 11, evidenceScore: 84, category: 'health' },
        { slug: 'education-budget', headline: 'Education Budget Analysis', summary: 'Widening gap between spending and outcomes.', publishedAt: '2026-07-14T06:00:00Z', readingTime: 9, evidenceScore: 83, category: 'policy' },
      ],
      relatedEntities: [
        { id: 'india', slug: 'india', name: 'India', type: 'country' },
      ],
      faq: [
        { question: 'What is Bihar\'s main economic challenge?', answer: 'Bihar has India\'s lowest per capita income and faces challenges in industrial development, infrastructure, and employment generation despite significant demographic dividend.' },
      ],
    },
    {
      id: 'ministry-of-finance', slug: 'ministry-of-finance', name: 'Ministry of Finance',
      type: 'organization', description: 'Nodal ministry of Government of India responsible for taxation, fiscal policy, financial sector regulation, and Union Budget preparation.',
      aliases: ['MoF', 'Finance Ministry', 'Ministry of Finance, GoI'], storyCount: 105, updatedAt: '2026-07-01T00:00:00Z',
      image: '/images/entities/mof.jpg',
      timeline: [
        { date: '1947-08-15', title: 'Ministry Established', description: 'Ministry of Finance established post-independence with Department of Economic Affairs.' },
        { date: '2016-07-01', title: 'GST Council Formed', description: 'GST Council established with Union Finance Minister as chairperson.' },
      ],
      statistics: { 'Annual Budget Outlay': '₹52 lakh crore', 'Fiscal Deficit': '4.5% of GDP', 'Tax-to-GDP Ratio': '11.2%', 'Debt-to-GDP Ratio': '58%' },
      relatedStories: [
        { slug: 'supply-chain-shift', headline: 'The Great Supply Chain Shift', summary: 'Can India capture the China+1 opportunity.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
        { slug: 'rbi-repo-rate', headline: 'RBI Repo Rate Analysis', summary: 'Decoding monetary policy.', publishedAt: '2026-07-08T06:00:00Z', readingTime: 10, evidenceScore: 91, category: 'economy' },
        { slug: 'education-budget', headline: 'Education Budget Analysis', summary: 'Spending vs learning outcomes.', publishedAt: '2026-07-14T06:00:00Z', readingTime: 9, evidenceScore: 83, category: 'policy' },
      ],
      relatedEntities: [
        { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization' },
        { id: 'india', slug: 'india', name: 'India', type: 'country' },
      ],
      faq: [
        { question: 'What is the role of the Ministry of Finance?', answer: 'The Ministry of Finance oversees taxation, fiscal policy, government expenditure, financial sector regulation, and prepares the annual Union Budget.' },
      ],
    },
    {
      id: 'ministry-of-women-and-child-development', slug: 'ministry-of-women-and-child-development', name: 'Ministry of Women and Child Development',
      type: 'organization', description: 'Nodal ministry responsible for women\'s empowerment, child development, nutrition, and the ICDS programme.',
      aliases: ['MWCD', 'Women and Child Development Ministry'], storyCount: 18, updatedAt: '2026-07-28T06:00:00Z',
      timeline: [], statistics: { 'Schemes Managed': '8', 'Annual Budget': '₹32,000 crore', 'Beneficiaries': '10 crore+' },
      relatedStories: [
        { slug: 'anganwadi-icds', headline: 'Anganwadi Centres: Frontline Workers Burning Out', summary: 'ICDS programme challenges.', publishedAt: '2026-07-28T06:00:00Z', readingTime: 11, evidenceScore: 84, category: 'health' },
      ],
      image: '/images/entities/mwcd.jpg',
      relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
      faq: [],
    },
    {
      id: 'india', slug: 'india', name: 'India',
      type: 'country', description: 'India is the world\'s most populous country and the fifth-largest economy by nominal GDP. A federal parliamentary democratic republic with 28 states and 8 union territories.',
      aliases: ['Republic of India', 'Bharat', 'Hindustan'], storyCount: 450, updatedAt: '2026-06-20T10:00:00Z',
      image: '/images/entities/india.jpg', evidenceScore: 93,
      population: 1426000000, gdp: 4100000000000, capital: 'New Delhi',
      timeline: [
        { date: '1947-08-15', title: 'Independence', description: 'India gains independence from British rule.' },
        { date: '1950-01-26', title: 'Republic', description: 'Constitution of India comes into effect.' },
        { date: '1991-07-01', title: 'Economic Liberalisation', description: 'Landmark economic reforms open Indian economy.' },
        { date: '2014-05-01', title: 'Digital India Initiative', description: 'National push for digital infrastructure and governance.' },
      ],
      datasets: [{ label: 'GDP Growth Rate', description: 'Annual GDP growth rate (%)', data: [{ year: '2020-21', growth: -5.8 }, { year: '2021-22', growth: 9.1 }, { year: '2022-23', growth: 7.2 }, { year: '2023-24', growth: 8.2 }, { year: '2024-25', growth: 7.0 }, { year: '2025-26', growth: 6.8 }], source: 'Ministry of Statistics' }],
      sources: [
        { name: 'Census of India', url: 'https://censusindia.gov.in', type: 'government', description: 'Official census data.' },
        { name: 'Ministry of Statistics', url: 'https://mospi.gov.in', type: 'government', description: 'Statistical data and publications.' },
      ],
      statistics: { 'Population': '142.6 cr', 'GDP Growth': '6.8%', 'Literacy Rate': '74.04%', 'Life Expectancy': '70.8 yrs' },
      relatedStories: [
        { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment', summary: 'Two decades of India\'s flagship rural employment scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
        { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: 'UPI\'s impact on financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
        { slug: 'pm-fasal-bima-claims', headline: 'PMFBY Investigation', summary: '', publishedAt: '2026-06-05T06:00:00Z', readingTime: 15, evidenceScore: 97, category: 'policy' },
        { slug: 'supply-chain-shift', headline: 'The Great Supply Chain Shift', summary: '', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
        { slug: 'anganwadi-icds', headline: 'Anganwadi Centres: Frontline Workers Burning Out', summary: '', publishedAt: '2026-07-28T06:00:00Z', readingTime: 11, evidenceScore: 84, category: 'health' },
        { slug: 'india-us-relations', headline: 'India-US Relations: From Nuclear Deal to Critical Technology Partnership', summary: 'The deepening strategic partnership.', publishedAt: '2026-08-15T10:00:00Z', readingTime: 16, evidenceScore: 91, category: 'geopolitics' },
        { slug: 'india-china-relations', headline: 'India-China: Two Asian Giants in an Era of Mistrust', summary: 'Border tensions and strategic rivalry.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
        { slug: 'india-europe-relations', headline: 'India and Europe: A Strategic Partnership Searching for Substance', summary: 'Relations with the European Union.', publishedAt: '2026-08-22T10:00:00Z', readingTime: 14, evidenceScore: 88, category: 'geopolitics' },
        { slug: 'india-uk-relations', headline: 'India-UK Relations: Beyond Colonial History to a Modern Strategic Partnership', summary: 'Colonial ties to modern partnership.', publishedAt: '2026-08-23T10:00:00Z', readingTime: 13, evidenceScore: 86, category: 'geopolitics' },
        { slug: 'india-russia-relations', headline: 'India-Russia: The Enduring Partnership Tested by War and Realignment', summary: 'Defence ties and oil trade post-Ukraine.', publishedAt: '2026-08-25T10:00:00Z', readingTime: 14, evidenceScore: 90, category: 'geopolitics' },
        { slug: 'india-indonesia-relations', headline: 'India-Indonesia: How Maritime Neighbours Are Reshaping the Indo-Pacific', summary: 'Maritime security and trade growth.', publishedAt: '2026-08-18T10:00:00Z', readingTime: 12, evidenceScore: 87, category: 'geopolitics' },
      ],
      relatedEntities: [
        { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization' },
        { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' },
        { id: 'ministry-of-finance', slug: 'ministry-of-finance', name: 'Ministry of Finance', type: 'organization' },
        { id: 'ministry-of-women-and-child-development', slug: 'ministry-of-women-and-child-development', name: 'Ministry of Women and Child Development', type: 'organization' },
        { id: 'un', slug: 'un', name: 'United Nations', type: 'organization' },
        { id: 'wto', slug: 'wto', name: 'World Trade Organization', type: 'organization' },
        { id: 'imf', slug: 'imf', name: 'International Monetary Fund', type: 'organization' },
        { id: 'world-bank', slug: 'world-bank', name: 'World Bank', type: 'organization' },
        { id: 'who', slug: 'who', name: 'World Health Organization', type: 'organization' },
        { id: 'g20', slug: 'g20', name: 'G20', type: 'organization' },
        { id: 'brics', slug: 'brics', name: 'BRICS', type: 'organization' },
      ],
      faq: [
        { question: 'What is India\'s current population?', answer: 'India\'s population as of 2026 is approximately 142.6 crore (1.426 billion).' },
        { question: 'What is India\'s GDP growth rate?', answer: 'India\'s GDP grew at 6.8% in 2025-26, maintaining its position as the fastest-growing major economy.' },
        { question: 'What are India\'s key international memberships?', answer: 'India is a member of the UN, WTO, IMF, World Bank, WHO, ILO, BRICS, SCO, G20, SAARC, Commonwealth, ADB, AIIB, BIMSTEC, Quad, ISA, FATF, NAM, G77, IORA, and CDRI.' },
      ],
    },
    {
      id: 'election-commission', slug: 'election-commission', name: 'Election Commission of India',
      type: 'organization', description: 'Independent constitutional body responsible for administering election processes at national and state levels. The ECI published electoral bond donor data following the Supreme Court\'s February 2024 judgment striking down the anonymous donation scheme.',
      aliases: ['ECI', 'Election Commission', 'Election Commission of India'], storyCount: 5, updatedAt: '2026-08-14T06:00:00Z',
      image: '/images/entities/election-commission.jpg', evidenceScore: 92,
      timeline: [
        { date: '1950-01-25', title: 'ECI Established', description: 'Election Commission constituted under Article 324 of the Constitution, one day before the Republic Day.' },
        { date: '1993-10-01', title: 'Multi-Member Commission', description: 'ECI becomes a multi-member body with three Election Commissioners.' },
        { date: '2019-03-10', title: 'First Full-Fledged EVM VVPAT Election', description: 'General Election 2019 becomes the first general election conducted entirely on EVMs with VVPATs.' },
        { date: '2024-02-15', title: 'Supreme Court Strikes Down Electoral Bonds', description: '5-judge bench declares electoral bonds unconstitutional; ECI ordered to publish bond data.' },
        { date: '2024-03-14', title: 'ECI Publishes Electoral Bond Data', description: 'ECI publishes complete donor data on its website for public scrutiny for the first time.', source: 'ECI Official Website' },
      ],
      statistics: { 'Voter Strength': '96.8 crore', 'Polling Stations': '10.5 lakh', 'States/UTs Administered': '36', 'EVM+VVPAT Coverage': '100%' },
      relatedStories: [
        { slug: 'electoral-bonds', headline: 'Electoral Bonds: The ₹12,769 Crore Anonymous Donation Scheme', summary: 'The rise and fall of India\'s anonymous political donation system.', publishedAt: '2026-08-14T06:00:00Z', readingTime: 16, evidenceScore: 95, category: 'policy' },
      ],
      relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
      faq: [
        { question: 'What is the role of the Election Commission?', answer: 'The ECI is responsible for conducting free and fair elections to the Lok Sabha, Rajya Sabha, State Legislative Assemblies, and the offices of the President and Vice President of India.' },
        { question: 'What role did the ECI play in the electoral bonds case?', answer: 'After the Supreme Court struck down the electoral bond scheme, the ECI was directed to publish all donor data. On March 14, 2024, the ECI made the data public for the first time, revealing the identities of donors and the amounts given to each political party.' },
      ],
      sources: [{ name: 'Election Commission of India Official Website', url: 'https://eci.gov.in', type: 'government', description: 'Official ECI portal with election data and results.' }],
    },
  ];

    // ── Data Breach Entities ─────────────────────────────────────────
    const icmr: APIEntity = {
      id: 'icmr', slug: 'icmr', name: 'Indian Council of Medical Research',
      type: 'organization', description: 'The apex body in India for the formulation, coordination and promotion of biomedical research. Its COVID-19 testing database was the suspected source of India\'s largest data breach compromising 81.5 crore Aadhaar and passport records.',
      aliases: ['ICMR', 'Indian Council of Medical Research'], storyCount: 3, updatedAt: '2026-07-09T00:00:00Z',
      image: '/images/entities/icmr.jpg', evidenceScore: 85,
      timeline: [
        { date: '1911-01-01', title: 'ICMR Founded', description: 'Established as the Indian Research Fund Association.' },
        { date: '1949-01-01', title: 'Renamed ICMR', description: 'Reconstituted and renamed the Indian Council of Medical Research.' },
        { date: '2020-03-01', title: 'COVID-19 Testing Database', description: 'ICMR becomes nodal agency for COVID-19 testing and aggregates nationwide testing data.' },
        { date: '2023-10-09', title: 'Data Breach Discovered', description: 'Threat actor pwn0001 posts 81.5 crore Indian citizen records for sale on Breach Forums, suspected to originate from ICMR database.' },
      ],
      statistics: { 'COVID Tests Aggregated': '90+ crore', 'Research Institutes': '26', 'Ongoing Studies': '250+' },
      relatedStories: [{ slug: '81-crore-data-breach', headline: '81.5 Crore Aadhaar Records Exposed', summary: 'Inside India\'s biggest data breach.', publishedAt: '2026-07-09T08:00:00Z', readingTime: 14, evidenceScore: 94, category: 'technology' }], relatedEntities: [],
      faq: [
        { question: 'What is ICMR\'s role in the data breach?', answer: 'ICMR\'s COVID-19 testing database, which collected Aadhaar and passport details for test registration and result delivery, is believed to be the source of 81.5 crore compromised records. The breach affected nearly every Indian citizen who took a COVID-19 test.' },
      ],
    };

    const certin: APIEntity = {
      id: 'cert-in', slug: 'cert-in', name: 'Indian Computer Emergency Response Team',
      type: 'organization', description: 'The national nodal agency for cybersecurity incident response, operating under MeitY. CERT-In was notified of the 81.5 crore data breach in October 2023.',
      aliases: ['CERT-In', 'CERT India', 'Indian CERT'], storyCount: 2, updatedAt: '2026-07-09T00:00:00Z',
      relatedStories: [{ slug: '81-crore-data-breach', headline: '81.5 Crore Aadhaar Records Exposed', summary: 'Inside India\'s biggest data breach.', publishedAt: '2026-07-09T08:00:00Z', readingTime: 14, evidenceScore: 94, category: 'technology' }],
      image: '/images/entities/cert-in.jpg', evidenceScore: 88,
      timeline: [
        { date: '2004-01-01', title: 'CERT-In Established', description: 'Established under the Information Technology Act, 2000.' },
        { date: '2014-10-16', title: 'CERT-In Notified as Nodal Agency', description: 'Government notifies CERT-In as the national agency for cybersecurity incident response.' },
        { date: '2023-10-09', title: '81.5 Cr Breach Reported', description: 'CERT-In notified of the massive data breach and initiates investigation.' },
      ],
      statistics: { 'Incidents Handled (2023)': '1.39 lakh', 'Cyber Alerts Issued': '8,000+', 'Vulnerability Disclosures': '200+' },
      relatedEntities: [],
      faq: [
        { question: 'What is CERT-In and what did it do about the breach?', answer: 'CERT-In is India\'s cybersecurity incident response agency. Upon learning of the 81.5 crore data breach, it initiated an investigation and coordinated with law enforcement agencies, including the CBI.' },
      ],
    };

    const uidai: APIEntity = {
      id: 'uidai', slug: 'uidai', name: 'Unique Identification Authority of India',
      type: 'organization', description: 'The statutory authority responsible for issuing Aadhaar numbers and managing the Aadhaar ecosystem. UIDAI was not the source of the breach but its database metadata was exposed through the ICMR breach.',
      aliases: ['UIDAI', 'Aadhaar Authority'], storyCount: 2, updatedAt: '2026-07-09T00:00:00Z',
      relatedStories: [{ slug: '81-crore-data-breach', headline: '81.5 Crore Aadhaar Records Exposed', summary: 'Inside India\'s biggest data breach.', publishedAt: '2026-07-09T08:00:00Z', readingTime: 14, evidenceScore: 94, category: 'technology' }],
      image: '/images/entities/uidai.jpg', evidenceScore: 87,
      timeline: [
        { date: '2016-03-03', title: 'Aadhaar Act Passed', description: 'Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act passed.' },
        { date: '2018-09-26', title: 'Supreme Court Upholds Aadhaar', description: 'Supreme Court upholds constitutional validity of Aadhaar with restrictions on private sector use.' },
        { date: '2023-10-09', title: '81.5 Cr Data Breach', description: 'Aadhaar numbers of 81.5 crore Indians compromised through third-party database breach.' },
      ],
      statistics: { 'Aadhaar Numbers Issued': '138 crore+', 'Authentication Transactions/Day': '7 crore+', 'Enrolment Centres': '50,000+' },
      relatedEntities: [],
      faq: [
        { question: 'Was UIDAI hacked?', answer: 'No. UIDAI\'s own systems were not breached. The Aadhaar numbers were compromised from a third-party database (suspected ICMR) that collected Aadhaar data for COVID-19 testing purposes.' },
      ],
    };

    const resecurity: APIEntity = {
      id: 'resecurity', slug: 'resecurity', name: 'Resecurity Inc.',
      type: 'organization', description: 'A US-based cybersecurity firm whose HUNTER unit discovered the 81.5 crore Indian data breach on the dark web and alerted Indian authorities.',
      aliases: ['Resecurity', 'Resecurity Inc.'], storyCount: 1, updatedAt: '2026-07-09T00:00:00Z',
      relatedStories: [{ slug: '81-crore-data-breach', headline: '81.5 Crore Aadhaar Records Exposed', summary: 'Inside India\'s biggest data breach.', publishedAt: '2026-07-09T08:00:00Z', readingTime: 14, evidenceScore: 94, category: 'technology' }],
      image: '/images/entities/resecurity.jpg', evidenceScore: 90,
      timeline: [
        { date: '2015-01-01', title: 'Resecurity Founded', description: 'Cybersecurity firm founded in Los Angeles, California.' },
        { date: '2023-10-09', title: 'HUNTER Unit Discovers Breach', description: 'Resecurity\'s HUNTER threat intelligence unit discovers post on Breach Forums selling 81.5 crore Indian records.' },
        { date: '2023-10-15', title: 'Breach Verified', description: 'Resecurity verifies sample records through government Aadhaar verification portal and notifies Indian authorities.' },
      ],
      statistics: { 'HUNTER Team Members': '40+', 'Active Threat Intel Cases': '500+', 'Countries Covered': '80+' },
      relatedEntities: [],
      faq: [
        { question: 'How did Resecurity discover the breach?', answer: 'Resecurity\'s HUNTER threat intelligence unit actively monitors dark web forums. On October 9, 2023, they detected a post by threat actor "pwn0001" on Breach Forums offering 815 million Indian citizen records for $80,000.' },
      ],
    };

    entityData.push(icmr, certin, uidai, resecurity);

    // ── International Organizations ──────────────────────────────────
    const intlEntities: APIEntity[] = [
      {
        id: 'un', slug: 'un', name: 'United Nations',image: '/images/entities/un.jpg', 
        type: 'organization', description: 'India is a founding member of the United Nations (1945) and has served as a non-permanent member of the Security Council eight times. India is the largest contributor to UN peacekeeping missions, with over 2,50,000 troops deployed across 49 missions since 1948.',
        aliases: ['UN', 'United Nations Organization', 'UNO'], storyCount: 5, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1945-10-24', title: 'UN Founded', description: 'India signs the UN Charter as a founding member.' },
          { date: '1953-01-01', title: 'First UNSC Term', description: 'India serves first term as non-permanent UNSC member.' },
          { date: '2021-08-01', title: 'UNSC Presidency', description: 'India presides over UN Security Council for August 2021.' },
        ],
        statistics: { 'UNSC Terms Served': '8', 'Peacekeepers Deployed': '2.5 lakh+', 'UN Budget Contribution': '0.74%' },
        relatedStories: [
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'India\'s foreign policy transformation from Nehruvian idealism to pragmatic multi-alignment.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
          { slug: 'us-iran-relations', headline: 'US-Iran Relations: From Maximum Pressure to Nuclear Negotiations', summary: 'Decades-long trajectory of confrontation and diplomacy between the US and Iran.', publishedAt: '2026-07-18T06:00:00Z', readingTime: 14, evidenceScore: 89, category: 'politics' },
          { slug: 'india-china-border-tensions', headline: 'India-China at the Crossroads: Four Years After Galwan', summary: 'Border confrontation and strategic rivalry reshaping Asia.', publishedAt: '2026-07-30T06:00:00Z', readingTime: 17, evidenceScore: 92, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What is India\'s role in UN peacekeeping?', answer: 'India is the largest cumulative troop contributor to UN peacekeeping missions, with over 2,50,000 personnel deployed across 49 missions since 1948.' },
          { question: 'Has India served on the UN Security Council?', answer: 'India has served 8 terms as a non-permanent member of the UN Security Council, most recently in 2021-22.' },
        ],
        sources: [{ name: 'UN India Website', url: 'https://un.org.in', type: 'international', description: 'UN India official portal.' }],
      },
      {
        id: 'wto', slug: 'wto', name: 'World Trade Organization',image: '/images/entities/wto.jpg', 
        type: 'organization', description: 'India is a founding member of the WTO (1995) and its predecessor GATT (1947). India is one of the most active users of the WTO dispute settlement mechanism and has been both complainant and respondent in numerous trade disputes. India\'s trade policy at the WTO focuses on protecting agricultural subsidies, special and differential treatment for developing countries, and resisting expanded mandates on investment and e-commerce.',
        aliases: ['WTO', 'World Trade Organisation'], storyCount: 3, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1995-01-01', title: 'WTO Established', description: 'WTO replaces GATT; India is a founding member.' },
          { date: '2005-01-01', title: 'India-US Dairy Dispute', description: 'India loses WTO dispute on US shrimp imports.' },
          { date: '2018-06-01', title: 'India Solar Case', description: 'WTO rules against India\'s solar domestic content requirements.' },
        ],
        statistics: { 'Trade Disputes Filed': '42', 'Disputes Won as Complainant': '10', 'Avg. WTO Bind Rate': '48.5%' },
        relatedStories: [
          { slug: 'india-europe-relations', headline: 'India and Europe: A Strategic Partnership Searching for Substance', summary: 'India-EU FTA negotiations, CBAM, and strategic partnership dynamics.', publishedAt: '2026-08-22T10:00:00Z', readingTime: 14, evidenceScore: 88, category: 'geopolitics' },
          { slug: 'india-uk-relations', headline: 'India-UK Relations: Beyond Colonial History', summary: 'FTA negotiations, diaspora links, and modern strategic partnership.', publishedAt: '2026-08-23T10:00:00Z', readingTime: 13, evidenceScore: 86, category: 'geopolitics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What is India\'s stance on WTO agricultural negotiations?', answer: 'India strongly defends its right to public stockholding for food security and has resisted caps on agricultural subsidies that would impact its MSP and PDS programmes.' },
          { question: 'How many WTO disputes has India been involved in?', answer: 'India has been involved in 42 disputes — 24 as complainant, 18 as respondent — making it one of the most active WTO members.' },
        ],
        sources: [{ name: 'WTO Disputes Database', url: 'https://wto.org/disputes', type: 'international', description: 'WTO dispute settlement gateway.' }],
      },
      {
        id: 'imf', slug: 'imf', name: 'International Monetary Fund',image: '/images/entities/imf.jpg', 
        type: 'organization', description: 'India is a founding member of the IMF (1945) and holds a 2.63% quota share and 2.34% voting power. India has taken IMF assistance during balance of payments crises in 1981, 1991, and the 1990s IMF programme catalysed India\'s landmark economic liberalisation. India\'s 16th Quota Review position advocates for increased voice for dynamic emerging economies.',
        aliases: ['IMF', 'International Monetary Fund'], storyCount: 4, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1945-12-27', title: 'IMF Founded', description: 'India becomes a founding member of the IMF.' },
          { date: '1991-01-16', title: 'Balance of Payments Crisis', description: 'India approaches IMF for $2.2 billion loan amid forex reserves crisis.' },
          { date: '2021-08-01', title: 'SDR Allocation', description: 'India receives $17.86 billion SDR allocation as part of IMF\'s $650 billion global allocation.' },
        ],
        statistics: { 'Quota Share': '2.63%', 'Voting Power': '2.34%', 'IMF Loans Received (1991)': '$2.2 billion' },
        relatedStories: [
          { slug: 'income-inequality-india', headline: 'Income Inequality in India: The Top 1% Now Owns 40% of the Wealth', summary: 'Structural drivers behind India\'s Gini coefficient trajectory and wealth concentration.', publishedAt: '2026-07-26T06:00:00Z', readingTime: 15, evidenceScore: 94, category: 'economy' },
          { slug: 'india-europe-relations', headline: 'India and Europe: A Strategic Partnership Searching for Substance', summary: 'India-EU FTA, CBAM impact, and economic partnership dynamics.', publishedAt: '2026-08-22T10:00:00Z', readingTime: 14, evidenceScore: 88, category: 'geopolitics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What was the IMF\'s role in India\'s 1991 economic reforms?', answer: 'The IMF provided a $2.2 billion loan under a Stand-By Arrangement conditional on structural reforms, which catalysed India\'s landmark economic liberalisation.' },
          { question: 'What is India\'s quota and voting share in the IMF?', answer: 'India holds a 2.63% quota share and 2.34% voting power, and has consistently advocated for quota reforms to better reflect emerging economies\' weight.' },
        ],
        sources: [{ name: 'IMF India Country Page', url: 'https://imf.org/en/Countries/IND', type: 'international', description: 'IMF country data for India.' }],
      },
      {
        id: 'world-bank', slug: 'world-bank', name: 'World Bank',image: '/images/entities/world-bank.jpg', 
        type: 'organization', description: 'India is a founding member of the World Bank (IBRD: 1945, IDA: 1960) and is the largest recipient of IDA (International Development Association) funds historically. The World Bank lends $3-5 billion annually to India across sectors including rural development, health, education, infrastructure, and water. The World Bank\'s Logistics Performance Index and Ease of Doing Business reports are key benchmarks for Indian policy.',
        aliases: ['World Bank', 'IBRD', 'IDA', 'World Bank Group'], storyCount: 6, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1945-12-27', title: 'IBRD Founded', description: 'India becomes a founding member of the International Bank for Reconstruction and Development.' },
          { date: '1960-09-01', title: 'IDA Established', description: 'India becomes a founding member of IDA, the World Bank\'s concessional lending arm.' },
          { date: '2014-07-01', title: 'World Bank Support for Swachh Bharat', description: 'World Bank commits $1.5 billion for sanitation infrastructure under Swachh Bharat Mission.' },
        ],
        statistics: { 'Active Projects': '80+', 'Annual Lending': '$3-5 billion', 'IDA Recipient Since': '1960' },
        relatedStories: [
          { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment', summary: 'Two decades of India\'s flagship rural employment guarantee scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
          { slug: 'climate-finance', headline: 'India\'s ₹11 Lakh Crore Climate Finance Challenge', summary: 'Climate finance gap threatens India\'s renewable energy transition.', publishedAt: '2026-07-10T06:00:00Z', readingTime: 13, evidenceScore: 87, category: 'environment' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'How much does the World Bank lend to India annually?', answer: 'The World Bank lends $3-5 billion annually to India across 80+ active projects covering rural development, health, education, and infrastructure.' },
          { question: 'What World Bank indices are most cited in Indian policy?', answer: 'The Logistics Performance Index (LPI), Ease of Doing Business Index, and Human Capital Index are frequently cited benchmarks for Indian policy reforms.' },
        ],
        sources: [{ name: 'World Bank India Overview', url: 'https://worldbank.org/en/country/india', type: 'international', description: 'World Bank India country page.' }],
      },
      {
        id: 'who', slug: 'who', name: 'World Health Organization',image: '/images/entities/who.jpg', 
        type: 'organization', description: 'India is a founding member of WHO (1948) and hosts the WHO South-East Asia Regional Office (SEARO) in New Delhi. India has been a major beneficiary of WHO technical assistance for polio eradication (certified polio-free in 2014), tuberculosis control, maternal health, and pandemic preparedness. India\'s Central Drugs Standard Control Organization (CDSCO) aligns with WHO prequalification standards for pharmaceutical exports.',
        aliases: ['WHO', 'World Health Organisation'], storyCount: 4, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1948-04-07', title: 'WHO Established', description: 'India joins WHO as a founding member.' },
          { date: '2014-03-27', title: 'Polio-Free Certification', description: 'India certified polio-free after 3 years without a single case.' },
          { date: '2020-01-30', title: 'COVID-19 PHEIC', description: 'WHO declares COVID-19 a Public Health Emergency of International Concern.' },
        ],
        statistics: { 'Polio-Free Since': '2014', 'WHO SEARO Headquarters': 'New Delhi', 'TB Incidence Reduction (2015-25)': '18%' },
        relatedStories: [
          { slug: 'who-cancer-report-2026', headline: 'Global Cancer Crisis: WHO Report Warns 35 Million Cases Per Year by 2050', summary: 'WHO\'s most comprehensive global cancer assessment covering 20.6M diagnoses, 10M deaths, and 7 recommendations.', publishedAt: '2026-07-08T10:00:00Z', readingTime: 14, evidenceScore: 93, category: 'health' },
          { slug: 'ayushman-bharat', headline: 'Ayushman Bharat: The World\'s Largest Health Insurance Experiment at 10', summary: 'Assessment of India\'s flagship health insurance scheme covering 50 crore beneficiaries.', publishedAt: '2026-08-08T06:00:00Z', readingTime: 14, evidenceScore: 91, category: 'health' },
          { slug: 'anganwadi-icds', headline: 'Anganwadi Centres: India\'s Frontline Nutrition Workers Are Burning Out', summary: 'ICDS programme challenges and nutrition worker conditions.', publishedAt: '2026-07-28T06:00:00Z', readingTime: 11, evidenceScore: 84, category: 'health' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What role did WHO play in India\'s polio eradication?', answer: 'WHO provided technical expertise, surveillance support, and certification infrastructure that helped India achieve polio-free status in 2014.' },
          { question: 'How does WHO influence Indian health policy?', answer: 'WHO technical guidelines shape Indian protocols for TB control, maternal health, air quality standards (AQI benchmarks), and pandemic response frameworks.' },
        ],
        sources: [{ name: 'WHO India Country Office', url: 'https://who.int/india', type: 'international', description: 'WHO India official portal.' }],
      },
      {
        id: 'ilo', slug: 'ilo', name: 'International Labour Organization',
        type: 'organization', description: 'India is a founding member of the ILO (1919) and one of the original signatories of the Treaty of Versailles that established the organisation. India has ratified 47 ILO conventions, including 6 of the 8 Fundamental Conventions. ILO reports on India\'s employment trends, wage data, and social protection gaps are critical inputs for Indian labour policy and recent labour code reforms.',
        aliases: ['ILO', 'International Labour Organisation'], storyCount: 3, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1919-04-11', title: 'ILO Established', description: 'India becomes a founding member of the ILO under the Treaty of Versailles.' },
          { date: '1947-08-15', title: 'Independent India\'s ILO Membership', description: 'India continues ILO membership post-independence.' },
          { date: '2021-09-01', title: 'ILO Conventions Ratified', description: 'India ratifies two core ILO conventions on child labour (C138 and C182).' },
        ],
        statistics: { 'Conventions Ratified': '47', 'Fundamental Conventions Ratified': '6 of 8', 'ILO Reports on India': 'India Employment Report 2025' },
        relatedStories: [
          { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment', summary: 'Two decades of India\'s flagship rural employment guarantee scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
          { slug: 'semiconductor-pli', headline: 'India\'s ₹1.2 Lakh Crore Semiconductor Push', summary: 'PLI scheme analysis and employment impact.', publishedAt: '2026-07-01T06:00:00Z', readingTime: 14, evidenceScore: 85, category: 'technology' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'Which ILO conventions has India ratified?', answer: 'India has ratified 47 ILO conventions including 6 of the 8 Fundamental Conventions. In 2021, India ratified the two core conventions on child labour (Minimum Age C138 and Worst Forms C182).' },
          { question: 'How does ILO data influence Indian labour policy?', answer: 'ILO\'s India Employment Reports provide critical data on unemployment, informal sector size, wage trends, and social protection gaps that inform the government\'s labour code reforms and employment generation schemes.' },
        ],
        sources: [{ name: 'ILO India Decent Work', url: 'https://ilo.org/newdelhi', type: 'international', description: 'ILO India country office.' }],
      },
      {
        id: 'brics', slug: 'brics', name: 'BRICS',image: '/images/entities/brics.jpg', 
        type: 'organization', description: 'India is a founding member of BRICS (2009), the grouping of major emerging economies. BRICS has evolved from an economic cooperation forum to a platform for reforming global governance institutions. India uses BRICS to advance its positions on UNSC reform, counter-terrorism, multilateral development bank reform, and the creation of alternative payment systems.',
        aliases: ['BRICS', 'BRICS Nations'], storyCount: 2, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '2009-06-16', title: 'First BRIC Summit', description: 'First BRIC summit in Yekaterinburg with Brazil, Russia, India, and China.' },
          { date: '2010-12-01', title: 'South Africa Joins', description: 'South Africa joins, making it BRICS.' },
          { date: '2021-09-01', title: 'BRICS Expansion Framework', description: 'BRICS agrees on expansion criteria; India supports inclusive expansion.' },
        ],
        statistics: { 'Member Countries': '11', 'Global GDP Share': '35%+', 'NDB Established': '2015' },
        relatedStories: [
          { slug: 'india-china-relations', headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry', summary: 'Border tensions, trade deficit, and strategic competition between Asia\'s giants.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
          { slug: 'india-russia-relations', headline: 'India-Russia: The Enduring Partnership Tested by War and Realignment', summary: 'Defence ties, oil imports, and strategic partnership dynamics.', publishedAt: '2026-08-25T10:00:00Z', readingTime: 14, evidenceScore: 90, category: 'geopolitics' },
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'India\'s transformation from non-alignment to pragmatic multi-alignment.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What is India\'s role in BRICS?', answer: 'India uses BRICS to advocate for UNSC reform, counter-terrorism cooperation, multilateral development bank reform, and strengthening South-South cooperation.' },
          { question: 'What is the New Development Bank (NDB)?', answer: 'The NDB, established by BRICS in 2015 with headquarters in Shanghai, provides infrastructure funding for emerging economies. India has received over $6 billion in NDB loans for infrastructure projects.' },
        ],
        sources: [{ name: 'Ministry of External Affairs — BRICS', url: 'https://mea.gov.in/brics', type: 'government', description: 'India\'s official BRICS portal.' }],
      },
      {
        id: 'sco', slug: 'sco', name: 'Shanghai Cooperation Organisation',image: '/images/entities/sco.jpg', 
        type: 'organization', description: 'India became a full member of the SCO in 2017, elevating its role in Eurasian security and economic cooperation. India\'s SCO membership provides a platform to engage with Central Asian republics on energy security, counter-terrorism, connectivity (INSTC), and Afghanistan stability. India hosted the SCO Heads of Government meeting in 2020.',
        aliases: ['SCO', 'Shanghai Cooperation Organization', 'Shanghai Pact'], storyCount: 1, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '2015-07-10', title: 'Observer to Member', description: 'India granted observer status at SCO Ufa Summit.' },
          { date: '2017-06-09', title: 'Full Membership', description: 'India becomes a full member of SCO at Astana Summit.' },
          { date: '2020-11-30', title: 'SCO Host', description: 'India hosts SCO Heads of Government virtual meeting.' },
        ],
        statistics: { 'Member Since': '2017', 'SCO Member States': '9', 'Global Population Covered': '40%+' },
        relatedStories: [
          { slug: 'india-china-relations', headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry', summary: 'SCO membership and strategic competition dynamics.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
          { slug: 'india-russia-relations', headline: 'India-Russia: The Enduring Partnership Tested by War and Realignment', summary: 'Defence partnership and SCO cooperation.', publishedAt: '2026-08-25T10:00:00Z', readingTime: 14, evidenceScore: 90, category: 'geopolitics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'Why is SCO membership important for India?', answer: 'SCO membership allows India to engage Central Asian states on energy security, counter-terrorism, and connectivity projects like the International North-South Transport Corridor (INSTC) while balancing China and Pakistan\'s influence in the grouping.' },
          { question: 'What are India\'s priorities within SCO?', answer: 'India focuses on counter-terrorism cooperation, regional connectivity, Afghanistan stability, and countering radicalisation through the SCO\'s Regional Anti-Terrorist Structure (RATS).' },
        ],
        sources: [{ name: 'Ministry of External Affairs — SCO', url: 'https://mea.gov.in/sco', type: 'government', description: 'India\'s official SCO portal.' }],
      },
      {
        id: 'g20', slug: 'g20', name: 'G20',image: '/images/entities/g20.jpg', 
        type: 'organization', description: 'India is a founding member of the G20 (1999) and held a landmark Presidency in 2023, hosting the New Delhi Leaders\' Summit. Under India\'s presidency, the G20 focused on climate finance, digital public infrastructure, women-led development, and Global South representation. India\'s push for the African Union\'s permanent G20 membership was a key diplomatic achievement.',
        aliases: ['G20', 'Group of Twenty', 'G20 Nations'], storyCount: 2, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1999-09-26', title: 'G20 Founded', description: 'India joins as a founding member of the G20 finance ministers forum.' },
          { date: '2008-11-14', title: 'G20 Leaders Summit', description: 'First G20 Leaders Summit on financial crisis response.' },
          { date: '2023-09-09', title: 'India\'s G20 Presidency', description: 'India hosts the G20 New Delhi Summit; African Union admitted as permanent member.' },
        ],
        statistics: { 'G20 GDP Share': '85%', 'India Presidency Year': '2023', 'New Delhi Summit Outcomes': '100+' },
        relatedStories: [
          { slug: 'india-us-relations', headline: 'India-US Relations: From Nuclear Deal to Critical Technology Partnership', summary: 'Strategic partnership and G20 cooperation dynamics.', publishedAt: '2026-08-15T10:00:00Z', readingTime: 16, evidenceScore: 91, category: 'geopolitics' },
          { slug: 'india-europe-relations', headline: 'India and Europe: A Strategic Partnership Searching for Substance', summary: 'India-EU relations and G20 presidency outcomes.', publishedAt: '2026-08-22T10:00:00Z', readingTime: 14, evidenceScore: 88, category: 'geopolitics' },
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'India\'s G20 presidency and global governance leadership.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What did India achieve during its G20 presidency?', answer: 'India successfully secured consensus on the New Delhi Leaders\' Declaration amid geopolitical tensions, pushed for African Union permanent membership, launched the Global Biofuels Alliance, and advanced the Digital Public Infrastructure (DPI) agenda.' },
          { question: 'How does the G20 affect Indian economic policy?', answer: 'G20 commitments influence India\'s positions on climate finance, digital taxation, cryptocurrency regulation, debt restructuring frameworks, and multilateral development bank reform.' },
        ],
        sources: [{ name: 'G20 India Presidency Website', url: 'https://g20.org', type: 'international', description: 'Official G20 portal.' }],
      },
      {
        id: 'saarc', slug: 'saarc', name: 'South Asian Association for Regional Cooperation',image: '/images/entities/saarc.jpg', 
        type: 'organization', description: 'India is a founding member of SAARC (1985), the primary regional cooperation forum in South Asia. SAARC has been largely paralysed due to India-Pakistan tensions, with the 19th SAARC Summit (scheduled for 2016 in Islamabad) indefinitely postponed. India has shifted focus to sub-regional initiatives like BBIN (Bangladesh-Bhutan-India-Nepal) and BIMSTEC as functional alternatives.',
        aliases: ['SAARC', 'South Asian Association for Regional Co-operation'], storyCount: 1, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1985-12-08', title: 'SAARC Founded', description: 'India is a founding member at the Dhaka Summit.' },
          { date: '1993-04-11', title: 'SAFTA Agreement', description: 'SAARC Preferential Trading Arrangement (SAPTA) signed.' },
          { date: '2016-11-01', title: '19th Summit Postponed', description: 'SAARC summit indefinitely postponed after India pulls out over cross-border terrorism concerns.' },
        ],
        statistics: { 'Member States': '8', 'SAARC Summits Held': '18', 'Trade as % of GDP': '5%' },
        relatedStories: [
          { slug: 'india-indonesia-relations', headline: 'India-Indonesia: How Maritime Neighbours Are Reshaping the Indo-Pacific', summary: 'India\'s Act East policy and regional cooperation beyond SAARC.', publishedAt: '2026-08-18T10:00:00Z', readingTime: 12, evidenceScore: 87, category: 'geopolitics' },
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'Neighbourhood First policy and regional diplomacy.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'Why is SAARC considered ineffective?', answer: 'SAARC has been paralysed by India-Pakistan tensions, with the 19th Summit postponed indefinitely since 2016. Intra-regional trade is only 5% of member GDP, far below ASEAN\'s 25%, and institutional mechanisms remain weak.' },
          { question: 'What alternatives has India pursued to SAARC?', answer: 'India has prioritised sub-regional groupings like BIMSTEC (Bay of Bengal), BBIN (Bangladesh-Bhutan-India-Nepal motor vehicles agreement), and the India-Nepal-Bhutan hydropower cooperation as more effective platforms.' },
        ],
        sources: [{ name: 'SAARC Secretariat', url: 'https://saarc-sec.org', type: 'international', description: 'Official SAARC secretariat.' }],
      },
      {
        id: 'commonwealth', slug: 'commonwealth', name: 'Commonwealth of Nations',image: '/images/entities/commonwealth.jpg', 
        type: 'organization', description: 'India joined the Commonwealth in 1947 as a republic, the first Asian member. India is the largest member by population and one of the largest financial contributors. The Commonwealth provides India with a platform for development cooperation, technical assistance, and promoting Commonwealth values among 56 member states. India hosts the Commonwealth of Learning headquarters in New Delhi.',
        aliases: ['Commonwealth', 'Commonwealth of Nations', 'British Commonwealth'], storyCount: 1, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1947-08-15', title: 'India Joins Commonwealth', description: 'India becomes the first Asian republic to join the Commonwealth.' },
          { date: '1950-01-26', title: 'Republic Status Confirmed', description: 'India continues Commonwealth membership as a republic.' },
          { date: '2022-06-25', title: 'Commonwealth Heads of Government', description: 'India participates in CHOGM 2022 in Rwanda.' },
        ],
        statistics: { 'Commonwealth Members': '56', 'Combined GDP': '$15 trillion', 'India\'s Population Share': '60%+' },
        relatedStories: [
          { slug: 'india-uk-relations', headline: 'India-UK Relations: Beyond Colonial History to a Modern Strategic Partnership', summary: 'Comprehensive Strategic Partnership, FTA, and Commonwealth ties.', publishedAt: '2026-08-23T10:00:00Z', readingTime: 13, evidenceScore: 86, category: 'geopolitics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'How does India benefit from Commonwealth membership?', answer: 'India leverages Commonwealth platforms for technical assistance programmes, trade links with small island states, and promoting Commonwealth values of democracy and development among developing nations.' },
          { question: 'What is India\'s role in the Commonwealth?', answer: 'India is the largest Commonwealth member by population and a major financial contributor, supporting development programmes through the Commonwealth Fund for Technical Co-operation.' },
        ],
        sources: [{ name: 'Commonwealth Secretariat', url: 'https://commonwealth.int', type: 'international', description: 'Official Commonwealth secretariat.' }],
      },
      {
        id: 'adb', slug: 'adb', name: 'Asian Development Bank',image: '/images/entities/adb.jpg', 
        type: 'organization', description: 'India is a founding member of the Asian Development Bank (1966) and its fourth-largest shareholder. ADB lends $3-4 billion annually to India for infrastructure, transport, energy, urban development, and financial sector projects. India-hosted ADB projects include the Delhi Metro, national highway corridors, and the Assam electricity grid strengthening.',
        aliases: ['ADB', 'Asian Development Bank'], storyCount: 2, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1966-11-22', title: 'ADB Established', description: 'India is a founding member of ADB.' },
          { date: '2007-12-01', title: 'India Co-financing', description: 'ADB expands India portfolio to $4 billion annual lending.' },
          { date: '2023-07-01', title: 'India-ADB Country Partnership', description: 'ADB approves $10 billion country partnership strategy for India.' },
        ],
        statistics: { 'Annual Lending to India': '$3-4 billion', 'Shareholding': '6.3%', 'Active Projects': '80+' },
        relatedStories: [
          { slug: 'supply-chain-shift', headline: 'The Great Supply Chain Shift: Can India Capture the China+1 Opportunity?', summary: 'Infrastructure development and FDI-driven growth.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
          { slug: 'india-ev-paradox', headline: 'India\'s EV Paradox: Policy Push Meets Ground Reality', summary: 'Infrastructure challenges and electric mobility transition.', publishedAt: '2026-08-10T06:00:00Z', readingTime: 13, evidenceScore: 88, category: 'environment' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What types of projects does ADB fund in India?', answer: 'ADB funds infrastructure projects in transport (metros, highways), energy (renewable, grid modernisation), urban development (smart cities, water supply), and financial sector reforms.' },
          { question: 'How does India\'s ADB shareholding compare?', answer: 'India is ADB\'s fourth-largest shareholder with 6.3% of shares, with the largest project portfolio after Bangladesh in the South Asia region.' },
        ],
        sources: [{ name: 'ADB India', url: 'https://adb.org/countries/india', type: 'international', description: 'ADB India country page.' }],
      },
      {
        id: 'aiib', slug: 'aiib', name: 'Asian Infrastructure Investment Bank',image: '/images/entities/aiib.jpg', 
        type: 'organization', description: 'India is the second-largest shareholder in AIIB (founding member, 2015) after China, with 8.52% voting power. India is AIIB\'s largest borrower, having received over $5 billion in loans for infrastructure projects including rural roads (PMGSY), power transmission, water supply, and renewable energy. AIIB has financed over 20 projects in India.',
        aliases: ['AIIB', 'Asian Infrastructure Investment Bank'], storyCount: 1, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '2015-06-29', title: 'AIIB Founded', description: 'India is a founding member and second-largest shareholder.' },
          { date: '2017-06-01', title: 'First India Project', description: 'AIIB approves $329 million for Andhra Pradesh rural roads.' },
          { date: '2024-03-01', title: 'India Loan Portfolio', description: 'AIIB\'s India portfolio crosses $5 billion across 20 projects.' },
        ],
        statistics: { 'Voting Power': '8.52%', 'Loans to India': '$5 billion+', 'Projects Funded in India': '20+' },
        relatedStories: [
          { slug: 'supply-chain-shift', headline: 'The Great Supply Chain Shift: Can India Capture the China+1 Opportunity?', summary: 'Infrastructure financing and development bank role in India\'s growth.', publishedAt: '2026-08-01T06:00:00Z', readingTime: 13, evidenceScore: 90, category: 'economy' },
          { slug: 'india-china-relations', headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry', summary: 'Chinese-led development finance and infrastructure competition.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'How does AIIB complement other development banks in India?', answer: 'AIIB co-finances with the World Bank and ADB, focusing on sustainable infrastructure, connectivity, and renewable energy projects aligned with India\'s net-zero targets.' },
          { question: 'What is India\'s influence in AIIB governance?', answer: 'As the second-largest shareholder with 8.52% voting power, India has significant influence in AIIB\'s strategic direction and lending priorities, particularly for South Asia.' },
        ],
        sources: [{ name: 'AIIB India Page', url: 'https://aiib.org/en/countries/india', type: 'international', description: 'AIIB country page for India.' }],
      },
      {
        id: 'bimstec', slug: 'bimstec', name: 'Bay of Bengal Initiative for Multi-Sectoral Technical and Economic Cooperation',image: '/images/entities/bimstec.jpg', 
        type: 'organization', description: 'India is a founding member of BIMSTEC (1997), a regional grouping connecting South and Southeast Asia through the Bay of Bengal. BIMSTEC has emerged as India\'s preferred regional platform after SAARC\'s paralysis, with progress on free trade agreements, connectivity (India-Myanmar-Thailand trilateral highway), counter-terrorism, and energy cooperation.',
        aliases: ['BIMSTEC', 'Bay of Bengal Initiative'], storyCount: 1, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1997-06-06', title: 'BIMSTEC Founded', description: 'India is a founding member with Bangladesh, Sri Lanka, Thailand, Myanmar, Nepal, and Bhutan.' },
          { date: '2023-11-01', title: 'India Hosts BIMSTEC', description: 'India hosts BIMSTEC Foreign Ministers\' Retreat.' },
        ],
        statistics: { 'Member States': '7', 'Combined GDP': '$4.5 trillion', 'Population': '1.8 billion' },
        relatedStories: [
          { slug: 'india-indonesia-relations', headline: 'India-Indonesia: How Maritime Neighbours Are Reshaping the Indo-Pacific', summary: 'Act East policy and BIMSTEC regional cooperation framework.', publishedAt: '2026-08-18T10:00:00Z', readingTime: 12, evidenceScore: 87, category: 'geopolitics' },
          { slug: 'india-china-relations', headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry', summary: 'Regional grouping dynamics and India\'s strategic alternatives.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'Why has India prioritised BIMSTEC over SAARC?', answer: 'BIMSTEC excludes Pakistan, allowing for more functional cooperation. It also connects India to ASEAN through Myanmar and Thailand, supporting India\'s Act East policy.' },
          { question: 'What are the key BIMSTEC projects for India?', answer: 'Key projects include the India-Myanmar-Thailand Trilateral Highway, BIMSTEC Free Trade Area negotiations, grid interconnection for energy security, and counter-terrorism cooperation mechanisms.' },
        ],
        sources: [{ name: 'BIMSTEC Secretariat', url: 'https://bimstec.org', type: 'international', description: 'Official BIMSTEC secretariat.' }],
      },
      {
        id: 'quad', slug: 'quad', name: 'Quadrilateral Security Dialogue',image: '/images/entities/quad.jpg', 
        type: 'organization', description: 'The Quad (Quadrilateral Security Dialogue) is a strategic forum comprising India, Australia, Japan, and the United States. Revived in 2017, the Quad focuses on a free and open Indo-Pacific, maritime security, critical and emerging technology cooperation, climate action, and infrastructure investment through the Quad Infrastructure Fellowship.',
        aliases: ['Quad', 'Quadrilateral Security Dialogue', 'Quad Grouping'], storyCount: 1, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '2007-05-01', title: 'First Quad Meeting', description: 'Initial quadrilateral meeting on the sidelines of ASEAN.' },
          { date: '2017-11-12', title: 'Quad Revived', description: 'Quad revived at ASEAN East Asia Summit with focus on Indo-Pacific.' },
          { date: '2021-03-12', title: 'First Leaders\' Summit', description: 'First Quad Leaders\' Virtual Summit held.' },
        ],
        statistics: { 'Member Nations': '4', 'Combined GDP': '$30 trillion+', 'Vaccine Doses Donated (Quad)': '1.2 billion' },
        relatedStories: [
          { slug: 'india-us-relations', headline: 'India-US Relations: From Nuclear Deal to Critical Technology Partnership', summary: 'Quad cooperation and Indo-Pacific strategic alignment.', publishedAt: '2026-08-15T10:00:00Z', readingTime: 16, evidenceScore: 91, category: 'geopolitics' },
          { slug: 'india-china-relations', headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry', summary: 'Quad\'s role in countering Chinese influence in the Indo-Pacific.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'Quad as a pillar of India\'s multi-alignment strategy.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What is India\'s role in the Quad?', answer: 'India uses the Quad platform to advance its Indo-Pacific vision, maritime security cooperation, and build alternative supply chains to reduce dependence on any single country.' },
          { question: 'What are the Quad\'s key initiatives?', answer: 'Key initiatives include the Quad Vaccine Partnership (1.2 billion doses), Maritime Domain Awareness cooperation, Critical and Emerging Technology (CET) working group, and the Quad Infrastructure Fellowship.' },
        ],
        sources: [{ name: 'MEA — Quad', url: 'https://mea.gov.in/quad', type: 'government', description: 'Indian MEA page on Quad.' }],
      },
      {
        id: 'nam', slug: 'nam', name: 'Non-Aligned Movement',image: '/images/entities/nam.jpg', 
        type: 'organization', description: 'India is a founding member of the Non-Aligned Movement (1961), established during the Cold War to provide an alternative to US and Soviet blocs. India was a leading force in NAM under Prime Ministers Nehru, Indira Gandhi, and Rao. While NAM\'s relevance declined after the Cold War, India continues to use it as a platform for South-South cooperation, multilateralism, and developing country solidarity.',
        aliases: ['NAM', 'Non-Aligned Movement'], storyCount: 0, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1961-09-01', title: 'NAM Founded', description: 'First NAM Summit in Belgrade; India is a founding member.' },
          { date: '1983-03-01', title: 'India Chairs NAM', description: 'India hosts and chairs the 7th NAM Summit in New Delhi.' },
        ],
        statistics: { 'Founding Members': '25', 'Current Members': '120', 'India\'s NAM Chair': '1983' },
        relatedStories: [
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'India\'s evolution from NAM to multi-alignment strategy.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What was India\'s role in founding NAM?', answer: 'Prime Minister Jawaharlal Nehru was a founding leader of NAM along with Tito (Yugoslavia), Nasser (Egypt), Sukarno (Indonesia), and Nkrumah (Ghana).' },
          { question: 'Is NAM still relevant for India?', answer: 'While NAM\'s Cold War relevance has diminished, India continues to use it for South-South cooperation, advocating for multilateralism, UNSC reform, and developing country positions on climate finance and trade.' },
        ],
        sources: [{ name: 'Ministry of External Affairs — NAM', url: 'https://mea.gov.in/nam', type: 'government', description: 'Indian MEA page on NAM.' }],
      },
      {
        id: 'g77', slug: 'g77', name: 'Group of 77',
        type: 'organization', description: 'India is a founding member of the G77 (1964), the largest intergovernmental organisation of developing countries at the United Nations. India plays a leading role in G77+China negotiations on climate finance, technology transfer, WTO trade negotiations, the Sustainable Development Goals, and reform of international financial institutions.',
        aliases: ['G77', 'Group of 77', 'G77+China'], storyCount: 0, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1964-06-15', title: 'G77 Founded', description: 'India is a founding member of the G77 at the first UNCTAD in Geneva.' },
          { date: '2023-09-01', title: 'G77+China Summit', description: 'India participates in the G77+China Summit in Havana.' },
        ],
        statistics: { 'Member States': '134', 'Global Population Represented': '80%+', 'Founded': '1964' },
        relatedStories: [
          { slug: 'climate-finance', headline: 'India\'s ₹11 Lakh Crore Climate Finance Challenge', summary: 'Climate finance negotiations and developing country coordination.', publishedAt: '2026-07-10T06:00:00Z', readingTime: 13, evidenceScore: 87, category: 'environment' },
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'Global South leadership and multilateral diplomacy.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'How does India use the G77 platform?', answer: 'India leads G77+China negotiations on climate finance (common but differentiated responsibilities), WTO special and differential treatment, technology transfer, and reform of multilateral development banks.' },
          { question: 'What is India\'s influence in G77?', answer: 'As one of the largest and most influential members, India often coordinates the G77+China position on climate change negotiations (UNFCCC), trade, and South-South cooperation.' },
        ],
        sources: [{ name: 'G77 Official Website', url: 'https://g77.org', type: 'international', description: 'Official G77 portal.' }],
      },
      {
        id: 'fatf', slug: 'fatf', name: 'Financial Action Task Force',
        type: 'organization', description: 'India became a full member of the Financial Action Task Force (FATF) in 2010, the global standard-setter for anti-money laundering (AML) and combating the financing of terrorism (CFT). FATF membership is critical for India\'s financial system integrity, and India has faced FATF scrutiny regarding Pakistan\'s compliance with CFT obligations. India\'s Prevention of Money Laundering Act (PMLA) is aligned with FATF recommendations.',
        aliases: ['FATF', 'Financial Action Task Force'], storyCount: 1, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '2010-06-01', title: 'India Joins FATF', description: 'India becomes the 34th member of FATF.' },
          { date: '2013-02-01', title: 'FATF Mutual Evaluation', description: 'FATF conducts its first mutual evaluation of India.' },
          { date: '2023-10-01', title: 'India FATF Presidency', description: 'India takes over FATF Presidency for 2024-25.' },
        ],
        statistics: { 'FATF Member Since': '2010', 'FATF Recommendations': '40', 'FATF Presidency': '2024-25' },
        relatedStories: [
          { slug: 'india-china-relations', headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry', summary: 'Financial security and counter-terrorism financing frameworks.', publishedAt: '2026-08-20T10:00:00Z', readingTime: 17, evidenceScore: 93, category: 'geopolitics' },
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'Financial integrity and international security cooperation.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'Why is FATF membership important for India?', answer: 'FATF membership ensures India\'s banking and financial systems are not blacklisted, which would severely impact international transactions, remittances, and trade finance.' },
          { question: 'How has India used FATF for diplomatic leverage?', answer: 'India has pushed for Pakistan\'s continued grey-listing through FATF\'s International Cooperation Review Group (ICRG) process, citing Pakistan\'s inadequate action against UN-designated terrorist entities.' },
        ],
        sources: [{ name: 'FATF Official Website', url: 'https://fatf-gafi.org', type: 'international', description: 'Official FATF website.' }],
      },
      {
        id: 'isa', slug: 'isa', name: 'International Solar Alliance',image: '/images/entities/isa.jpg', 
        type: 'organization', description: 'India co-founded the International Solar Alliance (ISA) with France at the COP21 in Paris (2015). Headquartered in Gurugram, India, the ISA is a treaty-based intergovernmental organisation with 120+ member countries focused on mobilising $1 trillion in solar energy investments by 2030. The ISA demonstrates India\'s leadership in climate action and renewable energy diplomacy.',
        aliases: ['ISA', 'International Solar Alliance'], storyCount: 1, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '2015-11-30', title: 'ISA Launched', description: 'India and France launch ISA at COP21 in Paris.' },
          { date: '2017-12-06', title: 'ISA Treaty Enters Force', description: 'ISA Framework Agreement enters into force with 15+ member ratifications.' },
          { date: '2023-09-01', title: 'Global Biofuels Alliance', description: 'India launches Global Biofuels Alliance under ISA framework during G20.' },
        ],
        statistics: { 'Member Countries': '120+', 'Target Investment': '$1 trillion by 2030', 'Headquarters': 'Gurugram, India' },
        relatedStories: [
          { slug: 'climate-finance', headline: 'India\'s ₹11 Lakh Crore Climate Finance Challenge', summary: 'Renewable energy leadership and solar alliance cooperation.', publishedAt: '2026-07-10T06:00:00Z', readingTime: 13, evidenceScore: 87, category: 'environment' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What is India\'s role in the ISA?', answer: 'India co-founded the ISA, hosts its headquarters in Gurugram, provides the largest financial contribution, and drives its solar finance agenda including the $2 billion Solar Technology Mission.' },
          { question: 'What ISA achievements are attributed to India?', answer: 'ISA under India\'s leadership has launched the Solar pump programme for African nations, the Global Solar Facility for de-risking solar investments, and the World Solar Bank proposal.' },
        ],
        sources: [{ name: 'International Solar Alliance', url: 'https://isolaralliance.org', type: 'international', description: 'Official ISA website.' }],
      },
      {
        id: 'iora', slug: 'iora', name: 'Indian Ocean Rim Association',image: '/images/entities/iora.jpg', 
        type: 'organization', description: 'India is a founding member of the Indian Ocean Rim Association (IORA, 1997), the primary regional organisation for the Indian Ocean region. IORA focuses on maritime safety, blue economy, fisheries management, disaster risk reduction, and connectivity. India has used IORA to advance its SAGAR (Security and Growth for All in the Region) policy for Indian Ocean maritime governance.',
        aliases: ['IORA', 'Indian Ocean Rim Association', 'IOR-ARC'], storyCount: 0, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '1997-03-01', title: 'IORA Founded', description: 'India is a founding member in Mauritius.' },
          { date: '2021-11-01', title: 'IORA Presidency', description: 'India chairs IORA as Vice Chair for 2021-23.' },
        ],
        statistics: { 'Member States': '23', 'Indian Ocean Trade Volume': '$7 trillion', 'Dialogue Partners': '11' },
        relatedStories: [
          { slug: 'india-indonesia-relations', headline: 'India-Indonesia: How Maritime Neighbours Are Reshaping the Indo-Pacific', summary: 'Indian Ocean maritime security and regional cooperation.', publishedAt: '2026-08-18T10:00:00Z', readingTime: 12, evidenceScore: 87, category: 'geopolitics' },
          { slug: 'indias-foreign-policy', headline: 'India\'s Foreign Policy at 80: From Non-Alignment to Multi-Alignment', summary: 'SAGAR policy and Indian Ocean maritime governance.', publishedAt: '2026-08-05T06:00:00Z', readingTime: 18, evidenceScore: 90, category: 'politics' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What role does India play in IORA?', answer: 'India drives IORA\'s maritime safety and security agenda under its SAGAR policy, focusing on blue economy, sustainable fisheries, and marine pollution.' },
          { question: 'How does IORA benefit India strategically?', answer: 'IORA provides a framework for India to counterbalance China\'s influence in the Indian Ocean region, securing sea lanes of communication that carry 80% of India\'s trade.' },
        ],
        sources: [{ name: 'IORA Official Website', url: 'https://iora.int', type: 'international', description: 'Official IORA secretariat.' }],
      },
      {
        id: 'cdri', slug: 'cdri', name: 'Coalition for Disaster Resilient Infrastructure',image: '/images/entities/cdri.jpg', 
        type: 'organization', description: 'India co-founded and hosts the Coalition for Disaster Resilient Infrastructure (CDRI, 2019), a global partnership of 40+ countries and organisations to promote climate and disaster-resilient infrastructure systems. CDRI, headquartered in New Delhi, is a flagship Indian initiative demonstrating leadership in climate adaptation, complementing India\'s Infrastructure for Resilient Island States (IRIS) for small island nations.',
        aliases: ['CDRI', 'Coalition for Disaster Resilient Infrastructure'], storyCount: 0, updatedAt: '2026-07-01T00:00:00Z',
        timeline: [
          { date: '2019-09-23', title: 'CDRI Launched', description: 'India launches CDRI at the UN Climate Action Summit in New York.' },
          { date: '2022-03-01', title: 'CDRI Headquarters', description: 'CDRI establishes headquarters in New Delhi.' },
        ],
        statistics: { 'Member Countries': '40+', 'CDRI Infrastructure Assessments': '25+', 'Headquarters': 'New Delhi' },
        relatedStories: [
          { slug: 'climate-finance', headline: 'India\'s ₹11 Lakh Crore Climate Finance Challenge', summary: 'Climate adaptation infrastructure and disaster resilience.', publishedAt: '2026-07-10T06:00:00Z', readingTime: 13, evidenceScore: 87, category: 'environment' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What is India\'s role in CDRI?', answer: 'India co-founded CDRI, hosts its secretariat in New Delhi, and provides primary funding. CDRI advances India\'s leadership on climate adaptation and resilience for developing countries.' },
          { question: 'What are CDRI\'s key programmes?', answer: 'CDRI conducts infrastructure risk assessments, develops resilience standards for power, transport, water, and telecom sectors, and runs the IRIS (Infrastructure for Resilient Island States) programme for small island developing states.' },
        ],
        sources: [{ name: 'CDRI Official Website', url: 'https://cdri.world', type: 'international', description: 'Official CDRI website.' }],
      },
      {
        id: 'icmr', slug: 'icmr', name: 'Indian Council of Medical Research',
        type: 'organization', description: 'The Indian Council of Medical Research (ICMR) is India\'s apex body for biomedical research, operating under the Ministry of Health & Family Welfare. ICMR conducts and coordinates research on national health priorities including mental health, communicable diseases, and public health surveillance.',
        aliases: ['ICMR', 'Indian Council of Medical Research'], storyCount: 1, updatedAt: '2026-07-11T00:00:00Z',
        timeline: [
          { date: '1911-01-01', title: 'ICMR Established', description: 'Founded as the Indian Research Fund Association.' },
          { date: '2023-01-01', title: 'Adolescent Health Survey', description: 'ICMR publishes Adolescent Health Survey covering mental health, nutrition, and risk behaviours.' },
        ],
        statistics: { 'Founded': '1911', 'Research Institutes': '25+', 'Annual Budget': '₹2,800 crore' },
        relatedStories: [
          { slug: 'youth-mental-health-crisis', headline: 'Youth Mental Health Crisis in India: Understanding Rising Suicide Rates', summary: 'ICMR data on adolescent depression and mental health infrastructure gaps.', publishedAt: '2026-07-11T12:00:00Z', readingTime: 12, evidenceScore: 91, category: 'health' },
          { slug: '81-crore-data-breach', headline: '81 Crore Data Breach: India\'s Largest Ever Cybersecurity Incident', summary: 'ICMR-linked data breach exposed Aadhaar and passport data.', publishedAt: '2026-06-01T06:00:00Z', readingTime: 10, evidenceScore: 95, category: 'cybersecurity' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What is ICMR\'s role in mental health research?', answer: 'ICMR conducts India\'s largest epidemiological studies on mental health prevalence, including the National Mental Health Survey (2015-16) and the Adolescent Health Survey (2023), which provide the primary data on India\'s mental health burden.' },
        ],
        sources: [{ name: 'ICMR Official Website', url: 'https://icmr.gov.in', type: 'government', description: 'Official ICMR portal.' }],
      },
      {
        id: 'ministry-of-education', slug: 'ministry-of-education', name: 'Ministry of Education',
        type: 'organization', description: 'The Ministry of Education (MoE) is the Indian government ministry responsible for education policy, school education, and higher education. It formulates and implements national education policies including NEP 2020, the Right to Education Act, and administers schemes like Samagra Shiksha Abhiyan.',
        aliases: ['Ministry of Education', 'MoE', 'Education Ministry'], storyCount: 1, updatedAt: '2026-07-11T00:00:00Z',
        timeline: [
          { date: '2020-07-30', title: 'NEP 2020 Announced', description: 'National Education Policy 2020 replaces the 1986 policy.' },
          { date: '2024-03-15', title: 'RTI School Counsellor Data', description: 'Ministry confirms only 12% of schools have counsellors via RTI response.' },
        ],
        statistics: { 'Founded': '1947', 'Budget 2025-26': '₹1.20 lakh crore', 'Schools Covered': '15 lakh+' },
        relatedStories: [
          { slug: 'youth-mental-health-crisis', headline: 'Youth Mental Health Crisis in India: Understanding Rising Suicide Rates', summary: 'Ministry\'s NEP 2020 counsellor mandate and implementation gaps.', publishedAt: '2026-07-11T12:00:00Z', readingTime: 12, evidenceScore: 91, category: 'health' },
        ], relatedEntities: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
        faq: [
          { question: 'What is the Ministry doing about mental health in schools?', answer: 'NEP 2020 mandates counsellors in every school and life skills education. However, implementation data shows only 12% of schools have counsellors. The Ministry is working on a National Mental Health in Schools framework as of 2026.' },
        ],
        sources: [{ name: 'Ministry of Education Official Website', url: 'https://education.gov.in', type: 'government', description: 'Official MoE portal.' }],
      },
    ];

    intlEntities.forEach((ie) => {
      entities.set(ie.slug, ie);
      organizations.set(ie.slug, ie);
    });

  entityData.forEach((e) => {
    entities.set(e.slug, e);
    if (e.type === 'country') countries.set(e.slug, e);
    if (e.type === 'organization') organizations.set(e.slug, e);
  });

  // ── Topics ────────────────────────────────────────────────────────

  const topicDefs = [
    { slug: 'economy', name: 'Economy & Finance', description: 'Indian economy, fiscal policy, GDP, inflation, and economic reforms.', stories: [story1, story2, story6, story10, story12, story24, story30, story32, story35], entities: ['rbi', 'ministry-of-finance'] },
    { slug: 'technology', name: 'Technology & Digital India', description: 'Digital transformation, fintech, UPI, 5G, and technology policy.', stories: [story2, story4, story5, story27, story29], entities: ['npci'] },
    { slug: 'cybersecurity', name: 'Cybersecurity & Data Privacy', description: 'Data breaches, cyber threats, digital security, privacy regulation, and India\'s cybersecurity landscape.', stories: [story5, story27], entities: ['icmr', 'cert-in', 'uidai', 'resecurity'] },
    { slug: 'policy', name: 'Policy & Governance', description: 'Government policies, schemes, and public administration.', stories: [story1, story3, story5, story8, story14, story15, story27, story28, story31, story32], entities: ['ministry-of-rural-development', 'ministry-of-agriculture', 'cag', 'election-commission'] },
    { slug: 'agriculture', name: 'Agriculture & Rural Development', description: 'Agriculture policy, crop insurance, rural employment, and farmer welfare.', stories: [story1, story3, story10, story13], entities: ['ministry-of-agriculture', 'mgnrega', 'india'] },
    { slug: 'digital-payments', name: 'Digital Payments & Fintech', description: 'UPI, digital banking, financial inclusion, payment systems, and digital infrastructure.', stories: [story2, story29], entities: ['npci', 'rbi'] },
    { slug: 'employment', name: 'Employment & Labour', description: 'Employment trends, job creation, skilling, and labour market analysis.', stories: [story1, story4], entities: [] },
    { slug: 'environment', name: 'Environment & Climate', description: 'Climate policy, environmental regulation, renewable energy, and sustainability in India.', stories: [story7, story9, story13, story30], entities: [] },
    { slug: 'education', name: 'Education & Skill Development', description: 'Education policy, learning outcomes, NEP implementation, and skill development programmes.', stories: [story8, story14, story23, story36], entities: ['ministry-of-education'] },
    { slug: 'semiconductor', name: 'Semiconductor & Electronics', description: 'Semiconductor manufacturing, electronics PLI, and technology hardware policy.', stories: [story4, story12], entities: [] },
    { slug: 'health', name: 'Health & Nutrition', description: 'Healthcare policy, nutrition programmes, public health infrastructure, cancer care, and health outcomes in India and globally.', stories: [story8, story11, story31, story33, story36], entities: ['who', 'ministry-of-women-and-child-development', 'icmr'] },
    { slug: 'infrastructure', name: 'Infrastructure & Logistics', description: 'Transport, logistics, urban infrastructure, digital connectivity, and infrastructure projects driving India\'s economic growth.', stories: [story12, story29, story30], entities: ['ministry-of-finance'] },
    { slug: 'geopolitics', name: 'Geopolitics & International Relations', description: 'India\'s foreign policy, bilateral relations, international organisations, trade agreements, and global diplomatic engagements.', stories: [story4, story7, story12, story16, story17, story18, story19, story20, story21, story22, story25, story26, story34], entities: ['un', 'wto', 'imf', 'world-bank', 'who', 'ilo', 'brics', 'sco', 'g20', 'saarc', 'commonwealth', 'adb', 'aiib', 'bimstec', 'quad', 'nam', 'g77', 'fatf', 'isa', 'iora', 'cdri', 'india'] },
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
    {
      id: 'semiconductor-pli-timeline', title: 'India\'s Semiconductor Push',
      description: 'Key milestones in India\'s semiconductor manufacturing journey.', category: 'technology',
      events: story4.timeline, storySlugs: ['semiconductor-pli'], dateRange: { start: '2021-12-15', end: '2026-03-15' },
    },
    {
      id: 'dpdp-bill-timeline', title: 'India\'s Data Protection Journey',
      description: 'From the right to privacy judgment to the DPDP Act and its amendments.', category: 'policy',
      events: story5.timeline, storySlugs: ['dpdp-bill'], dateRange: { start: '2017-08-24', end: '2026-03-20' },
    },
    {
      id: 'rbi-repo-rate-timeline', title: 'RBI Monetary Policy Timeline',
      description: 'Key decisions in India\'s monetary policy under the inflation targeting framework.', category: 'economy',
      events: story6.timeline, storySlugs: ['rbi-repo-rate'], dateRange: { start: '2016-10-04', end: '2026-04-08' },
    },
    {
      id: 'climate-finance-timeline', title: 'India\'s Climate Action Timeline',
      description: 'India\'s international climate commitments and renewable energy milestones.', category: 'environment',
      events: story7.timeline, storySlugs: ['climate-finance'], dateRange: { start: '2015-12-12', end: '2026-06-15' },
    },
    {
      id: 'education-budget-timeline', title: 'Education Policy & Budget Timeline',
      description: 'Key milestones in India\'s education policy and budget allocations.', category: 'policy',
      events: story8.timeline, storySlugs: ['education-budget'], dateRange: { start: '2020-07-30', end: '2025-02-01' },
    },
    {
      id: 'groundwater-depletion-timeline', title: 'India\'s Groundwater Crisis Timeline',
      description: 'Key events in India\'s groundwater depletion and conservation efforts.', category: 'environment',
      events: story9.timeline, storySlugs: ['groundwater-depletion'], dateRange: { start: '2012-02-01', end: '2022-03-22' },
    },
    {
      id: 'ration-digitization-timeline', title: 'PDS Digitization Timeline',
      description: 'The journey from NFSA to One Nation One Ration Card.', category: 'economy',
      events: story10.timeline, storySlugs: ['ration-digitization'], dateRange: { start: '2013-09-10', end: '2023-02-01' },
    },
    {
      id: 'anganwadi-icds-timeline', title: 'ICDS — India\'s Nutrition Programme Journey',
      description: 'Key milestones in India\'s Integrated Child Development Services programme.', category: 'health',
      events: story11.timeline, storySlugs: ['anganwadi-icds'], dateRange: { start: '1975-10-02', end: '2025-09-15' },
    },
    {
      id: 'supply-chain-shift-timeline', title: 'India\'s Supply Chain Transformation',
      description: 'From COVID disruptions to the China+1 opportunity, India\'s manufacturing and logistics evolution.', category: 'economy',
      events: story12.timeline, storySlugs: ['supply-chain-shift'], dateRange: { start: '2020-04-01', end: '2026-04-15' },
    },
    {
      id: 'aadhaar-breach-timeline', title: 'The 81.5 Crore Aadhaar Data Breach',
      description: 'Timeline of India\'s largest data breach — from the dark web listing to the investigation and aftermath.', category: 'technology',
      events: story27.timeline, storySlugs: ['81-crore-data-breach'], dateRange: { start: '2020-03-01', end: '2024-06-01' },
    },
  ];

  timelineDefs.forEach((t) => timelines.set(t.id, t));

  // ── The Fix — Seed Solutions ──────────────────────────────────────

  const fix1: APIFix = {
    id: 'fix-mgnrega-reform', slug: 'fix-mgnrega-reform', storySlug: 'mgnrega-reform',
    headline: 'Fixing MGNREGA: 5 Reforms to Make Rural Employment Work',
    summary: 'Two decades of data reveal clear pathways to fix India\'s flagship rural employment scheme — from wage indexation to digital fund tracking.',
    publishedAt: '2026-06-16T10:00:00Z', updatedAt: '2026-06-16T10:00:00Z',
    readingTime: 14, author: { name: 'The Breakdown Editorial' }, evidenceScore: 91,
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
    readingTime: 12, author: { name: 'The Breakdown Editorial' }, evidenceScore: 94,
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

  // ── Fix 3: Air Pollution ───────────────────────────────────────────

  const fix3: APIFix = {
    id: 'fix-air-pollution',
    slug: 'fix-air-pollution',
    storySlug: '',
    headline: 'Fixing India\'s Air Pollution: A Multi-Sector Action Plan',
    summary: 'India has 22 of the world\'s 30 most polluted cities. A comprehensive framework covering transport, industry, agriculture, and household emissions.',
    heroImage: '/images/stories/climate-finance.jpg',
    publishedAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
    readingTime: 15,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 88,
    tags: ['air pollution', 'environment', 'public health', 'NCAP', 'emissions'],
    problem: { title: 'Why Air Pollution Persists', content: 'Despite the National Clean Air Programme (NCAP) targeting 40% reduction in PM2.5 by 2026, 132 of 141 monitored cities have failed to meet air quality standards. Sources vary by region: vehicular emissions dominate in cities, crop stubble burning in the Indo-Gangetic plains, industrial coal in eastern clusters, and household biomass in rural areas.' },
    whoIsAffected: { title: 'Who Is Affected', content: 'Nearly 1.4 billion Indians breathe air exceeding WHO safe limits. Children under 5, elderly, and those with respiratory conditions suffer most. Annual economic loss from premature deaths is estimated at $36 billion (1.4% of GDP).' },
    rootCauses: { title: 'Root Causes', content: 'Seven interconnected drivers: (1) coal-dependent power generation, (2) 26% of vehicles exceeding emission norms, (3) stubble burning from 5 million farms, (4) 50% of industrial units lacking pollution control, (5) construction dust unregulated, (6) 40% of households using solid cooking fuels, (7) weak inter-state coordination on airshed management.' },
    evidence: { title: 'Evidence Base', content: 'ICMR study attributes 1.67 million annual deaths to air pollution. IIT Kanpur source apportionment studies identify local contributions. CSE analysis shows NCAP funding utilisation at only 52% of allocated amount.', supportingData: [{ label: 'Premature Deaths/Year', value: '1.67 million' }, { label: 'Economic Loss', value: '$36 billion' }, { label: 'NCAP Fund Utilisation', value: '52%' }, { label: 'Cities Meeting Standards', value: '9 of 141' }] },
    stakeholders: [
      { name: 'Ministry of Environment, Forest and Climate Change', type: 'government', role: 'Policy formulation and monitoring', interest: 'NCAP implementation', stance: 'supports' },
      { name: 'State Pollution Control Boards', type: 'government', role: 'Enforcement on ground', interest: 'Industrial compliance', stance: 'neutral' },
      { name: 'Farmers in Punjab & Haryana', type: 'citizen', role: 'Stubble burners', interest: 'Low-cost crop residue management', stance: 'opposes' },
      { name: 'Coal India', type: 'private-sector', role: 'Coal supplier', interest: 'Maintaining coal demand', stance: 'mixed' },
    ],
    existingSolutions: [
      { name: 'National Clean Air Programme', description: 'Targets 40% reduction in PM2.5 by 2026 across 141 non-attainment cities.', status: 'active', effectiveness: 'Moderate — funding and implementation lagging', source: 'MoEFCC' },
      { name: 'BS-VI Emission Norms', description: 'Jump from BS-IV to BS-VI since 2020 for all vehicles.', status: 'active', effectiveness: 'High for new vehicles, but 26% of fleet still older than BS-VI standards' },
      { name: 'Graded Response Action Plan', description: 'Emergency measures during severe pollution episodes in NCR.', status: 'active', effectiveness: 'Limited — reactive rather than preventive' },
    ],
    globalExamples: [
      { country: 'China', policy: 'Air Pollution Prevention Action Plan 2013-17', description: 'Closed coal plants, restricted vehicle use, invested in renewable energy.', outcome: 'PM2.5 reduced by 33% in Beijing within 5 years.', source: 'WHO', applicableToIndia: true },
      { country: 'United Kingdom', policy: 'Clean Air Act 1956 & Ultra Low Emission Zone', description: 'Ban on coal burning in cities followed by congestion charging and ULEZ expansion.', outcome: 'London NO2 levels fell 44% in 5 years post-ULEZ.', source: 'UK Government', applicableToIndia: true },
    ],
    recommendedActions: [
      { title: 'Implement an Airshed-Based Governance Model', description: 'Replace city-level approach with regional airshed management for the Indo-Gangetic Plain, with a single authority coordinating 6 states.', priority: 'critical', timeframe: 'immediate', actors: ['MoEFCC', 'State Governments'] },
      { title: 'Scale Up Crop Residue Management Infrastructure', description: 'Provide subsidised happy seeders and ex-situ pelletisation units to all 5 million stubble-burning farms. Complete ban on stubble burning by 2028.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Agriculture', 'State Governments'] },
      { title: 'Retire Coal Plants Within 5 km of Cities', description: 'Phase out 32 coal-fired plants located within 5 km of major cities, replacing with gas or renewable.', priority: 'high', timeframe: 'medium-term', actors: ['Ministry of Power', 'CEA'] },
      { title: 'Expand Electric Vehicle Charging Infrastructure', description: 'Install 1,00,000 public charging points across 50 cities with dedicated green grid supply.', priority: 'medium', timeframe: 'medium-term', actors: ['Ministry of Heavy Industries', 'DISCOMs'] },
      { title: 'Universalize LPG Connections for Rural Households', description: 'Extend Ujjwala scheme to cover remaining 3 crore households using solid fuels.', priority: 'medium', timeframe: 'short-term', actors: ['Ministry of Petroleum', 'State Governments'] },
    ],
    citizenActions: [
      { title: 'Report Polluting Industries', description: 'Use the NCAP mobile app to report visible industrial emissions.', priority: 'low', timeframe: 'immediate', actors: ['Citizens'] },
      { title: 'Switch to Public Transport', description: 'Use metro and bus networks; carpool for commutes longer than 10 km.', priority: 'medium', timeframe: 'short-term', actors: ['Citizens'] },
      { title: 'Install Air Purifiers in Schools', description: 'Advocate and crowdfund air purifier installation in classrooms.', priority: 'low', timeframe: 'medium-term', actors: ['Schools', 'Parents'] },
    ],
    governmentActions: [
      { title: 'Create Unified Airshed Authority', description: 'Pass The Airshed Management Bill 2027 creating a statutory body with powers over 6 Indo-Gangetic states.', priority: 'critical', timeframe: 'immediate', actors: ['Parliament', 'MoEFCC'] },
      { title: 'Double NCAP Budget', description: 'Increase allocation from ₹1,200 crore to ₹2,400 crore with 70% utilisation mandate.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Finance', 'MoEFCC'] },
      { title: 'Mandate Continuous Emissions Monitoring', description: 'All 2,500+ major industrial units must install CEMS with real-time data upload to CPCB portal.', priority: 'high', timeframe: 'short-term', actors: ['CPCB', 'SPCBs'] },
    ],
    metricsToTrack: [
      { name: 'Annual PM2.5 Average', currentValue: '58 µg/m³', targetValue: '35 µg/m³', dataSource: 'CPCB', updateFrequency: 'Annual' },
      { name: 'NCAP Fund Utilisation', currentValue: '52%', targetValue: '90%', dataSource: 'MoEFCC', updateFrequency: 'Quarterly' },
      { name: 'Stubble Burning Incidents', currentValue: '71,000 (2025)', targetValue: '10,000 (2028)', dataSource: 'ISRO / Bhuvan', updateFrequency: 'Seasonal' },
      { name: 'EV Share of New Vehicle Sales', currentValue: '6.5%', targetValue: '30% by 2030', dataSource: 'SIAM / VAHAN', updateFrequency: 'Annual' },
    ],
    relatedStories: [
      { slug: 'climate-finance', headline: 'India\'s Climate Finance Challenge', summary: 'The ₹11 lakh crore gap.', publishedAt: '2026-06-20T10:00:00Z', readingTime: 10, evidenceScore: 87, category: 'environment' },
    ],
    relatedEntities: [
      { id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture', type: 'organization' },
    ],
  };

  // ── Fix 4: Farm Income ────────────────────────────────────────────

  const fix4: APIFix = {
    id: 'fix-farm-income',
    slug: 'fix-farm-income',
    storySlug: '',
    headline: 'Fixing Farm Income: Beyond MSP to a Comprehensive Support System',
    summary: 'Average monthly farm income in India is ₹10,200 per household — below the poverty line. A multi-pronged approach to double farmer incomes.',
    heroImage: '/images/stories/groundwater-depletion.jpg',
    publishedAt: '2026-05-28T10:00:00Z',
    updatedAt: '2026-05-28T10:00:00Z',
    readingTime: 14,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 86,
    tags: ['farm income', 'agriculture', 'MSP', 'PM-KISAN', 'agriculture reform'],
    problem: { title: 'The Farm Income Crisis', content: 'Average monthly income per agricultural household stands at ₹10,200 (NSSO 77th Round). With 86% of farmers owning less than 2 hectares, marginalisation is increasing. Input costs have risen 60% in 5 years while output prices grew only 25%.' },
    whoIsAffected: { title: 'Who Is Affected', content: '14.6 crore farming households (about 80 crore people). Small and marginal farmers (<2 ha) constitute 86% of all farmers. Tenant farmers and landless labourers are most vulnerable.' },
    rootCauses: { title: 'Root Causes', content: '(1) Fragmented landholdings — average size declining from 2.3 ha (1970) to 1.08 ha (2025), (2) Input price inflation outpacing output price growth, (3) MSP coverage limited to 23% of crops, (4) Post-harvest losses of 10-15%, (5) Limited access to institutional credit for small farmers, (6) Climate volatility increasing crop failure risk.' },
    evidence: { title: 'Evidence Base', content: 'NSSO data shows 52% of agricultural households are indebted, average debt per household at ₹1,04,600. Government\'s PM-KISAN transfers ₹6,000/year — one-third the recommendation of the Swaminathan Committee (₹18,000/year minimum support).', supportingData: [{ label: 'Average Monthly Income', value: '₹10,200' }, { label: 'Households in Debt', value: '52%' }, { label: 'MSP Coverage', value: '23% crops' }, { label: 'PM-KISAN Annual', value: '₹6,000' }] },
    stakeholders: [
      { name: 'Ministry of Agriculture and Farmers Welfare', type: 'government', role: 'Policy formulation', interest: 'Farmer welfare', stance: 'supports' },
      { name: 'Farmers\' Unions', type: 'civil-society', role: 'Representing farmer interests', interest: 'Legal MSP guarantee', stance: 'opposes' },
      { name: 'State Governments', type: 'government', role: 'Implementing agri schemes', interest: 'Fiscal burden vs farmer welfare', stance: 'mixed' },
    ],
    existingSolutions: [
      { name: 'PM-KISAN', description: '₹6,000/year direct income support to all farmer families.', status: 'active', effectiveness: 'Moderate — amount insufficient, exclusion errors', source: 'GoI' },
      { name: 'MSP Operations', description: 'Government procurement at Minimum Support Price for 23 crops via NAFED/FCI.', status: 'active', effectiveness: 'Limited — only 6% of farmers access MSP, mostly paddy/wheat in Punjab/Haryana' },
      { name: 'PM-Fasal Bima Yojana', description: 'Crop insurance with 1.5-2% premium for kharif, 5% for commercial crops.', status: 'active', effectiveness: 'Low — only 30% claims paid, delays of 6-12 months' },
    ],
    globalExamples: [
      { country: 'Brazil', policy: 'Family Agriculture Strengthening Program (PRONAF)', description: 'Subsidized credit, technical assistance, and guaranteed purchase for small farmers.', outcome: 'Small farm incomes increased 40% in 10 years.', source: 'FAO', applicableToIndia: true },
      { country: 'European Union', policy: 'Common Agricultural Policy Direct Payments', description: 'Income support decoupled from production, with environmental conditionality.', outcome: 'Farm incomes stabilised within 90% of economy-wide average.', source: 'EU Commission', applicableToIndia: false },
    ],
    recommendedActions: [
      { title: 'Expand PM-KISAN to ₹12,000/Year', description: 'Double direct income support with phased increase over 3 years, linked to inflation indexation.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Finance', 'Ministry of Agriculture'] },
      { title: 'Implement Legal MSP Guarantee for Key Crops', description: 'Start with 12 staple crops, procurement through decentralised agencies with private sector participation.', priority: 'critical', timeframe: 'medium-term', actors: ['Parliament', 'Ministry of Agriculture', 'State Governments'] },
      { title: 'Scale Farmer Producer Organisations', description: 'Target 25,000 FPOs by 2030 with ₹10 lakh each for market linkage infrastructure.', priority: 'high', timeframe: 'medium-term', actors: ['NABARD', 'SFAC', 'State Governments'] },
      { title: 'Post-Harvest Infrastructure Fund', description: 'Create ₹50,000 crore fund for cold storage, warehouses, and processing units near farm clusters.', priority: 'medium', timeframe: 'long-term', actors: ['Ministry of Finance', 'Ministry of Food Processing'] },
    ],
    citizenActions: [
      { title: 'Join Farmer Producer Organisations', description: 'Pool resources through FPOs for better input pricing and market access.', priority: 'medium', timeframe: 'medium-term', actors: ['Farmers'] },
      { title: 'Adopt Crop Diversification', description: 'Shift from water-intensive paddy to millets, pulses, and oilseeds with state support.', priority: 'medium', timeframe: 'medium-term', actors: ['Farmers', 'State Governments'] },
    ],
    governmentActions: [
      { title: 'Pass Farmers\' Income Insurance Bill', description: 'Combine PM-KISAN, MSP, and PMFBY into a unified income insurance framework.', priority: 'critical', timeframe: 'medium-term', actors: ['Parliament', 'Ministry of Agriculture', 'Ministry of Finance'] },
      { title: 'Double Agriculture Budget', description: 'Increase from ₹1.42 lakh crore to ₹2.84 lakh crore with focus on small farmers.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Finance'] },
    ],
    metricsToTrack: [
      { name: 'Average Farm Income', currentValue: '₹10,200/month', targetValue: '₹20,000/month', dataSource: 'NSSO', updateFrequency: 'Annual' },
      { name: 'Farm Household Indebtedness', currentValue: '52%', targetValue: '30%', dataSource: 'NSSO', updateFrequency: 'Annual' },
      { name: 'MSP Coverage', currentValue: '23% crops', targetValue: '50% crops', dataSource: 'Ministry of Agriculture', updateFrequency: 'Annual' },
      { name: 'PM-KISAN Annual Transfer', currentValue: '₹6,000', targetValue: '₹12,000', dataSource: 'DBT Portal', updateFrequency: 'Annual' },
    ],
    relatedStories: [
      { slug: 'pm-fasal-bima-claims', headline: 'PMFBY: Claims and Coverage Gap', summary: 'Crop insurance claims analysis.', publishedAt: '2026-06-18T10:00:00Z', readingTime: 10, evidenceScore: 84, category: 'agriculture' },
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Rural employment assessment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture and Farmers Welfare',image: '/images/entities/ministry-of-agriculture.jpg',  type: 'organization' },
      { id: 'india', slug: 'india', name: 'India', type: 'country' },
    ],
  };

  // ── Fix 5: Judicial Pendency ───────────────────────────────────────

  const fix5: APIFix = {
    id: 'fix-judicial-pendency',
    slug: 'fix-judicial-pendency',
    storySlug: '',
    headline: 'Fixing India\'s Judicial Pendency: 5 Crore Cases and Counting',
    summary: 'India\'s courts have a backlog of over 5 crore cases. A comprehensive reform agenda for judicial infrastructure, appointments, and technology adoption.',
    heroImage: '/images/stories/dpdp-bill.jpg',
    publishedAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
    readingTime: 13,
    author: { name: 'The Breakdown Editorial', bio: 'The Breakdown editorial desk.' },
    evidenceScore: 90,
    tags: ['judiciary', 'pendency', 'legal reform', 'e-courts', 'justice'],
    problem: { title: 'The Pendency Crisis', content: 'Over 5 crore cases pending across all levels of judiciary as of June 2026. Supreme Court: 82,000+, High Courts: 60+ lakh, District & Subordinate: 4.4+ crore. Average case disposal time: 3-15 years depending on court type. Judge-to-population ratio stands at 21 judges per million — far below the Law Commission\'s recommended 50.' },
    whoIsAffected: { title: 'Who Is Affected', content: 'Every Indian litigant — 3.5 crore cases involve undertrial prisoners, 65% of prison inmates are undertrials. Commercial disputes worth ₹5+ lakh crore are locked in litigation. Women seeking maintenance, land dispute claimants, and accident victims face the longest delays.' },
    rootCauses: { title: 'Root Causes', content: '(1) Judge vacancies — 30% of High Court positions unfilled, 20% in lower courts, (2) Inadequate infrastructure — 2,000 court halls needed, (3) Low judge-to-population ratio — 21 per million vs global average of 50-60, (4) Procedural inefficiencies — 30+ adjournments average per case, (5) Low technology adoption outside e-Courts project, (6) High vacancy rate in public prosecutors and legal aid counsel.' },
    evidence: { title: 'Evidence Base', content: 'Law Commission 245th Report recommends 50 judges per million. NJDG data shows pendency growing at 5% annually. NITI Aayog estimates economic cost of judicial delays at 1.5% of GDP.', supportingData: [{ label: 'Total Pending Cases', value: '5+ crore' }, { label: 'Judge-to-Population', value: '21 per million' }, { label: 'Undertrial Prisoners', value: '65%' }, { label: 'Annual GDP Loss', value: '1.5%' }] },
    stakeholders: [
      { name: 'Supreme Court Collegium', type: 'government', role: 'Judicial appointments', interest: 'Maintaining judicial independence', stance: 'supports' },
      { name: 'Ministry of Law and Justice', type: 'government', role: 'Policy and infrastructure', interest: 'Judicial reform', stance: 'supports' },
      { name: 'Bar Councils', type: 'civil-society', role: 'Lawyer representation', interest: 'Member interests', stance: 'mixed' },
      { name: 'High Courts', type: 'government', role: 'Superintendence over lower courts', interest: 'Judicial administration', stance: 'supports' },
    ],
    existingSolutions: [
      { name: 'e-Courts Mission Mode Project', description: 'ICT enablement of courts across India. Phase III (2023-27) with ₹7,000 crore outlay.', status: 'active', effectiveness: 'Moderate — digitization progressing but case disposal rates not improving proportionally', source: 'eCourts.gov.in' },
      { name: 'Fast Track Courts', description: 'Special courts for rape, POCSO, and commercial disputes.', status: 'active', effectiveness: 'High for specific categories — disposal time reduced 40% for rape cases' },
      { name: 'National Judicial Data Grid', description: 'Real-time pendency data across all courts.', status: 'active', effectiveness: 'Effective for transparency but does not directly reduce pendency' },
    ],
    globalExamples: [
      { country: 'Singapore', policy: 'Technology-Mediated Dispute Resolution', description: 'Mandatory online mediation for civil disputes below $60,000; AI-assisted case management.', outcome: '90% of small claims resolved within 3 months.', source: 'Singapore Courts', applicableToIndia: true },
      { country: 'United Kingdom', policy: 'Civil Procedure Rules 1998 & Online Dispute Resolution', description: 'Proportionality principle, case management conferences, online court for claims under £10,000.', outcome: 'Average civil case duration fell from 4 years to 18 months.', source: 'UK Ministry of Justice', applicableToIndia: true },
    ],
    recommendedActions: [
      { title: 'Double Judge Strength to 50 per Million', description: 'Fill all vacancies, create 15,000 new district judge positions, and 500 additional High Court judges over 5 years.', priority: 'critical', timeframe: 'long-term', actors: ['Law Ministry', 'Supreme Court Collegium', 'State Governments', 'UPSC'] },
      { title: 'Budget Allocation to 0.5% of GDP', description: 'Increase judiciary budget from current 0.12% of GDP to 0.5% over 3 years.', priority: 'critical', timeframe: 'short-term', actors: ['Ministry of Finance', 'Law Ministry'] },
      { title: 'Mandatory Pre-Litigation Mediation', description: 'Amend CPC to require mediation for 20 categories of civil disputes before court filing.', priority: 'high', timeframe: 'medium-term', actors: ['Law Commission', 'Parliament'] },
      { title: 'AI-Assisted Case Management System', description: 'Deploy AI tools for case categorization, scheduling, and judgment drafting assistance in all district courts.', priority: 'high', timeframe: 'medium-term', actors: ['e-Courmittee', 'NeGD', 'Law Ministry'] },
      { title: 'Limit Adjournments to Maximum 3 Per Case', description: 'Amend CPC and CrPC to cap adjournments, with monetary costs for each adjournment beyond first.', priority: 'high', timeframe: 'immediate', actors: ['Parliament', 'Supreme Court'] },
    ],
    citizenActions: [
      { title: 'Use Plea Bargaining in Appropriate Cases', description: 'For criminal cases where evidence is strong, plea bargaining can reduce trial time from years to months.', priority: 'low', timeframe: 'immediate', actors: ['Litigants', 'Lawyers'] },
      { title: 'Opt for Mediation', description: 'Choose out-of-court mediation for family, property, and commercial disputes.', priority: 'medium', timeframe: 'immediate', actors: ['Litigants', 'Mediation Centres'] },
      { title: 'File Complaints About Judge Vacancies', description: 'Use RTI and public interest petitions to demand timely judicial appointments.', priority: 'low', timeframe: 'medium-term', actors: ['Citizens', 'Civil Society'] },
    ],
    governmentActions: [
      { title: 'Create All-India Judicial Service', description: 'Constitutional amendment to create a centralised recruitment mechanism for district judges.', priority: 'critical', timeframe: 'long-term', actors: ['Parliament', 'Supreme Court', 'State Governments'] },
      { title: 'Pass Judicial Infrastructure Bill', description: 'Mandate 0.25% of state budgets for court infrastructure with central matching grant.', priority: 'high', timeframe: 'short-term', actors: ['Parliament', 'Ministry of Finance', 'State Governments'] },
    ],
    metricsToTrack: [
      { name: 'Judge-to-Population Ratio', currentValue: '21/million', targetValue: '50/million', dataSource: 'DoJ Annual Report', updateFrequency: 'Annual' },
      { name: 'Case Disposal Time (Average)', currentValue: '3.7 years', targetValue: '1 year', dataSource: 'NJDG', updateFrequency: 'Quarterly' },
      { name: 'Judiciary Budget (% of GDP)', currentValue: '0.12%', targetValue: '0.5%', dataSource: 'Union Budget', updateFrequency: 'Annual' },
      { name: 'Undertrial Prisoners (%)', currentValue: '65%', targetValue: '40%', dataSource: 'NCRB Prison Statistics', updateFrequency: 'Annual' },
    ],
    relatedStories: [
      { slug: 'dpdp-bill', headline: 'Digital Personal Data Protection Bill', summary: 'India\'s privacy law journey.', publishedAt: '2026-08-01T10:00:00Z', readingTime: 10, evidenceScore: 90, category: 'policy' },
    ],
    relatedEntities: [
      { id: 'cag', slug: 'cag', name: 'Comptroller and Auditor General',image: '/images/entities/cag.jpg',  type: 'organization' },
      { id: 'india', slug: 'india', name: 'India', type: 'country' },
    ],
  };

  // ── Fix 6: Anganwadi / ICDS Reform ──────────────────────────────────

  const fix6: APIFix = {
    id: 'fix-anganwadi-reform', slug: 'fix-anganwadi-reform', storySlug: 'anganwadi-icds',
    headline: 'Fixing India\'s Anganwadi System: From Nutrition to Empowerment',
    summary: 'India\'s 14 lakh anganwadi centres are the backbone of child nutrition — but crumbling infrastructure, underpaid workers, and fragmented oversight demand a comprehensive overhaul.',
    publishedAt: '2026-07-30T06:00:00Z', updatedAt: '2026-07-30T06:00:00Z',
    readingTime: 12, author: { name: 'The Breakdown Editorial' }, evidenceScore: 86,
    tags: ['ICDS', 'anganwadi', 'nutrition', 'child development', 'women empowerment'],
    problem: {
      title: 'Anganwadi workers receive below-minimum-wage honorariums with no benefits',
      content: 'India\'s 25 lakh anganwadi workers and helpers receive a monthly honorarium of ₹10,000 and ₹5,000 respectively — below the minimum wage in most states. They have no pension, health insurance, or paid leave. Despite managing nutrition, pre-school education, and health tracking for 10 crore beneficiaries, they are classified as "volunteers" rather than government employees.',
      supportingData: [{ label: 'Average worker honorarium', value: '₹10,000/month' }, { label: 'Minimum wage in Delhi', value: '₹16,792/month' }, { label: 'Centres without toilets', value: '40%' }, { label: 'Workers with pension coverage', value: '0%' }],
    },
    whoIsAffected: {
      title: '25 lakh frontline women workers and 10 crore nutrition beneficiaries',
      content: 'Anganwadi workers are predominantly women (99.7%) from the communities they serve. Their low compensation and lack of benefits perpetuate gender and economic inequality. The ultimate cost falls on 10 crore beneficiaries — children under 6, pregnant women, and lactating mothers — who receive sub-optimal nutrition services.',
      supportingData: [{ label: 'Women workers', value: '99.7%' }, { label: 'Child beneficiaries (under 6)', value: '7.2 crore' }, { label: 'Pregnant/lactating women beneficiaries', value: '2.8 crore' }],
    },
    rootCauses: {
      title: 'Volunteer classification, fragmented funding, and lack of infrastructure accountability',
      content: 'Three structural issues: (1) Workers are classified as "honorary" volunteers rather than employees, excluding them from labour protections, (2) ICDS funding is split across centre (60%), state (40%) with no dedicated infrastructure maintenance budget, (3) No centralised monitoring of anganwadi infrastructure — CAG found 40% of centres lack basic amenities but there is no penalty for state non-compliance.',
      supportingData: [{ label: 'ICDS budget allocation (2025-26)', value: '₹21,200 crore' }, { label: 'Infrastructure maintenance budget', value: 'None' }, { label: 'States with Aadhaar-based attendance', value: '12 of 36' }],
    },
    evidence: {
      title: 'CAG reports, worker surveys, and NFHS data confirm systemic neglect',
      content: 'CAG Audit 2024 found 40% of anganwadi centres lack functional toilets and 35% lack drinking water. National Frontline Workers Survey 2025 documented 68% of workers reporting wage delays of 2-6 months. NFHS-5 shows stunting decline has slowed to 0.8 percentage points per year versus 1.2% in the prior decade.',
      supportingData: [{ label: 'Centres without toilets', value: '40%' }, { label: 'Workers reporting wage delays', value: '68%' }, { label: 'Stunting reduction rate (2016-21)', value: '0.8%/yr' }],
    },
    stakeholders: [
      { name: 'Ministry of Women and Child Development', type: 'government', role: 'ICDS policy and funding', interest: 'Improving programme outcomes', stance: 'supports' },
      { name: 'State Governments', type: 'government', role: 'ICDS implementation', interest: 'Fiscal burden of increased honorariums', stance: 'mixed' },
      { name: 'Anganwadi Workers (AWWs)', type: 'citizen', role: 'Frontline service delivery', interest: 'Better wages, benefits, and working conditions', stance: 'supports' },
      { name: 'All India Anganwadi Workers\' Union', type: 'civil-society', role: 'Worker representation', interest: 'Employee status and minimum wage', stance: 'opposes' },
    ],
    existingSolutions: [
      { name: 'ICDS-CAS (Common Application Software)', description: 'Smartphone-based real-time nutrition tracking and attendance system rolled out to all centres.', status: 'active', effectiveness: 'Moderate — improves accountability but adds to worker workload without compensation', source: 'MWCD' },
      { name: 'POSHAN Abhiyaan', description: 'National Nutrition Mission with targeted stunting reduction goals and inter-sectoral convergence.', status: 'active', effectiveness: 'Moderate — stunting declining but at slowing pace' },
      { name: 'State-Level Honorarium Revisions', description: 'Some states (Kerala, Tamil Nadu, Karnataka) have supplemented central honorarium with state contributions.', status: 'active', effectiveness: 'High but limited to 5 states' },
    ],
    globalExamples: [
      { country: 'Brazil', policy: 'Bolsa Família conditional cash transfers', description: 'Brazil\'s unified conditional cash transfer system uses health and nutrition conditionality monitored by community health workers who are formal government employees with career progression.', outcome: 'Stunting reduced from 37% to 7% in 20 years; frontline workers earn 2x minimum wage.', source: 'World Bank', applicableToIndia: true },
      { country: 'Thailand', policy: 'Community-Based Nutrition Programme', description: 'Thailand\'s nutrition programme trains village health volunteers with monthly stipends, health insurance, and pathways to government nursing positions.', outcome: 'Thailand eliminated severe malnutrition by 2005 and achieved universal health coverage.', source: 'WHO', applicableToIndia: true },
      { country: 'Chile', policy: 'Chile Crece Contigo', description: 'Integrated early childhood development programme with case management, home visits, and guaranteed childcare for vulnerable families.', outcome: 'Developmental delays reduced 30% in high-priority areas within 5 years.', source: 'UNICEF', applicableToIndia: false },
    ],
    recommendedActions: [
      { title: 'Grant Employee Status to Anganwadi Workers', description: 'Reclassify anganwadi workers as government employees with minimum wage, pension (EPS), health insurance (Ayushman Bharat), and paid maternity leave.', priority: 'critical', timeframe: 'immediate', actors: ['MWCD', 'Ministry of Labour', 'Ministry of Finance'] },
      { title: 'Create Infrastructure Maintenance Fund', description: 'Allocate ₹5,000 crore dedicated fund for anganwadi infrastructure upgrades with mandated state matching contribution.', priority: 'high', timeframe: 'short-term', actors: ['MWCD', 'Ministry of Finance', 'State Governments'] },
      { title: 'Reduce Worker-to-Centre Ratio', description: 'Deploy additional workers to reduce the burden from the current 1 worker per centre to 2 workers for centres serving >100 beneficiaries.', priority: 'high', timeframe: 'medium-term', actors: ['MWCD', 'State Governments'] },
      { title: 'Link Honorarium to State Minimum Wage', description: 'Mandate that anganwadi worker honorarium be indexed to state minimum wage, with centre sharing cost 60:40.', priority: 'critical', timeframe: 'short-term', actors: ['MWCD', 'Ministry of Finance', 'State Governments'] },
    ],
    citizenActions: [
      { title: 'Join Anganwadi Management Committees', description: 'Every anganwadi has a community management committee — parents and local residents can join to monitor service quality and infrastructure.', priority: 'medium', timeframe: 'immediate', actors: ['Citizens', 'Local Communities'] },
      { title: 'Report Infrastructure Deficiencies', description: 'Use the ICDS-CAS mobile app or state helpline to report anganwadi centres lacking basic amenities.', priority: 'low', timeframe: 'immediate', actors: ['Citizens'] },
    ],
    governmentActions: [
      { title: 'Pass Anganwadi Workers (Recognition and Welfare) Bill', description: 'Legislate minimum wage, social security, and career progression for all anganwadi workers and helpers.', priority: 'critical', timeframe: 'short-term', actors: ['Parliament', 'MWCD'] },
      { title: 'Triple ICDS Budget to 0.9% of GDP', description: 'Increase allocation from ₹21,200 crore to ₹63,600 crore phased over 3 years, with dedicated infrastructure and honorarium components.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Finance', 'MWCD'] },
      { title: 'Mandate Quarterly Infrastructure Audits', description: 'Central government to conduct third-party quarterly audits of anganwadi infrastructure with public dashboard and state-wise ranking.', priority: 'high', timeframe: 'medium-term', actors: ['CAG', 'MWCD', 'State Governments'] },
    ],
    metricsToTrack: [
      { name: 'Worker honorarium as % of state minimum wage', currentValue: '60% (avg)', targetValue: '100%', dataSource: 'State Labour Departments', updateFrequency: 'Annual' },
      { name: 'Centres with functional toilets', currentValue: '60%', targetValue: '100%', dataSource: 'CAG / MWCD Dashboard', updateFrequency: 'Quarterly' },
      { name: 'Stunting rate (children under 5)', currentValue: '35.5%', targetValue: '25% by 2030', dataSource: 'NFHS', updateFrequency: '3 years' },
      { name: 'Worker vacancy rate', currentValue: '12%', targetValue: '<3%', dataSource: 'MWCD', updateFrequency: 'Annual' },
      { name: 'ICDS budget as % of GDP', currentValue: '0.28%', targetValue: '0.9%', dataSource: 'Union Budget', updateFrequency: 'Annual' },
    ],
    relatedStories: [{ slug: 'anganwadi-icds', headline: 'Anganwadi Centres: Frontline Workers Burning Out', summary: 'India\'s ICDS programme at a crossroads.', publishedAt: '2026-07-28T06:00:00Z', readingTime: 11, evidenceScore: 84, category: 'health' }],
    relatedEntities: [
      { id: 'ministry-of-women-and-child-development', slug: 'ministry-of-women-and-child-development', name: 'Ministry of Women and Child Development',image: '/images/entities/ministry-of-women-and-child-development.jpg',  type: 'organization' },
      { id: 'india', slug: 'india', name: 'India', type: 'country' },
    ],
  };

  fixes.set(fix1.slug, fix1);
  fixes.set(fix2.slug, fix2);
  fixes.set(fix3.slug, fix3);
  fixes.set(fix4.slug, fix4);
  fixes.set(fix5.slug, fix5);
  fixes.set(fix6.slug, fix6);

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

function searchFilter<T>(items: T[], query: string, fields: (keyof T)[]): T[] {
  if (!query) return items;
  const lower = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const val = (item as Record<string, unknown>)[field as string];
      if (val == null) return false;
      const str = typeof val === 'string' ? val : JSON.stringify(val);
      return str.toLowerCase().includes(lower);
    })
  );
}

function sortItems<T>(items: T[], field: string, order: 'asc' | 'desc' = 'desc'): T[] {
  return [...items].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[field];
    const bVal = (b as Record<string, unknown>)[field];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === 'string' && typeof bVal === 'string' ? aVal.localeCompare(bVal) : Number(aVal) - Number(bVal);
    return order === 'desc' ? -cmp : cmp;
  });
}

/* ── Public API ─────────────────────────────────────────────────────── */

export function getStories(params: QueryParams = {}): APIListResponse<APIStory> {
  const s = getStore();
  let items = Array.from(s.stories.values());

  if (params.category) items = items.filter((st) => st.category === params.category);
  const tagFilter = params.tag;
  if (tagFilter) items = items.filter((st) => st.tags.includes(tagFilter));
  const authorFilter = params.author;
  if (authorFilter) items = items.filter((st) => st.author.name.toLowerCase().includes(authorFilter.toLowerCase()));
  const searchQuery = params.search;
  if (searchQuery) items = searchFilter(items, searchQuery, ['headline', 'summary', 'tags']);
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

/* ── Mutations ────────────────────────────────────────────────────────── */

export function upsertStory(slug: string, story: APIStory): void {
  getStore().stories.set(slug, story);
}

export function removeStory(slug: string): void {
  getStore().stories.delete(slug);
}

export function upsertEntity(slug: string, entity: APIEntity): void {
  const s = getStore();
  s.entities.set(slug, entity);
  if (entity.type === 'country') s.countries.set(slug, entity as APICountry);
  if (entity.type === 'organization') s.organizations.set(slug, entity as APIOrganization);
}

export function removeEntity(slug: string): void {
  const s = getStore();
  const existing = s.entities.get(slug);
  if (existing) {
    if (existing.type === 'country') s.countries.delete(slug);
    if (existing.type === 'organization') s.organizations.delete(slug);
  }
  s.entities.delete(slug);
}

export function upsertTopic(slug: string, topic: APITopic): void {
  getStore().topics.set(slug, topic);
}

export function removeTopic(slug: string): void {
  getStore().topics.delete(slug);
}

export function upsertTimeline(id: string, timeline: APITimeline): void {
  getStore().timelines.set(id, timeline);
}

export function removeTimeline(id: string): void {
  getStore().timelines.delete(id);
}

export function upsertFix(slug: string, fix: APIFix): void {
  getStore().fixes.set(slug, fix);
}

export function removeFix(slug: string): void {
  getStore().fixes.delete(slug);
}
