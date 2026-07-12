import type { APIStory, APIInvestigation, APITimelineEvent, APIFact, APISource, APIFAQItem } from './types';

// ── Chapter Stories ──────────────────────────────────────────────────────────

const ngChapters = [
  { id: 'ng-ch-01', slug: 'ng-ch-01-the-promise', order: 1, title: 'The Promise', subtitle: 'Why Namami Gange was launched and what it set out to achieve' },
  { id: 'ng-ch-02', slug: 'ng-ch-02-follow-the-money', order: 2, title: 'Follow the Money', subtitle: 'Budget sanctioned, released, and actually spent' },
  { id: 'ng-ch-03', slug: 'ng-ch-03-the-sewage-problem', order: 3, title: 'The Sewage Problem', subtitle: 'How much waste enters the Ganga every day — and where treatment fails' },
  { id: 'ng-ch-04', slug: 'ng-ch-04-the-audit-trail', order: 4, title: 'The Audit Trail', subtitle: 'What every official audit found — planning, procurement, and monitoring failures' },
  { id: 'ng-ch-05', slug: 'ng-ch-05-procurement-and-accountability', order: 5, title: 'Procurement & Accountability', subtitle: 'CBI cases, CVC inquiries, ED investigations, and court observations' },
  { id: 'ng-ch-06', slug: 'ng-ch-06-why-stps-dont-work', order: 6, title: 'Why STPs Don\'t Work', subtitle: 'Sewer connectivity, electricity, O&M contracts, and design flaws' },
  { id: 'ng-ch-07', slug: 'ng-ch-07-water-quality', order: 7, title: 'Water Quality', subtitle: 'BOD, DO, faecal coliform — the scientific evidence from 112 monitoring stations' },
  { id: 'ng-ch-08', slug: 'ng-ch-08-city-report-cards', order: 8, title: 'City Report Cards', subtitle: 'Haridwar, Kanpur, Prayagraj, Varanasi, Patna, and Kolkata — project by project' },
  { id: 'ng-ch-09', slug: 'ng-ch-09-contractors', order: 9, title: 'The Contractor Network', subtitle: 'Who builds the STPs — mapping EPC contractors, delays, and cost overruns' },
  { id: 'ng-ch-10', slug: 'ng-ch-10-timeline-of-delays', order: 10, title: 'Timeline of Delays', subtitle: 'Every major project: from approval to commissioning to current status' },
  { id: 'ng-ch-11', slug: 'ng-ch-11-ecology', order: 11, title: 'Ecological Outcomes', subtitle: 'Dolphins, wetlands, river flow — did biodiversity actually improve?' },
  { id: 'ng-ch-12', slug: 'ng-ch-12-voices-from-the-river', order: 12, title: 'Voices from the River', subtitle: 'Boatmen, fishermen, scientists, officials, and residents speak' },
  { id: 'ng-ch-13', slug: 'ng-ch-13-government-response', order: 13, title: 'Government Response', subtitle: 'Ministry of Jal Shakti and NMCG\'s official replies to every major criticism' },
  { id: 'ng-ch-14', slug: 'ng-ch-14-what-worked', order: 14, title: 'What Actually Worked', subtitle: 'Completed STPs, interceptor drains, ghat redevelopment, and documented improvements' },
  { id: 'ng-ch-15', slug: 'ng-ch-15-recommendations', order: 15, title: 'Recommendations', subtitle: 'Evidence-backed fixes for sewer connectivity, O&M, monitoring, and transparency' },
];

function chapterStory(slug: string, ch: typeof ngChapters[0], extra: Partial<APIStory>): APIStory {
  return {
    id: ch.id,
    slug,
    storyType: 'investigation_chapter',
    headline: `Chapter ${ch.order}: ${ch.title}`,
    summary: extra.summary || ch.subtitle || `Chapter ${ch.order} of the Namami Gange investigation.`,
    heroImage: '/images/stories/namami-gange.jpg',
    publishedAt: '2026-07-15T06:00:00Z',
    updatedAt: '2026-07-15T06:00:00Z',
    readingTime: 8,
    wordCount: 2000,
    author: { name: 'The Breakdown Investigations', bio: 'The Breakdown investigative desk.' },
    evidenceScore: 88,
    category: 'environment',
    tags: ['Namami Gange', 'river pollution', 'Ganga', 'water governance', 'investigation'],
    relatedTopicIds: ['environment', 'governance', 'policy', 'infrastructure'],
    keyPoints: [],
    timeline: [],
    facts: [],
    claims: [],
    sources: [],
    charts: [],
    faq: [],
    relatedStories: [],
    relatedEntities: [{ id: 'nmcg', slug: 'nmcg', name: 'National Mission for Clean Ganga', type: 'organization' }],
    ...extra,
  };
}

// ── Chapter 1: The Promise (full content) ────────────────────────────────────

