/**
 * ─── Research Intelligence — Research Source Registry ────────────────────────
 * Governing documents: docs/research/source-governance.md
 *                      docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Editorial-governed registry of production discovery surfaces. Source
 * activation is an editorial decision; this module enforces the state machine:
 *
 *   PROPOSED → APPROVED → ACTIVE ──→ PAUSED / RETIRED
 *
 * Only APPROVED and ACTIVE sources participate in discovery. The registry is
 * configuration-plus-runtime: definitions ship in data/research-source-registry.ts
 * (v1 code-config, documented limitation); runtime health is tracked in memory.
 *
 * A failing source is a partial failure, never a run killer: each feed is
 * independent, errors are surfaced, and health is recorded per feed.
 */

import { assertSafeOutboundUrl } from './pipeline';
import { RssAdapter, RssFeedConfig, RssFeedOutcome } from './adapters/rss';
import { RESEARCH_SOURCE_DEFINITIONS } from '@/data/research-source-registry';
import type {
  ResearchSourceApprovalState,
  ResearchSourceClass,
  ResearchSourceDefinition,
  ResearchSourceHealth,
  ResearchSourceHealthStatus,
} from '@/types/research-intelligence';

const ELIGIBLE_STATES: ReadonlyArray<ResearchSourceApprovalState> = ['APPROVED', 'ACTIVE'];
const PRIMARY_SOURCE_CLASSES: ReadonlySet<ResearchSourceClass> = new Set<ResearchSourceClass>([
  'PRIMARY',
  'OFFICIAL',
  'REGULATORY',
  'JUDICIAL',
  'PARLIAMENTARY',
]);

function isPrimaryClass(sourceClass: ResearchSourceClass): boolean {
  return PRIMARY_SOURCE_CLASSES.has(sourceClass);
}

export function sourceIsPrimary(sourceClass: ResearchSourceClass): boolean {
  return isPrimaryClass(sourceClass);
}

function nowIso(): string {
  return new Date().toISOString();
}

export class ResearchSourceRegistry {
  private readonly definitions = new Map<string, ResearchSourceDefinition>();
  private readonly health = new Map<string, ResearchSourceHealth>();

  constructor(definitions: ResearchSourceDefinition[]) {
    for (const definition of definitions) this.upsertDefinition(definition);
  }

