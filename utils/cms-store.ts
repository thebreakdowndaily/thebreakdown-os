// ─── CMS Store (legacy seed data, used only by scripts/seed-d1.ts) ────────

import { mockCMSStories, type CMSStory, type StoryStatus } from './cms-data';
import type {
  CMSEntity, CMSTopic, CMSTimeline, CMSFix, CMSMediaItem,
  CMSUser, ActivityEntry, StoryRevision, EntityType,
} from './cms-types';

// ─── Store ──────────────────────────────────────────────────────────────────

let counter = 0;
function uid(prefix = 'id'): string {
  return `${prefix}-${String(++counter)}-${Date.now().toString(36)}`;
}

// Seed media
const seedMedia: CMSMediaItem[] = [
  { id: uid('media'), type: 'image', src: '/images/stories/mgnrega-20.jpg', alt: 'MGNREGA field work', caption: 'Rural workers under MGNREGA scheme in Rajasthan', tags: ['mgnrega', 'rural', 'employment'], credit: 'Photo by R. Kumar', width: 1200, height: 800, fileSize: 245000, version: 1, createdAt: '2026-06-10T08:00:00Z', updatedAt: '2026-06-10T08:00:00Z' },
  { id: uid('media'), type: 'image', src: '/images/stories/digital-payments.jpg', alt: 'UPI payment', caption: 'Digital payment via UPI at a rural shop', tags: ['upi', 'digital', 'payments'], credit: 'Photo by A. Sharma', width: 1200, height: 800, fileSize: 198000, version: 1, createdAt: '2026-06-08T10:00:00Z', updatedAt: '2026-06-08T10:00:00Z' },
  { id: uid('media'), type: 'image', src: '/images/stories/semiconductor-pli.jpg', alt: 'Semiconductor wafer', caption: 'Semiconductor manufacturing wafer processing', tags: ['semiconductor', 'manufacturing', 'technology'], credit: 'Intel Press Kit', width: 1200, height: 675, fileSize: 312000, version: 1, createdAt: '2026-07-01T09:00:00Z', updatedAt: '2026-07-01T09:00:00Z' },
  { id: uid('media'), type: 'image', src: '/images/stories/dpdp-bill.jpg', alt: 'Parliament building', caption: 'Lok Sabha during DPDP bill debate', tags: ['parliament', 'data-protection', 'policy'], credit: 'Sansad TV', width: 1200, height: 800, fileSize: 178000, version: 1, createdAt: '2026-07-01T12:00:00Z', updatedAt: '2026-07-01T12:00:00Z' },
  { id: uid('media'), type: 'chart', src: '/images/charts/semiconductor-capacity.png', alt: 'Semiconductor capacity chart', caption: 'Global semiconductor manufacturing capacity by country 2026', tags: ['chart', 'semiconductor', 'manufacturing'], credit: 'SIA', width: 800, height: 600, fileSize: 45000, version: 1, createdAt: '2026-07-02T07:00:00Z', updatedAt: '2026-07-02T07:00:00Z' },
  { id: uid('media'), type: 'document', src: '/docs/semiconductor-policy.pdf', alt: '', caption: 'MeitY Semiconductor Policy Document 2026', tags: ['policy', 'semiconductor', 'government'], credit: 'MeitY', fileSize: 1200000, version: 1, createdAt: '2026-06-30T14:00:00Z', updatedAt: '2026-06-30T14:00:00Z' },
];

// Seed users
const seedUsers: CMSUser[] = [
  { id: uid('user'), name: 'The Breakdown Editorial', email: 'editorial@thebreakdown.in', role: 'admin', createdAt: '2025-01-01T00:00:00Z' },
];

