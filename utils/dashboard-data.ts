// ─── Dashboard Types & Real Canonical Data ──────────────────────────────────
// The Breakdown — Newsroom Dashboard
// Updated: 27 September 2026 (Platform Beta / VS8 Release)

export interface StorySummary {
  id: string;
  slug: string;
  headline: string;
  category: string;
  author: string;
  status: 'draft' | 'research' | 'editorial-review' | 'publishing' | 'published' | 'updated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  evidenceScore?: number;
  wordCount?: number;
  version?: number;
}

export interface QueueItem {
  id: string;
  type: 'research' | 'editorial-review' | 'publishing';
  storyId: string;
  headline: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  submittedAt: string;
  deadline?: string;
  status: 'pending' | 'in-progress' | 'overdue';
  notes?: string;
}

export interface MonitoringAlert {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'informational';
  source: string;
  title: string;
  summary: string;
  detectedAt: string;
  affectedStories: number;
  acknowledged: boolean;
  action: 'update_and_republish' | 'update_only' | 'log_only' | 'dismiss';
}

export interface TrendingTopic {
  topic: string;
  category: string;
  volume: number;        // 0-100
  change: number;        // % change from last period
  direction: 'up' | 'down' | 'stable';
  relatedStories: number;
}

export interface EntityUpdate {
  id: string;
  entityName: string;
  entityType: 'person' | 'organization' | 'policy' | 'law' | 'location' | 'event' | 'report';
  changeType: 'new' | 'status_change' | 'value_change' | 'personnel_change';
  summary: string;
  source: string;
  detectedAt: string;
  storyId?: string;
}

export interface KGNode {
  id: string;
  label: string;
  type: string;
  size: number;          // 1-5, visual weight
  connections: number;
}

export interface KGEdge {
  source: string;
  target: string;
  label: string;
  weight: number;        // 1-5
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  change: number;
  direction: 'up' | 'down';
  period: string;
}

export interface DashboardData {
  stats: {
    storiesToday: number;
    researchQueue: number;
    editorialQueue: number;
    publishingQueue: number;
    activeMonitors: number;
    criticalAlerts: number;
    publishedThisWeek: number;
    avgEvidenceScore: number;
  };
  stories: StorySummary[];
  researchQueue: QueueItem[];
  editorialQueue: QueueItem[];
  publishingQueue: QueueItem[];
  alerts: MonitoringAlert[];
  trending: TrendingTopic[];
  entityUpdates: EntityUpdate[];
  knowledgeGraph: { nodes: KGNode[]; edges: KGEdge[] };
  analytics: AnalyticsMetric[];
}

// ─── Latest Canonical Newsroom Data (September 2026) ─────────────────────────