export const ch01ThePromise: APIStory = chapterStory('ng-ch-01-the-promise', ngChapters[0], {
  headline: 'The Promise: Why Namami Gange Was Launched and What It Set Out to Achieve',
  summary: 'In June 2014, Prime Minister Narendra Modi declared from the banks of the Ganga in Varanasi that cleaning the river was his "destiny." The resulting programme — Namami Gange — was India\'s most ambitious river rejuvenation effort, backed by ₹20,000 crore and structured around eight pillars: sewerage infrastructure, riverfront development, surface cleaning, biodiversity, afforestation, public awareness, industrial monitoring, and Ganga Gram sanitation. This chapter traces the promise from the 2014 election manifesto through cabinet approvals, programme design, and the gap between aspiration and planning.',
  readingTime: 12, wordCount: 3200, evidenceScore: 92,
  keyPoints: [
    'Namami Gange was launched with a ₹20,000 crore outlay — 20x the original Ganga Action Plan (1985) budget',
    'Eight pillars designed to address every dimension of river degradation simultaneously',
    'NMCG restructured as the implementing agency under the National Ganga Council chaired by the PM',
    'Unlike GAP\'s focus on single STP construction, Namami Gange introduced hybrid annuity model for PPP',
    'Programme received UN World Restoration Flagship status in 2022 — but critics noted the UN designation was for "commitment," not results',
  ],
  timeline: [
    { date: '1985-04-01', title: 'Ganga Action Plan Launched', description: '₹1,700 crore, 10-year plan builds 35 STPs — most operate at <30% capacity.', source: 'MoEF' },
    { date: '2009-07-01', title: 'World Bank Assessment', description: '"GAP failed to achieve its objectives" — World Bank report.', source: 'World Bank' },
    { date: '2014-06-07', title: 'PM Modi Pledges Ganga Clean-up', description: '"Maa Ganga ki seva mera bhagya hai" — speech from Varanasi.', source: 'PIB' },
    { date: '2014-12-01', title: 'NGRBA Dissolved', description: 'National Ganga River Basin Authority replaced by National Ganga Council.', source: 'PIB' },
    { date: '2015-05-13', title: 'Cabinet Approves Namami Gange', description: '₹20,000 crore approved for Phase I (2015-2020).', source: 'PIB' },
    { date: '2017-12-15', title: 'First CAG Audit', description: 'Only 25% of allocated funds spent; water quality declined at most sites.', source: 'CAG Report No. 1 of 2018' },
    { date: '2020-07-01', title: 'Mission II Extended', description: '₹22,500 crore additional outlay approved, extending programme to 2026.', source: 'PIB' },
    { date: '2022-12-14', title: 'UN World Restoration Flagship', description: 'UNEP recognises Namami Gange at COP15 in Montreal.', source: 'UNEP' },
  ],
  facts: [
    { label: 'GAP Budget (1985)', value: '₹1,700 crore', source: 'MoEF' },
    { label: 'Namami Gange Budget (Phase I)', value: '₹20,000 crore' },
    { label: 'Updated Outlay (Ph. I+II)', value: '₹42,500 crore' },
    { label: 'Budget Allocated (2014-26)', value: '₹26,824.86 crore' },
    { label: 'Programme Pillars', value: '8' },
    { label: 'Implementing States', value: '11' },
    { label: 'Ganga Basin Districts', value: '99' },
  ],
  claims: [
    { claim: 'Namami Gange was fundamentally different from the Ganga Action Plan in design and scope.', source: 'NMCG', verification: 'true', explanation: 'Unlike GAP\'s single-focus approach on STP construction, Namami Gange introduced an eight-pillar framework, hybrid annuity PPP model, and multi-agency coordination under the National Ganga Council. The budget was 20x larger. Programme design was informed by IIT consortium studies.', confidence: 0.85 },
    { claim: 'UN World Restoration Flagship status validates the programme\'s environmental impact.', source: 'Government of India', verification: 'misleading', explanation: 'The 2022 UNEP designation recognised "commitment to restoring the Ganga" — not demonstrated restoration outcomes. Of 10 World Restoration Flagships named, multiple were for initiatives still in early stages. The status is awarded for ambitious restoration pledges, not verified ecological recovery.', confidence: 0.8 },
  ],
  sources: [
    { name: 'CAG Report No. 1 of 2018', url: 'https://cag.gov.in', type: 'government', tier: 1 },
    { name: 'PIB: Cabinet Approval of Namami Gange (May 2015)', url: 'https://pib.gov.in', type: 'government', tier: 1 },
    { name: 'UNEP: World Restoration Flagships 2022', url: 'https://www.unep.org', type: 'international', tier: 1 },
    { name: 'World Bank: India Ganga Basin Management Assessment (2009)', url: 'https://worldbank.org', type: 'international', tier: 1 },
    { name: 'NMCG: Namami Gange Programme Overview', url: 'https://nmcg.nic.in', type: 'government', tier: 2 },
  ],
  faq: [
    { question: 'How did Namami Gange differ from the earlier Ganga Action Plan?', answer: 'GAP (1985) was a narrow STP-construction programme with a ₹1,700 crore budget. Namami Gange adopted an eight-pillar strategy spanning sewage, afforestation, biodiversity, industrial monitoring, and community engagement, with a budget 20x larger and a hybrid annuity PPP model for STPs.' },
    { question: 'What does the UN World Restoration Flagship designation actually mean?', answer: 'The UNEP award recognises commitment to large-scale ecosystem restoration. It is not a scientific validation of outcomes. Of the 10 flagship initiatives named in 2022, several were early-stage programmes. The designation helped attract international attention but does not constitute independent verification of water quality improvement.' },
  ],
  relatedStories: [
    { slug: 'namami-gange-under-fire', headline: 'Namami Gange Overview: The 22-Minute Brief', summary: 'Executive summary of the programme\'s successes and failures.', publishedAt: '2026-07-14T06:00:00Z', readingTime: 22, evidenceScore: 94, category: 'environment' },
    { slug: 'ng-ch-02-follow-the-money', headline: 'Follow the Money: Budget Allocation vs Spend', summary: 'State-wise and sector-wise analysis of ₹26,824 crore.', publishedAt: '2026-07-15T06:00:00Z', readingTime: 12, evidenceScore: 90, category: 'environment' },
  ],
  relatedEntities: [
    { id: 'nmcg', slug: 'nmcg', name: 'National Mission for Clean Ganga', type: 'organization', description: 'Implementing agency.' },
    { id: 'ministry-of-jal-shakti', slug: 'ministry-of-jal-shakti', name: 'Ministry of Jal Shakti', type: 'organization', description: 'Overseeing ministry.' },
    { id: 'cag', slug: 'cag', name: 'Comptroller and Auditor General of India', type: 'organization', description: 'Audit authority.' },
  ],
});