// Seed topics
const seedTopics: CMSTopic[] = [
  {
    id: uid('topic'), name: 'Agriculture', slug: 'agriculture',
    description: 'Indian agriculture policy, subsidies, reforms, and farmer welfare programs.',
    overview: 'Agriculture employs nearly 45% of India\'s workforce but contributes only 18% to GDP. Key policy challenges include farm income support, input subsidy reform, market access, and climate resilience.',
    image: '/images/topics/agriculture.jpg',
    storyIds: ['story-mgnrega-reform'], relatedEntityIds: ['entity-mgnrega', 'entity-mord'], featuredStoryIds: ['story-mgnrega-reform'],
    countries: ['india'], faq: [
      { question: 'What is the share of agriculture in India\'s GDP?', answer: 'As of 2025-26, agriculture contributes approximately 18% to India\'s GDP while employing about 45% of the workforce.' },
    ], timeline: [
      { date: '2020-09', title: 'Farm Laws Passed', description: 'Three farm reform laws passed by Parliament.' },
      { date: '2021-11', title: 'Farm Laws Repealed', description: 'Government repealed the three farm laws after prolonged protests.' },
    ], statistics: [{ label: 'GDP Share', value: '18%' }, { label: 'Workforce', value: '45%' }],
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: uid('topic'), name: 'Employment', slug: 'employment',
    description: 'Employment trends, job creation schemes, and labor market analysis.',
    image: '/images/topics/employment.jpg',
    storyIds: ['story-mgnrega-reform', 'story-semiconductor-pli'], relatedEntityIds: ['entity-mgnrega', 'entity-mord'], featuredStoryIds: [],
    countries: ['india'], faq: [
      { question: 'What is India\'s current unemployment rate?', answer: 'As of Q1 2026, India\'s urban unemployment rate stands at 6.7%, while rural unemployment is approximately 5.2%.' },
    ], timeline: [], statistics: [{ label: 'Unemployment Rate', value: '6.7%' }, { label: 'Labor Force Participation', value: '49.8%' }],
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-06-10T14:00:00Z',
  },
  {
    id: uid('topic'), name: 'Digital India', slug: 'digital-india',
    description: 'Digital transformation, data protection, and technology policy.',
    storyIds: ['story-dpdp-bill', 'story-digital-payments'], relatedEntityIds: [], featuredStoryIds: [],
    countries: ['india'], faq: [], timeline: [], statistics: [],
    createdAt: '2025-07-01T00:00:00Z', updatedAt: '2026-07-02T08:00:00Z',
  },
  {
    id: uid('topic'), name: 'Economy & Finance', slug: 'economy-finance',
    description: 'Monetary policy, fiscal policy, banking, and financial markets.',
    storyIds: ['story-rbi-repo-rate'], relatedEntityIds: ['entity-rbi'], featuredStoryIds: [],
    countries: ['india'], faq: [], timeline: [], statistics: [],
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-07-01T16:00:00Z',
  },
  {
    id: uid('topic'), name: 'Technology Policy', slug: 'technology-policy',
    description: 'Semiconductor policy, AI regulation, and tech industry governance.',
    storyIds: ['story-semiconductor-pli', 'story-dpdp-bill'], relatedEntityIds: [], featuredStoryIds: ['story-semiconductor-pli'],
    countries: ['india'], faq: [], timeline: [], statistics: [],
    createdAt: '2025-08-01T00:00:00Z', updatedAt: '2026-07-02T09:00:00Z',
  },
];

