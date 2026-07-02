// ─── Internal CMS - Types & Mock Data ──────────────────────────────────────
// The Breakdown — Block-based Content Management System

export type BlockType =
  | 'hero'
  | 'text'
  | 'timeline'
  | 'evidence'
  | 'chart'
  | 'faq'
  | 'sources'
  | 'image'
  | 'quote'
  | 'statistics'
  | 'callout'
  | 'table';

export const BLOCK_META: Record<BlockType, {
  label: string;
  icon: string;
  description: string;
  defaultData: Record<string, any>;
}> = {
  hero: {
    label: 'Hero',
    icon: '⭐',
    description: 'Headline, summary, hero image, category, author',
    defaultData: { headline: '', summary: '', heroImage: '', category: '', author: '', publishedAt: '' },
  },
  text: {
    label: 'Text',
    icon: '📝',
    description: 'Rich text paragraph',
    defaultData: { html: '<p>Start writing...</p>' },
  },
  timeline: {
    label: 'Timeline',
    icon: '📅',
    description: 'Chronological list of events',
    defaultData: { events: [{ date: '', title: '', description: '' }] },
  },
  evidence: {
    label: 'Evidence',
    icon: '🔬',
    description: 'Data point with source citation',
    defaultData: { claim: '', data: '', source: '', sourceUrl: '', tier: 1 },
  },
  chart: {
    label: 'Chart',
    icon: '📊',
    description: 'Data visualization configuration',
    defaultData: { chartType: 'bar', title: '', data: [], caption: '' },
  },
  faq: {
    label: 'FAQ',
    icon: '❓',
    description: 'Question and answer pairs',
    defaultData: { items: [{ question: '', answer: '' }] },
  },
  sources: {
    label: 'Sources',
    icon: '📚',
    description: 'Citation list',
    defaultData: { sources: [{ title: '', url: '', accessedAt: '', tier: 1 }] },
  },
  image: {
    label: 'Image',
    icon: '🖼️',
    description: 'Image with caption and alt text',
    defaultData: { src: '', alt: '', caption: '', credit: '' },
  },
  quote: {
    label: 'Quote',
    icon: '💬',
    description: 'Pull quote with attribution',
    defaultData: { text: '', speaker: '', context: '' },
  },
  statistics: {
    label: 'Statistics',
    icon: '🔢',
    description: 'Key numbers display',
    defaultData: { stats: [{ value: '', label: '', change: '', direction: 'up' }] },
  },
  callout: {
    label: 'Callout',
    icon: '💡',
    description: 'Highlighted information box',
    defaultData: { type: 'info', title: '', body: '' },
  },
  table: {
    label: 'Table',
    icon: '📋',
    description: 'Data table with rows and columns',
    defaultData: { headers: [''], rows: [['']], caption: '' },
  },
};

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, any>;
  collapsed: boolean;
}

export type StoryStatus = 'draft' | 'review' | 'published';

export interface CMSStory {
  id: string;
  title: string;
  slug: string;
  status: StoryStatus;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  notes?: string;
}

// ─── Mock Stories ──────────────────────────────────────────────────────────

let blockCounter = 0;
function bid(): string {
  return `blk-${++blockCounter}`;
}

