export interface TrackerDataPoint {
  label: string;
  value: string;
  source: string;
  asOf: string;
}

export interface TrackerChange {
  date: string;
  title: string;
  description: string;
  impact: 'critical' | 'major' | 'minor';
  source: string;
}

export interface TrackerTimelineEvent {
  date: string;
  title: string;
  description: string;
  source: string;
  category: 'legislation' | 'policy' | 'data' | 'event';
}

export interface TrackerEvidenceChain {
  claim: string;
  confidence: 'established' | 'strong' | 'contested';
  source: string;
  lastVerified: string;
  counterargument?: string;
}

export interface TrackerDocument {
  title: string;
  type: 'act' | 'notification' | 'report' | 'audit' | 'data';
  date: string;
  url?: string;
  summary: string;
}

export interface MgnregaTracker {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  currentStatus: string;
  lastUpdated: string;
  lastVerifiedBy: string;
  keyDataPoints: TrackerDataPoint[];
  recentChanges: TrackerChange[];
  timeline: TrackerTimelineEvent[];
  evidenceChain: TrackerEvidenceChain[];
  documents: TrackerDocument[];
  relatedStorySlugs: string[];
  relatedEntityIds: string[];
}

export function getMgnregaTracker(): MgnregaTracker {
  return {
    id: 'mgnrega',
    title: 'MGNREGA → VB-G RAM G Act 2025',
    subtitle: 'India\'s rural employment guarantee — 20 years of MGNREGA, then the 2026 overhaul',
    description: 'Track the legislative transition from MGNREGA 2005 (100 days) to the Viksit Bharat – Guarantee for Rozgar and Ajeevika Mission (Gramin) Act, 2025 (125 days), including key data, evidence, and what changed.',
    currentStatus: 'VB-G RAM G Act 2025 is now the operative statute (since 1 July 2026). MGNREGA 2005 repealed under Section 36(1) of Act No. 18 of 2025. Existing job card holders retain full transitional protection.',
    lastUpdated: '2026-07-23',
    lastVerifiedBy: 'The Breakdown Editorial',
    keyDataPoints: [
      { label: 'Statutory guarantee (current law)', value: '125 days/year', source: 'VB-G RAM G Act 2025', asOf: '1 Jul 2026' },
      { label: 'Statutory guarantee (historical)', value: '100 days/year', source: 'MGNREGA 2005 (2005–2026)', asOf: '1 Jul 2026' },
      { label: 'Active rural workers', value: '14.2 crore', source: 'NREGA / VB-G RAM G MIS', asOf: 'FY 2025-26' },
      { label: 'Women participation', value: '55.3%', source: 'MoRD Annual Report 2025-26', asOf: 'FY 2025-26' },
      { label: 'Cumulative expenditure (20 years)', value: '₹8+ lakh crore', source: 'The Breakdown Analysis', asOf: 'Feb 2026' },
      { label: 'FY 2026-27 budget estimate', value: '₹1,05,000 crore', source: 'Union Budget 2026-27', asOf: 'Feb 2026' },
    ],
    recentChanges: [
      {
        date: '1 Jul 2026',
        title: 'VB-G RAM G Act comes into force',
        description: 'MGNREGA 2005 repealed. 125-day statutory guarantee operationalized nationwide under Act No. 18 of 2025.',
        impact: 'critical',
        source: 'MoRD Notification S.O. 2415(E)',
      },
      {
        date: '18 Dec 2025',
        title: 'VB-G RAM G Act enacted',
        description: 'Parliament passes the Viksit Bharat – Guarantee for Rozgar and Ajeevika Mission (Gramin) Act, 2025 (Act No. 18 of 2025).',
        impact: 'critical',
        source: 'Gazette of India',
      },
      {
        date: '15 Jun 2026',
        title: 'Commencement notification issued',
        description: 'MoRD issues Notification S.O. 2415(E) fixing 1 July 2026 as the nationwide commencement date.',
        impact: 'major',
        source: 'Ministry of Rural Development',
      },
    ],
    timeline: [
      { date: '2006-02-02', title: 'MGNREGA 2005 enacted', description: 'Parliament passes the National Rural Employment Guarantee Act (Act No. 42 of 2005) guaranteeing 100 days of work.', source: 'PRS Legislative', category: 'legislation' },
      { date: '2008-04-01', title: 'Phase 1 completion', description: 'Scheme covers 200 most backward districts nationwide.', source: 'MoRD', category: 'policy' },
      { date: '2013-09-01', title: 'Enhanced wage structure', description: 'Wage rates revised with CPI-AL linkage.', source: 'Gazette Notification', category: 'policy' },
      { date: '2020-04-01', title: 'COVID-19 relief surge', description: 'Demand for work surges 40% during pandemic lockdowns.', source: 'MoRD Annual Report', category: 'data' },
      { date: '2026-02-02', title: '20th anniversary milestone', description: 'Cumulative historical expenditure exceeds ₹8 lakh crore over two decades.', source: 'The Breakdown Analysis', category: 'data' },
      { date: '2025-12-18', title: 'VB-G RAM G Act enacted', description: 'Parliament passes Act No. 18 of 2025 replacing MGNREGA 2005.', source: 'Gazette of India', category: 'legislation' },
      { date: '2026-06-15', title: 'Commencement notification', description: 'MoRD fixes 1 July 2026 as nationwide commencement date.', source: 'MoRD Notification S.O. 2415(E)', category: 'policy' },
      { date: '2026-07-01', title: 'VB-G RAM G Act operational', description: 'MGNREGA 2005 repealed under Section 36(1). 125-day guarantee now operative.', source: 'The Breakdown Gazette Analysis', category: 'legislation' },
    ],
    evidenceChain: [
      {
        claim: 'MGNREGA 2005 is no longer operative law in India.',
        confidence: 'established',
        source: 'Section 36(1) of Act No. 18 of 2025; MoRD Notification S.O. 2415(E)',
        lastVerified: '2026-07-23',
        counterargument: 'Some public statements still reference MGNREGA 2005 as the active statute, but this is outdated.',
      },
      {
        claim: 'The statutory guarantee increased from 100 to 125 days per household per financial year.',
        confidence: 'established',
        source: 'VB-G RAM G Act 2025, Section 4',
        lastVerified: '2026-07-23',
      },
      {
        claim: '55.3% of person-days generated under MGNREGA/VB-G RAM G were worked by women.',
        confidence: 'strong',
        source: 'MoRD Annual Report 2025-26',
        lastVerified: '2026-07-23',
      },
      {
        claim: 'MGNREGA wages have not kept pace with inflation, with 12 of 28 states paying below market rates.',
        confidence: 'established',
        source: 'CAG Performance Audit; PRS Legislative Research',
        lastVerified: '2026-06-15',
      },
    ],
    documents: [
      { title: 'National Rural Employment Guarantee Act, 2005 (Act No. 42 of 2005)', type: 'act', date: '2005-09-07', summary: 'Original legislation guaranteeing 100 days of wage employment per household. Now repealed.' },
      { title: 'Viksit Bharat – Guarantee for Rozgar and Ajeevika Mission (Gramin) Act, 2025', type: 'act', date: '2025-12-18', summary: 'Replacement legislation expanding the guarantee to 125 days. Act No. 18 of 2025.' },
      { title: 'MoRD Notification S.O. 2415(E)', type: 'notification', date: '2026-06-15', summary: 'Commencement notification fixing 1 July 2026 as the date the 2025 Act comes into force nationwide.' },
      { title: 'MoRD Annual Report 2025-26', type: 'report', date: '2026-05-01', summary: 'Operational data including person-days, women participation, expenditure, and state-wise coverage.' },
      { title: 'CAG Performance Audit of MGNREGA', type: 'audit', date: '2025-12-01', summary: 'Audit findings on wage delays, fund leakage, and incomplete social audits.' },
    ],
    relatedStorySlugs: ['mgnrega-reform'],
    relatedEntityIds: ['ministry-of-rural-development', 'india'],
  };
}