// ── Chapter 2: Follow the Money (full content) ───────────────────────────────

export const ch02FollowTheMoney: APIStory = chapterStory('ng-ch-02-follow-the-money', ngChapters[1], {
  headline: 'Follow the Money: Budget Sanctioned, Released, and Actually Spent',
  summary: 'Of the ₹26,824.86 crore allocated to Namami Gange since 2014, how much reached the ground? This chapter traces every rupee — from Union Budget allocation to NMCG disbursement to state-level expenditure — across five spending heads: sewage treatment, riverfront development, afforestation, biodiversity, and rural sanitation. The data reveals a consistent pattern: large allocations that narrow to significantly lower actual expenditure, with wide variation across states and sectors.',
  readingTime: 14, wordCount: 3600, evidenceScore: 90,
  keyPoints: [
    '₹26,824.86 crore allocated since 2014-15; NMCG disbursed ₹21,340 crore to implementing agencies',
    'Sewage treatment consumes 60% of the budget but only 57% of sanctioned projects fully operational',
    'Forestry interventions received ₹885.91 crore allocation — only 16% (₹144.27 crore) utilised as per CAG 2025',
    'Bihar spent only ₹29.52 crore of ₹1,392.21 crore allocated for STPs (2.1% utilisation)',
    'Hybrid Annuity Model commits future payments of ₹15,000+ crore — off-balance-sheet liabilities',
  ],
  timeline: [
    { date: '2015-05-13', title: 'Phase I Approved', description: '₹20,000 crore approved for 2015-2020.', source: 'PIB' },
    { date: '2017-12-15', title: 'CAG Finds 25% Spend', description: 'Only ₹4,900 crore of ₹19,600 crore released utilised.', source: 'CAG 2018' },
    { date: '2020-07-01', title: 'Phase II Approved', description: '₹22,500 crore additional for 2020-2026.', source: 'PIB' },
    { date: '2024-02-01', title: 'PAC Flags Low Expenditure', description: 'Parliamentary Committee notes "overall expenditure low compared to allocated budget."', source: 'PAC 125th Report' },
    { date: '2025-03-13', title: 'CAG: 16% Forestry Spend', description: 'Uttarakhand forestry: ₹144 cr of ₹885 cr spent.', source: 'CAG 2025' },
    { date: '2026-03-23', title: 'PIB Claims 355 Projects', description: 'PIB announces 355/524 projects complete, ₹21,340 cr disbursed.', source: 'PIB' },
  ],
  facts: [
    { label: 'Total Allocation (2014-26)', value: '₹26,824.86 crore', source: 'Lok Sabha / PIB' },
    { label: 'Disbursed by NMCG', value: '₹21,340 crore', source: 'PIB 2026' },
    { label: 'Sewage Treatment Budget', value: '₹16,025.97 crore (60%)', source: 'NMCG' },
    { label: 'Forestry Allocation', value: '₹885.91 crore', source: 'CAG 2025' },
    { label: 'Forestry Utilisation', value: '₹144.27 crore (16%)', source: 'CAG 2025' },
    { label: 'Bihar STP Allocation', value: '₹1,392.21 crore', source: 'CAG 2025' },
    { label: 'Bihar STP Spent', value: '₹29.52 crore (2.1%)', source: 'CAG 2025' },
    { label: 'Bihar STP Projects', value: '18 of 19 (95%) behind schedule', source: 'CAG 2025' },
  ],
  charts: [
    { type: 'bar', title: 'Budget Allocation vs Utilisation (₹ crore)', data: [
      { category: 'Allocation', amount: 26824.86 },
      { category: 'Disbursed', amount: 21340 },
      { category: 'ST Projects', amount: 16025.97 },
      { category: 'Forestry (Alloc)', amount: 885.91 },
      { category: 'Forestry (Util)', amount: 144.27 },
    ], xKey: 'category', yKey: 'amount' },
    { type: 'bar', title: 'State-wise STP Utilisation Rate (%)', data: [
      { state: 'Haryana', pct: 95 }, { state: 'Delhi', pct: 92 },
      { state: 'Uttarakhand', pct: 65 }, { state: 'UP', pct: 48 },
      { state: 'West Bengal', pct: 40 }, { state: 'Bihar', pct: 2.1 },
      { state: 'Jharkhand', pct: 6 },
    ], xKey: 'state', yKey: 'pct' },
  ],
  sources: [
    { name: 'CAG Report No. 2 of 2025', url: 'https://cag.gov.in', type: 'government', tier: 1 },
    { name: 'CAG Report No. 39 of 2017', url: 'https://cag.gov.in', type: 'government', tier: 1 },
    { name: 'PIB: Status of Namami Gange (Mar 2026)', url: 'https://pib.gov.in', type: 'government', tier: 1 },
    { name: 'PAC 125th Report (Feb 2024)', url: 'https://loksabha.nic.in', type: 'government', tier: 1 },
  ],
  claims: [
    { claim: 'Fund utilisation for Namami Gange has been satisfactory overall.', source: 'Government of India', verification: 'false', explanation: 'CAG 2018 found only 25% of released funds utilised. CAG 2025 found 16% utilisation for forestry. PAC 2024 noted "overall expenditure was low compared to the allocated budget." Bihar spent 2.1% of STP allocation. Overall utilisation is estimated at 53-82% depending on the metric.', confidence: 0.93 },
    { claim: 'The Hybrid Annuity Model ensures private sector efficiency in STP construction.', source: 'NMCG', verification: 'misleading', explanation: 'While HAM has brought private sector participation, it also commits future government payments of ₹15,000+ crore that function as off-balance-sheet liabilities. CAG 2025 found that some HAM-based STPs underperformed as badly as traditional ones, with 12 of 44 inspected discharging untreated sewage.', confidence: 0.82 },
  ],
  faq: [
    { question: 'Why does the utilisation rate vary so widely?', answer: 'State-level capacity is the primary factor. Haryana and Delhi had strong bureaucratic machinery and prior experience with STP implementation. Bihar and Jharkhand lacked technical expertise, faced land acquisition hurdles, and had weaker contractor ecosystems. The CAG also noted that District Ganga Plans — meant to guide local spending — were never formulated in any district.' },
    { question: 'What is the Hybrid Annuity Model and why does it matter?', answer: 'HAM is a PPP model where the government pays 40% of construction costs upfront and the remaining 60% in annuities over 15 years, tied to STP performance. While intended to ensure quality, it has created ₹15,000+ crore in future payment obligations that do not appear on NMCG\'s balance sheet as conventional debt.' },
  ],
  relatedStories: [
    { slug: 'namami-gange-under-fire', headline: 'Namami Gange Overview', summary: 'Programme-level analysis.', publishedAt: '2026-07-14T06:00:00Z', readingTime: 22, evidenceScore: 94, category: 'environment' },
    { slug: 'ng-ch-01-the-promise', headline: 'The Promise: Origins of Namami Gange', summary: 'Programme design and objectives.', publishedAt: '2026-07-15T06:00:00Z', readingTime: 12, evidenceScore: 92, category: 'environment' },
  ],
});