export function createNewStory(): CMSStory {
  blockCounter = 0;
  return {
    id: `story-new-${Date.now()}`,
    title: 'Untitled Story',
    slug: 'untitled-story',
    status: 'draft',
    blocks: [
      { id: bid(), type: 'hero', data: { ...BLOCK_META.hero.defaultData }, collapsed: false },
      { id: bid(), type: 'text', data: { html: '<p>Start writing your story here...</p>' }, collapsed: false },
      { id: bid(), type: 'sources', data: { ...BLOCK_META.sources.defaultData }, collapsed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const mockCMSStories: CMSStory[] = [
  {
    id: 'story-001',
    title: 'Semiconductor PLI Expansion: What It Means for India\'s Tech Ambitions',
    slug: 'semiconductor-pli-expansion',
    status: 'published',
    blocks: [
      {
        id: bid(),
        type: 'hero',
        data: {
          headline: 'Semiconductor PLI Expansion: What It Means for India\'s Tech Ambitions',
          summary: 'The Cabinet has approved a ₹1.2 lakh crore expansion of the Production Linked Incentive scheme for semiconductor manufacturing. Here\'s what changes and why it matters.',
          heroImage: '/images/stories/semiconductor-pli.jpg',
          category: 'economy',
          author: 'Priya Sharma',
          publishedAt: '2026-07-02T09:30:00Z',
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'text',
        data: {
          html: '<p>The Cabinet Committee on Economic Affairs (CCEA) on Thursday approved a ₹1.2 lakh crore expansion of the Production Linked Incentive (PLI) scheme for semiconductor manufacturing, marking one of the largest single-sector incentives in India\'s industrial policy history.</p><p>The expanded scheme covers chip design, fabrication, assembly, testing, and packaging — creating an end-to-end semiconductor ecosystem for the first time.</p>',
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'timeline',
        data: {
          events: [
            { date: 'Dec 2021', title: 'PLI for Semiconductor Announced', description: 'Union Cabinet approved ₹76,000 crore PLI for semiconductor and display manufacturing.' },
            { date: 'Sep 2022', title: 'First Applications Received', description: 'Government received 5 applications for chip fabrication units under the scheme.' },
            { date: 'Jun 2024', title: 'Vedanta-Foxconn JV Collapses', description: 'The Vedanta-Foxconn joint venture for a Gujarat fab was dissolved.' },
            { date: 'Mar 2025', title: 'Revised Scheme Drafted', description: 'MeitY drafted an expanded version after industry feedback on the original scheme.' },
            { date: 'Jul 2026', title: '₹1.2 Lakh Crore Expansion Approved', description: 'CCEA approved the expanded PLI scheme covering the full semiconductor value chain.' },
          ],
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'evidence',
        data: {
          claim: 'India\'s semiconductor market is projected to reach $100 billion by 2030.',
          data: 'Current market size: $38 billion (2025). Projected: $100 billion (2030). CAGR: 21.4%.',
          source: 'India Semiconductor Market Report 2026',
          sourceUrl: 'https://example.com/semiconductor-report',
          tier: 2,
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'chart',
        data: {
          chartType: 'bar',
          title: 'Global Semiconductor Manufacturing Capacity by Country (2026)',
          data: [
            { label: 'Taiwan', value: 48 },
            { label: 'South Korea', value: 22 },
            { label: 'Japan', value: 12 },
            { label: 'China', value: 8 },
            { label: 'USA', value: 6 },
            { label: 'India', value: 1 },
            { label: 'Others', value: 3 },
          ],
          caption: 'Source: Semiconductor Industry Association',
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'faq',
        data: {
          items: [
            { question: 'What is the total outlay of the expanded PLI scheme?', answer: 'The expanded scheme has an outlay of ₹1.2 lakh crore over 6 years, up from the original ₹76,000 crore.' },
            { question: 'Which companies are expected to benefit?', answer: 'The scheme is open to both domestic and international semiconductor companies. Key players include Tata Electronics, US-based chipmakers, and several fabless design startups.' },
            { question: 'How many jobs will this create?', answer: 'The government estimates the scheme will create 85,000 direct jobs and 2.5 lakh indirect jobs in the semiconductor ecosystem.' },
          ],
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'sources',
        data: {
          sources: [
            { title: 'PIB Release: Cabinet Approves Semiconductor PLI Expansion', url: 'https://pib.gov.in/ReleaseDetail.aspx?relid=12345', accessedAt: '2026-07-02', tier: 1 },
            { title: 'MeitY Semiconductor Policy Document', url: 'https://meity.gov.in/semiconductor-policy', accessedAt: '2026-07-01', tier: 1 },
            { title: 'SIA Global Semiconductor Report 2026', url: 'https://semiconductors.org/report-2026', accessedAt: '2026-06-30', tier: 2 },
          ],
        },
        collapsed: false,
      },
    ],
    createdAt: '2026-07-02T06:00:00Z',
    updatedAt: '2026-07-02T09:30:00Z',
    updatedBy: 'Priya Sharma',
  },
  {
    id: 'story-002',
    title: 'DPDP Amendment Bill: What Changes After Lok Sabha Passage',
    slug: 'dpdp-amendment-bill-loksabha',
    status: 'published',
    blocks: [
      {
        id: bid(),
        type: 'hero',
        data: {
          headline: 'DPDP Amendment Bill: What Changes After Lok Sabha Passage',
          summary: 'The Digital Personal Data Protection (Amendment) Bill, 2026 was passed in Lok Sabha with 3 key amendments. Here\'s a complete breakdown.',
          heroImage: '/images/stories/dpdp-bill.jpg',
          category: 'policy',
          author: 'Vikram Joshi',
          publishedAt: '2026-07-02T08:15:00Z',
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'quote',
        data: {
          text: 'This bill balances the need for data protection with the requirements of innovation and economic growth.',
          speaker: 'Minister of Electronics and IT',
          context: 'In response to debate on the DPDP Amendment Bill in Lok Sabha',
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'text',
        data: {
          html: '<p>The Digital Personal Data Protection (Amendment) Bill, 2026 was passed in the Lok Sabha on Wednesday with three key amendments. The bill now moves to the Rajya Sabha for consideration.</p><p>The amendments address concerns raised by the Joint Parliamentary Committee and civil society organizations regarding data localization, consent frameworks, and penalties for non-compliance.</p>',
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'evidence',
        data: {
          claim: 'Over 80% of Indian companies will need to revise their data handling practices.',
          data: 'Estimated compliance cost impact: ₹5-15 crore per large enterprise. Timeline: 12 months from enactment.',
          source: 'Industry Association Impact Assessment',
          sourceUrl: '',
          tier: 3,
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'sources',
        data: {
          sources: [
            { title: 'Lok Sabha Debate Transcript, July 1 2026', url: 'https://sansad.in/ls/debate', accessedAt: '2026-07-02', tier: 1 },
            { title: 'DPDP Bill 2026 - Full Text', url: 'https://egazette.gov.in/dpdp-2026', accessedAt: '2026-07-01', tier: 1 },
          ],
        },
        collapsed: false,
      },
    ],
    createdAt: '2026-07-01T14:00:00Z',
    updatedAt: '2026-07-02T08:15:00Z',
    updatedBy: 'Vikram Joshi',
  },
  {
    id: 'story-003',
    title: 'Explained: How RBI\'s Repo Rate Decision Affects Your Loan EMIs',
    slug: 'rbi-repo-rate-loan-emi-impact',
    status: 'draft',
    blocks: [
      {
        id: bid(),
        type: 'hero',
        data: {
          headline: 'Explained: How RBI\'s Repo Rate Decision Affects Your Loan EMIs',
          summary: 'RBI held the repo rate at 6.50% with a 5:1 MPC vote. What this means for borrowers, savers, and the economy.',
          heroImage: '',
          category: 'economy',
          author: 'Ananya Mehta',
          publishedAt: '',
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'text',
        data: {
          html: '<p>The Reserve Bank of India\'s Monetary Policy Committee (MPC) voted 5:1 to keep the repo rate unchanged at 6.50% for the 8th consecutive meeting. The decision was widely expected by markets...</p>',
        },
        collapsed: true,
      },
      {
        id: bid(),
        type: 'statistics',
        data: {
          stats: [
            { value: '6.50%', label: 'Repo Rate', change: 'unchanged', direction: 'up' as const },
            { value: '5:1', label: 'MPC Vote', change: '', direction: 'up' as const },
            { value: '4.8%', label: 'CPI Inflation', change: '-0.2pp', direction: 'down' as const },
            { value: '6.5%', label: 'GDP Growth Forecast', change: '+0.1pp', direction: 'up' as const },
          ],
        },
        collapsed: false,
      },
    ],
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-01T16:00:00Z',
    updatedBy: 'Ananya Mehta',
    notes: 'Need to add impact analysis section',
  },
  {
    id: 'story-004',
    title: 'Supreme Court to Review Aadhaar Constitutional Validity',
    slug: 'supreme-court-aadhaar-review',
    status: 'review',
    blocks: [
      {
        id: bid(),
        type: 'hero',
        data: {
          headline: 'Supreme Court to Review Aadhaar Constitutional Validity',
          summary: 'The Supreme Court has agreed to review the constitutional validity of Aadhaar, sending the case to a 5-judge constitution bench.',
          heroImage: '/images/stories/aadhaar-sc.jpg',
          category: 'policy',
          author: 'Ravi Desai',
          publishedAt: '',
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'timeline',
        data: {
          events: [
            { date: 'Sep 2018', title: 'Supreme Court Upholds Aadhaar', description: '5-judge bench upheld Aadhaar\'s constitutional validity (4:1 majority).' },
            { date: 'Aug 2023', title: 'Review Petition Filed', description: 'Civil liberties organizations filed review petitions citing new privacy concerns.' },
            { date: 'Jun 2026', title: 'Supreme Court Admits Review', description: 'SC agreed to hear review petitions, referring to 5-judge constitution bench.' },
            { date: 'Jul 2026', title: 'Hearing Scheduled', description: 'Constitution bench hearing set for August 2026.' },
          ],
        },
        collapsed: false,
      },
      {
        id: bid(),
        type: 'callout',
        data: {
          type: 'warning',
          title: 'What\'s at Stake',
          body: 'If the court overturns its 2018 judgment, over 1.3 billion Aadhaar enrollments and thousands of government services linked to Aadhaar could be affected. The judgment could redefine the scope of privacy rights under Article 21.',
        },
        collapsed: false,
      },
    ],
    createdAt: '2026-07-02T04:00:00Z',
    updatedAt: '2026-07-02T10:00:00Z',
    updatedBy: 'Ravi Desai',
    notes: 'Waiting for additional background from legal team',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getBlockIcon(type: BlockType): string {
  return BLOCK_META[type]?.icon || '📄';
}

export function getBlockLabel(type: BlockType): string {
  return BLOCK_META[type]?.label || type;
}

export function reorderBlocks(blocks: Block[], fromIndex: number, toIndex: number): Block[] {
  const result = [...blocks];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export function updateBlock(blocks: Block[], blockId: string, updates: Partial<Block>): Block[] {
  return blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
}

export function removeBlock(blocks: Block[], blockId: string): Block[] {
  return blocks.filter((b) => b.id !== blockId);
}

export function addBlock(blocks: Block[], type: BlockType, afterId?: string): Block[] {
  const newBlock: Block = {
    id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    data: { ...BLOCK_META[type].defaultData },
    collapsed: false,
  };
  if (afterId) {
    const idx = blocks.findIndex((b) => b.id === afterId);
    const result = [...blocks];
    result.splice(idx + 1, 0, newBlock);
    return result;
  }
  return [...blocks, newBlock];
}

export function duplicateBlock(blocks: Block[], blockId: string): Block[] {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return blocks;
  const newBlock: Block = {
    ...JSON.parse(JSON.stringify(block)),
    id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  const idx = blocks.findIndex((b) => b.id === blockId);
  const result = [...blocks];
  result.splice(idx + 1, 0, newBlock);
  return result;
}
