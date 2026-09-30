/**
 * Next Best Understanding Engine (Phase 6 Empirical Validation Edition)
 *
 * Implements deterministic cognitive scaffolding:
 * Moves the reader from passive article consumption to purposeful comprehension
 * across five relational vectors:
 * 1. Prerequisite Foundation ("Read This First")
 * 2. Institutional Actor ("Who Controls The Levers")
 * 3. Upstream Cause ("How We Got Here")
 * 4. Structural Fix ("Evidence-Backed Policy Alternatives")
 * 5. Downstream Consequence ("What Follows / Causal Ripple")
 *
 * Phase 6 Enhancements:
 * - Editorial Override System (pin steps, suppress false connections, custom rationales)
 * - Prerequisite Suppression Heuristic (avoids friction on self-contained stories)
 * - Competing Learning Paths (legal_statutory, institutional, empirical_evidence, structural_reform)
 * - Explanatory Reasoning Engine (answers "Why did I recommend this?")
 * - False Connection Safeguards (blocks broad country/generic-tag false edges)
 */

import { getStore } from '@/utils/data-layer/store';
import { getEntityById } from '@/utils/data-layer/entity-index';
import { CANONICAL_FIXTURES } from '@/fixtures/fixes';
import { getFixesForStory } from '@/lib/fix-helpers';

export type CognitiveRelationshipType =
  | 'prerequisite'
  | 'institutional_actor'
  | 'upstream_cause'
  | 'structural_fix'
  | 'downstream_consequence';

export type LearningPathCategory =
  | 'legal_statutory'
  | 'institutional'
  | 'empirical_evidence'
  | 'structural_reform';

export interface CognitiveStep {
  type: CognitiveRelationshipType;
  learningPath?: LearningPathCategory;
  badgeLabel: string;
  title: string;
  subtitle?: string;
  summary: string;
  url: string;
  entityOrCategory?: string;
  estimatedMinutes?: number;
  explanationReason?: string;
}

export interface NextBestUnderstandingPlan {
  storySlug: string;
  storyTitle: string;
  rationale: string;
  suppressPrerequisite?: boolean;
  steps: CognitiveStep[];
}

export interface EditorialOverrideRule {
  pinnedUrls?: string[];
  suppressedUrls?: string[];
  suppressPrerequisite?: boolean;
  customRationale?: string;
}

/** In-memory registry of editorial overrides for human-in-the-loop control */
const EDITORIAL_OVERRIDES: Map<string, EditorialOverrideRule> = new Map();

export function setEditorialOverride(storySlug: string, rule: EditorialOverrideRule): void {
  EDITORIAL_OVERRIDES.set(storySlug, rule);
}

export function getEditorialOverride(storySlug: string): EditorialOverrideRule | undefined {
  return EDITORIAL_OVERRIDES.get(storySlug);
}

export function clearEditorialOverrides(): void {
  EDITORIAL_OVERRIDES.clear();
}

/**
 * Explains the cognitive rationale for a recommendation in human-readable language.
 * Answers: "Why does the reader need this next?"
 */
export function explainRecommendation(step: CognitiveStep): string {
  if (step.explanationReason) return step.explanationReason;

  switch (step.type) {
    case 'prerequisite':
      return `Foundational context: Reading this before the investigation clarifies the legal baseline and prevents terminology confusion.`;
    case 'institutional_actor':
      return `Institutional leverage: This constitutional body or ministry holds the statutory power to execute, audit, or reform the issue.`;
    case 'structural_fix':
      return `Policy solution: Moves the reader from problem awareness to empirical evaluation of tested systemic alternatives.`;
    case 'downstream_consequence':
      return `Causal continuation: Traces the real-world ripple effect where this policy decision directly impacts citizen welfare.`;
    case 'upstream_cause':
      return `Historical context: Explains how prior statutory choices and precedents created the current dilemma.`;
    default:
      return `Connected knowledge object providing direct analytical context.`;
  }
}