// Seed entities
const seedEntities: CMSEntity[] = [
  {
    id: uid('entity'), type: 'scheme', name: 'MGNREGA', slug: 'mgnrega',
    description: 'Mahatma Gandhi National Rural Employment Guarantee Act — India\'s flagship rural employment scheme.',
    aliases: ['NREGA', 'Employment Guarantee Scheme'],
    image: '/images/entities/mgnrega.jpg', storyCount: 1, evidenceScore: 92,
    relatedEntityIds: ['entity-mord'], relatedStoryIds: ['story-mgnrega-reform'], relatedTopicIds: ['topic-agriculture', 'topic-employment'],
    statistics: [{ label: 'Budget 2026-27', value: '₹1,12,000 Cr' }, { label: 'Active Workers', value: '15.2 Cr' }],
    timeline: [{ date: '2005-08', title: 'Act Passed', description: 'MGNREGA enacted by Parliament.' }, { date: '2006-02', title: 'Phase 1 Launch', description: 'Launched in 200 most backward districts.' }],
    faq: [{ question: 'What is MGNREGA?', answer: 'MGNREGA guarantees 100 days of wage employment per year to rural households.' }],
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-06-15T09:00:00Z',
  },
  {
    id: uid('entity'), type: 'organization', name: 'Ministry of Rural Development', slug: 'ministry-of-rural-development',
    description: 'Nodal ministry responsible for rural development policies and programs.',
    aliases: ['MoRD', 'Rural Development Ministry'],
    image: '/images/entities/mord.jpg', storyCount: 1, evidenceScore: 88,
    relatedEntityIds: ['entity-mgnrega'], relatedStoryIds: ['story-mgnrega-reform'], relatedTopicIds: ['topic-agriculture', 'topic-employment'],
    statistics: [{ label: 'Budget 2026-27', value: '₹1,86,000 Cr' }, { label: 'Programs', value: '12' }],
    timeline: [], faq: [],
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-06-10T11:00:00Z',
  },
  {
    id: uid('entity'), type: 'organization', name: 'Reserve Bank of India', slug: 'rbi',
    description: 'India\'s central banking institution controlling monetary policy and currency issuance.',
    aliases: ['RBI', 'Central Bank'],
    image: '/images/entities/rbi.jpg', storyCount: 1, evidenceScore: 95,
    relatedEntityIds: [], relatedStoryIds: ['story-rbi-repo-rate'], relatedTopicIds: ['topic-economy-finance'],
    statistics: [{ label: 'Repo Rate', value: '6.50%' }, { label: 'Forex Reserves', value: '$670 B' }],
    timeline: [{ date: '1935-04', title: 'RBI Established', description: 'Reserve Bank of India Act passed in 1934.' }],
    faq: [{ question: 'What does RBI do?', answer: 'RBI regulates monetary policy, banking system, and currency in India.' }],
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-07-01T16:00:00Z',
  },
];

// Seed timelines
const seedTimelines: CMSTimeline[] = [
  {
    id: uid('timeline'), title: 'MGNREGA Evolution', description: 'Timeline of MGNREGA from enactment to current reforms.', category: 'policy',
    storyIds: ['story-mgnrega-reform'], entityIds: ['entity-mgnrega', 'entity-mord'], topicIds: ['topic-agriculture', 'topic-employment'],
    events: [
      { date: '2005-08-23', title: 'MGNREGA Enacted', description: 'Parliament passes the National Rural Employment Guarantee Act.' },
      { date: '2006-02-02', title: 'Phase 1 Launch', description: 'Launched in 200 most backward districts.' },
      { date: '2008-04-01', title: 'National Coverage', description: 'Extended to all rural districts across India.' },
      { date: '2020-04-01', title: 'COVID-19 Expansion', description: 'Budget allocation increased amid pandemic-induced job losses.' },
      { date: '2024-06-01', title: 'Digital Transformation', description: 'Full digitization of job cards, attendance, and wage payments.' },
      { date: '2026-06-15', title: '20-Year Reform', description: 'MGNREGA completes 20 years; major reforms proposed.' },
    ],
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: uid('timeline'), title: 'Semiconductor PLI Milestones', description: 'Key milestones in India\'s semiconductor manufacturing push.', category: 'economy',
    storyIds: ['story-semiconductor-pli'], entityIds: [], topicIds: ['topic-technology-policy'],
    events: [
      { date: '2021-12-15', title: 'PLI for Semiconductors Announced', description: 'Cabinet approves ₹76,000 crore PLI scheme.' },
      { date: '2022-09-01', title: 'Applications Open', description: 'Government receives 5 applications for chip fabrication.' },
      { date: '2024-06-01', title: 'Vedanta-Foxconn JV Collapses', description: 'Joint venture dissolved due to technology transfer issues.' },
      { date: '2025-03-01', title: 'Revised Scheme Drafted', description: 'MeitY expands scope after industry feedback.' },
      { date: '2026-07-02', title: '₹1.2 Lakh Crore Expansion', description: 'CCEA approves expanded PLI covering full semiconductor value chain.' },
    ],
    createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-02T09:30:00Z',
  },
  {
    id: uid('timeline'), title: 'Data Protection Law Journey', description: 'India\'s journey toward comprehensive data protection legislation.', category: 'policy',
    storyIds: ['story-dpdp-bill'], entityIds: [], topicIds: ['topic-digital-india', 'topic-technology-policy'],
    events: [
      { date: '2017-08-24', title: 'Right to Privacy Declared Fundamental Right', description: 'Supreme Court 9-judge bench declares privacy a fundamental right under Article 21.' },
      { date: '2018-07-27', title: 'Srikrishna Committee Report', description: 'BN Srikrishna committee submits draft Data Protection Bill.' },
      { date: '2019-12-11', title: 'PDP Bill Introduced', description: 'Personal Data Protection Bill, 2019 introduced in Lok Sabha.' },
      { date: '2023-08-09', title: 'Digital Personal Data Protection Act Passed', description: 'Parliament passes DPDP Act, 2023.' },
      { date: '2026-07-01', title: 'DPDP Amendment Bill Passed in Lok Sabha', description: 'Amendment bill passed with 3 key changes.' },
    ],
    createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-02T08:15:00Z',
  },
];

