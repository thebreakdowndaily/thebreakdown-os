/**
 * ─── Research Intelligence Engine — Acceptance Test ─────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * End-to-end run of the bounded pipeline against the deterministic fixture
 * corpus for the acceptance topic "India-US trade tariffs". Asserts the full
 * research journey the corpus is designed to exercise:
 *   - primary vs secondary vs wire-copy source classes
 *   - syndicated copy (ANI reprint) → content-level dedup + tagging
 *   - identical claim across independent publishers → corroboration
 *   - conflicting tariff figures (25% vs 15%) → contradiction detection
 *   - dated claims → timeline events
 *   - social post → social signal
 *   - change events from a completed run
 *   - research pack export (markdown / json / csv)
 *   - Story OS brief with claim→evidence→document→source lineage
 */

import { ResearchIntelligenceCore } from '../../services/intelligence/research/core';
import { runResearchPipeline } from '../../services/intelligence/research/pipeline';
import {
  fixtureAdapter,
  ACCEPTANCE_CORPUS,
} from '../../services/intelligence/research/adapters/fixture';
import { MemoryStateRepository } from '../../services/intelligence/research/persistence';

const PIB_URL = 'https://pib.gov.in/PressReleasePage.aspx?PRID=2025TariffTrade';
const ET_URL = 'https://economictimes.indiatimes.com/industry/india-us-trade-tariff-deal';
const ANI_URL = 'https://aninews.in/news/india-us-trade-tariff-deal';
const FE_URL = 'https://www.financialexpress.com/economy/india-us-tariff-25';
const HINDU_BL_URL = 'https://www.thehindubusinessline.com/economy/us-tariff-15-percent';

const FIXED_NOW = new Date('2026-08-15T12:00:00.000Z');