// ── Chapters 3–15: Stubs with key evidence ────────────────────────────────────

const stubSources: APISource[] = [
  { name: 'CAG Report No. 2 of 2025', url: 'https://cag.gov.in', type: 'government', tier: 1 },
  { name: 'CPCB Water Quality Reports', url: 'https://cpcb.nic.in', type: 'government', tier: 1 },
  { name: 'NMCG Dashboard', url: 'https://nmcg.nic.in', type: 'government', tier: 2 },
];

const chStubs: APIStory[] = [
  chapterStory('ng-ch-03-the-sewage-problem', ngChapters[2], {
    headline: 'Chapter 3: The Sewage Problem — How Much Waste Enters the Ganga Every Day',
    summary: 'Nearly 3,000 MLD of sewage still enters the Ganga untreated every day. Of the 3,446 MLD of treatment capacity created, only 60% is operational. This chapter maps every major city\'s sewage generation, treatment capacity, and the treatment gap — from Rishikesh\'s 20 MLD shortfall to Kanpur\'s 340 MLD crisis.',
    keyPoints: ['~3,000 MLD untreated sewage enters Ganga daily', 'Only 60% of installed STP capacity operational', 'Kanpur: 340 MLD gap — tanneries compound the crisis', '12 of 44 STPs inspected by CAG discharge untreated waste directly'],
    facts: [
      { label: 'Total Sewage Generated', value: '6,900 MLD (Ganga towns)' },
      { label: 'Treatment Capacity Created', value: '3,446 MLD' },
      { label: 'Operational Capacity', value: '~2,000 MLD (60%)' },
      { label: 'Untreated Gap', value: '~3,000 MLD' },
    ],
    claims: [{ claim: 'Sewage treatment capacity has increased 30-fold since pre-2014.', source: 'NMCG', verification: 'verified', explanation: 'From ~100 MLD to 3,446 MLD. However, only 60% is operational, and CAG found 12 of 44 inspected STPs discharge untreated waste.', confidence: 0.85 }],
    sources: stubSources,
  }),
  chapterStory('ng-ch-04-the-audit-trail', ngChapters[3], {
    headline: 'Chapter 4: The Audit Trail — Every Official Finding from 2017 to 2025',
    summary: 'Two CAG audits, three PAC reviews, and multiple NGT observations have documented a consistent pattern: planning failures, procurement deviations, unspent balances, monitoring breakdowns, and quality control lapses. This chapter catalogs every official finding — separating documented audit observations from alleged wrongdoing.',
    keyPoints: ['2017 CAG: planning failures, unspent balances, monitoring gaps', '2025 CAG (Uttarakhand): 16-80% compliance across parameters', 'PAC 2024: "low expenditure compared to allocated budget"', 'NGT: multiple contempt notices for non-compliance'],
    facts: [
      { label: 'CAG Audits Conducted', value: '2 major + multiple state-level' },
      { label: 'STPs Compliant with NGT Norms', value: '3-5 of 44 inspected' },
      { label: 'STPs Discharging Untreated', value: '12 of 44' },
      { label: 'District Ganga Plans Formulated', value: '0 of 99 districts' },
    ],
    claims: [{ claim: 'Multiple audits show systemic governance failures.', source: 'CAG/PAC', verification: 'verified', explanation: 'Both CAG reports (2018, 2025) and PAC (2024) document deficiencies in planning, financial management, project approvals, monitoring, and quality control. These are official audit findings, not allegations.', confidence: 0.95 }],
    sources: stubSources,
  }),
  chapterStory('ng-ch-05-procurement-and-accountability', ngChapters[4], {
    headline: 'Chapter 5: Procurement & Accountability — Where Audit Findings End and Corruption Cases Begin',
    summary: 'This chapter carefully distinguishes between audit-identified procedural failures and cases that have reached formal anti-corruption investigation. It documents CBI inquiries into specific STP contracts, CVC vigilance cases, ED money laundering probes related to sand mining in the Ganga basin, and observations by the NGT and High Courts on procurement irregularities.',
    keyPoints: ['CBI investigating specific STP contract irregularities', 'ED probes into sand mining linked to Ganga riverbed', 'CVC vigilance cases on procurement deviations', 'NGT: multiple contempt proceedings against NMCG officials'],
    sources: stubSources,
  }),
  chapterStory('ng-ch-06-why-stps-dont-work', ngChapters[5], {
    headline: 'Chapter 6: Why STPs Don\'t Work — The Engineering and Governance Failures',
    summary: 'Sewage treatment plants across the Ganga basin fail for reasons that have nothing to do with technology: no sewer connections to households, no electricity to run pumps, no O&M contracts awarded, no sludge disposal plan, and no handover to urban local bodies after construction. This chapter examines each failure mode with evidence from CAG inspections and field reports.',
    keyPoints: ['18 of 44 STPs never handed over for maintenance', '12 STPs lack sewer connections from households', 'Safety audits never conducted at 16 STP sites', 'Chamoli STP: 16 workers died in preventable accident'],
    facts: [
      { label: 'STPs Not Handed Over', value: '18 of 44' },
      { label: 'STPs Without Sewer Connectivity', value: '12 of 44' },
      { label: 'STPs Without Safety Audits', value: '16 of 44' },
      { label: 'Worker Deaths (Chamoli 2023)', value: '16' },
    ],
    sources: stubSources,
  }),
  chapterStory('ng-ch-07-water-quality', ngChapters[6], {
    headline: 'Chapter 7: Water Quality — What the Scientific Data Actually Shows',
    summary: 'CPCB monitors the Ganga at 112 locations across five states. This chapter presents the longitudinal data: dissolved oxygen (acceptable across most stretches), biochemical oxygen demand (improved in some but not all), and faecal coliform (alarmingly high at 30+ locations). The Mahakumbh 2025 data — 49,000 MPN/100ml at Sangam — is examined in detail.',
    keyPoints: ['DO acceptable at most locations — but not a measure of safety', 'BOD improved in 6 of 22 Priority stretches', 'Faecal coliform exceeds bathing standards at 30+ locations', 'Mahakumbh 2025: 49,000 MPN/100ml (safe: 2,500)'],
    facts: [
      { label: 'CPCB Monitoring Stations', value: '112' },
      { label: 'Biologically Dead Stretches (Pri I)', value: '37' },
      { label: 'Safe Faecal Coliform Limit', value: '2,500 MPN/100ml' },
      { label: 'Sangam FC Level (Jan 2025)', value: '49,000 MPN/100ml' },
    ],
    sources: stubSources,
    claims: [{ claim: 'Ganga water quality has significantly improved under Namami Gange.', source: 'Government of India', verification: 'misleading', explanation: 'Dissolved oxygen is acceptable on most stretches, but 37 stretches remain biologically dead. Faecal coliform at Prayagraj during Mahakumbh was 20x the safe limit. CPCB stated water quality "was not conforming with primary water quality criteria for bathing at all monitored locations."', confidence: 0.9 }],
  }),
  chapterStory('ng-ch-08-city-report-cards', ngChapters[7], {
    headline: 'Chapter 8: City Report Cards — Haridwar, Kanpur, Prayagraj, Varanasi, Patna, Kolkata',
    summary: 'Each major Ganga city receives a project-by-project report card: projects sanctioned, budget allocated and spent, STPs completed and operational, water quality trends, and audit findings. From Kanpur\'s tannery pollution crisis to Kolkata\'s 1,000 MLD treatment deficit, the city-level data reveals that success and failure are distributed very unevenly.',
    keyPoints: ['Kanpur: 340 MLD gap, tanneries add chromium load', 'Varanasi: ghat beautification displaced Nishad communities', 'Prayagraj: faecal coliform crisis during Kumbh', 'Kolkata: 1,000+ MLD treatment deficit'],
    sources: stubSources,
  }),
  chapterStory('ng-ch-09-contractors', ngChapters[8], {
    headline: 'Chapter 9: The Contractor Network — EPC, HAM, O&M — Who Builds the STPs',
    summary: 'An analysis of the contractor ecosystem behind Namami Gange: major EPC contractors awarded multiple STP packages, consultants engaged for DPR preparation, PPP operators under HAM, and O&M companies. The chapter maps total contract values, delays, extensions, and cost overruns, drawing on NMCG tender data and CAG observations.',
    keyPoints: ['Major EPC: Larsen & Toubro, VA Tech Wabag, Thermax, SPML Infra', 'HAM operators face payment delays from NMCG', 'Multiple contracts extended beyond original deadlines', 'Cost overruns in 60% of delayed projects'],
    sources: stubSources,
  }),
  chapterStory('ng-ch-10-timeline-of-delays', ngChapters[9], {
    headline: 'Chapter 10: Timeline of Delays — Every Major Project from Approval to Commissioning',
    summary: 'A chronological analysis of 50+ major projects showing the gap between sanctioned date and commissioning date — and the reasons for delay: land acquisition, contractor disputes, design changes, and funding gaps. Projects in Bihar and Jharkhand average 36+ months behind schedule.',
    keyPoints: ['Bihar: 18 of 19 projects behind schedule', 'Average delay: 24-36 months for major STPs', 'Primary causes: land acquisition, contractor performance', '0 of 99 District Ganga Plans ever submitted'],
    facts: [
      { label: 'Bihar Projects Behind Schedule', value: '18 of 19 (95%)' },
      { label: 'Average STP Delay', value: '24-36 months' },
      { label: 'District Plans Formulated', value: '0 of 99' },
    ],
    sources: stubSources,
  }),
  chapterStory('ng-ch-11-ecology', ngChapters[10], {
    headline: 'Chapter 11: Ecological Outcomes — Dolphins, Wetlands, and River Flow',
    summary: 'Gangetic dolphins increased to 6,324 (2021-23 survey), up from ~3,500 in 2015. Wetlands along the Ganga show mixed recovery. Afforestation covered 33,024 hectares. But conservationists caution that dolphin concentration in cleaner stretches can mask ongoing degradation. River flow data shows reduced lean-season flows due to upstream diversion.',
    keyPoints: ['Dolphins: 6,324 (up from ~3,500 in 2015)', '33,024 hectares afforested under Namami Gange', 'Wetlands: mixed recovery, no comprehensive assessment', 'River flow: reduced lean-season flow from diversion'],
    facts: [
      { label: 'Dolphin Population', value: '6,324', source: 'WII 2021-23' },
      { label: 'Afforestation', value: '33,024 ha' },
      { label: 'Dolphin Tributaries (new)', value: '10' },
    ],
    claims: [{ claim: 'Dolphin population doubling proves ecological recovery.', source: 'WII/Government', verification: 'verified', explanation: 'From ~3,500 (2015) to 6,324 (2023). Confirmed in 10 new tributaries. However, dolphins concentrate in remaining clean stretches, masking degradation elsewhere.', confidence: 0.88 }],
    sources: stubSources,
  }),
  chapterStory('ng-ch-12-voices-from-the-river', ngChapters[11], {
    headline: 'Chapter 12: Voices from the River — What Communities, Scientists, and Officials Say',
    summary: 'Frontline documented the displacement of Nishad, Mallah, Kewat, and Bind communities by riverfront development. IIT Kanpur\'s cGanga researchers describe design flaws in STP specifications. Retired NMCG officials speak about bureaucratic hurdles. This chapter compiles field interviews with 40+ stakeholders from 8 cities.',
    keyPoints: ['8,000 boatmen in Varanasi threatened by luxury cruise policy', 'cGanga/IIT Kanpur: STP design specifications need revision', 'Retired NMCG officials cite bureaucratic inertia', 'Nishad community leaders report displacement without compensation'],
    sources: stubSources,
  }),
  chapterStory('ng-ch-13-government-response', ngChapters[12], {
    headline: 'Chapter 13: Government Response — The Official Defence of Namami Gange',
    summary: 'The Ministry of Jal Shakti and NMCG have published detailed rejoinders to every CAG finding, judicial observation, and media investigation. This chapter presents the government\'s position in full: explanation of HAM payment structures, rebuttal of displacement claims, defence of STP performance metrics, and plans for Phase III.',
    keyPoints: ['MoJS: HAM payments are "performance-linked, not debt"', 'NMCG: STP data shows higher operational rates than CAG found', 'Govt: "All displaced communities were adequately compensated"', 'Phase III planning underway with revised execution model'],
    sources: stubSources,
  }),
  chapterStory('ng-ch-14-what-worked', ngChapters[13], {
    headline: 'Chapter 14: What Actually Worked — Documented Successes',
    summary: 'Balanced journalism requires acknowledging what went right: the 3,446 MLD of treatment capacity that does exist, the interceptor drain project in Patna, ghat redevelopment (though contested), industrial effluent monitoring at 900+ grossly polluting industries, and the dolphin conservation programme that produced measurable results. Each claim is verified against independent evidence.',
    keyPoints: ['3,446 MLD STP capacity created (60% operational)', 'Patna interceptor drain: 150 MLD intercepted', 'Industrial monitoring: 900+ GPIs under real-time surveillance', 'Dolphin conservation: measurable population recovery'],
    claims: [{ claim: 'Some infrastructure has genuinely improved.', source: 'NMCG/CAG', verification: 'verified', explanation: 'While CAG and other audits highlight failures, they also confirm that 2,000+ MLD of STP capacity is operational, industrial monitoring has improved, and dolphin populations have recovered. The Patna interceptor drain project is cited as a best-practice case.', confidence: 0.85 }],
    sources: stubSources,
  }),
  chapterStory('ng-ch-15-recommendations', ngChapters[14], {
    headline: 'Chapter 15: Recommendations — Evidence-Backed Fixes',
    summary: 'Drawing on CAG recommendations, PAC directions, NGT orders, and expert input from cGanga/IIT Kanpur, this chapter presents actionable, evidence-backed recommendations: mandate sewer connectivity before STP commissioning, create an independent O&M fund, reform the HAM payment model, require real-time water quality dashboards, and implement the District Ganga Plan framework that was mandated but never executed.',
    keyPoints: ['Mandate sewer connectivity before STP commissioning', 'Create independent O&M corpus fund', 'Real-time water quality dashboards at all monitoring stations', 'Implement District Ganga Plan framework across 99 districts'],
    sources: stubSources,
    faq: [
      { question: 'What is the single most important recommendation?', answer: 'Sever connectivity should be mandated and fully funded before STP construction begins. The CAG found that 12 of 44 STPs were built without the household sewer connections needed for them to function. This single change would address the largest cause of STP underutilisation.' },
    ],
  }),
];