export const mockDashboardData: DashboardData = {
  stats: {
    storiesToday: 6,
    researchQueue: 8,
    editorialQueue: 4,
    publishingQueue: 3,
    activeMonitors: 16,
    criticalAlerts: 1,
    publishedThisWeek: 26,
    avgEvidenceScore: 94,
  },

  stories: [
    {
      id: 'story-mgnrega',
      slug: 'mgnrega-reform',
      headline: 'MGNREGA 2026: The 125-Day Rural Employment Guarantee Explained',
      category: 'economy',
      author: 'The Breakdown Editorial',
      status: 'published',
      priority: 'high',
      createdAt: '2026-09-20T06:00:00Z',
      updatedAt: '2026-09-26T14:30:00Z',
      evidenceScore: 94,
      wordCount: 4600,
      version: 2,
    },
    {
      id: 'story-kashmir',
      slug: 'kashmir-the-first-test',
      headline: 'Kashmir 1947–48: The First Test of Strategic Autonomy',
      category: 'foreign_affairs',
      author: 'The Breakdown Editorial',
      status: 'published',
      priority: 'critical',
      createdAt: '2026-09-18T10:00:00Z',
      updatedAt: '2026-09-25T16:00:00Z',
      evidenceScore: 96,
      wordCount: 5200,
      version: 2,
    },
    {
      id: 'story-china-border',
      slug: 'india-china-border-lac',
      headline: 'The Sino-Indian Border: Strategic Inheritance, Treaties & The LAC',
      category: 'defence',
      author: 'The Breakdown Editorial',
      status: 'published',
      priority: 'critical',
      createdAt: '2026-09-15T08:00:00Z',
      updatedAt: '2026-09-24T12:00:00Z',
      evidenceScore: 95,
      wordCount: 4800,
      version: 1,
    },
    {
      id: 'story-inheritance',
      slug: 'indias-inheritance',
      headline: 'Foundations (1947–1962): India\'s Strategic Inheritance',
      category: 'foreign_affairs',
      author: 'Editor-in-Chief & Editorial Bureau',
      status: 'published',
      priority: 'critical',
      createdAt: '2026-09-10T04:00:00Z',
      updatedAt: '2026-09-26T18:00:00Z',
      evidenceScore: 98,
      wordCount: 15400,
      version: 3,
    },
    {
      id: 'story-accountability',
      slug: 'accountability-in-india',
      headline: 'Accountability in India: RTI, Audits, and Institutional Checks',
      category: 'governance',
      author: 'The Breakdown Editorial',
      status: 'published',
      priority: 'high',
      createdAt: '2026-09-12T08:00:00Z',
      updatedAt: '2026-09-25T11:30:00Z',
      evidenceScore: 92,
      wordCount: 3800,
      version: 1,
    },
    {
      id: 'story-electoral-bonds',
      slug: 'electoral-bonds',
      headline: 'Electoral Bonds & Political Financing: The Complete Evidence Trail',
      category: 'politics',
      author: 'The Breakdown Editorial',
      status: 'published',
      priority: 'critical',
      createdAt: '2026-09-14T05:00:00Z',
      updatedAt: '2026-09-25T09:00:00Z',
      evidenceScore: 96,
      wordCount: 4100,
      version: 2,
    },
    {
      id: 'story-who-cancer',
      slug: 'who-cancer-report-2026',
      headline: 'Cancer in India 2026: Evidence, Pricing & The National Registry',
      category: 'health',
      author: 'The Breakdown Editorial',
      status: 'published',
      priority: 'high',
      createdAt: '2026-09-16T07:00:00Z',
      updatedAt: '2026-09-24T15:00:00Z',
      evidenceScore: 91,
      wordCount: 3600,
      version: 1,
    },
    {
      id: 'story-epf',
      slug: 'epf-scheme-2026',
      headline: 'EPFO Social Security Reform 2026: Coverage, Yields & Wage Limits',
      category: 'labour',
      author: 'The Breakdown Editorial',
      status: 'published',
      priority: 'medium',
      createdAt: '2026-09-19T09:00:00Z',
      updatedAt: '2026-09-25T10:00:00Z',
      evidenceScore: 93,
      wordCount: 3400,
      version: 1,
    },
  ],

  researchQueue: [
    {
      id: 'rq-001',
      type: 'research',
      storyId: 'vol1-ch2',
      headline: 'Volume I Chapter 2: Integration of Princely States (1947–1950)',
      assignedTo: 'Historical Research Bureau',
      priority: 'critical',
      submittedAt: '2026-09-24T10:00:00Z',
      deadline: '2026-10-05T18:00:00Z',
      status: 'in-progress',
      notes: 'Collating National Archives instrument of accession documents & VP Menon memoirs.',
    },
    {
      id: 'rq-002',
      type: 'research',
      storyId: 'kashmir-uncip',
      headline: 'UNCIP Resolution 47 & Karachi Agreement (1949) Digital Document Dossier',
      assignedTo: 'Verification Bureau',
      priority: 'high',
      submittedAt: '2026-09-25T08:00:00Z',
      deadline: '2026-09-30T18:00:00Z',
      status: 'in-progress',
      notes: 'Aligning UN Digital Library treaty citations with interactive map coordinates.',
    },
    {
      id: 'rq-003',
      type: 'research',
      storyId: 'cag-pmkisan',
      headline: 'CAG Compliance Audit: DBT Benefit Saturation in Direct Farm Schemes',
      assignedTo: 'Economic Data Desk',
      priority: 'high',
      submittedAt: '2026-09-25T14:00:00Z',
      deadline: '2026-10-02T12:00:00Z',
      status: 'pending',
      notes: 'State-wise disbursement audit cross-referenced with PFMS logs.',
    },
    {
      id: 'rq-004',
      type: 'research',
      storyId: 'green-hydrogen-2026',
      headline: 'National Green Hydrogen Mission: Electrolyser Capacity & Offtake Pacts',
      assignedTo: 'Climate & Energy Desk',
      priority: 'medium',
      submittedAt: '2026-09-26T09:00:00Z',
      deadline: '2026-10-08T10:00:00Z',
      status: 'pending',
    },
  ],

  editorialQueue: [
    {
      id: 'eq-001',
      type: 'editorial-review',
      storyId: 'panchsheel-dossier',
      headline: 'Panchsheel & Bandung Conference: The Historical Evidence Archive',
      assignedTo: 'Senior Editorial Desk',
      priority: 'high',
      submittedAt: '2026-09-26T11:00:00Z',
      deadline: '2026-09-29T14:00:00Z',
      status: 'in-progress',
      notes: 'Phase 4 Bias Audit and primary treaty verification underway.',
    },
    {
      id: 'eq-002',
      type: 'editorial-review',
      storyId: 'namami-gange-audit',
      headline: 'Namami Gange Phase II: Sewage Treatment Plant Utilization & Water Sensor Telemetry',
      assignedTo: 'Investigative Review Bureau',
      priority: 'high',
      submittedAt: '2026-09-25T16:00:00Z',
      deadline: '2026-09-28T18:00:00Z',
      status: 'in-progress',
      notes: 'Validating CPCB real-time biochemical oxygen demand telemetry data.',
    },
  ],

  publishingQueue: [
    {
      id: 'pq-001',
      type: 'publishing',
      storyId: 'story-mgnrega-errata',
      headline: 'MGNREGA 2026: Published Errata Notice & In-Context Statutory Banner Binding',
      assignedTo: 'Knowledge Operations Desk',
      priority: 'critical',
      submittedAt: '2026-09-27T08:00:00Z',
      deadline: '2026-09-27T12:00:00Z',
      status: 'in-progress',
      notes: 'VS8 reader correction errata banner deployed to public story surface.',
    },
    {
      id: 'pq-002',
      type: 'publishing',
      storyId: 'strategic-autonomy-synthesis',
      headline: 'Foundations of Strategic Autonomy: Volume I Interactive Concept Map',
      assignedTo: 'Knowledge Operations Desk',
      priority: 'high',
      submittedAt: '2026-09-26T15:00:00Z',
      deadline: '2026-09-28T10:00:00Z',
      status: 'pending',
      notes: 'Knowledge graph visual connections verified across Volume I thinkers.',
    },
  ],

  alerts: [
    {
      id: 'alert-sep-01',
      severity: 'critical',
      source: 'cag-audit',
      title: 'CAG Union Compliance Report Tabled in Parliament',
      summary: 'CAG report flags rural employment funding reconciliation gaps across three state nodal agencies.',
      detectedAt: '2026-09-27T09:15:00Z',
      affectedStories: 2,
      acknowledged: false,
      action: 'update_and_republish',
    },
    {
      id: 'alert-sep-02',
      severity: 'major',
      source: 'rbi',
      title: 'RBI Monetary Policy Committee Resolution — Stance Maintained',
      summary: 'MPC votes 5:1 to keep benchmark repo rate steady; liquidity conditions remain monitored.',
      detectedAt: '2026-09-26T11:00:00Z',
      affectedStories: 3,
      acknowledged: true,
      action: 'update_only',
    },
    {
      id: 'alert-sep-03',
      severity: 'major',
      source: 'supreme-court',
      title: 'Supreme Court Sets Hearing on Digital Data Protection Enforcement',
      summary: 'Constitution bench to examine statutory rule-making boundaries under DPDP Act.',
      detectedAt: '2026-09-25T14:30:00Z',
      affectedStories: 2,
      acknowledged: true,
      action: 'update_only',
    },
    {
      id: 'alert-sep-04',
      severity: 'minor',
      source: 'pib',
      title: 'MoD Announces Completion of Strategic Northern Tunnel Link',
      summary: 'Border Roads Organisation completes all-weather link in eastern Ladakh sector.',
      detectedAt: '2026-09-25T08:00:00Z',
      affectedStories: 1,
      acknowledged: true,
      action: 'log_only',
    },
  ],

  trending: [
    { topic: 'MGNREGA 125 Days', category: 'economy', volume: 96, change: 110, direction: 'up', relatedStories: 4 },
    { topic: 'UNCIP Ceasefire 1949', category: 'foreign_affairs', volume: 91, change: 85, direction: 'up', relatedStories: 3 },
    { topic: 'Sino-Indian LAC', category: 'defence', volume: 88, change: 42, direction: 'up', relatedStories: 3 },
    { topic: 'Electoral Bonds Trail', category: 'politics', volume: 84, change: 25, direction: 'up', relatedStories: 2 },
    { topic: 'EPFO Wage Ceiling', category: 'labour', volume: 76, change: 30, direction: 'up', relatedStories: 2 },
    { topic: 'CAG Rural Audit', category: 'governance', volume: 72, change: 140, direction: 'up', relatedStories: 2 },
    { topic: 'National Cancer Registry', category: 'health', volume: 68, change: 18, direction: 'up', relatedStories: 1 },
    { topic: 'Strategic Autonomy', category: 'foreign_affairs', volume: 64, change: 50, direction: 'up', relatedStories: 3 },
  ],

  entityUpdates: [
    {
      id: 'ent-001',
      entityName: 'Ministry of Rural Development',
      entityType: 'organization',
      changeType: 'status_change',
      summary: 'Notified transitional operational guidelines for VB-G RAM G Act, 2025',
      source: 'pib',
      detectedAt: '2026-09-26T16:00:00Z',
      storyId: 'mgnrega-reform',
    },
    {
      id: 'ent-002',
      entityName: 'United Nations Commission for India and Pakistan (UNCIP)',
      entityType: 'organization',
      changeType: 'new',
      summary: 'Primary archival ceasefire resolutions digitized and verified in Source Registry',
      source: 'un-digital-library',
      detectedAt: '2026-09-25T11:00:00Z',
      storyId: 'kashmir-the-first-test',
    },
    {
      id: 'ent-003',
      entityName: 'Reserve Bank of India (RBI)',
      entityType: 'organization',
      changeType: 'status_change',
      summary: 'Monetary Policy Committee releases bi-annual Monetary Policy Report',
      source: 'rbi',
      detectedAt: '2026-09-26T12:00:00Z',
    },
    {
      id: 'ent-004',
      entityName: 'Border Roads Organisation (BRO)',
      entityType: 'organization',
      changeType: 'value_change',
      summary: 'Completed 64 strategic border bridges in northern & north-eastern sectors',
      source: 'pib',
      detectedAt: '2026-09-24T14:00:00Z',
      storyId: 'india-china-border-lac',
    },
    {
      id: 'ent-005',
      entityName: 'Supreme Court of India',
      entityType: 'organization',
      changeType: 'status_change',
      summary: 'Constitutional bench listed judicial accountability and transparency petitions',
      source: 'supreme-court',
      detectedAt: '2026-09-23T10:00:00Z',
      storyId: 'accountability-in-india',
    },
  ],

  knowledgeGraph: {
    nodes: [
      { id: 'kg-1', label: 'Strategic Inheritance', type: 'concept', size: 5, connections: 8 },
      { id: 'kg-2', label: 'Kashmir Accession 1947', type: 'event', size: 5, connections: 7 },
      { id: 'kg-3', label: 'UNCIP Resolution 47', type: 'law', size: 4, connections: 6 },
      { id: 'kg-4', label: 'Sino-Indian LAC', type: 'location', size: 4, connections: 7 },
      { id: 'kg-5', label: 'VB-G RAM G Act 2025', type: 'law', size: 5, connections: 6 },
      { id: 'kg-6', label: 'Reserve Bank of India', type: 'organization', size: 4, connections: 5 },
      { id: 'kg-7', label: 'Electoral Bonds Ledger', type: 'dataset', size: 4, connections: 5 },
      { id: 'kg-8', label: 'CAG Audit Reports', type: 'report', size: 4, connections: 6 },
    ],
    edges: [
      { source: 'kg-1', target: 'kg-2', label: 'governs', weight: 4 },
      { source: 'kg-2', target: 'kg-3', label: 'referred_to', weight: 5 },
      { source: 'kg-1', target: 'kg-4', label: 'delineates', weight: 4 },
      { source: 'kg-5', target: 'kg-8', label: 'audited_by', weight: 4 },
      { source: 'kg-7', target: 'kg-8', label: 'disclosed_in', weight: 3 },
      { source: 'kg-6', target: 'kg-7', label: 'processed_by', weight: 3 },
      { source: 'kg-1', target: 'kg-5', label: 'welfare_doctrine', weight: 3 },
    ],
  },

  analytics: [
    { label: 'Total Stories Published', value: '512', change: 16, direction: 'up', period: 'vs last month' },
    { label: 'Avg Evidence Score', value: '94.2', change: 2.9, direction: 'up', period: 'vs last month' },
    { label: 'Avg In-Depth Read Time', value: '11.4 min', change: 1.8, direction: 'up', period: 'vs last month' },
    { label: 'Active Monitored Sources', value: '16', change: 3, direction: 'up', period: 'all verified' },
    { label: 'Public Errata Transparency', value: '100%', change: 0, direction: 'up', period: 'VS8 certified' },
    { label: 'Pipeline Health Stages', value: '10/10', change: 0, direction: 'up', period: 'healthy' },
    { label: 'Corrections Queue Latency', value: '< 2 hrs', change: -35, direction: 'down', period: 'improved' },
    { label: 'Reader Trust Index', value: '96.4%', change: 3.1, direction: 'up', period: 'all cohorts' },
  ],
};