describe('Research Intelligence Engine — Acceptance (fixture corpus)', () => {
  let core: ResearchIntelligenceCore;
  let repository: MemoryStateRepository;

  beforeEach(async () => {
    ResearchIntelligenceCore.resetInstance();
    repository = new MemoryStateRepository();
    core = ResearchIntelligenceCore.getInstance(repository, [fixtureAdapter]);
    await core.ensureLoaded();
  });

  async function runAcceptancePipeline() {
    const project = core.createProject({
      title: 'India-US trade tariffs',
      researchQuestion: 'India-US trade tariffs',
      description: 'Acceptance topic for RIE v1.0',
      priority: 'P1',
      createdBy: 'acceptance-test',
    });
    const run = await runResearchPipeline(core, project.id, {
      triggeredBy: 'acceptance-test',
      adapters: [fixtureAdapter],
      now: () => FIXED_NOW,
      maxQueries: 24,
      maxSources: 40,
      maxDiscoveryResultsPerQuery: 20,
    });
    return { project, run };
  }

  it('runs every pipeline stage to completion over the full corpus', async () => {
    const { project, run } = await runAcceptancePipeline();

    expect(run.status).toBe('COMPLETED');
    expect(run.errors).toHaveLength(0);
    for (const stage of run.stages) {
      expect(stage.status).toBe('COMPLETED');
    }

    expect(run.queriesGenerated).toBeGreaterThanOrEqual(10);
    expect(run.sourcesDiscovered).toBeGreaterThanOrEqual(13);
    expect(run.sourcesFetched).toBeGreaterThanOrEqual(13);
    expect(run.claimsExtracted).toBeGreaterThan(0);
    expect(run.contradictionsFound).toBeGreaterThanOrEqual(1);
    expect(run.duplicatesRemoved).toBeGreaterThanOrEqual(1);

    const sources = core.getSources(project.id);
    const documents = core.getDocuments(project.id);
    expect(sources.length).toBeGreaterThanOrEqual(13);
    expect(documents.length).toBeGreaterThanOrEqual(12);

    const sourceUrls = new Set(sources.map((s) => s.url));
    for (const url of [PIB_URL, ET_URL, ANI_URL, FE_URL, HINDU_BL_URL]) {
      expect(sourceUrls.has(url)).toBe(true);
    }

    // Primary source classes must be present for corroboration weighting.
    expect(sources.some((s) => s.sourceClass === 'OFFICIAL')).toBe(true);
    expect(sources.some((s) => s.sourceClass === 'ACADEMIC')).toBe(true);
  });

  it('deduplicates syndicated wire copy at content level without dropping evidence', async () => {
    const { run } = await runAcceptancePipeline();

    expect(run.duplicatesRemoved).toBeGreaterThanOrEqual(1);

    const sources = core.getSources(core.getProjects()[0].id);
    const pair = sources.filter((s) => s.url === ET_URL || s.url === ANI_URL);
    expect(pair).toHaveLength(2);
    expect(pair.filter((s) => core.getDocumentForSource(s.id))).toHaveLength(1);
  });

  it('corroborates the identical claim reported by independent publishers to PRIMARY_SOURCE_CONFIRMED', async () => {
    const { project } = await runAcceptancePipeline();

    const claims = core.getClaims(project.id);
    const almondClaim = claims.find((c) => c.claimText.includes('reduced tariffs on almonds and pistachios'));
    expect(almondClaim).toBeDefined();
    expect(almondClaim!.verificationState).toBe('PRIMARY_SOURCE_CONFIRMED');

    const corroborated = claims.filter((c) =>
      ['CORROBORATED', 'PRIMARY_SOURCE_CONFIRMED'].includes(c.verificationState)
    );
    expect(corroborated.length).toBeGreaterThan(0);

    const overview = core.getProjectOverview(project.id);
    expect(overview?.verifiedClaims).toBeGreaterThan(0);
    expect(overview?.primarySourceCount).toBeGreaterThan(0);
    expect(overview?.clusters).toBeGreaterThan(0);
  });

  it('detects the conflicting tariff figures as a contradiction and never auto-resolves it', async () => {
    const { project, run } = await runAcceptancePipeline();

    expect(run.contradictionsFound).toBeGreaterThanOrEqual(1);
    const contradictions = core.getContradictions(project.id);
    expect(contradictions.length).toBeGreaterThanOrEqual(1);

    const tariffContradiction = contradictions.find(
      (c) => (c.valueA === '25 percent' && c.valueB === '15 percent') || (c.valueA === '15 percent' && c.valueB === '25 percent')
    );
    expect(tariffContradiction).toBeDefined();
    expect(tariffContradiction!.classification).toBe('TRUE_CONTRADICTION');
    expect(tariffContradiction!.status).toBe('OPEN');
    expect(tariffContradiction!.nextAction.length).toBeGreaterThan(0);
  });

  it('builds a dated timeline and records a social signal from the corpus', async () => {
    const { project } = await runAcceptancePipeline();

    const events = core.getEvents(project.id);
    expect(events.length).toBeGreaterThan(0);
    expect(events.some((e) => e.datePrecision !== 'UNKNOWN')).toBe(true);

    const signals = core.getSocialSignals(project.id);
    expect(signals.length).toBeGreaterThanOrEqual(1);
    expect(signals[0].status).toBe('SIGNAL_ONLY');
  });

  it('reports gaps and emits change events for the completed run', async () => {
    const { project, run } = await runAcceptancePipeline();

    const gaps = core.getGaps(project.id);
    expect(gaps.length).toBeGreaterThanOrEqual(1);
    const overview = core.getProjectOverview(project.id);
    expect(overview?.openResearchGaps).toBeGreaterThanOrEqual(1);

    const changeEvents = core.getChangeEvents(project.id);
    expect(changeEvents.length).toBeGreaterThanOrEqual(1);
    expect(changeEvents.some((e) => e.type === 'NEW_PRIMARY_SOURCE')).toBe(true);
    expect(run.id).toBeTruthy();
  });

  it('exports a research pack in markdown, json and csv', async () => {
    const { project } = await runAcceptancePipeline();

    for (const format of ['markdown', 'json', 'csv'] as const) {
      const pack = core.exportResearchPack(project.id, format, 'acceptance-test');
      expect(pack).not.toBeNull();
      expect(pack!.content.length).toBeGreaterThan(0);
      expect(pack!.generatedBy).toBe('acceptance-test');
    }

    const markdown = core.exportResearchPack(project.id, 'markdown', 'acceptance-test')!;
    expect(markdown.content).toContain('# Research Pack');
    expect(markdown.content).toContain('## Key claims');
    expect(markdown.content).toContain('PRIMARY_SOURCE_CONFIRMED');
    const json = JSON.parse(core.exportResearchPack(project.id, 'json', 'acceptance-test')!.content);
    expect(json.project.title).toBe('India-US trade tariffs');
    expect(Array.isArray(json.claims)).toBe(true);
    expect(Array.isArray(json.sources)).toBe(true);
  });

  it('generates a Story OS brief with full claim→evidence→document→source lineage', async () => {
    const { project } = await runAcceptancePipeline();

    const brief = core.generateStoryBrief(project.id, 'acceptance-test');
    expect(brief).not.toBeNull();
    expect(brief!.title).toBe('India-US trade tariffs');
    expect(brief!.keyClaims.length).toBeGreaterThan(0);
    expect(brief!.timeline.length).toBeGreaterThan(0);
    expect(brief!.entities.length).toBeGreaterThan(0);
    expect(brief!.provenance.claimEvidenceLineage.length).toBeGreaterThan(0);

    const lineage = brief!.provenance.claimEvidenceLineage[0];
    expect(lineage.claimId).toBeTruthy();
    expect(lineage.sourceId).toBeTruthy();
    expect(core.getSource(lineage.sourceId)).toBeDefined();

    const stored = core.getStoryBriefs(project.id);
    expect(stored).toHaveLength(1);
  });

  it('keeps the fixture corpus internally consistent (single source of truth for fixtures)', () => {
    expect(ACCEPTANCE_CORPUS.length).toBeGreaterThanOrEqual(14);
    const urls = ACCEPTANCE_CORPUS.map((d) => d.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const doc of ACCEPTANCE_CORPUS) {
      expect(doc.content.trim().length).toBeGreaterThan(0);
      expect(doc.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });
});
