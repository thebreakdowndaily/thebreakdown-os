/**
 * Batch Ingestion Engine — Step 4
 *
 * Reads a canonical manifest (JSON) and processes each constituency through
 * the staged pipeline with checkpointing, deterministic insert-or-verify,
 * quality gates, and human review queue.
 *
 * Stages: DISCOVERED → ACQUIRED → EXTRACTED → CLAIMED → LINKED → VALIDATED
 *
 * Usage:
 *   node scripts/batch-ingest.js <manifest.json> [--dry-run] [--resume]
 *
 * Checkpoint file: checkpoints/{batch_id}.json
 * Quality report:  reports/{batch_id}-quality.json
 * Review queue:    reports/{batch_id}-review-queue.json
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Configuration ──────────────────────────────────────────────────────────

const STAGES = ['DISCOVERED', 'ACQUIRED', 'EXTRACTED', 'CLAIMED', 'LINKED', 'VALIDATED'];
const CHECKPOINT_DIR = path.resolve(__dirname, '../checkpoints');
const REPORT_DIR = path.resolve(__dirname, '../reports');
const SCHEMA_PATH = path.resolve(__dirname, '../schemas/ingestion-manifest.schema.json');

// ─── Utilities ──────────────────────────────────────────────────────────────

function loadEnv() {
  const envContent = fs.readFileSync('.env.test', 'utf8');
  const env = {};
  for (const line of envContent.split('\n')) {
    if (line.trim() && !line.startsWith('#')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return env;
}

function sha256(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

function dryUuid() {
  return crypto.randomUUID();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function log(constituency, stage, message) {
  const ts = new Date().toISOString().slice(11, 19);
  const prefix = constituency ? `[${constituency}]` : '[BATCH]';
  console.log(`${ts} ${prefix} ${stage.padEnd(12)} ${message}`);
}

// ─── Checkpoint Manager ────────────────────────────────────────────────────

class CheckpointManager {
  constructor(batchId, dryRun = false) {
    this.batchId = batchId;
    this.dryRun = dryRun;
    this.path = path.join(CHECKPOINT_DIR, `${batchId}.json`);
    ensureDir(CHECKPOINT_DIR);
    this.state = this._load();
  }

  _load() {
    if (fs.existsSync(this.path)) {
      return JSON.parse(fs.readFileSync(this.path, 'utf8'));
    }
    return {
      batch_id: this.batchId,
      created_at: new Date().toISOString(),
      constituencies: {},
      totals: { claims: 0, evidence: 0, sources: 0, financial: 0, review_flags: 0 }
    };
  }

  save() {
    this.state.updated_at = new Date().toISOString();
    fs.writeFileSync(this.path, JSON.stringify(this.state, null, 2));
  }

  isComplete(constituencyId) {
    const c = this.state.constituencies[constituencyId];
    return c && c.status === 'COMPLETED';
  }

  getCompletedStage(constituencyId) {
    const c = this.state.constituencies[constituencyId];
    return c ? c.stage : null;
  }

  markStage(constituencyId, stage, counts) {
    if (!this.state.constituencies[constituencyId]) {
      this.state.constituencies[constituencyId] = {
        started_at: new Date().toISOString(),
        stages: {}
      };
    }
    const c = this.state.constituencies[constituencyId];
    c.stage = stage;
    c.stages[stage] = { completed_at: new Date().toISOString(), ...counts };

    if (stage === 'COMPLETED') {
      c.status = 'COMPLETED';
      c.completed_at = new Date().toISOString();
      if (counts) {
        this.state.totals.claims += counts.claims || 0;
        this.state.totals.evidence += counts.evidence || 0;
        this.state.totals.sources += counts.sources || 0;
        this.state.totals.financial += counts.financial || 0;
        this.state.totals.review_flags += counts.review_flags || 0;
      }
    }

    // Don't persist during dry runs
    if (!this.dryRun) this.save();
  }

  markFailed(constituencyId, error) {
    if (this.state.constituencies[constituencyId]) {
      this.state.constituencies[constituencyId].status = 'FAILED';
      this.state.constituencies[constituencyId].error = error;
      this.state.constituencies[constituencyId].failed_at = new Date().toISOString();
    }
    if (!this.dryRun) this.save();
  }

  getReport() {
    return this.state;
  }
}

// ─── Manifest Validator ────────────────────────────────────────────────────

function validateManifest(manifest) {
  const errors = [];

  if (!manifest.manifest_version || manifest.manifest_version !== '1.0') {
    errors.push('manifest_version must be "1.0"');
  }
  if (!manifest.batch_id || !/^[A-Z0-9_-]{4,64}$/.test(manifest.batch_id)) {
    errors.push('batch_id must match pattern ^[A-Z0-9_-]{4,64}$');
  }
  if (!manifest.ingestion_version) {
    errors.push('ingestion_version is required');
  }
  if (!manifest.researcher) {
    errors.push('researcher is required');
  }
  if (!Array.isArray(manifest.constituencies) || manifest.constituencies.length === 0) {
    errors.push('At least one constituency entry is required');
  }

  // Cross-reference validation per constituency
  for (const c of (manifest.constituencies || [])) {
    const cid = c.constituency_id || 'UNKNOWN';

    // Validate source_ids are unique within constituency
    const sourceIds = (c.sources || []).map(s => s.source_id);
    const dupeSourceIds = sourceIds.filter((id, i) => sourceIds.indexOf(id) !== i);
    if (dupeSourceIds.length > 0) {
      errors.push(`${cid}: Duplicate source_ids: ${dupeSourceIds.join(', ')}`);
    }

    // Validate evidence references valid source
    for (const e of (c.evidence || [])) {
      if (!sourceIds.includes(e.source_id)) {
        errors.push(`${cid}: Evidence ${e.evidence_id} references non-existent source ${e.source_id}`);
      }
    }

    // Validate claim evidence_ids reference valid evidence
    const evidenceIds = (c.evidence || []).map(e => e.evidence_id);
    for (const cl of (c.claims || [])) {
      for (const eid of (cl.evidence_ids || [])) {
        if (!evidenceIds.includes(eid)) {
          errors.push(`${cid}: Claim ${cl.claim_id} references non-existent evidence ${eid}`);
        }
      }
    }

    // Validate contradiction references
    for (const con of (c.contradictions || [])) {
      const claimIds = (c.claims || []).map(cl => cl.claim_id);
      if (!claimIds.includes(con.claim_id_a)) {
        errors.push(`${cid}: Contradiction references non-existent claim ${con.claim_id_a}`);
      }
      if (!claimIds.includes(con.claim_id_b)) {
        errors.push(`${cid}: Contradiction references non-existent claim ${con.claim_id_b}`);
      }
    }

    // Validate financial record source references
    for (const f of (c.financial_records || [])) {
      if (f.reporting_source_id && !sourceIds.includes(f.reporting_source_id)) {
        errors.push(`${cid}: Financial record ${f.canonical_id} references non-existent source ${f.reporting_source_id}`);
      }
    }
  }

  return errors;
}

// ─── Quality Gates ──────────────────────────────────────────────────────────

class QualityGates {
  constructor(batchId) {
    this.batchId = batchId;
    this.flags = [];
    this.metrics = {};
  }

  addFlag(constituencyId, flagType, description, relatedIds = [], priority = 'P2_MEDIUM') {
    this.flags.push({
      batch_id: this.batchId,
      constituency_id: constituencyId,
      flag_type: flagType,
      description,
      related_ids: relatedIds,
      priority,
      created_at: new Date().toISOString()
    });
  }

  checkProvenance(constituencyId, claims, evidenceRels) {
    const claimsWithoutEvidence = claims.filter(cl => {
      return !evidenceRels.some(r => r.claim_id === cl.id);
    });

    if (claimsWithoutEvidence.length > 0) {
      this.addFlag(
        constituencyId,
        'LOW_CONFIDENCE',
        `${claimsWithoutEvidence.length} claims have no evidence relationships`,
        claimsWithoutEvidence.map(c => c.canonical_id),
        'P1_HIGH'
      );
    }

    const coverage = claims.length > 0
      ? ((claims.length - claimsWithoutEvidence.length) / claims.length * 100).toFixed(1)
      : 100;

    return { total: claims.length, covered: claims.length - claimsWithoutEvidence.length, coverage };
  }

  checkFinancialSafety(constituencyId, financialRecords) {
    const issues = [];

    for (const f of financialRecords) {
      if (!f.reporting_source_id) {
        issues.push(`${f.canonical_id}: No reporting source`);
        this.addFlag(
          constituencyId,
          'SOURCE_CONFLICT',
          `Financial record ${f.canonical_id} has no reporting source`,
          [f.canonical_id],
          'P1_HIGH'
        );
      }
    }

    return { total: financialRecords.length, issues: issues.length };
  }

  checkGeographicAmbiguity(constituencyId, claims, searchProtocols) {
    const boundaryClaims = claims.filter(cl =>
      cl.statement && cl.statement.toLowerCase().includes('distinct')
    );

    if (boundaryClaims.length > 0) {
      this.addFlag(
        constituencyId,
        'BOUNDARY_COMPLEXITY',
        `${boundaryClaims.length} claims involve boundary/identity distinctions`,
        boundaryClaims.map(c => c.canonical_id),
        'P2_MEDIUM'
      );
    }

    return { boundaryClaims: boundaryClaims.length };
  }

  checkContradictions(constituencyId, contradictions) {
    const unresolved = contradictions.filter(c => !c.resolution);

    for (const con of unresolved) {
      this.addFlag(
        constituencyId,
        'CONTRADICTORY_EVIDENCE',
        `Unresolved contradiction: ${con.description || 'No description'}`,
        [con.claim_id_a, con.claim_id_b],
        'P0_BLOCKING'
      );
    }

    return { total: contradictions.length, unresolved: unresolved.length };
  }

  generateReport() {
    const report = {
      batch_id: this.batchId,
      generated_at: new Date().toISOString(),
      total_flags: this.flags.length,
      by_priority: {
        P0_BLOCKING: this.flags.filter(f => f.priority === 'P0_BLOCKING').length,
        P1_HIGH: this.flags.filter(f => f.priority === 'P1_HIGH').length,
        P2_MEDIUM: this.flags.filter(f => f.priority === 'P2_MEDIUM').length,
        P3_LOW: this.flags.filter(f => f.priority === 'P3_LOW').length,
      },
      by_type: {},
      flags: this.flags
    };

    for (const f of this.flags) {
      report.by_type[f.flag_type] = (report.by_type[f.flag_type] || 0) + 1;
    }

    return report;
  }
}

// ─── Ingestion Engine ───────────────────────────────────────────────────────

class BatchIngestionEngine {
  constructor(client, manifest, options = {}) {
    this.client = client;
    this.manifest = manifest;
    this.batchId = manifest.batch_id;
    this.dryRun = options.dry || false;
    this.resume = options.resume || false;

    this.checkpoint = new CheckpointManager(this.batchId, this.dryRun);
    this.quality = new QualityGates(this.batchId);
    this.reviewQueue = [];

    // ID mapping: batch-local IDs → database UUIDs
    this.idMap = {
      sources: {},      // source_id → db id
      evidence: {},     // evidence_id → db id
      claims: {},       // claim_id → db id
      constituencies: {}, // constituency_id → db id
      projects: {},     // project_name → db id
      financial: {},    // canonical_id → db id
      gaps: {},         // canonical_id → db id
      search_protocols: {} // canonical_id → db id
    };

    // Counters
    this.counts = {
      sources: 0, evidence: 0, claims: 0,
      claim_evidence: 0, claim_subject: 0,
      financial: 0, gaps: 0, search_protocols: 0,
      review_flags: 0
    };
  }

  // ─── Deterministic Insert-or-Verify ────────────────────────────────────

  /**
   * Insert-or-resolve: SELECT first, INSERT only if not found.
   * NEVER does UPDATE on conflict. If a record exists with the same identity,
   * returns the existing ID and verifies it matches expectations.
   *
   * @param {string} table - Table name
   * @param {string[]} columns - Column names
   * @param {any[]} values - Column values
   * @param {string[]} identityCols - Columns that form the identity
   * @param {object} [verify] - Optional: expected values to verify against existing record
   * @returns {{ id: string, action: 'EXISTING'|'CREATED', verified: boolean }}
   */
  async insertOrVerify(table, columns, values, identityCols, verify = null) {
    // Build identity WHERE clause
    const identityValues = identityCols.map(c => values[columns.indexOf(c)]);
    const where = identityCols.map((c, i) => `${c} = $${i + 1}`).join(' AND ');

    // SELECT first
    const existing = await this.client.query(
      `SELECT * FROM ${table} WHERE ${where}`,
      identityValues
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      let verified = true;

      // Verify expected values if provided
      if (verify) {
        for (const [key, expected] of Object.entries(verify)) {
          if (row[key] !== undefined && row[key] !== expected) {
            verified = false;
            this.quality.addFlag(
              this.currentConstituency,
              'SOURCE_CONFLICT',
              `Record ${table} id=${row.id} has ${key}='${row[key]}' but manifest expects '${expected}'`,
              [row.id],
              'P1_HIGH'
            );
          }
        }
      }

      return { id: row.id, action: 'EXISTING', verified };
    }

    // INSERT if not found
    if (this.dryRun) {
      log(this.currentConstituency, 'DRY-RUN', `Would INSERT into ${table}`);
      return { id: dryUuid(), action: 'CREATED', verified: true };
    }

    const colStr = columns.join(', ');
    const valStr = columns.map((_, i) => `$${i + 1}`).join(', ');
    const res = await this.client.query(
      `INSERT INTO ${table} (${colStr}) VALUES (${valStr}) RETURNING id`,
      values
    );

    return { id: res.rows[0].id, action: 'CREATED', verified: true };
  }

  /**
   * Insert junction record. Uses ON CONFLICT DO NOTHING (safe for idempotency).
   */
  async insertJunction(table, columns, values) {
    if (this.dryRun) {
      log(this.currentConstituency, 'DRY-RUN', `Would INSERT into ${table}`);
      return dryUuid();
    }

    const colStr = columns.join(', ');
    const valStr = columns.map((_, i) => `$${i + 1}`).join(', ');
    await this.client.query(
      `INSERT INTO ${table} (${colStr}) VALUES (${valStr}) ON CONFLICT DO NOTHING`,
      values
    );
  }

  // ─── Stage Processors ──────────────────────────────────────────────────

  async stage_DISCOVERED(entry) {
    // Resolve or create constituency
    const res = await this.insertOrVerify(
      'research_constituencies',
      ['canonical_id', 'name', 'ingestion_method'],
      [entry.constituency_id, entry.name, this.batchId],
      ['canonical_id']
    );
    this.idMap.constituencies[entry.constituency_id] = res.id;

    // Resolve or create project if specified
    if (entry.project_id) {
      const projRes = await this.client.query(
        `SELECT id FROM research_projects WHERE name = $1`,
        [entry.project_id]
      );
      if (projRes.rows.length > 0) {
        this.idMap.projects[entry.project_id] = projRes.rows[0].id;
      } else if (!this.dryRun) {
        const newProj = await this.client.query(
          `INSERT INTO research_projects (name, ingestion_method) VALUES ($1, $2) RETURNING id`,
          [entry.project_id, this.batchId]
        );
        this.idMap.projects[entry.project_id] = newProj.rows[0].id;
      }
    }

    log(entry.constituency_id, 'DISCOVERED', `Constituency resolved: ${entry.name}`);
    this.checkpoint.markStage(entry.constituency_id, 'DISCOVERED', null);
  }

  async stage_ACQUIRED(entry) {
    // Insert sources
    for (const src of entry.sources) {
      const res = await this.insertOrVerify(
        'research_sources',
        ['title', 'source_type', 'ingestion_method'],
        [src.title, src.source_type, this.batchId],
        ['title']
      );
      this.idMap.sources[src.source_id] = res.id;
      if (res.action === 'CREATED') this.counts.sources++;
    }

    log(entry.constituency_id, 'ACQUIRED', `${entry.sources.length} sources resolved`);
    this.checkpoint.markStage(entry.constituency_id, 'ACQUIRED', null);
  }

  async stage_EXTRACTED(entry) {
    // Insert evidence items
    for (const ev of entry.evidence) {
      const sourceDbId = this.idMap.sources[ev.source_id];
      if (!sourceDbId) {
        this.quality.addFlag(
          entry.constituency_id,
          'SOURCE_CONFLICT',
          `Evidence ${ev.evidence_id} references missing source ${ev.source_id}`,
          [ev.evidence_id],
          'P0_BLOCKING'
        );
        continue;
      }

      const res = await this.insertOrVerify(
        'research_evidence_items',
        ['source_id', 'extracted_text', 'ingestion_method'],
        [sourceDbId, ev.extracted_text, this.batchId],
        ['source_id']  // identity: one evidence per source (simplified for batch)
      );
      this.idMap.evidence[ev.evidence_id] = res.id;
      if (res.action === 'CREATED') this.counts.evidence++;
    }

    log(entry.constituency_id, 'EXTRACTED', `${entry.evidence.length} evidence items resolved`);
    this.checkpoint.markStage(entry.constituency_id, 'EXTRACTED', null);
  }

  async stage_CLAIMED(entry) {
    // Insert claims
    for (const cl of entry.claims) {
      const res = await this.insertOrVerify(
        'research_claims',
        ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
        [cl.claim_id, cl.confidence, cl.statement, 'DRAFT', 'UNREVIEWED', this.batchId],
        ['canonical_id']
      );
      this.idMap.claims[cl.claim_id] = res.id;
      if (res.action === 'CREATED') this.counts.claims++;
    }

    // Insert financial records
    for (const fin of (entry.financial_records || [])) {
      const projId = fin.project_id_ref ? this.idMap.projects[fin.project_id_ref] : null;
      const constId = this.idMap.constituencies[entry.constituency_id];
      const srcId = fin.reporting_source_id ? this.idMap.sources[fin.reporting_source_id] : null;

      const res = await this.insertOrVerify(
        'research_financial_records',
        ['project_id', 'stage', 'canonical_id', 'amount_status', 'amount_operator', 'amount_value',
         'source_terminology', 'fiscal_year', 'reporting_source_id', 'ingestion_method',
         'target_geography', 'target_constituency_id', 'valid_from'],
        [projId, fin.stage, fin.canonical_id, fin.amount_status, fin.amount_operator || 'EXACT',
         fin.amount_value, fin.source_terminology || null, fin.fiscal_year || null,
         srcId, this.batchId, fin.target_geography || null, constId, fin.valid_from || null],
        ['canonical_id']
      );
      this.idMap.financial[fin.canonical_id] = res.id;
      if (res.action === 'CREATED') this.counts.financial++;
    }

    // Insert search protocols
    for (const proto of (entry.search_protocols || [])) {
      const res = await this.insertOrVerify(
        'research_search_protocols',
        ['canonical_id', 'research_question', 'repositories_searched', 'queries_used',
         'search_started_at', 'search_completed_at', 'ingestion_method'],
        [proto.canonical_id, proto.research_question,
         JSON.stringify(proto.repositories_searched), JSON.stringify(proto.queries_used || []),
         proto.search_started_at || null, proto.search_completed_at || null, this.batchId],
        ['canonical_id']
      );
      this.idMap.search_protocols[proto.canonical_id] = res.id;
      if (res.action === 'CREATED') this.counts.search_protocols++;
    }

    // Insert gaps
    for (const gap of (entry.gaps || [])) {
      const res = await this.insertOrVerify(
        'research_gaps',
        ['canonical_id', 'gap_description', 'ingestion_method'],
        [gap.canonical_id, gap.gap_description, this.batchId],
        ['canonical_id']
      );
      this.idMap.gaps[gap.canonical_id] = res.id;
      if (res.action === 'CREATED') this.counts.gaps++;
    }

    log(entry.constituency_id, 'CLAIMED',
      `${entry.claims.length} claims, ${(entry.financial_records || []).length} financial, ` +
      `${(entry.search_protocols || []).length} protocols, ${(entry.gaps || []).length} gaps`);
    this.checkpoint.markStage(entry.constituency_id, 'CLAIMED', null);
  }

  async stage_LINKED(entry) {
    const constId = this.idMap.constituencies[entry.constituency_id];
    const projId = entry.project_id ? this.idMap.projects[entry.project_id] : null;

    // Link claims to evidence
    for (const cl of entry.claims) {
      const claimDbId = this.idMap.claims[cl.claim_id];
      if (!claimDbId) continue;

      for (const evId of (cl.evidence_ids || [])) {
        const evDbId = this.idMap.evidence[evId];
        if (!evDbId) continue;

        await this.insertJunction(
          'research_claim_evidence_relationships',
          ['claim_id', 'evidence_id', 'relationship_type', 'ingestion_method'],
          [claimDbId, evDbId, 'SUPPORTS', this.batchId]
        );
        this.counts.claim_evidence++;
      }
    }

    // Link claims to subjects (constituency or project)
    for (const cl of entry.claims) {
      const claimDbId = this.idMap.claims[cl.claim_id];
      if (!claimDbId) continue;

      const scope = cl.scope || 'PRIMARY_SUBJECT';

      if (projId) {
        await this.insertJunction(
          'research_claim_subject_relationships',
          ['claim_id', 'project_id', 'scope', 'ingestion_method'],
          [claimDbId, projId, scope, this.batchId]
        );
      } else if (constId) {
        await this.insertJunction(
          'research_claim_subject_relationships',
          ['claim_id', 'constituency_id', 'scope', 'ingestion_method'],
          [claimDbId, constId, scope, this.batchId]
        );
      }
      this.counts.claim_subject++;
    }

    log(entry.constituency_id, 'LINKED',
      `${this.counts.claim_evidence} claim-evidence, ${this.counts.claim_subject} claim-subject`);
    this.checkpoint.markStage(entry.constituency_id, 'LINKED', null);
  }

  async stage_VALIDATED(entry) {
    // Run quality gates for this constituency
    const constId = this.idMap.constituencies[entry.constituency_id];

    // Provenance check
    const claimsRes = await this.client.query(
      `SELECT id, canonical_id, statement FROM research_claims WHERE ingestion_method = $1`,
      [this.batchId]
    );
    const evidenceRels = await this.client.query(
      `SELECT claim_id FROM research_claim_evidence_relationships WHERE ingestion_method = $1`,
      [this.batchId]
    );

    const provenance = this.quality.checkProvenance(
      entry.constituency_id,
      claimsRes.rows,
      evidenceRels.rows
    );

    // Financial safety
    const finRes = await this.client.query(
      `SELECT canonical_id, reporting_source_id FROM research_financial_records WHERE ingestion_method = $1`,
      [this.batchId]
    );
    const financial = this.quality.checkFinancialSafety(entry.constituency_id, finRes.rows);

    // Geographic ambiguity
    const geo = this.quality.checkGeographicAmbiguity(entry.constituency_id, claimsRes.rows, []);

    // Contradictions
    const contradictionResult = this.quality.checkContradictions(
      entry.constituency_id,
      entry.contradictions || []
    );

    // Human review flags from manifest
    for (const flag of (entry.human_flags || [])) {
      this.quality.addFlag(entry.constituency_id, flag.flag_type, flag.description, flag.related_ids, flag.priority);
      this.counts.review_flags++;
    }

    // Log quality summary
    const summary = [
      `provenance=${provenance.coverage}%`,
      `financial_issues=${financial.issues}`,
      `boundary=${geo.boundaryClaims}`,
      `contradictions=${contradictionResult.unresolved} unresolved`
    ].join(', ');

    log(entry.constituency_id, 'VALIDATED', `Quality: ${summary}`);

    const counts = {
      claims: claimsRes.rows.length,
      evidence: this.counts.evidence,
      sources: this.counts.sources,
      financial: this.counts.financial,
      review_flags: this.counts.review_flags
    };

    this.checkpoint.markStage(entry.constituency_id, 'VALIDATED', counts);
  }

  // ─── Main Loop ─────────────────────────────────────────────────────────

  async run() {
    const startTime = Date.now();
    log(null, 'START', `Batch: ${this.batchId}, Constituencies: ${this.manifest.constituencies.length}`);

    // Validate manifest
    const errors = validateManifest(this.manifest);
    if (errors.length > 0) {
      log(null, 'ERROR', `Manifest validation failed:`);
      errors.forEach(e => log(null, 'ERROR', `  ${e}`));
      throw new Error(`Manifest validation failed: ${errors.length} errors`);
    }
    log(null, 'VALIDATE', `Manifest validation passed`);

    // Process each constituency
    let processed = 0;
    let skipped = 0;

    for (const entry of this.manifest.constituencies) {
      this.currentConstituency = entry.constituency_id;

      // Resume: skip completed constituencies
      if (this.resume && this.checkpoint.isComplete(entry.constituency_id)) {
        log(entry.constituency_id, 'SKIP', 'Already completed (resume mode)');
        skipped++;
        continue;
      }

      // Check for partial progress
      const completedStage = this.checkpoint.getCompletedStage(entry.constituency_id);
      let startIdx = 0;
      if (completedStage) {
        if (completedStage === 'COMPLETED') {
          log(entry.constituency_id, 'SKIP', 'Already completed');
          skipped++;
          continue;
        }
        startIdx = STAGES.indexOf(completedStage) + 1;
        if (startIdx >= STAGES.length) {
          log(entry.constituency_id, 'SKIP', 'Already completed');
          skipped++;
          continue;
        }
        log(entry.constituency_id, 'RESUME', `Starting from stage ${STAGES[startIdx]} (previous: ${completedStage})`);
      }

      try {
        // Run stages
        const stageMethods = [
          () => this.stage_DISCOVERED(entry),
          () => this.stage_ACQUIRED(entry),
          () => this.stage_EXTRACTED(entry),
          () => this.stage_CLAIMED(entry),
          () => this.stage_LINKED(entry),
          () => this.stage_VALIDATED(entry),
        ];

        for (let i = startIdx; i < stageMethods.length; i++) {
          await stageMethods[i]();
        }

        // Mark complete
        this.checkpoint.markStage(entry.constituency_id, 'COMPLETED', {
          claims: (entry.claims || []).length,
          evidence: (entry.evidence || []).length,
          sources: (entry.sources || []).length,
          financial: (entry.financial_records || []).length,
          review_flags: (entry.human_flags || []).length
        });

        processed++;
        log(entry.constituency_id, 'DONE', `Completed successfully`);

      } catch (err) {
        this.checkpoint.markFailed(entry.constituency_id, err.message);
        log(entry.constituency_id, 'FAILED', err.message);
        throw err; // Stop on failure — resume from this constituency
      }
    }

    // Finalize
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Generate quality report
    const qualityReport = this.quality.generateReport();
    ensureDir(REPORT_DIR);
    fs.writeFileSync(
      path.join(REPORT_DIR, `${this.batchId}-quality.json`),
      JSON.stringify(qualityReport, null, 2)
    );

    // Generate review queue
    const reviewQueue = {
      batch_id: this.batchId,
      generated_at: new Date().toISOString(),
      total_items: this.quality.flags.length,
      blocking: this.quality.flags.filter(f => f.priority === 'P0_BLOCKING'),
      high: this.quality.flags.filter(f => f.priority === 'P1_HIGH'),
      medium: this.quality.flags.filter(f => f.priority === 'P2_MEDIUM'),
      low: this.quality.flags.filter(f => f.priority === 'P3_LOW')
    };
    fs.writeFileSync(
      path.join(REPORT_DIR, `${this.batchId}-review-queue.json`),
      JSON.stringify(reviewQueue, null, 2)
    );

    log(null, 'COMPLETE',
      `Processed: ${processed}, Skipped: ${skipped}, ` +
      `Claims: ${this.checkpoint.state.totals.claims}, ` +
      `Evidence: ${this.checkpoint.state.totals.evidence}, ` +
      `Sources: ${this.checkpoint.state.totals.sources}, ` +
      `Financial: ${this.checkpoint.state.totals.financial}, ` +
      `Review flags: ${this.checkpoint.state.totals.review_flags}, ` +
      `Quality flags: ${qualityReport.total_flags} ` +
      `(P0=${qualityReport.by_priority.P0_BLOCKING}, ` +
      `P1=${qualityReport.by_priority.P1_HIGH}), ` +
      `Elapsed: ${elapsed}s`);

    return {
      processed,
      skipped,
      quality: qualityReport,
      reviewQueue,
      checkpoint: this.checkpoint.getReport()
    };
  }
}

