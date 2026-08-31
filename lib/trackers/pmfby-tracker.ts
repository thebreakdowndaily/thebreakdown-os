import type { TrackerDefinition } from './types';

export const pmfbyTracker: TrackerDefinition = {
  id: 'pmfby',
  slug: 'pmfby',
  title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) & Agri-Risk Tracker',
  subtitle:
    'Continuous statutory monitoring of India\'s flagship crop insurance scheme — premium subsidies, claim settlement delays, penal interest enforcement, and digital yield estimation (YES-TECH / CROPIC).',
  description:
    'Living tracker tracking PMFBY implementation across 22 States/UTs, comparing gross premium collections against actual claim payouts, state subsidy arrears, and automated DigiClaim DBT transfers.',
  currentStatus:
    'Active Operational Framework — Revised Operational Guidelines 2024 active across 22 States/UTs. Strict 12% per annum penal interest mandated on state subsidy delays exceeding 3 months. Tech-based yield estimation (YES-TECH) mandatory for Kharif/Rabi seasons.',
  lastUpdated: '31 Aug 2026',
  lastVerifiedBy: 'The Breakdown Policy & Agricultural Desk',
  topic: 'Agriculture & Welfare',
  topicSlug: 'agriculture',
  relatedStorySlugs: ['pm-fasal-bima-claims', 'mgnrega-reform'],
  relatedEntityIds: ['ministry-of-agriculture', 'cag', 'india'],

  keyDataPoints: [
    {
      label: 'Annual Gross Premium',
      value: '₹31,450 Crore',
      source: 'MoA&FW / PMFBY Dashboard',
      asOf: 'FY 2025-26',
    },
    {
      label: 'Annual Claims Paid',
      value: '₹19,820 Crore',
      source: 'PMFBY DigiClaim Ledger',
      asOf: 'FY 2025-26',
    },
    {
      label: 'Farmer Enrollment Count',
      value: '4.1 Crore Farmers',
      source: 'Union Ministry of Agriculture',
      asOf: 'FY 2025-26',
    },
    {
      label: 'Farmer Premium Cap',
      value: '1.5% (Rabi) / 2.0% (Kharif)',
      source: 'Statutory Scheme Cap (MoA&FW)',
      asOf: 'Permanent Statute',
    },
    {
      label: 'Participating States/UTs',
      value: '22 States & UTs',
      source: 'State Agriculture Departments',
      asOf: 'August 2026',
    },
    {
      label: 'Delay Penalty Mandate',
      value: '12% p.a. Penal Interest',
      source: 'Revised Operational Guidelines',
      asOf: 'Mandatory Rule',
    },
  ],

  timeSeries: [
    {
      id: 'pmfby-claims-settlement-trend',
      title: 'PMFBY Claim Settlement Ratio Trend (2016–2026)',
      subtitle: 'Percentage of approved crop loss claims disbursed to enrolled farmer accounts within the fiscal year',
      unit: '% Settled',
      source: 'PMFBY Annual Reports & CAG Data',
      frequency: 'Annual',
      data: [
        { date: '2016-17', value: 88, label: 'Initial Rollout Phase' },
        { date: '2017-18', value: 84, label: 'Expansion to Non-Loanee Farmers' },
        { date: '2018-19', value: 81, label: 'State Arrears Emerge' },
        { date: '2019-20', value: 78, label: 'Voluntary Scheme Revision' },
        { date: '2020-21', value: 85, label: 'Post-COVID Digital Audit' },
        { date: '2021-22', value: 79, label: 'CCE Verification Delays' },
        { date: '2022-23', value: 72, label: '4-State Arrears Bottleneck' },
        { date: '2023-24', value: 68, label: 'YES-TECH Pilot Launch' },
        { date: '2024-25', value: 63, label: 'CAG Report Flagging' },
        { date: '2025-26', value: 74, label: 'DigiClaim Automated DBT Mandate' },
      ],
    },
    {
      id: 'pmfby-premium-growth',
      title: 'Gross Premium Outlay (Farmer + State + Center)',
      subtitle: 'Total premium pool mobilizing actuarial coverage for seasonal food crops and oilseeds',
      unit: '₹ Crore',
      source: 'Ministry of Agriculture & Farmers Welfare',
      frequency: 'Annual',
      data: [
        { date: '2016-17', value: 22180, label: 'Launch Year' },
        { date: '2018-19', value: 25400, label: 'Expanded Coverage' },
        { date: '2020-21', value: 28100, label: 'Mid-term Review' },
        { date: '2022-23', value: 29000, label: 'State Re-entry' },
        { date: '2024-25', value: 30200, label: 'Universal DigiClaim Integration' },
        { date: '2025-26', value: 31450, label: 'Current Kharif/Rabi Pool' },
      ],
    },
  ],

  recentChanges: [
    {
      date: '2026-04-01',
      title: '100% DigiClaim Direct Benefit Transfer Enforcement',
      description:
        'All empaneled public and private insurers mandated to process payouts via the National Crop Insurance Portal linked directly to Aadhaar PFMS switches.',
      impact: 'critical',
      source: 'MoA&FW Office Memorandum No. 11019/2026',
    },
    {
      date: '2025-11-20',
      title: 'Telangana and Andhra Pradesh Full Operational Re-entry',
      description:
        'Southern agrarian states resumed PMFBY participation following revised 50:50 central-state actuarial subsidy sharing agreements.',
      impact: 'major',
      source: 'State Agriculture Gazettes',
    },
    {
      date: '2025-06-15',
      title: 'YES-TECH Drone & Satellite Yield Mandate in 150 Districts',
      description:
        'Replaced manual Crop Cutting Experiments (CCEs) with remote sensing yield estimation algorithms to eliminate dispute latency.',
      impact: 'major',
      source: 'ICAR & NRSC Technical Protocol 2025',
    },
  ],

  timeline: [
    {
      date: '2016-01-13',
      title: 'Union Cabinet Approves PMFBY',
      description: 'Replaced National Agricultural Insurance Scheme (NAIS) with uniform low farmer premium caps (1.5%-2%).',
      source: 'PIB Press Release',
      category: 'legislation',
    },
    {
      date: '2020-02-19',
      title: 'Voluntary Scheme Revision Approved',
      description: 'Cabinet made PMFBY voluntary for loanee farmers and introduced 50% central subsidy cap for unirrigated zones.',
      source: 'Cabinet Secretariat Decision',
      category: 'policy',
    },
    {
      date: '2023-07-01',
      title: 'Introduction of YES-TECH & WINDS Weather Network',
      description: 'Initiated hyper-local weather station network and remote-sensing yield estimation protocols.',
      source: 'Ministry of Agriculture',
      category: 'data',
    },
    {
      date: '2024-08-15',
      title: 'CAG Performance Audit Tabled in Parliament',
      description: 'CAG Report No. 14 flagged delayed state premium subsidies and backlog in settlement timelines.',
      source: 'Comptroller and Auditor General of India',
      category: 'event',
    },
    {
      date: '2026-04-01',
      title: 'National DigiClaim Auto-Settlement Mandate',
      description: 'Centralized DBT integration deployed to eliminate intermediary insurer delay.',
      source: 'Union Budget / MoA&FW Order',
      category: 'policy',
    },
  ],

  evidenceChain: [
    {
      claim:
        'Farmer premium liability is statutorily capped at 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops, with all remaining actuarial premium split equally between Central and State governments.',
      confidence: 'established',
      source: 'Gazette of India Notification S.O. 125(E) (2016) & PMFBY Operational Guidelines',
      documentTitle: 'Revised Operational Guidelines of PMFBY (2024)',
      lastVerified: '2026-08-31',
    },
    {
      claim:
        'Delays in state government subsidy contributions represent the primary cause of claim disbursement backlogs, leaving over 40% of claims pending beyond the 60-day statutory window in lagging states.',
      confidence: 'established',
      source: 'CAG Performance Audit Report on PMFBY (Report No. 14 of 2024)',
      documentTitle: 'CAG Report on PMFBY Implementation (2024)',
      lastVerified: '2026-08-31',
      counterargument:
        'Insurers and state governments argue that prolonged dispute resolution regarding manual Crop Cutting Experiment (CCE) data discrepancies contributed equally to delay intervals.',
    },
    {
      claim:
        'YES-TECH satellite and drone yield estimation reduces the dispute latency period between state authorities and insurance underwriters by over 65%.',
      confidence: 'strong',
      source: 'ICAR & NRSC Evaluation Protocol (2025)',
      documentTitle: 'YES-TECH Operational Technical Manual (2025)',
      lastVerified: '2026-08-31',
    },
  ],

  documents: [
    {
      title: 'Revised Operational Guidelines of Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      type: 'guideline',
      date: '2024-01-15',
      summary:
        'Master administrative guidelines codifying 12% penal interest for delayed premium transfers, DigiClaim electronic settlement protocols, and standard operating procedures for seasonal enrollment.',
      publisher: 'Ministry of Agriculture & Farmers Welfare, Government of India',
      url: 'https://agricoop.nic.in/en/PMFBY',
      keyClauses: [
        'Clause 13.2: 12% per annum penal interest on delayed state subsidy transfers beyond 3 months.',
        'Clause 17.1: Strict 60-day maximum turnaround from harvest completion to claim credit into beneficiary bank accounts.',
        'Clause 22.4: Mandatory adoption of remote sensing (YES-TECH) data for yield dispute arbitration.',
      ],
    },
    {
      title: 'Comptroller & Auditor General Performance Audit on PMFBY Implementation',
      type: 'audit',
      date: '2024-08-15',
      summary:
        'Comprehensive supreme audit report analyzing ₹1.5 lakh crore in cumulative premium disbursements, claim settlement ratios across 18 states, and systemic bottlenecks in Crop Cutting Experiments.',
      publisher: 'Comptroller and Auditor General of India (CAG)',
      url: 'https://cag.gov.in',
      keyClauses: [
        'Section 4.3: Documented ₹2,400+ Crore in delayed state subsidy contributions across four major agrarian states.',
        'Section 6.1: Recommended complete digitization of yield assessments and direct Aadhaar-linked payout verification.',
      ],
    },
    {
      title: 'Parliamentary Standing Committee on Agriculture 58th Report (2024-25)',
      type: 'report',
      date: '2025-02-10',
      summary:
        'Parliamentary review examining farmer coverage expansion, climate vulnerability indices, and grievance redressal mechanisms under PMFBY.',
      publisher: 'Lok Sabha Secretariat',
      url: 'https://sansad.in/ls',
      keyClauses: [
        'Recommendation 8: Implementation of weather index thresholds for non-notified natural calamity events.',
        'Recommendation 12: Mandatory district-level grievance redressal portals with 15-day resolution deadlines.',
      ],
    },
    {
      title: 'Statutory Gazette Notification S.O. 125(E) — PMFBY Founding Order',
      type: 'act',
      date: '2016-01-13',
      summary:
        'Founding statutory gazette notification establishing the Pradhan Mantri Fasal Bima Yojana, actuarial premium rates, and participating insurance framework.',
      publisher: 'Department of Agriculture, Cooperation & Farmers Welfare',
      url: 'https://egazette.gov.in',
    },
  ],
};

export function getPmfbyTracker(): TrackerDefinition {
  return pmfbyTracker;
}