// Seed fixes
const seedFixes: CMSFix[] = [
  {
    id: uid('fix'), title: 'Fixing PDS Leakage Through Digitization', slug: 'fix-ration-digitization',
    problem: 'India\'s Public Distribution System (PDS) loses an estimated 40% of subsidized food grains to leakages — diversion to open market, ghost beneficiaries, and fake ration cards.',
    rootCauses: ['Manual record-keeping vulnerable to manipulation', 'Lack of biometric authentication at Fair Price Shops', 'No real-time inventory tracking from warehouse to shop', 'Political patronage in ration shop dealerships'],
    existingSolutions: [{ title: 'ePoS System', description: 'Electronic Point of Sale devices installed at ration shops for biometric authentication.' }],
    globalExamples: [{ country: 'Brazil', approach: 'Bolsa Familia conditional cash transfer with biometric ID', outcome: 'Reduced leakage to under 5%' }],
    recommendedActions: [{ action: 'Mandate Aadhaar-based biometric authentication at all FPS', responsible: 'Department of Food & Public Distribution', timeline: '6 months' }],
    citizenActions: ['Check your ration entitlement online via the Anna Bhagya portal', 'Report FPS irregularities to the toll-free helpline 1967'],
    governmentActions: ['Integrate PDS portal with Aadhaar for deduplication', 'Install GPS-enabled ePoS devices at all FPS'],
    metrics: [{ metric: 'PDS Leakage Rate', currentValue: '40%', targetValue: '10%', source: 'NIPFP Study 2025' }],
    status: 'published', createdAt: '2026-05-25T08:00:00Z', updatedAt: '2026-05-25T08:00:00Z',
  },
];

// Map CMSStory IDs to our internal IDs
const cmsStoryIdMap: Record<string, string> = {
  'story-001': 'story-semiconductor-pli',
  'story-002': 'story-dpdp-bill',
  'story-003': 'story-rbi-repo-rate',
  'story-004': 'story-aadhaar-sc-review',
};

// ─── Store Class ────────────────────────────────────────────────────────────

class CMSStore {
  stories: Map<string, CMSStory>;
  topics: Map<string, CMSTopic>;
  entities: Map<string, CMSEntity>;
  timelines: Map<string, CMSTimeline>;
  fixes: Map<string, CMSFix>;
  media: Map<string, CMSMediaItem>;
  users: Map<string, CMSUser>;
  activity: ActivityEntry[];
  revisions: Map<string, StoryRevision[]>;

  constructor() {
    this.stories = new Map(mockCMSStories.map((s: CMSStory) => [cmsStoryIdMap[s.id] || s.id, { ...s, id: cmsStoryIdMap[s.id] || s.id }]));
    this.topics = new Map(seedTopics.map((t) => [t.id, t]));
    this.entities = new Map(seedEntities.map((e) => [e.id, e]));
    this.timelines = new Map(seedTimelines.map((t) => [t.id, t]));
    this.fixes = new Map(seedFixes.map((f) => [f.id, f]));
    this.media = new Map(seedMedia.map((m) => [m.id, m]));
    this.users = new Map(seedUsers.map((u) => [u.id, u]));
    this.activity = [];
    this.revisions = new Map();
    this._seedActivity();
  }

