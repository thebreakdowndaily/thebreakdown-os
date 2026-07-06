import type { Story, Claim } from '@/types/canonical';

export interface SimplifiedStory { title: string; summary: string; keyPoints: string[]; }
export interface PolicyComparison { aspect: string; current: string; previous: string; }

const JARGON_MAP: Record<string, string> = {
  'leverage': 'use', 'synergy': 'cooperation', 'optimize': 'improve',
  'paradigm': 'model', 'facilitate': 'help', 'utilize': 'use',
  'implement': 'carry out', 'initiative': 'program', 'stakeholder': 'participant',
  'streamline': 'simplify', 'robust': 'strong', 'holistic': 'overall',
  'incentivize': 'encourage', 'operationalize': 'put into practice',
  'transparency': 'openness', 'accountability': 'responsibility',
  'infrastructure': 'systems', 'governance': 'management',
  'sustainability': 'long-term health', 'framework': 'system',
  'ecosystem': 'network', 'disruption': 'major change',
  'scalability': 'ability to grow', 'compliance': 'following rules',
  'oversight': 'supervision', 'mandate': 'order',
  'allocation': 'distribution', 'disbursement': 'payment',
  'expenditure': 'spending', 'procurement': 'purchasing',
  'remittance': 'payment sent', 'subsidy': 'financial aid',
  'tariff': 'tax on imports', 'fiscal': 'financial',
  'monetary': 'money-related', 'inflation': 'rising prices',
  'deficit': 'shortfall', 'surplus': 'extra',
  'liquidity': 'cash available', 'solvency': 'ability to pay debts',
  'amortization': 'gradual repayment', 'depreciation': 'loss in value',
  'appreciation': 'gain in value', 'arbitrage': 'price difference profit',
  'collateral': 'security for a loan', 'default': 'failure to repay',
};

export class ReaderAI {
  simplify(story: Story, audience: 'general' | 'student' | 'expert'): SimplifiedStory {
    if (audience === 'expert') {
      return {
        title: story.title,
        summary: story.summary,
        keyPoints: this.extractKeyPoints(story),
      };
    }

    const simplifyText = (text: string): string => {
      let result = text;
      for (const [jargon, plain] of Object.entries(JARGON_MAP)) {
        const regex = new RegExp(`\\b${jargon}\\b`, 'gi');
        result = result.replace(regex, plain);
      }
      return result;
    };

    const simpleTitle = simplifyText(story.title);
    const simpleSummary = simplifyText(story.summary);

    if (audience === 'general') {
      return {
        title: simpleTitle,
        summary: simpleSummary,
        keyPoints: this.extractKeyPoints(story).map(simplifyText),
      };
    }

    const contextNotes: string[] = [];
    const topClaims = [...story.claims]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    for (const claim of topClaims) {
      const tierLabel = claim.tier === 1 ? 'highly authoritative' :
        claim.tier === 2 ? 'scholarly' :
        claim.tier === 3 ? 'statistical' : 'analytical';
      contextNotes.push(`${claim.claim} (from a ${tierLabel} source, confidence: ${claim.confidence}%)`);
    }

    const contextSummary = simpleSummary + (
      contextNotes.length > 0
        ? ` Key context: ${contextNotes.join('; ')}.`
        : ''
    );

    return {
      title: `${simpleTitle} — explained`,
      summary: contextSummary,
      keyPoints: [
        ...this.extractKeyPoints(story).map(simplifyText),
        ...contextNotes,
      ],
    };
  }

  extractVerifiedClaims(story: Story): Claim[] {
    return (story.claims || []).filter(c => c.confidence >= 80);
  }

  summarize(story: Story, maxPoints: number): string[] {
    if (maxPoints <= 0) return [];

    const points: string[] = [];

    const sortedClaims = [...(story.claims || [])].sort((a, b) => b.confidence - a.confidence);
    for (const claim of sortedClaims) {
      if (points.length >= maxPoints) break;
      const tierLabel = claim.tier === 1 ? '[High Confidence]' :
        claim.tier === 2 ? '[Scholarly]' :
        claim.tier === 3 ? '[Data-backed]' : '[Analysis]';
      points.push(`${tierLabel} ${claim.claim}`);
    }

    if (points.length < maxPoints && story.summary) {
      points.push(story.summary);
    }

    if (points.length < maxPoints && story.headline) {
      points.push(story.headline);
    }

    return points.slice(0, maxPoints);
  }

  comparePolicies(story: Story, previousStory: Story): PolicyComparison[] {
    const comparisons: PolicyComparison[] = [];

    comparisons.push({
      aspect: 'Category',
      current: story.category,
      previous: previousStory.category,
    });

    comparisons.push({
      aspect: 'Evidence Score',
      current: `${story.evidenceScore}`,
      previous: `${previousStory.evidenceScore}`,
    });

    comparisons.push({
      aspect: 'Number of Sources',
      current: `${story.sources?.length || 0}`,
      previous: `${previousStory.sources?.length || 0}`,
    });

    comparisons.push({
      aspect: 'Number of Claims',
      current: `${story.claims?.length || 0}`,
      previous: `${previousStory.claims?.length || 0}`,
    });

    const currentVerified = (story.claims || []).filter(c => c.confidence >= 80).length;
    const previousVerified = (previousStory.claims || []).filter(c => c.confidence >= 80).length;
    comparisons.push({
      aspect: 'Verified Claims (confidence >= 80)',
      current: `${currentVerified}`,
      previous: `${previousVerified}`,
    });

    const currentTimelineCount = story.timeline?.length || 0;
    const previousTimelineCount = previousStory.timeline?.length || 0;
    comparisons.push({
      aspect: 'Timeline Events',
      current: `${currentTimelineCount}`,
      previous: `${previousTimelineCount}`,
    });

    const currentAvgConfidence = (story.claims || []).length > 0
      ? (story.claims.reduce((sum, c) => sum + c.confidence, 0) / story.claims.length).toFixed(1)
      : 'N/A';
    const previousAvgConfidence = (previousStory.claims || []).length > 0
      ? (previousStory.claims.reduce((sum, c) => sum + c.confidence, 0) / previousStory.claims.length).toFixed(1)
      : 'N/A';
    comparisons.push({
      aspect: 'Average Claim Confidence',
      current: currentAvgConfidence,
      previous: previousAvgConfidence,
    });

    const currentEntities = story.relatedEntityIds?.length || 0;
    const previousEntities = previousStory.relatedEntityIds?.length || 0;
    comparisons.push({
      aspect: 'Related Entities',
      current: `${currentEntities}`,
      previous: `${previousEntities}`,
    });

    return comparisons;
  }

  timelineSummary(story: Story): string {
    const events = story.timeline;
    if (!events || events.length === 0) return '';

    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

    const parts: string[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const event = sorted[i];
      const conjunction = i === 0
        ? 'It began'
        : i === sorted.length - 1
          ? 'Most recently'
          : 'Then';
      const connector = i === 0 ? '' : ', ';
      parts.push(`${connector}${conjunction} on ${event.date}, ${event.title}. ${event.description}`);
    }

    return parts.join('').trim();
  }

  private extractKeyPoints(story: Story): string[] {
    const points: string[] = [];

    if (story.claims && story.claims.length > 0) {
      const topClaims = [...story.claims]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
      for (const c of topClaims) {
        points.push(c.claim);
      }
    } else if (story.summary) {
      const sentences = story.summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
      for (const s of sentences.slice(0, 3)) {
        points.push(s.trim());
      }
    }

    return points;
  }
}
