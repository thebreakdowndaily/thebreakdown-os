import type { Fix } from '../../types/canonical';
import type { Story, Entity } from '../../types/canonical';

export const FIX_MGNREGA_REFORM: Fix = {
  id: 'fix-mgnrega-reform',
  slug: 'fix-mgnrega-reform',
  headline: 'Fixing MGNREGA: 5 Reforms to Make Rural Employment Work',
  summary: 'Two decades of data reveal clear pathways to fix India\'s flagship rural employment scheme — from wage indexation to digital fund tracking.',
  storySlug: 'mgnrega-reform',
  publishedAt: '2026-06-16T10:00:00Z',
  updatedAt: '2026-06-16T10:00:00Z',
  readingTime: 14,
  author: { name: 'The Breakdown Editorial', role: 'Editorial Bureau' },
  evidenceScore: 91,
  tags: ['MGNREGA', 'rural employment', 'policy reform', 'wages', 'governance'],
  title: 'Fixing MGNREGA: 5 Reforms to Make Rural Employment Work',
  primaryCategory: 'statutory',
  secondaryCategories: ['administrative', 'technological'],
  maturityStatus: 'expert_reviewed',
  publicationStatus: 'published',
  evidenceGrade: 'High',
  problemStatement: 'MGNREGA wage rates have not kept pace with inflation, with 12 of 28 states paying below market rates and revision delays of 6-18 months.',
  responsibleActorIds: ['Ministry of Rural Development', 'Ministry of Finance'],
  beneficiaryGroups: ['Rural workers', 'Women', 'SC/ST households'],
  disadvantagedGroups: ['State finance departments'],
  fiscalCost: { amount: '4,200', currency: 'INR', timeframe: 'Annual', fundingMechanism: 'Central budget allocation', category: 'CapEx' },
  timeToImpact: 'short-term',
  lastVerified: '2026-07-10T00:00:00Z',
  version: '1.0.0',
  reversibility: 'partially_reversible',
  scalability: 'national',
  globalPrecedents: [
    { country: 'Brazil', policy: 'Bolsa Família', description: 'Unified registry across 40+ programmes.', outcome: 'Reduced poverty by 15% in 5 years.', source: 'World Bank', applicableToIndia: true },
    { country: 'Ethiopia', policy: 'PSNP', description: 'Public works with dedicated maintenance budget.', outcome: '78% asset retention after 5 years.', source: 'IFPRI', applicableToIndia: true },
  ],
  tradeOffs: [
    { dimension: 'Fiscal', advantage: 'Reduced leakage via DBT', disadvantage: 'Higher upfront technology cost', affectedParties: ['Finance Ministry', 'Workers'] },
    { dimension: 'Administrative', advantage: 'Faster wage payments', disadvantage: 'State-level capacity requirements', affectedParties: ['State governments'] },
  ],
  risksAndFailures: [
    { risk: 'State non-compliance with digital mandate', impact: 'high', mitigation: 'Incentive structure tied to fund releases' },
    { risk: 'Technology infrastructure gaps in rural areas', impact: 'medium', mitigation: 'Offline-first mobile app design' },
  ],
  successMetrics: [
    { name: 'Average wage payment delay', currentValue: '45 days', targetValue: '<15 days', dataSource: 'NREGA MIS', updateFrequency: 'Monthly' },
    { name: 'Asset maintenance rate', currentValue: '42%', targetValue: '>70%', dataSource: 'CAG/Social Audits', updateFrequency: 'Annual' },
    { name: 'Real wage growth', currentValue: '-8% (since 2018)', targetValue: '>0%', dataSource: 'CPI-AL vs Wage', updateFrequency: 'Quarterly' },
  ],
  sourceIds: [],
  relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment of rural employment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' } as unknown as Story],
  relatedEntities: [
    { id: 'mgnrega', slug: 'mgnrega', name: 'MGNREGA', type: 'policy', description: 'Rural employment guarantee scheme.' } as unknown as Entity,
    { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' } as unknown as Entity,
  ],
  problem: { title: 'MGNREGA wage rates have not kept pace with inflation', content: 'Despite 20 years of operation, MGNREGA wage rates are indexed to CPI-AL but revisions are delayed by 6-18 months.' },
  whoIsAffected: { title: '14.2 crore active workers', content: 'MGNREGA provides employment to 14.2 crore households, with women constituting 55.3% of all person-days.' },
  rootCauses: { title: 'Delayed wage indexation, fund flow inefficiencies', content: 'Three structural issues: delayed indexation, fund flow delays, and asset durability gaps.' },
  evidence: { title: 'CAG reports and academic studies confirm systemic delays', content: 'CAG Report 2024 found 68% of audited districts had delayed wage payments exceeding 15 days.' },
  stakeholders: [
    { name: 'Ministry of Rural Development', type: 'government', role: 'Scheme implementation', interest: 'Improving scheme efficiency', stance: 'supports' },
    { name: 'MGNREGA Workers', type: 'citizen', role: 'Beneficiaries', interest: 'Timely wages', stance: 'supports' },
  ],
  existingSolutions: [
    { name: 'Direct Benefit Transfer', description: 'Wage payments directly to bank accounts.', status: 'active', effectiveness: 'medium' },
  ],
  globalExamples: [
    { country: 'Brazil', policy: 'Bolsa Família', description: 'Unified registry.', outcome: 'Reduced poverty by 15%.', applicableToIndia: true },
  ],
  recommendedActions: [
    { title: 'Automatic wage indexation', description: 'Link wages to CPI-AL with quarterly revision.', priority: 'critical', timeframe: 'immediate', actors: ['MoRD'] },
  ],
  citizenActions: [
    { title: 'Demand social audits', description: 'Workers can demand audits every 6 months.', priority: 'high', timeframe: 'immediate', actors: ['Workers'] },
  ],
  governmentActions: [
    { title: 'Pass MGNREGA Amendment Bill', description: 'Amend Act for automatic indexation.', priority: 'critical', timeframe: 'short-term', actors: ['Parliament'] },
  ],
  metricsToTrack: [
    { name: 'Average wage payment delay', currentValue: '45 days', targetValue: '<15 days', dataSource: 'NREGA MIS', updateFrequency: 'Monthly' },
  ],
};