  private _seedActivity() {
    const now = Date.now();
    this.activity.push(
      { id: uid('act'), type: 'story_published', label: 'Published: Semiconductor PLI Expansion', timestamp: new Date(now - 60000).toISOString(), userId: 'user-1', link: '/cms/story/story-semiconductor-pli' },
      { id: uid('act'), type: 'story_updated', label: 'Updated: DPDP Amendment Bill', timestamp: new Date(now - 180000).toISOString(), userId: 'user-1', link: '/cms/story/story-dpdp-bill' },
      { id: uid('act'), type: 'topic_created', label: 'Created topic: Technology Policy', timestamp: new Date(now - 360000).toISOString(), userId: 'user-1' },
      { id: uid('act'), type: 'timeline_created', label: 'Created timeline: Data Protection Law Journey', timestamp: new Date(now - 720000).toISOString(), userId: 'user-1' },
      { id: uid('act'), type: 'story_updated', label: 'Updated: RBI Repo Rate Explained', timestamp: new Date(now - 1440000).toISOString(), userId: 'user-1', link: '/cms/story/story-rbi-repo-rate' },
      { id: uid('act'), type: 'entity_updated', label: 'Updated: MGNREGA entity page', timestamp: new Date(now - 2880000).toISOString(), userId: 'user-1' },
      { id: uid('act'), type: 'media_uploaded', label: 'Uploaded: Semiconductor capacity chart', timestamp: new Date(now - 3600000).toISOString(), userId: 'user-1' },
    );
  }

  // ─── Stories ──────────────────────────────────
  getStories(): CMSStory[] { return Array.from(this.stories.values()); }
  getStory(id: string): CMSStory | undefined { return this.stories.get(id); }
  saveStory(story: CMSStory): void {
    const existing = this.stories.get(story.id);
    if (existing) {
      // Save revision
      this.addRevision(story.id, existing);
    }
    this.stories.set(story.id, { ...story, updatedAt: new Date().toISOString() });
    this.addActivity({ type: existing ? 'story_updated' : 'story_created', label: `${existing ? 'Updated' : 'Created'}: ${story.title}`, link: `/cms/story/${story.id}` });
  }
  deleteStory(id: string): void {
    this.stories.delete(id);
    this.addActivity({ type: 'story_updated', label: `Deleted story: ${id}` });
  }

  // ─── Topics ───────────────────────────────────
  getTopics(): CMSTopic[] { return Array.from(this.topics.values()); }
  getTopic(id: string): CMSTopic | undefined { return this.topics.get(id); }
  saveTopic(topic: CMSTopic): void {
    const existing = this.topics.get(topic.id);
    this.topics.set(topic.id, { ...topic, updatedAt: new Date().toISOString() });
    this.addActivity({ type: existing ? 'topic_updated' : 'topic_created', label: `${existing ? 'Updated' : 'Created'} topic: ${topic.name}` });
  }
  deleteTopic(id: string): void { this.topics.delete(id); }

  // ─── Entities ─────────────────────────────────
  getEntities(): CMSEntity[] { return Array.from(this.entities.values()); }
  getEntity(id: string): CMSEntity | undefined { return this.entities.get(id); }
  saveEntity(entity: CMSEntity): void {
    const existing = this.entities.get(entity.id);
    this.entities.set(entity.id, { ...entity, updatedAt: new Date().toISOString() });
    this.addActivity({ type: existing ? 'entity_updated' : 'entity_created', label: `${existing ? 'Updated' : 'Created'} entity: ${entity.name}` });
  }
  deleteEntity(id: string): void { this.entities.delete(id); }

  // ─── Timelines ────────────────────────────────
  getTimelines(): CMSTimeline[] { return Array.from(this.timelines.values()); }
  getTimeline(id: string): CMSTimeline | undefined { return this.timelines.get(id); }
  saveTimeline(tl: CMSTimeline): void {
    const existing = this.timelines.get(tl.id);
    this.timelines.set(tl.id, { ...tl, updatedAt: new Date().toISOString() });
    this.addActivity({ type: existing ? 'timeline_updated' : 'timeline_created', label: `${existing ? 'Updated' : 'Created'} timeline: ${tl.title}` });
  }
  deleteTimeline(id: string): void { this.timelines.delete(id); }