  private validate(def: ResearchSourceDefinition): void {
    if (this.definitions.has(def.id) && this.definitions.get(def.id)?.url !== def.url) {
      throw new Error(`ResearchSourceRegistry: id "${def.id}" is reused with a different URL.`);
    }
    for (const other of this.definitions.values()) {
      if (other.id === def.id) continue;
      if (other.url === def.url) {
        throw new Error(`ResearchSourceRegistry: duplicate URL for "${def.id}" and "${other.id}".`);
      }
    }
    if (!def.url) throw new Error(`ResearchSourceRegistry: "${def.id}" has no url.`);
    try {
      assertSafeOutboundUrl(def.url);
    } catch (err) {
      throw new Error(`ResearchSourceRegistry: "${def.id}" fails SSRF guard: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (def.adapter !== 'rss') {
      throw new Error(`ResearchSourceRegistry: "${def.id}" uses unsupported adapter "${def.adapter}" (only rss is supported in v1).`);
    }
    if (def.primarySource && !isPrimaryClass(def.authorityClass)) {
      throw new Error(`ResearchSourceRegistry: "${def.id}" is marked primarySource but authorityClass ${def.authorityClass} is not a primary class.`);
    }
    if (
      (def.approvalStatus === 'APPROVED' || def.approvalStatus === 'ACTIVE') &&
      (!def.approvedBy || !def.approvedAt)
    ) {
      throw new Error(`ResearchSourceRegistry: "${def.id}" requires approvedBy/approvedAt when ${def.approvalStatus}.`);
    }
  }

  public upsertDefinition(def: ResearchSourceDefinition): void {
    this.validate(def);
    this.definitions.set(def.id, def);
    if (!this.health.has(def.id)) {
      this.health.set(def.id, {
        sourceId: def.id,
        feedUrl: def.url,
        failureCount: 0,
        consecutiveFailures: 0,
        contentChanges: 0,
        parserSuccessRate: 1,
        status: this.classifyHealth(def, undefined),
      });
    }
  }

  public list(): ResearchSourceDefinition[] {
    const priorityRank: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return Array.from(this.definitions.values()).sort(
      (a, b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9)
    );
  }

  public get(id: string): ResearchSourceDefinition | undefined {
    return this.definitions.get(id);
  }

  public getByUrl(url: string): ResearchSourceDefinition | undefined {
    return Array.from(this.definitions.values()).find((d) => d.url === url);
  }

  /** Only APPROVED and ACTIVE, enabled sources may participate in production discovery. */
  public getEligible(): ResearchSourceDefinition[] {
    return this.list().filter((d) => d.enabled && ELIGIBLE_STATES.includes(d.approvalStatus));
  }

  public approve(id: string, approvedBy: string): ResearchSourceDefinition {
    const def = this.get(id);
    if (!def) throw new Error(`ResearchSourceRegistry: unknown source "${id}".`);
    if (def.approvalStatus !== 'PROPOSED' && def.approvalStatus !== 'APPROVED') {
      throw new Error(`ResearchSourceRegistry: "${id}" cannot be approved from state ${def.approvalStatus}.`);
    }
    def.approvalStatus = 'APPROVED';
    def.approvedBy = approvedBy;
    def.approvedAt = nowIso();
    return def;
  }

  public activate(id: string): ResearchSourceDefinition {
    const def = this.get(id);
    if (!def) throw new Error(`ResearchSourceRegistry: unknown source "${id}".`);
    if (def.approvalStatus === 'PROPOSED') {
      throw new Error(`ResearchSourceRegistry: "${id}" must be approved before activation.`);
    }
    if (def.approvalStatus === 'RETIRED') {
      throw new Error(`ResearchSourceRegistry: "${id}" is retired and cannot be reactivated.`);
    }
    def.approvalStatus = 'ACTIVE';
    return def;
  }

  public pause(id: string): ResearchSourceDefinition {
    const def = this.get(id);
    if (!def) throw new Error(`ResearchSourceRegistry: unknown source "${id}".`);
    if (def.approvalStatus !== 'ACTIVE' && def.approvalStatus !== 'APPROVED') {
      throw new Error(`ResearchSourceRegistry: "${id}" cannot be paused from state ${def.approvalStatus}.`);
    }
    def.approvalStatus = 'PAUSED';
    return def;
  }

  public retire(id: string): ResearchSourceDefinition {
    const def = this.get(id);
    if (!def) throw new Error(`ResearchSourceRegistry: unknown source "${id}".`);
    def.approvalStatus = 'RETIRED';
    def.enabled = false;
    return def;
  }

  public setEnabled(id: string, enabled: boolean): ResearchSourceDefinition {
    const def = this.get(id);
    if (!def) throw new Error(`ResearchSourceRegistry: unknown source "${id}".`);
    def.enabled = enabled;
    return def;
  }

  // ── Adapter construction ───────────────────────────────────────────────────

  public toRssFeedConfigs(): RssFeedConfig[] {
    return this.getEligible().map((d) => ({
      url: d.url,
      publisher: d.publisher,
      sourceType: d.sourceType,
      sourceClass: d.authorityClass,
    }));
  }

  /**
   * Builds the RSS adapter for production discovery from eligible sources
   * only. Fixture is never present here — there is no fallback path.
   */
  public toRssAdapter(): RssAdapter {
    return new RssAdapter({
      feeds: this.toRssFeedConfigs(),
      onFeedOutcome: (outcome) => this.recordFeedOutcome(outcome),
    });
  }

  // ── Source health ──────────────────────────────────────────────────────────

  public recordFeedOutcome(outcome: RssFeedOutcome): void {
    const def = this.getByUrl(outcome.feedUrl);
    if (!def) return;
    const current = this.health.get(def.id) ?? {
      sourceId: def.id,
      feedUrl: def.url,
      failureCount: 0,
      consecutiveFailures: 0,
      contentChanges: 0,
      parserSuccessRate: 1,
      status: 'HEALTHY' as ResearchSourceHealthStatus,
    };
    if (outcome.ok) {
      current.lastSuccessfulFetch = nowIso();
      current.lastStatusCode = outcome.statusCode;
      current.consecutiveFailures = 0;
      current.contentChanges = 0;
      current.averageLatencyMs = current.averageLatencyMs
        ? Math.round((current.averageLatencyMs + outcome.latencyMs) / 2)
        : outcome.latencyMs;
      const rate = outcome.itemsParsed > 0 ? 1 : 0.5;
      current.parserSuccessRate = current.parserSuccessRate
        ? Math.round((current.parserSuccessRate + rate) / 2 * 1000) / 1000
        : rate;
    } else {
      current.lastFailure = nowIso();
      current.lastStatusCode = outcome.statusCode;
      current.failureCount += 1;
      current.consecutiveFailures += 1;
      current.averageLatencyMs = current.averageLatencyMs
        ? Math.round((current.averageLatencyMs + outcome.latencyMs) / 2)
        : outcome.latencyMs;
      current.parserSuccessRate = current.parserSuccessRate
        ? Math.round((current.parserSuccessRate + 0) / 2 * 1000) / 1000
        : 0;
    }
    current.status = this.classifyHealth(def, current);
    this.health.set(def.id, current);
  }

  public getHealth(sourceId: string): ResearchSourceHealth | undefined {
    return this.health.get(sourceId);
  }

  public getHealthForUrl(feedUrl: string): ResearchSourceHealth | undefined {
    const def = this.getByUrl(feedUrl);
    return def ? this.health.get(def.id) : undefined;
  }

  private classifyHealth(def: ResearchSourceDefinition, health: ResearchSourceHealth | undefined): ResearchSourceHealthStatus {
    if (!def.enabled || !ELIGIBLE_STATES.includes(def.approvalStatus)) return 'DISABLED';
    if (!health) return 'HEALTHY';
    if (health.consecutiveFailures >= 3 || health.failureCount >= 5) return 'FAILING';
    if (health.consecutiveFailures >= 1 || (health.averageLatencyMs ?? 0) > 5000) return 'DEGRADED';
    return 'HEALTHY';
  }

  // ── Registry status (transparency) ─────────────────────────────────────────

  public snapshot(): {
    total: number;
    byState: Record<ResearchSourceApprovalState, number>;
    eligible: number;
    health: Record<string, ResearchSourceHealthStatus>;
    sources: Array<{
      id: string;
      name: string;
      publisher: string;
      status: ResearchSourceApprovalState;
      healthStatus: ResearchSourceHealthStatus;
    }>;
  } {
    const byState: Record<ResearchSourceApprovalState, number> = {
      PROPOSED: 0,
      APPROVED: 0,
      ACTIVE: 0,
      PAUSED: 0,
      RETIRED: 0,
    };
    const health: Record<string, ResearchSourceHealthStatus> = {};
    const sources: Array<{
      id: string;
      name: string;
      publisher: string;
      status: ResearchSourceApprovalState;
      healthStatus: ResearchSourceHealthStatus;
    }> = [];
    for (const def of this.list()) {
      byState[def.approvalStatus] += 1;
      const status = this.health.get(def.id)?.status ?? 'HEALTHY';
      health[def.id] = status;
      sources.push({
        id: def.id,
        name: def.name,
        publisher: def.publisher,
        status: def.approvalStatus,
        healthStatus: status,
      });
    }
    return {
      total: this.definitions.size,
      byState,
      eligible: this.getEligible().length,
      health,
      sources,
    };
  }
}

export const researchSourceRegistry = new ResearchSourceRegistry(RESEARCH_SOURCE_DEFINITIONS);