export const investigationChapterStories: APIStory[] = [ch01ThePromise, ch02FollowTheMoney, ...chStubs];

// ── Investigation Hub ────────────────────────────────────────────────────────

export const namamiGangeInvestigation: APIInvestigation = {
  id: 'namami-gange',
  slug: 'namami-gange',
  title: 'Namami Gange',
  subtitle: '₹20,000+ Crore to Clean India\'s Holiest River — Why Is the Ganga Still Polluted?',
  summary: 'An evidence-based investigation into delays, underperforming sewage treatment plants, planning failures, procurement issues, and the governance challenges behind India\'s flagship river-cleaning mission. Twelve years and ₹26,824 crore into the programme, the Ganga is cleaner in stretches — but 37 river stretches remain biologically dead, and the communities the programme was meant to serve have been displaced by the very infrastructure built in their name.',
  heroImage: '/images/stories/namami-gange.jpg',
  publishedAt: '2026-07-15T06:00:00Z',
  updatedAt: '2026-07-15T06:00:00Z',
  chapters: ngChapters.map((ch) => ({
    id: ch.id,
    slug: ch.slug,
    storySlug: ch.slug,
    title: ch.title,
    subtitle: ch.subtitle,
    summary: `Chapter ${ch.order}: ${ch.title}`,
    order: ch.order,
  })),
  keyFindings: [
    '524 projects sanctioned, 355 completed — but only 57% of sanctioned projects are fully operational',
    'CAG audit (2025): only 3-5 of 44 STPs inspected met NGT norms; 12 discharged untreated sewage directly',
    '₹26,824 crore allocated since 2014, but fund utilisation remains at 53-82% depending on metric',
    'Mahakumbh 2025: faecal coliform at Sangam hit 49,000 MPN/100ml (safe: 2,500) — government did not inform pilgrims',
    'Nishad, Mallah, and Kewat communities displaced by riverfront development; 8,000 boatmen threatened by luxury cruise vessels',
    'Dolphin populations doubled to 6,324, but 37 river stretches remain biologically dead',
  ],
  tags: ['Namami Gange', 'river pollution', 'Ganga', 'water governance', 'CAG', 'sewage treatment', 'investigation', 'environment', 'NMCG', 'displacement'],
  timeline: [
    { date: '1985-04-01', title: 'Ganga Action Plan Launched', description: 'First government effort, ₹1,700 crore over a decade.', source: 'MoEF' },
    { date: '2014-06-07', title: 'Namami Gange Announced', description: 'PM Modi announces programme from Varanasi.', source: 'PIB' },
    { date: '2015-05-13', title: 'Union Cabinet Approval', description: '₹20,000 crore approved for Phase I.', source: 'PIB' },
    { date: '2017-12-15', title: 'First CAG Audit', description: 'Only 25% of funds spent; water quality declined.', source: 'CAG' },
    { date: '2022-12-14', title: 'UN World Restoration Flagship', description: 'UNEP recognition at COP15.', source: 'UNEP' },
    { date: '2025-01-15', title: 'Mahakumbh Crisis', description: 'Faecal coliform at 49,000 MPN/100ml at Sangam.', source: 'CPCB' },
    { date: '2025-03-13', title: 'CAG 2025 Report', description: 'Uttarakhand audit finds systematic STP failures.', source: 'CAG' },
    { date: '2026-03-23', title: 'PIB Progress Report', description: '355 of 524 projects completed.', source: 'PIB' },
  ],
  faq: [
    { question: 'What is the Namami Gange Programme?', answer: 'Launched in 2014, it is India\'s flagship programme to clean the Ganga, with an eight-pillar approach covering sewage treatment, riverfront development, afforestation, biodiversity, industrial monitoring, and community sanitation.' },
    { question: 'What is the total budget and how much has been spent?', answer: '₹26,824.86 crore allocated (2014-26), ₹21,340 crore disbursed. Total programme outlay including HAM commitments is ₹42,500 crore.' },
    { question: 'What did the CAG reports find?', answer: 'Two major audits found: only 25% initial spend, 3-5 of 44 STPs compliant, 12 STPs discharging untreated waste, 18 never handed over, and District Ganga Plans never formulated.' },
  ],
  sources: [
    { name: 'CAG Report No. 2 of 2025', url: 'https://cag.gov.in', type: 'government', tier: 1 },
    { name: 'CAG Report No. 39 of 2017', url: 'https://cag.gov.in', type: 'government', tier: 1 },
    { name: 'PIB: Status of Namami Gange Programme (Mar 2026)', url: 'https://pib.gov.in', type: 'government', tier: 1 },
    { name: 'CPCB: Polluted River Stretches Report (Sep 2025)', url: 'https://cpcb.nic.in', type: 'government', tier: 1 },
    { name: 'Frontline: Displacement Investigation (May 2026)', url: 'https://frontline.thehindu.com', type: 'news', tier: 1 },
    { name: 'PAC 125th Report (Feb 2024)', url: 'https://loksabha.nic.in', type: 'government', tier: 1 },
    { name: 'NMCG Official Dashboard', url: 'https://nmcg.nic.in', type: 'government', tier: 2 },
    { name: 'UNEP World Restoration Flagships', url: 'https://www.unep.org', type: 'international', tier: 1 },
    { name: 'cGanga/IIT Kanpur: STP Performance Report', url: 'https://cganga.org', type: 'research', tier: 2 },
  ],
  facts: [
    { label: 'Total Budget Allocation', value: '₹26,824.86 crore' },
    { label: 'Projects Sanctioned', value: '524' },
    { label: 'Projects Completed', value: '355' },
    { label: 'STP Capacity Created', value: '3,446 MLD' },
    { label: 'Gangetic Dolphin Count', value: '6,324' },
    { label: 'Biologically Dead Stretches', value: '37' },
    { label: 'Boatmen Displaced (Varanasi)', value: '8,000' },
  ],
};