  // ─── Fixes ────────────────────────────────────
  getFixes(): CMSFix[] { return Array.from(this.fixes.values()); }
  getFix(id: string): CMSFix | undefined { return this.fixes.get(id); }
  saveFix(fix: CMSFix): void {
    const existing = this.fixes.get(fix.id);
    this.fixes.set(fix.id, { ...fix, updatedAt: new Date().toISOString() });
    this.addActivity({ type: existing ? 'fix_updated' : 'fix_created', label: `${existing ? 'Updated' : 'Created'} fix: ${fix.title}` });
  }
  deleteFix(id: string): void { this.fixes.delete(id); }

  // ─── Media ────────────────────────────────────
  getMedia(): CMSMediaItem[] { return Array.from(this.media.values()); }
  getMediaItem(id: string): CMSMediaItem | undefined { return this.media.get(id); }
  saveMediaItem(item: CMSMediaItem): void {
    const existing = this.media.get(item.id);
    const updated = { ...item, updatedAt: new Date().toISOString(), version: existing ? existing.version + 1 : 1 };
    this.media.set(item.id, updated);
    this.addActivity({ type: 'media_uploaded', label: `${existing ? 'Updated' : 'Uploaded'}: ${item.alt || item.caption}` });
  }
  deleteMedia(id: string): void { this.media.delete(id); }

  // ─── Users ────────────────────────────────────
  getUsers(): CMSUser[] { return Array.from(this.users.values()); }

  // ─── Activity ─────────────────────────────────
  getActivity(limit = 20): ActivityEntry[] {
    return this.activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  }
  addActivity(entry: { type: ActivityEntry['type']; label: string; link?: string }): void {
    this.activity.unshift({ id: uid('act'), ...entry, timestamp: new Date().toISOString() });
    if (this.activity.length > 200) this.activity.pop();
  }

  // ─── Revisions ────────────────────────────────
  getRevisions(storyId: string): StoryRevision[] {
    return this.revisions.get(storyId) || [];
  }
  addRevision(storyId: string, story: CMSStory): void {
    const existing = this.revisions.get(storyId) || [];
    const version = existing.length + 1;
    existing.push({
      id: uid('rev'),
      storyId,
      version,
      snapshot: JSON.stringify(story),
      createdAt: new Date().toISOString(),
      message: `Version ${version}`,
    });
    this.revisions.set(storyId, existing);
  }
  restoreRevision(storyId: string, revisionId: string): CMSStory | undefined {
    const existing = this.getRevisions(storyId);
    const rev = existing.find((r) => r.id === revisionId);
    if (!rev) return;
    const snapshot = JSON.parse(rev.snapshot) as CMSStory;
    this.stories.set(storyId, { ...snapshot, updatedAt: new Date().toISOString() });
    return snapshot;
  }

  // ─── Dashboard Stats ──────────────────────────
  getDashboardStats() {
    const allStories = this.getStories();
    return {
      totalStories: allStories.length,
      drafts: allStories.filter((s) => s.status === 'draft').length,
      scheduled: 0,
      review: allStories.filter((s) => s.status === 'review').length,
      published: allStories.filter((s) => s.status === 'published').length,
      totalTopics: this.topics.size,
      totalEntities: this.entities.size,
      totalTimelines: this.timelines.size,
      totalFixes: this.fixes.size,
      totalMedia: this.media.size,
    };
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const cmsStore = new CMSStore();

// ─── Workflow Status Transitions ────────────────────────────────────────────

export const WORKFLOW_TRANSITIONS: Record<StoryStatus, StoryStatus[]> = {
  draft: ['review'],
  review: ['draft', 'published'],
  published: ['draft'],
};

export function canTransition(from: StoryStatus, to: StoryStatus): boolean {
  return WORKFLOW_TRANSITIONS[from]?.includes(to) ?? false;
}
