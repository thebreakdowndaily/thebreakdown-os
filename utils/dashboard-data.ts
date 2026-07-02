// ─── Dashboard Types & Mock Data ───────────────────────────────────────────
// The Breakdown — Newsroom Dashboard

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

// ─── Mock Data ─────────────────────────────────────────────────────────────

export const mockDashboardData: DashboardData = {
  stats: {
    storiesToday: 4,
    researchQueue: 7,
    editorialQueue: 3,
    publishingQueue: 2,
    activeMonitors: 13,
    criticalAlerts: 2,
    publishedThisWeek: 18,
    avgEvidenceScore: 91,
  },

  stories: [
    {
      id: 'story-001',
      slug: 'semiconductor-pli-expansion',
      headline: 'Cabinet Approves ₹1.2 Lakh Crore Semiconductor PLI Expansion',
      category: 'economy',
      author: 'Priya Sharma',
      status: 'published',
      priority: 'high',
      createdAt: '2026-07-02T06:00:00Z',
      updatedAt: '2026-07-02T09:30:00Z',
      evidenceScore: 94,
      wordCount: 1850,
      version: 1,
    },
    {
      id: 'story-002',
      slug: 'dpdp-bill-passed-loksabha',
      headline: 'DPDP Amendment Bill Passed in Lok Sabha — What Changes',
      category: 'policy',
      author: 'Vikram Joshi',
      status: 'published',
      priority: 'critical',
      createdAt: '2026-07-01T14:00:00Z',
      updatedAt: '2026-07-02T08:15:00Z',
      evidenceScore: 96,
      wordCount: 2200,
      version: 2,
    },
    {
      id: 'story-003',
      slug: 'rbi-repo-rate-july-2026',
      headline: 'RBI Holds Repo Rate at 6.50% — MPC Votes 5:1',
      category: 'economy',
      author: 'Ananya Mehta',
      status: 'published',
      priority: 'high',
      createdAt: '2026-07-01T10:00:00Z',
      updatedAt: '2026-07-01T16:45:00Z',
      evidenceScore: 92,
      wordCount: 1600,
      version: 1,
    },
    {
      id: 'story-004',
      slug: 'supreme-court-aadhaar-review',
      headline: 'Supreme Court to Review Aadhaar Constitutional Validity',
      category: 'policy',
      author: 'Ravi Desai',
      status: 'publishing',
      priority: 'critical',
      createdAt: '2026-07-02T04:00:00Z',
      updatedAt: '2026-07-02T10:00:00Z',
      evidenceScore: 89,
      wordCount: 1950,
      version: 1,
    },
    {
      id: 'story-005',
      slug: 'state-budget-analysis-uttar-pradesh',
      headline: 'Uttar Pradesh Budget 2026-27: Infrastructure Gets 40% Share',
      category: 'policy',
      author: 'Sonia Gupta',
      status: 'editorial-review',
      priority: 'medium',
      createdAt: '2026-07-01T08:00:00Z',
      updatedAt: '2026-07-02T07:30:00Z',
      evidenceScore: 85,
      wordCount: 1400,
      version: 1,
    },
    {
      id: 'story-006',
      slug: 'global-semiconductor-supply-chain',
      headline: 'How India Is Positioning Itself in the Global Semiconductor Supply Chain',
      category: 'technology',
      author: 'Priya Sharma',
      status: 'research',
      priority: 'high',
      createdAt: '2026-07-02T05:00:00Z',
      updatedAt: '2026-07-02T08:00:00Z',
      wordCount: 500,
    },
  ],

  researchQueue: [
    {
      id: 'rq-001',
      type: 'research',
      storyId: 'story-006',
      headline: 'How India Is Positioning Itself in the Global Semiconductor Supply Chain',
      assignedTo: 'Priya Sharma',
      priority: 'high',
      submittedAt: '2026-07-02T05:00:00Z',
      deadline: '2026-07-03T18:00:00Z',
      status: 'in-progress',
      notes: 'Need latest PLI scheme data and global fab investment numbers',
    },
    {
      id: 'rq-002',
      type: 'research',
      storyId: 'story-007',
      headline: 'WHO Declares Nipah Outbreak in Kerala — PHEIC Status Assessed',
      assignedTo: 'Unassigned',
      priority: 'critical',
      submittedAt: '2026-07-02T01:00:00Z',
      deadline: '2026-07-02T18:00:00Z',
      status: 'pending',
      notes: 'Urgent — coordinate with health desk',
    },
    {
      id: 'rq-003',
      type: 'research',
      storyId: 'story-008',
      headline: 'CAG Report: ₹2,300 Crore Irregularities in PM-KISAN Scheme',
      assignedTo: 'Ravi Desai',
      priority: 'high',
      submittedAt: '2026-07-01T16:00:00Z',
      deadline: '2026-07-03T12:00:00Z',
      status: 'in-progress',
    },
    {
      id: 'rq-004',
      type: 'research',
      storyId: 'story-009',
      headline: 'IMF Article IV: India Growth Forecast Revised to 7.1%',
      assignedTo: 'Ananya Mehta',
      priority: 'medium',
      submittedAt: '2026-07-01T14:00:00Z',
      deadline: '2026-07-04T10:00:00Z',
      status: 'pending',
    },
    {
      id: 'rq-005',
      type: 'research',
      storyId: 'story-010',
      headline: 'Election Commission Announces Maharashtra Assembly By-Poll Dates',
      assignedTo: 'Unassigned',
      priority: 'low',
      submittedAt: '2026-07-01T10:00:00Z',
      deadline: '2026-07-05T10:00:00Z',
      status: 'pending',
    },
  ],

  editorialQueue: [
    {
      id: 'eq-001',
      type: 'editorial-review',
      storyId: 'story-005',
      headline: 'Uttar Pradesh Budget 2026-27: Infrastructure Gets 40% Share',
      assignedTo: 'Amit Khanna',
      priority: 'medium',
      submittedAt: '2026-07-02T07:30:00Z',
      deadline: '2026-07-03T10:00:00Z',
      status: 'in-progress',
      notes: 'Check state budget data against CAG report',
    },
    {
      id: 'eq-002',
      type: 'editorial-review',
      storyId: 'story-011',
      headline: 'India\'s PISA 2025 Results: A Data-Driven Analysis',
      assignedTo: 'Vikram Joshi',
      priority: 'high',
      submittedAt: '2026-07-01T18:00:00Z',
      deadline: '2026-07-02T14:00:00Z',
      status: 'pending',
      notes: 'Verify PISA scores against official OECD dataset',
    },
    {
      id: 'eq-003',
      type: 'editorial-review',
      storyId: 'story-012',
      headline: 'Explained: The Digital Personal Data Protection Rules, 2026',
      assignedTo: 'Amit Khanna',
      priority: 'medium',
      submittedAt: '2026-07-01T12:00:00Z',
      deadline: '2026-07-02T14:00:00Z',
      status: 'overdue',
    },
  ],

  publishingQueue: [
    {
      id: 'pq-001',
      type: 'publishing',
      storyId: 'story-004',
      headline: 'Supreme Court to Review Aadhaar Constitutional Validity',
      assignedTo: 'Sonia Gupta',
      priority: 'critical',
      submittedAt: '2026-07-02T10:00:00Z',
      deadline: '2026-07-02T12:00:00Z',
      status: 'in-progress',
      notes: 'Push to all channels — X thread, Instagram carousel, newsletter alert',
    },
    {
      id: 'pq-002',
      type: 'publishing',
      storyId: 'story-002',
      headline: 'DPDP Amendment Bill Passed in Lok Sabha — Update (v2)',
      assignedTo: 'Vikram Joshi',
      priority: 'critical',
      submittedAt: '2026-07-02T08:15:00Z',
      deadline: '2026-07-02T11:00:00Z',
      status: 'in-progress',
      notes: 'Version 2 — add "What Changed" section, update all channels',
    },
  ],

  alerts: [
    {
      id: 'alert-001',
      severity: 'critical',
      source: 'supreme-court',
      title: 'Supreme Court Grants Stay on CAA Implementation',
      summary: 'Supreme Court issued interim stay on Citizenship Amendment Act implementation until next hearing on July 15.',
      detectedAt: '2026-07-02T10:30:00Z',
      affectedStories: 3,
      acknowledged: false,
      action: 'update_and_republish',
    },
    {
      id: 'alert-002',
      severity: 'critical',
      source: 'pib',
      title: 'Cabinet Approves ₹1.2 Lakh Crore Semiconductor PLI',
      summary: 'Cabinet Committee on Economic Affairs approved expanded PLI scheme for semiconductor manufacturing.',
      detectedAt: '2026-07-02T06:15:00Z',
      affectedStories: 2,
      acknowledged: true,
      action: 'update_and_republish',
    },
    {
      id: 'alert-003',
      severity: 'major',
      source: 'rbi',
      title: 'RBI Releases Financial Stability Report — Banking Sector Stress',
      summary: 'RBI Financial Stability Report flags rising stress in unsecured personal loans and NBFC exposure.',
      detectedAt: '2026-07-02T09:00:00Z',
      affectedStories: 1,
      acknowledged: false,
      action: 'update_only',
    },
    {
      id: 'alert-004',
      severity: 'major',
      source: 'who',
      title: 'WHO Declares Nipah Outbreak in Kerala',
      summary: 'WHO assessed Nipah virus outbreak in Kozhikode, Kerala. PHEIC status under consideration.',
      detectedAt: '2026-07-02T00:45:00Z',
      affectedStories: 0,
      acknowledged: false,
      action: 'dismiss',
    },
    {
      id: 'alert-005',
      severity: 'minor',
      source: 'election-commission',
      title: 'EC Releases Maharashtra By-Poll Schedule',
      summary: 'Election Commission announced by-poll dates for 3 assembly constituencies in Maharashtra.',
      detectedAt: '2026-07-01T18:00:00Z',
      affectedStories: 0,
      acknowledged: true,
      action: 'log_only',
    },
    {
      id: 'alert-006',
      severity: 'informational',
      source: 'oecd',
      title: 'OECD Economic Outlook — India Section Updated',
      summary: 'OECD projects India GDP growth at 6.9% for FY 2026-27, revised up from 6.7%.',
      detectedAt: '2026-07-01T14:00:00Z',
      affectedStories: 0,
      acknowledged: true,
      action: 'log_only',
    },
  ],

  trending: [
    { topic: 'Semiconductor PLI', category: 'economy', volume: 95, change: 82, direction: 'up', relatedStories: 3 },
    { topic: 'DPDP Act', category: 'policy', volume: 88, change: 45, direction: 'up', relatedStories: 4 },
    { topic: 'Aadhaar Review', category: 'policy', volume: 82, change: 120, direction: 'up', relatedStories: 2 },
    { topic: 'CAA Stay', category: 'policy', volume: 78, change: 210, direction: 'up', relatedStories: 3 },
    { topic: 'Nipah Outbreak', category: 'health', volume: 72, change: 350, direction: 'up', relatedStories: 1 },
    { topic: 'RBI Repo Rate', category: 'economy', volume: 65, change: -12, direction: 'down', relatedStories: 2 },
    { topic: 'PISA 2025', category: 'education', volume: 58, change: 28, direction: 'up', relatedStories: 2 },
    { topic: 'UP Budget', category: 'policy', volume: 45, change: 15, direction: 'up', relatedStories: 1 },
    { topic: 'Semiconductor Global Supply Chain', category: 'technology', volume: 42, change: -5, direction: 'down', relatedStories: 2 },
    { topic: 'Climate Finance', category: 'environment', volume: 35, change: 8, direction: 'stable', relatedStories: 1 },
  ],

  entityUpdates: [
    {
      id: 'ent-001',
      entityName: 'Citizenship Amendment Act (CAA)',
      entityType: 'law',
      changeType: 'status_change',
      summary: 'Supreme Court granted interim stay on implementation',
      source: 'supreme-court',
      detectedAt: '2026-07-02T10:30:00Z',
      storyId: 'story-caa-2024',
    },
    {
      id: 'ent-002',
      entityName: 'DPIIT',
      entityType: 'organization',
      changeType: 'new',
      summary: 'Expanded PLI scheme to include semiconductor fabs',
      source: 'pib',
      detectedAt: '2026-07-02T06:15:00Z',
      storyId: 'story-pli-semiconductor',
    },
    {
      id: 'ent-003',
      entityName: 'Digital Personal Data Protection Act',
      entityType: 'law',
      changeType: 'status_change',
      summary: 'Amendment Bill passed in Lok Sabha, moves to Rajya Sabha',
      source: 'parliament',
      detectedAt: '2026-07-01T14:00:00Z',
      storyId: 'story-dpdp-bill',
    },
    {
      id: 'ent-004',
      entityName: 'Shaktikanta Das',
      entityType: 'person',
      changeType: 'personnel_change',
      summary: 'RBI Governor\'s term extended by 1 year',
      source: 'pib',
      detectedAt: '2026-07-01T10:00:00Z',
      storyId: 'story-rbi-governor',
    },
    {
      id: 'ent-005',
      entityName: 'PISA',
      entityType: 'report',
      changeType: 'new',
      summary: 'India\'s PISA 2025 results published — significant improvement',
      source: 'oecd',
      detectedAt: '2026-07-01T08:00:00Z',
      storyId: 'story-pisa-india',
    },
  ],

  knowledgeGraph: {
    nodes: [
      { id: 'ng-1', label: 'Semiconductor PLI', type: 'policy', size: 5, connections: 6 },
      { id: 'ng-2', label: 'DPDP Act', type: 'law', size: 4, connections: 5 },
      { id: 'ng-3', label: 'Supreme Court', type: 'organization', size: 4, connections: 8 },
      { id: 'ng-4', label: 'RBI', type: 'organization', size: 4, connections: 7 },
      { id: 'ng-5', label: 'CAA', type: 'law', size: 3, connections: 4 },
      { id: 'ng-6', label: 'PISA 2025', type: 'report', size: 3, connections: 3 },
      { id: 'ng-7', label: 'Lok Sabha', type: 'organization', size: 3, connections: 5 },
      { id: 'ng-8', label: 'Nipah Virus', type: 'event', size: 3, connections: 2 },
    ],
    edges: [
      { source: 'ng-1', target: 'ng-2', label: 'related', weight: 3 },
      { source: 'ng-1', target: 'ng-4', label: 'funded_by', weight: 2 },
      { source: 'ng-2', target: 'ng-7', label: 'passed_by', weight: 4 },
      { source: 'ng-2', target: 'ng-3', label: 'challenged_in', weight: 3 },
      { source: 'ng-3', target: 'ng-5', label: 'stayed', weight: 5 },
      { source: 'ng-4', target: 'ng-1', label: 'regulates', weight: 2 },
      { source: 'ng-6', target: 'ng-7', label: 'tabled_in', weight: 2 },
    ],
  },

  analytics: [
    { label: 'Total Stories Published', value: '486', change: 12, direction: 'up', period: 'vs last month' },
    { label: 'Avg Evidence Score', value: '91.3', change: 2.1, direction: 'up', period: 'vs last month' },
    { label: 'Avg Read Time', value: '9.2 min', change: 0.8, direction: 'up', period: 'vs last month' },
    { label: 'Stories Updated (Monitor)', value: '34', change: 18, direction: 'up', period: 'this quarter' },
    { label: 'Channel Distribution', value: '10/10', change: 0, direction: 'up', period: 'all active' },
    { label: 'Total Monitored Sources', value: '13', change: 0, direction: 'up', period: 'all active' },
    { label: 'Alerts This Week', value: '28', change: -5, direction: 'down', period: 'vs last week' },
    { label: 'Avg Publish Time (fast)', value: '47 min', change: -12, direction: 'down', period: 'vs last month' },
  ],
};
