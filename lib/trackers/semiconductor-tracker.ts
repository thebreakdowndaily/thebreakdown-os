import type { TrackerDefinition } from './types';

export const semiconductorTracker: TrackerDefinition = {
  id: 'semiconductor',
  slug: 'semiconductor',
  title: 'India Semiconductor Mission (ISM) & PLI Tracker',
  subtitle:
    'Tracking ₹76,000 Cr government outlays, ₹1.26 lakh Cr private project investments, and fab construction across Sanand, Dholera, and Morigaon',
  description:
    "Track India's semiconductor manufacturing initiative — from the ₹76,000 crore fiscal incentive package to facility construction, OSAT commercial packaging milestones, and fab timelines across Gujarat and Assam.",
  topic: 'Technology & Industrial Policy',
  topicSlug: 'technology',
  currentStatus:
    'COMMERCIAL_PRODUCTION commenced at CG Semi OSAT in Sanand (Q1 2026). Micron ATMP in PILOT_PRODUCTION. Tata-PSMC Dholera Fab (₹91,000 cr) and Tata Morigaon OSAT facility progressing cleanroom construction towards 2026–2027 output.',
  lastUpdated: '2026-08-30',
  lastVerifiedBy: 'The Breakdown Editorial',
  keyDataPoints: [
    { label: 'Government Program Outlay', value: '₹76,000 crore ($10B)', source: 'Union Cabinet / ISM', asOf: '2026' },
    { label: 'Approved Project Commitments', value: '₹1.26 lakh crore ($15.2B)', source: 'MeitY / Union Cabinet', asOf: 'Q1 2026' },
    { label: 'CG Semi Sanand (OSAT)', value: 'COMMERCIAL_PRODUCTION', source: 'MeitY PIB Release', asOf: 'Q1 2026' },
    { label: 'Micron Sanand (ATMP)', value: 'PILOT_PRODUCTION', source: 'Micron / MeitY', asOf: 'H1 2026' },
    { label: 'Tata-PSMC Dholera Fab', value: 'UNDER_CONSTRUCTION', source: 'Tata Electronics', asOf: 'Target 2027' },
    { label: 'Approved Facilities', value: '5 units', source: 'Union Cabinet', asOf: '2025–2026' },
  ],
  recentChanges: [
    {
      date: '10 Apr 2026',
      title: 'Micron ATMP Sanand advances pilot qualification',
      description: 'Micron ATMP line completed memory assembly qualification runs in Sanand; volume ramp-up underway.',
      impact: 'major',
      source: 'Micron Press Office',
    },
    {
      date: '15 Feb 2026',
      title: 'CG Semi OSAT commences commercial production',
      description: 'CG Semi OSAT facility in Sanand began commercial chip packaging, marking India\'s first commercial OSAT production milestone.',
      impact: 'critical',
      source: 'MeitY PIB Release Q1 2026',
    },
    {
      date: '15 Mar 2025',
      title: 'Union Cabinet approves 5 semiconductor proposals',
      description: 'Cabinet approved cumulative project commitments of ₹1.26 lakh crore across 5 facilities in Gujarat and Assam.',
      impact: 'critical',
      source: 'Union Cabinet',
    },
  ],
  timeline: [
    { date: '2021-12-15', title: '₹76,000 Cr PLI Scheme Announced', description: 'Government approves ₹76,000 crore incentive package for semiconductor and display manufacturing.', source: 'PIB', category: 'policy' },
    { date: '2023-06-28', title: 'Micron ATMP Sanand Approved', description: 'Union Cabinet clears Micron\'s $2.75 billion ATMP facility in Sanand, Gujarat.', source: 'Union Cabinet', category: 'policy' },
    { date: '2024-06-10', title: 'Vedanta-Foxconn JV Scrapped', description: 'Joint venture dissolves; partners re-apply independently under revised ISM guidelines.', source: 'Company Statements', category: 'industry' },
    { date: '2025-03-15', title: '5 Facilities Cleared by Cabinet', description: 'Cabinet approves ₹1.26 lakh crore total investments across Tata Dholera, Tata Morigaon, CG Semi, Micron, and Kaynes.', source: 'Union Cabinet', category: 'legislation' },
    { date: '2026-02-15', title: 'Commercial Debut at CG Semi Sanand', description: 'Commercial chip packaging output commences at Sanand OSAT plant.', source: 'MeitY PIB Release', category: 'industry' },
    { date: '2026-04-10', title: 'Micron Pilot Volume Ramp-up', description: 'Micron Sanand pilot lines achieve operational qualification.', source: 'Micron Press Office', category: 'industry' },
  ],
  evidenceChain: [
    {
      claim: 'The ₹76,000 crore semiconductor PLI allocation is government fiscal incentive outlay, not total private factory investment.',
      confidence: 'established',
      source: 'ISM Guidelines & Cabinet Decision',
      lastVerified: '2026-08-30',
      counterargument: 'Media summaries frequently conflate government subsidy outlay with total private capital expenditure.',
      documentTitle: 'Union Cabinet Decision on ISM Guidelines (2021)',
    },
    {
      claim: 'Commercial semiconductor packaging has commenced in India under the PLI scheme at the CG Semi OSAT facility in Sanand.',
      confidence: 'established',
      source: 'MeitY PIB Commercial Production Release Q1 2026',
      lastVerified: '2026-08-30',
      documentTitle: 'MeitY Commercial Production Notification Q1 2026',
    },
    {
      claim: 'Initial Indian fab production focuses on mature nodes (28nm, 50nm) rather than leading-edge 3nm microchips.',
      confidence: 'established',
      source: 'Tata Electronics & PSMC Technical Disclosures',
      lastVerified: '2026-08-30',
      documentTitle: 'India Semiconductor Mission (ISM) Guidelines',
    },
    {
      claim: 'Approved project investments across 5 facilities total ₹1,26,000 crore ($15.2B).',
      confidence: 'strong',
      source: 'Union Cabinet Press Release March 2025',
      lastVerified: '2026-08-30',
      documentTitle: 'Union Cabinet Approval of 5 Semiconductor Proposals (2025)',
    },
  ],
  timeSeries: [
    {
      id: 'semiconductor-investment-growth',
      title: 'Semiconductor Program Allocations vs Approved Investments (2021–2026)',
      subtitle: 'Comparison of initial fiscal package vs cumulative approved private commitments',
      unit: '₹ Lakh Crore',
      source: 'Ministry of Electronics and Information Technology (MeitY)',
      frequency: 'Annual',
      data: [
        { date: '2021-22', value: 0.76, label: '₹0.76L Cr (Govt Outlay)' },
        { date: '2023-24', value: 0.22, label: '₹0.22L Cr (Micron Approval)' },
        { date: '2024-25', value: 1.26, label: '₹1.26L Cr (5 Fab/OSAT Units)' },
        { date: '2025-26', value: 1.52, label: '₹1.52L Cr (Cumulative)' },
      ],
    },
  ],
  documents: [
    {
      title: 'Union Cabinet Decision on ISM Guidelines (2021)',
      type: 'decision',
      date: '2021-12-15',
      publisher: 'Union Cabinet Secretariat',
      url: 'https://pib.gov.in',
      summary: 'Cabinet approval for ₹76,000 crore incentive package for semiconductor and display manufacturing ecosystem.',
      keyClauses: [
        'Item 1: Comprehensive program for development of semiconductors and display manufacturing ecosystem in India with total outlay of ₹76,000 crore.',
      ],
    },
    {
      title: 'India Semiconductor Mission (ISM) Guidelines',
      type: 'guideline',
      date: '2022-01-01',
      publisher: 'Ministry of Electronics and Information Technology',
      url: 'https://meity.gov.in/esdm',
      summary: 'Operational framework and fiscal support criteria (up to 50% capital subsidy) for Fabs, ATMP/OSAT, and Compound Semis.',
      keyClauses: [
        'Section 3.1: Fiscal support of 50% of project cost on pari-passu basis for silicon semiconductor fabs.',
      ],
    },
    {
      title: 'Union Cabinet Approval of 5 Semiconductor Proposals (2025)',
      type: 'decision',
      date: '2025-03-15',
      publisher: 'Union Cabinet Secretariat',
      url: 'https://pib.gov.in',
      summary: 'Approved project commitments for Tata Dholera Fab, Micron Sanand, CG Semi Sanand, Tata Morigaon, and Kaynes.',
    },
    {
      title: 'MeitY Commercial Production Notification Q1 2026',
      type: 'notification',
      date: '2026-02-15',
      publisher: 'Ministry of Electronics and Information Technology',
      url: 'https://meity.gov.in',
      summary: 'Official commencement record of packaged semiconductor output at CG Semi Sanand facility.',
    },
    {
      title: 'MeitY Annual Report 2025-26',
      type: 'report',
      date: '2026-05-01',
      publisher: 'Ministry of Electronics and Information Technology',
      url: 'https://meity.gov.in',
      summary: 'Annual progress tracking of electronics manufacturing, PLI disbursements, and semiconductor cluster infrastructure.',
    },
  ],
  relatedStorySlugs: ['semiconductor-pli', 'digital-payments-boom'],
  relatedEntityIds: ['ministry-of-finance', 'india'],
};

export function getSemiconductorTracker(): TrackerDefinition {
  return semiconductorTracker;
}