/**
 * Curated editorial knowledge graph for flagship investigative dossiers.
 * Serves as the Gold-Standard benchmark for deterministic cognitive scaffolding.
 */
const EDITORIAL_KNOWLEDGE_PLANS: Record<string, {
  rationale: string;
  suppressPrerequisite?: boolean;
  steps: CognitiveStep[];
}> = {
  'accountability-in-india': {
    rationale: 'Public accountability requires understanding the constitutional audit mandate of the CAG, the judicial review powers of the Supreme Court, and grassroots social audit mechanisms.',
    steps: [
      {
        type: 'prerequisite',
        learningPath: 'legal_statutory',
        badgeLabel: 'Prerequisite Foundation',
        title: 'Comptroller and Auditor General: Constitutional Mandate',
        subtitle: 'Articles 148–151 of the Constitution',
        summary: 'Understand the legal independence, tabling procedures, and audit scope of India\'s supreme audit institution before examining audit backlog.',
        url: '/entity/cag',
        entityOrCategory: 'Constitutional Body',
        estimatedMinutes: 4,
        explanationReason: 'Articles 148–151 define CAG independence and reporting duties, essential for evaluating why audit delays occur.',
      },
      {
        type: 'institutional_actor',
        learningPath: 'institutional',
        badgeLabel: 'Key Institutional Actor',
        title: 'Supreme Court of India: Public Interest Litigation & Enforcement',
        subtitle: 'Guardian of Fundamental Rights',
        summary: 'How the apex court uses mandamus and judicial oversight to compel executive compliance with statutory audit findings.',
        url: '/entity/supreme-court-of-india',
        entityOrCategory: 'Judiciary',
        estimatedMinutes: 5,
        explanationReason: 'The apex court enforces executive compliance when parliamentary audit committees fail to act.',
      },
      {
        type: 'structural_fix',
        learningPath: 'structural_reform',
        badgeLabel: 'Structural Policy Fix',
        title: 'Independent Social Audit Directorates',
        subtitle: 'Civil Society Verification of Public Expenditure',
        summary: 'Institutionalizing concurrent social audits with statutory protection to bridge the 28-month formal audit delay.',
        url: '/fix',
        entityOrCategory: 'Policy Reform',
        estimatedMinutes: 6,
        explanationReason: 'Grassroots social audits offer concurrent verification before formal post-expenditure audit reports are published.',
      },
      {
        type: 'downstream_consequence',
        learningPath: 'empirical_evidence',
        badgeLabel: 'Downstream Consequence',
        title: 'Rural Employment & Direct Benefit Transfers',
        subtitle: 'Where Financial Accountability Meets Delivery',
        summary: 'How expenditure bottlenecks and Aadhaar payment bridges impact delivery on the ground.',
        url: '/story/mgnrega-reform',
        entityOrCategory: 'Welfare Delivery',
        estimatedMinutes: 7,
        explanationReason: 'Examines the real-world frontline where audit findings intersect with welfare disbursement.',
      },
    ],
  },
  'electoral-bonds': {
    rationale: 'Electoral finance opacity cannot be understood without examining the 2017 amendments to the Companies Act, the Supreme Court\'s ruling on voter information rights, and public funding alternatives.',
    steps: [
      {
        type: 'prerequisite',
        learningPath: 'legal_statutory',
        badgeLabel: 'Prerequisite Foundation',
        title: 'The 2017 Finance Act Amendments',
        subtitle: 'Lifting the 7.5% Corporate Profit Cap',
        summary: 'How legislative changes to the Companies Act and Reserve Bank of India Act paved the way for anonymous bearer bonds.',
        url: '/topic/policy',
        entityOrCategory: 'Statutory Context',
        estimatedMinutes: 4,
        explanationReason: 'The statutory deregulation of corporate donations in 2017 is the legal root of anonymous bond purchases.',
      },
      {
        type: 'institutional_actor',
        learningPath: 'institutional',
        badgeLabel: 'Key Institutional Actor',
        title: 'Supreme Court of India: Association for Democratic Reforms (2024)',
        subtitle: 'Unanimous 5-Judge Constitution Bench',
        summary: 'The landmark constitutional doctrine establishing that voter information under Article 19(1)(a) overrides anonymous corporate speech.',
        url: '/entity/supreme-court-of-india',
        entityOrCategory: 'Judiciary',
        estimatedMinutes: 6,
        explanationReason: 'The 5-judge Constitution Bench verdict struck down the scheme as unconstitutional under Article 19(1)(a).',
      },
      {
        type: 'structural_fix',
        learningPath: 'structural_reform',
        badgeLabel: 'Structural Policy Fix',
        title: 'State Funding of Elections: Indrajit Gupta Committee Framework',
        subtitle: 'In-Kind Subsidies & Cap Enforcement',
        summary: 'An empirical policy model for curbing corporate election capture through audited public funding of recognized parties.',
        url: '/fix',
        entityOrCategory: 'Electoral Reform',
        estimatedMinutes: 5,
        explanationReason: 'Public funding remains the leading structural reform alternative to corporate campaign dependency.',
      },
      {
        type: 'downstream_consequence',
        learningPath: 'empirical_evidence',
        badgeLabel: 'Continuing Investigation',
        title: 'Corporate Contribution Data Ledger',
        subtitle: 'Empirical Verification of Donor-Contract Patterns',
        summary: 'Review the verified dataset linking bond purchases to public procurement contracts and enforcement actions.',
        url: '/investigations',
        entityOrCategory: 'Data Investigation',
        estimatedMinutes: 8,
        explanationReason: 'Cross-verifies bond serial numbers against corporate balance sheets and public contract awards.',
      },
    ],
  },
  'mgnrega-reform': {
    rationale: 'The legislative shift from MGNREGA 2005 to the VB-G RAM G Act 2025 expands the statutory guarantee from 100 to 125 days, necessitating understanding of rural delivery and digital payments.',
    steps: [
      {
        type: 'prerequisite',
        learningPath: 'legal_statutory',
        badgeLabel: 'Prerequisite Foundation',
        title: 'MGNREGA 2005: Two Decades of the Right to Work',
        subtitle: 'Historical Performance & Budget Trends',
        summary: 'Analyze the 20-year baseline of guaranteed rural employment before evaluating the 2025/2026 legislative overhaul.',
        url: '/trackers/mgnrega',
        entityOrCategory: 'Policy Tracker',
        estimatedMinutes: 5,
        explanationReason: 'Understanding the 20-year historical baseline of 100 guaranteed days is essential to evaluate the new 125-day statutory guarantee.',
      },
      {
        type: 'institutional_actor',
        learningPath: 'institutional',
        badgeLabel: 'Nodal Ministry',
        title: 'Ministry of Rural Development',
        subtitle: 'Statutory Implementation & Funding Allocations',
        summary: 'The central executive body responsible for notifying wage rates, managing the VB-G RAM G MIS, and enforcing 15-day payment timelines.',
        url: '/entity/ministry-of-rural-development',
        entityOrCategory: 'Union Ministry',
        estimatedMinutes: 4,
        explanationReason: 'The Ministry of Rural Development notifies statutory wages and manages the nationwide central funds.',
      },
      {
        type: 'structural_fix',
        learningPath: 'structural_reform',
        badgeLabel: 'Structural Policy Fix',
        title: 'Automated Delay Compensation & Real-Time Grievance Portability',
        subtitle: 'Statutory Wage Security',
        summary: 'Institutional mechanisms to guarantee interest payouts when wage transfers exceed the statutory 15-day window.',
        url: '/fix/fix-mgnrega-reform',
        entityOrCategory: 'Social Protection',
        estimatedMinutes: 5,
        explanationReason: 'Evidence-backed policy reforms to enforce timely wage credit through statutory delay penalties.',
      },
      {
        type: 'downstream_consequence',
        learningPath: 'empirical_evidence',
        badgeLabel: 'Downstream Consequence',
        title: 'Digital Payments in Rural India: UPI & AePS Adoption',
        subtitle: 'The Last-Mile Banking Infrastructure',
        summary: 'How business correspondents and micro-ATMs determine whether rural wage guarantees convert into usable cash.',
        url: '/story/digital-payments-boom',
        entityOrCategory: 'Fintech & Inclusion',
        estimatedMinutes: 6,
        explanationReason: 'Examines the last-mile fintech infrastructure that determines whether workers can withdraw statutory wages.',
      },
    ],
  },
  'pm-fasal-bima-claims': {
    rationale: 'Evaluating agricultural crop insurance deficits requires understanding the Ministry of Agriculture\'s premium subsidy framework, state delay patterns, and yield estimation reforms.',
    steps: [
      {
        type: 'prerequisite',
        learningPath: 'legal_statutory',
        badgeLabel: 'Prerequisite Foundation',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) Guidelines',
        subtitle: 'Crop Cutting Experiments & Actuarial Premiums',
        summary: 'How threshold yields, area approach indemnity, and state premium subsidies are structured under the scheme.',
        url: '/trackers/pmfby',
        entityOrCategory: 'Crop Insurance',
        estimatedMinutes: 5,
        explanationReason: 'Establishes how the area-yield insurance model functions before examining claim settlement delays.',
      },
      {
        type: 'institutional_actor',
        learningPath: 'institutional',
        badgeLabel: 'Nodal Ministry',
        title: 'Ministry of Agriculture and Farmers Welfare',
        subtitle: 'Insurance Regulatory & Subsidy Allocation',
        summary: 'The central ministry administering insurance company empanelment, state subsidy sharing, and technology adoption.',
        url: '/entity/ministry-of-agriculture',
        entityOrCategory: 'Union Ministry',
        estimatedMinutes: 4,
        explanationReason: 'Administers premium subsidies and sets dispute resolution guidelines between states and insurers.',
      },
      {
        type: 'structural_fix',
        learningPath: 'structural_reform',
        badgeLabel: 'Structural Policy Fix',
        title: 'Satellite Remote Sensing & Weather Station Automation',
        subtitle: 'Reforming Crop Cutting Experiments',
        summary: 'Replacing dispute-prone manual crop cutting experiments with validated remote sensing indices for instant payouts.',
        url: '/fix/fix-pmfby-claims',
        entityOrCategory: 'Agri Reform',
        estimatedMinutes: 5,
        explanationReason: 'Eliminates 12-month claim settlement disputes by using satellite yield proxies for objective assessment.',
      },
      {
        type: 'downstream_consequence',
        learningPath: 'empirical_evidence',
        badgeLabel: 'Downstream Investigation',
        title: 'Farm Income Volatility and Debt Pressures',
        subtitle: 'Rural Credit & Distress Cycles',
        summary: 'How delayed insurance settlements compound non-performing loans in rural cooperative banks.',
        url: '/topic/agriculture',
        entityOrCategory: 'Rural Economy',
        estimatedMinutes: 6,
        explanationReason: 'Traces the secondary impact of unpaid insurance claims on farmer indebtedness.',
      },
    ],
  },
  'digital-payments-boom': {
    rationale: 'UPI\'s expansion into rural commerce is self-contained and benefits from exploring the underlying retail payments infrastructure and financial inclusion milestones.',
    suppressPrerequisite: true, // Consumer story: Prerequisite suppressed to eliminate unnecessary friction
    steps: [
      {
        type: 'institutional_actor',
        learningPath: 'institutional',
        badgeLabel: 'Infrastructure Provider',
        title: 'National Payments Corporation of India (NPCI)',
        subtitle: 'Retail Payment Infrastructure Operator',
        summary: 'How the public utility operates UPI rails, 2FA protocols, and interchange settlements.',
        url: '/entity/npci',
        entityOrCategory: 'Fintech Utility',
        estimatedMinutes: 4,
        explanationReason: 'NPCI operates the underlying switch and sets daily transaction limits and security rules.',
      },
      {
        type: 'downstream_consequence',
        learningPath: 'empirical_evidence',
        badgeLabel: 'Live Systemic Tracker',
        title: 'UPI Volume & Value Metrics',
        subtitle: 'Real-Time Monthly Transaction Ledger',
        summary: 'Track real-time growth across peer-to-peer and peer-to-merchant transaction volumes.',
        url: '/trackers/upi',
        entityOrCategory: 'Macro Tracker',
        estimatedMinutes: 3,
        explanationReason: 'Offers empirical monthly volume and value metrics tracking the shift from cash to digital.',
      },
      {
        type: 'upstream_cause',
        learningPath: 'legal_statutory',
        badgeLabel: 'Systemic Precedent',
        title: 'Aadhaar Enabled Payment Systems (AePS)',
        subtitle: 'Last-Mile Biometric Banking',
        summary: 'The foundational digital rail that enabled micro-ATMs and rural correspondent banking.',
        url: '/topic/technology',
        entityOrCategory: 'Digital Public Goods',
        estimatedMinutes: 5,
        explanationReason: 'AePS created the biometric banking correspondent network that preceded rural smartphone adoption.',
      },
      {
        type: 'structural_fix',
        learningPath: 'structural_reform',
        badgeLabel: 'Continuing Innovation',
        title: 'Offline Digital Payments (UPI Lite & 123PAY)',
        subtitle: 'Addressing Connectivity Gaps',
        summary: 'Reforms to enable secure digital payments in low-connectivity rural zones without mobile data.',
        url: '/fix',
        entityOrCategory: 'Inclusion Reform',
        estimatedMinutes: 5,
        explanationReason: 'Explores technological solutions to network failure in rural remote settlements.',
      },
    ],
  },
};

