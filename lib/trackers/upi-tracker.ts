import type { TrackerDefinition } from './types';

export const upiTracker: TrackerDefinition = {
  id: 'upi',
  slug: 'upi',
  title: 'Unified Payments Interface (UPI) & Digital Rails Tracker',
  subtitle:
    'Real-time tracking of India\'s sovereign retail payments architecture — volume, limits, rural penetration, MDR rules, and cross-border linkages (2016–2026).',
  description:
    'The Breakdown\'s comprehensive intelligence tracker for the Unified Payments Interface (UPI). Maintained by NPCI and regulated by the Reserve Bank of India, UPI processes over 80% of India\'s retail digital transactions. This tracker monitors regulatory limits, merchant discount rate (MDR) policy, feature phone access (UPI123Pay), market share concentration, and international cross-border linkages.',
  topic: 'Digital Payments & Fintech',
  topicSlug: 'digital-payments',
  currentStatus: 'Active · Record 185B Annual Volume · Zero MDR Retained',
  lastUpdated: '2026-08-30',
  lastVerifiedBy: 'The Breakdown Financial Regulation Desk',

  keyDataPoints: [
    {
      label: 'Annual Transaction Volume (FY25-26)',
      value: '185.2 Billion',
      source: 'NPCI Official Monthly Bulletins',
      asOf: '2026-03-31',
    },
    {
      label: 'Annual Transaction Value (FY25-26)',
      value: '₹260.4 Lakh Crore',
      source: 'NPCI / RBI Annual Payment Data',
      asOf: '2026-03-31',
    },
    {
      label: 'UPI123Pay Per-Txn Limit',
      value: '₹10,000',
      source: 'RBI SDRP Statement (Oct 2024) / NPCI Circular 209',
      asOf: '2026-01-01',
    },
    {
      label: 'Rural UPI Value (2025-26)',
      value: '₹12.0 Lakh Crore',
      source: 'MoF / NPCI Rural Financial Inclusion Report',
      asOf: '2026-03-31',
    },
    {
      label: 'Zero MDR Mandate (P2M)',
      value: '100% Retained',
      source: 'Section 10A, PSS Act 2007 (MoF Notification)',
      asOf: '2026-07-01',
    },
    {
      label: 'International Live Linkages',
      value: '7 Countries',
      source: 'NIPL (NPCI International Payments Ltd)',
      asOf: '2026-06-30',
    },
  ],

  timeSeries: [
    {
      id: 'upi-volume-growth',
      title: 'Annual UPI Transaction Volume (2016–2026)',
      subtitle: 'Total verified transactions processed through NPCI central switch',
      unit: 'Billion Transactions',
      source: 'NPCI Historical Payment Systems Statistics',
      frequency: 'Annual (Financial Year)',
      data: [
        { date: '2016-17', value: 0.02, label: '0.02 B' },
        { date: '2017-18', value: 0.91, label: '0.91 B' },
        { date: '2018-19', value: 5.35, label: '5.35 B' },
        { date: '2019-20', value: 12.52, label: '12.52 B' },
        { date: '2020-21', value: 22.33, label: '22.33 B' },
        { date: '2021-22', value: 45.96, label: '45.96 B' },
        { date: '2022-23', value: 83.75, label: '83.75 B' },
        { date: '2023-24', value: 131.15, label: '131.15 B' },
        { date: '2024-25', value: 162.40, label: '162.40 B' },
        { date: '2025-26', value: 185.20, label: '185.20 B' },
      ],
    },
    {
      id: 'upi-value-growth',
      title: 'Annual UPI Transaction Value (2016–2026)',
      subtitle: 'Gross settlement turnover across all participating banks and TPAPs',
      unit: '₹ Lakh Crore',
      source: 'Reserve Bank of India & NPCI Bulletins',
      frequency: 'Annual (Financial Year)',
      data: [
        { date: '2016-17', value: 0.07, label: '₹0.07L Cr' },
        { date: '2017-18', value: 1.09, label: '₹1.09L Cr' },
        { date: '2018-19', value: 8.77, label: '₹8.77L Cr' },
        { date: '2019-20', value: 21.31, label: '₹21.31L Cr' },
        { date: '2020-21', value: 41.03, label: '₹41.03L Cr' },
        { date: '2021-22', value: 84.15, label: '₹84.15L Cr' },
        { date: '2022-23', value: 139.20, label: '₹139.2L Cr' },
        { date: '2023-24', value: 199.80, label: '₹199.8L Cr' },
        { date: '2024-25', value: 235.60, label: '₹235.6L Cr' },
        { date: '2025-26', value: 260.40, label: '₹260.4L Cr' },
      ],
    },
  ],

  recentChanges: [
    {
      date: '2026-06-30',
      title: '10-Year Decadal Volume Crosses 185B Transactions',
      description:
        'NPCI reports decadal performance milestones: monthly run-rate stabilized at 16.5 billion transactions with 55% peer-to-merchant (P2M) share.',
      impact: 'major',
      source: 'NPCI Decadal Bulletin',
    },
    {
      date: '2025-05-15',
      title: '30% Volume Cap Compliance Deadline Extended',
      description:
        'NPCI extends the market share cap compliance deadline for third-party application providers (TPAPs) to prevent transaction disruptions while supporting secondary app growth.',
      impact: 'major',
      source: 'NPCI Regulatory Circular',
    },
    {
      date: '2024-10-09',
      title: 'RBI Enhances UPI123Pay and UPI Lite Limits',
      description:
        'The Reserve Bank of India raises the per-transaction limit for feature phone UPI (UPI123Pay) from ₹5,000 to ₹10,000 and enhances UPI Lite wallet capacity to ₹2,000.',
      impact: 'critical',
      source: 'RBI Statement on Development and Regulatory Policies',
    },
  ],

  timeline: [
    {
      date: '2016-04-11',
      title: 'UPI Pilot Launch',
      description: 'NPCI launches the Unified Payments Interface with 21 member banks in Mumbai.',
      source: 'NPCI Press Release',
      category: 'event',
    },
    {
      date: '2016-12-30',
      title: 'BHIM App Enacted',
      description: 'Government launches Bharat Interface for Money (BHIM) to promote direct bank interoperability.',
      source: 'Prime Minister Office',
      category: 'policy',
    },
    {
      date: '2020-01-01',
      title: 'Zero MDR Mandate Implemented',
      description: 'Section 10A of the Payment and Settlement Systems Act eliminates MDR on UPI and RuPay debit cards.',
      source: 'Ministry of Finance Gazette',
      category: 'legislation',
    },
    {
      date: '2022-03-08',
      title: 'UPI123Pay for Feature Phones Launched',
      description: 'RBI and NPCI operationalize UPI123Pay via IVR, missed call, and embedded sound tech for 40 Cr feature phone users.',
      source: 'RBI Governor Address',
      category: 'policy',
    },
    {
      date: '2023-02-21',
      title: 'India–Singapore PayNow Linkage Live',
      description: 'Real-time cross-border payment linkage inaugurated between UPI and Singapore PayNow.',
      source: 'RBI & MAS Joint Release',
      category: 'event',
    },
    {
      date: '2024-10-09',
      title: 'UPI123Pay Limit Doubled to ₹10,000',
      description: 'RBI announces limit expansion in bi-monthly monetary policy review; NPCI issues Circular 209.',
      source: 'RBI SDRP Statement',
      category: 'policy',
    },
  ],

  evidenceChain: [
    {
      claim: 'The per-transaction limit for UPI123Pay on feature phones is ₹10,000.',
      confidence: 'established',
      source: 'RBI Statement on Development and Regulatory Policies Oct 2024',
      lastVerified: '2026-07-15',
      documentTitle: 'RBI Statement on Development and Regulatory Policies (October 2024)',
      documentUrl: 'https://rbi.org.in',
    },
    {
      claim: 'Zero Merchant Discount Rate (MDR) remains operative law for person-to-merchant UPI transactions.',
      confidence: 'established',
      source: 'Section 10A, Payment and Settlement Systems Act, 2007',
      lastVerified: '2026-07-20',
      documentTitle: 'Payment and Settlement Systems Act, 2007 (Section 10A Mandate)',
      documentUrl: 'https://egazette.gov.in',
    },
    {
      claim: 'The top two TPAP apps process over 80% of aggregate UPI transaction volume.',
      confidence: 'strong',
      source: 'NPCI UPI Application Statistics 2025-26',
      lastVerified: '2026-06-15',
      counterargument: 'NPCI 30% volume cap policy exists but enforcement timeline was deferred to avoid user payment disruption.',
    },
  ],

  documents: [
    {
      title: 'RBI Statement on Development and Regulatory Policies (October 2024)',
      type: 'decision',
      date: '2024-10-09',
      publisher: 'Reserve Bank of India',
      url: 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
      summary:
        'Announces increase in UPI123Pay limit from ₹5,000 to ₹10,000 per transaction and UPI Lite auto-replenishment wallet facility.',
      keyClauses: [
        'Paragraph 8: Enhancement of limits on UPI123Pay from ₹5,000 to ₹10,000 per transaction.',
        'Paragraph 9: Introduction of Auto-Replenishment Facility under UPI Lite.',
      ],
    },
    {
      title: 'NPCI Circular UPI OC No. 209 FY 24-25',
      type: 'notification',
      date: '2024-10-15',
      publisher: 'National Payments Corporation of India',
      url: 'https://npci.org.in/circulars',
      summary:
        'Directs all member banks, PSPs, and TPAPs to implement the ₹10,000 per-transaction limit for UPI123Pay with immediate effect.',
      keyClauses: [
        'Clause 2.1: Member banks must update limit configurations on core banking systems (CBS).',
        'Clause 3: Mandatory compliance verification by January 1, 2025.',
      ],
    },
    {
      title: 'Payment and Settlement Systems Act, 2007 (Section 10A Mandate)',
      type: 'act',
      date: '2007-12-20',
      publisher: 'Parliament of India',
      url: 'https://egazette.gov.in',
      summary:
        'Statutory framework governing electronic payments; Section 10A prohibits banks from charging MDR on prescribed electronic modes including UPI.',
      keyClauses: [
        'Section 10A: No bank or system provider shall impose any charge on a person making or receiving a payment using prescribed electronic modes.',
      ],
    },
  ],

  relatedStorySlugs: ['digital-payments-boom'],
  relatedEntityIds: ['npci', 'rbi'],
};