// ─── CLI ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const manifestPath = args.find(a => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  const resume = args.includes('--resume');
  const fresh = args.includes('--fresh');

  if (!manifestPath) {
    console.error('Usage: node scripts/batch-ingest.js <manifest.json> [--dry-run] [--resume] [--fresh]');
    process.exit(1);
  }

  // Load manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`Manifest: ${manifest.batch_id} (${manifest.constituencies.length} constituencies)`);

  if (dryRun) console.log('DRY RUN — no data will be written');
  if (fresh) {
    const cpPath = path.join(CHECKPOINT_DIR, `${manifest.batch_id}.json`);
    if (fs.existsSync(cpPath)) {
      fs.unlinkSync(cpPath);
      console.log('Cleared checkpoint for fresh start');
    }
  }

  // Connect
  const env = loadEnv();
  const client = new Client({ connectionString: env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to database');

  try {
    const engine = new BatchIngestionEngine(client, manifest, { dry: dryRun, resume });
    const result = await engine.run();

    // Summary
    console.log('\n=== BATCH INGESTION COMPLETE ===');
    console.log(`Constituencies: ${result.processed} processed, ${result.skipped} skipped`);
    console.log(`Quality flags: ${result.quality.total_flags}`);
    console.log(`Review queue: ${result.reviewQueue.total_items} items`);

    if (result.quality.flags.length > 0) {
      console.log('\n--- Review Queue ---');
      for (const f of result.quality.flags) {
        console.log(`  [${f.priority}] ${f.constituency_id}: ${f.flag_type} — ${f.description}`);
      }
    }

  } catch (err) {
    console.error('Batch ingestion failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