/**
 * Filter to eliminate false connections (superficial graph links).
 * Blocks:
 * 1. Circular links (target equals source).
 * 2. Overly broad country entities ('/entity/india').
 * 3. Suppressed URLs designated by editorial overrides.
 */
function isFalseConnection(sourceSlug: string, step: CognitiveStep, overrideRule?: EditorialOverrideRule): boolean {
  if (step.url === `/story/${sourceSlug}` || step.url === sourceSlug) {
    return true; // Circular self-link
  }
  if (step.url === '/entity/india') {
    return true; // Too generic: every domestic story touches India
  }
  if (overrideRule?.suppressedUrls && overrideRule.suppressedUrls.includes(step.url)) {
    return true; // Explicitly suppressed by editor
  }
  return false;
}

/**
 * Resolves the deterministic Next Best Understanding plan for a story.
 * Prioritizes curated editorial plans; applies human-in-the-loop overrides;
 * falls back to deterministic graph resolution using primary entities, related topics, and matched policy fixes.
 */
export function resolveNextBestUnderstanding(storySlug: string): NextBestUnderstandingPlan {
  const store = getStore();
  const story = Array.from(store.stories.values()).find(
    (s) => s.slug === storySlug || s.id === storySlug
  );

  const storyTitle = story?.headline || storySlug;
  const override = getEditorialOverride(storySlug);

  // 1. Curated Gold-Standard Plan
  if (EDITORIAL_KNOWLEDGE_PLANS[storySlug]) {
    const curated = EDITORIAL_KNOWLEDGE_PLANS[storySlug];
    let filteredSteps = curated.steps.filter((s) => !isFalseConnection(storySlug, s, override));

    // Apply editorial overrides
    const shouldSuppressPrereq = override?.suppressPrerequisite ?? curated.suppressPrerequisite;
    if (shouldSuppressPrereq) {
      filteredSteps = filteredSteps.filter((s) => s.type !== 'prerequisite');
    }

    return {
      storySlug,
      storyTitle,
      rationale: override?.customRationale || curated.rationale,
      suppressPrerequisite: shouldSuppressPrereq,
      steps: filteredSteps,
    };
  }

  // 2. Deterministic Dynamic Scaffolding
  const candidateSteps: CognitiveStep[] = [];

  // Vector A: Institutional Actor (Primary Entity)
  if (story?.primaryEntityId) {
    const entity = getEntityById(story.primaryEntityId);
    if (entity && entity.slug !== 'india') {
      candidateSteps.push({
        type: 'institutional_actor',
        learningPath: 'institutional',
        badgeLabel: 'Key Institutional Actor',
        title: entity.name || entity.title || entity.slug,
        subtitle: 'Key Institution',
        summary: `Examine the constitutional powers, leadership, and policy mandate of ${entity.name || entity.slug}.`,
        url: `/entity/${entity.slug}`,
        entityOrCategory: 'Institution',
        estimatedMinutes: 4,
        explanationReason: `This institution exercises statutory authority or regulatory control over this domain.`,
      });
    }
  }

  // Vector B: Structural Policy Fix
  const fixes = getFixesForStory(storySlug, CANONICAL_FIXTURES);
  if (fixes.length > 0) {
    const fix = fixes[0];
    candidateSteps.push({
      type: 'structural_fix',
      learningPath: 'structural_reform',
      badgeLabel: 'Proposed Structural Solution',
      title: fix.headline,
      subtitle: fix.primaryCategory ? `${fix.primaryCategory.toUpperCase()} INTERVENTION` : 'Policy Alternative',
      summary: fix.problemStatement || 'Explore empirical evidence and global precedents for solving this challenge.',
      url: `/fix/${fix.slug}`,
      entityOrCategory: fix.maturityStatus || 'Proposed',
      estimatedMinutes: 5,
      explanationReason: `Presents an evidence-backed policy reform addressing the root problem identified in this story.`,
    });
  }

  // Vector C: Topic Primer / Context
  const primaryTopic = story?.relatedTopicIds?.[0] || story?.category;
  if (primaryTopic) {
    candidateSteps.push({
      type: 'upstream_cause',
      learningPath: 'legal_statutory',
      badgeLabel: 'Context & Topic Dossier',
      title: `${primaryTopic.charAt(0).toUpperCase() + primaryTopic.slice(1)} Knowledge Dossier`,
      subtitle: 'Systemic Background',
      summary: `Explore comprehensive background, institutional relationships, and policy trends across ${primaryTopic}.`,
      url: `/topic/${primaryTopic}`,
      entityOrCategory: 'Topic Primer',
      estimatedMinutes: 6,
      explanationReason: `Explores overarching statutory frameworks and policy history across the ${primaryTopic} sector.`,
    });
  }

  // Vector D: Continuing Exploration
  const otherStories = Array.from(store.stories.values()).filter(
    (s) => s.slug !== storySlug && (s.category === story?.category || s.relatedTopicIds?.some((t) => story?.relatedTopicIds?.includes(t)))
  );
  if (otherStories.length > 0) {
    const nextStory = otherStories[0];
    candidateSteps.push({
      type: 'downstream_consequence',
      learningPath: 'empirical_evidence',
      badgeLabel: 'Continuing Development',
      title: nextStory.headline,
      subtitle: nextStory.category ? `${nextStory.category.toUpperCase()} REPORT` : 'Next Analysis',
      summary: nextStory.summary || 'Deep dive into the next sequential investigation.',
      url: `/story/${nextStory.slug}`,
      entityOrCategory: nextStory.category || 'Analysis',
      estimatedMinutes: nextStory.readingTime || 5,
      explanationReason: `Investigates closely aligned empirical findings in the ${nextStory.category || 'general'} portfolio.`,
    });
  }

  // Filter out false connections and circular links
  const finalSteps = candidateSteps.filter((s) => !isFalseConnection(storySlug, s, override));

  return {
    storySlug,
    storyTitle,
    rationale: override?.customRationale || `Cognitive roadmap dynamically generated based on primary entity [${story?.primaryEntityId || 'none'}], policy category [${story?.category || 'general'}], and verified policy interventions.`,
    suppressPrerequisite: override?.suppressPrerequisite ?? false,
    steps: finalSteps.slice(0, 4),
  };
}
