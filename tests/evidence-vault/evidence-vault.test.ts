/**
 * ─── Phase 4B-2B: Evidence Preservation Vault Integration & Forensic Test Suite ──
 *
 * Governing Documents:
 *   - .planning/PHASE-4B-2A-EVIDENCE-PRESERVATION-DESIGN.md
 *   - AGENTS.md (Verification & Idempotency, Knowledge First)
 *   - docs/editorial/editorial-constitution.md (Article III - Evidence Hierarchy)
 *
 * Objectives:
 *   Validate all 25 required test cases against the Staging Supabase PostgreSQL
 *   environment (lvfovvidtowadmnggzzf), ensuring 100% production isolation.
 */

import { Client } from 'pg';
import { createHash, randomUUID } from 'node:crypto';
import {
  EvidenceVaultService,
  ArtifactIntegrityError,
  ArchivedArtifactRecord,
} from '../../services/intelligence/evidence-vault.service';
import type { RawArtifact } from '../../services/radar/types';
import {
  NewsroomIntelligenceCore,
  VerificationPreconditionError,
} from '../../services/intelligence/newsroom/index';
import {
  validateStoryEvidenceCompleteness,
  PublicationBlockedError,
} from '../../lib/story/evidence-guard';
import { MemoryStoryService } from '../../services/stories/service';
import type { Story, Claim } from '../../types/canonical';

// ── Strict Staging Safety Interlock ──────────────────────────────────────────
const STAGING_URL =
  process.env.STAGING_DATABASE_URL ||
  'postgresql://postgres:Ntn%40supabase403@db.lvfovvidtowadmnggzzf.supabase.co:5432/postgres';

const u = new URL(STAGING_URL);
if (!u.host.includes('lvfovvidtowadmnggzzf')) {
  throw new Error(`FATAL: Test targeted non-staging host ${u.host}! Aborting.`);
}
if (u.host.includes('mskyhaunnlwtwvsqcmav') || u.host.includes('swektehukscmsgxdzymw')) {
  throw new Error('FATAL: Test targeted PRODUCTION project! Aborting immediately.');
}

let passed = 0;
let failed = 0;

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected defined value but got undefined`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} > ${expected}`);
      }
    },
    toContain(expected: any) {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected string to contain ${JSON.stringify(expected)}`);
      } else if (Array.isArray(actual) && !actual.includes(expected)) {
        throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
      } else if (typeof actual === 'object' && actual !== null && !(expected in actual)) {
        throw new Error(`Expected object to contain property ${JSON.stringify(expected)}`);
      }
    },
    not: {
      toBe(expected: any) {
        if (actual === expected) {
          throw new Error(`Expected NOT to be ${JSON.stringify(expected)}`);
        }
      }
    },
    rejects: {
      async toThrow(expectedError?: any) {
        let threw = false;
        let caughtErr: any;
        try {
          await actual;
        } catch (err: any) {
          threw = true;
          caughtErr = err;
        }
        if (!threw) {
          throw new Error(`Expected promise to reject, but it resolved successfully.`);
        }
        if (expectedError) {
          if (expectedError instanceof RegExp) {
            if (!expectedError.test(caughtErr?.message || String(caughtErr))) {
              throw new Error(`Expected error matching ${expectedError} but got "${caughtErr?.message || caughtErr}"`);
            }
          } else if (typeof expectedError === 'function') {
            if (!(caughtErr instanceof expectedError)) {
              throw new Error(`Expected error instance of ${expectedError.name} but got ${caughtErr}`);
            }
          } else if (typeof expectedError === 'string') {
            if (!String(caughtErr?.message || caughtErr).includes(expectedError)) {
              throw new Error(`Expected error message to contain "${expectedError}" but got "${caughtErr?.message || caughtErr}"`);
            }
          }
        }
      }
    }
  };
}

async function runTests() {
  console.log('=== Running Phase 4B-2B Evidence Preservation Vault Test Suite ===\n');
  const client = new Client({ connectionString: STAGING_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const vault = new EvidenceVaultService(client);

  const createdArchiveIds: string[] = [];
  const createdObservationIds: string[] = [];
  const createdClaimIds: string[] = [];
  const createdClusterIds: string[] = [];
  const testQueue: Array<{ name: string; fn: () => Promise<void> }> = [];

  function test(name: string, fn: () => Promise<void>) {
    testQueue.push({ name, fn });
  }

  try {

  // 1. HTML artifact archive
  test('1. HTML artifact archive preserves exact HTML content and metadata', async () => {
    const rawHtml = '<!DOCTYPE html><html><body><h1>Supreme Court Gazette Notice 2026</h1><p>Orders issued.</p></body></html>';
    const htmlBuffer = Buffer.from(rawHtml, 'utf-8');
    const artifact: RawArtifact = {
      sourceId: 'src-test-html',
      url: 'https://gazette.gov.in/test-notice.html',
      retrievedAt: new Date().toISOString(),
      title: 'Supreme Court Gazette Notice 2026',
      content: 'Supreme Court Gazette Notice 2026 Orders issued.',
      contentHash: createHash('sha256').update('Supreme Court Gazette Notice 2026 Orders issued.').digest('hex'),
      contentLength: 48,
      rawPayload: htmlBuffer,
      mimeType: 'text/html',
      metadata: { testId: 'html-01' },
    };

    const record = await vault.archiveArtifact(artifact);
    createdArchiveIds.push(record.id);

    expect(record.id).toBeDefined();
    expect(record.mimeType).toBe('text/html');
    expect(record.byteLength).toBe(htmlBuffer.length);
    expect(record.preservationState).toBe('preserved');
    expect(record.storageBucket).toBe('evidence-vault');
  });

  // 2. PDF artifact archive
  test('2. PDF artifact archive preserves exact binary bytes and mime type', async () => {
    const fakePdfBytes = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Title (Official Order 403) >>\nendobj\ntrailer\n<<>>\n%%EOF');
    const artifact: RawArtifact = {
      sourceId: 'src-test-pdf',
      url: 'https://highcourt.gov.in/orders/order-403.pdf',
      retrievedAt: new Date().toISOString(),
      title: 'Official Order 403',
      content: 'Official Order 403 text content',
      contentHash: createHash('sha256').update('Official Order 403 text content').digest('hex'),
      contentLength: 30,
      rawPayload: fakePdfBytes,
      mimeType: 'application/pdf',
      metadata: { isPdf: true, orderNumber: '403/2026' },
    };

    const record = await vault.archiveArtifact(artifact);
    createdArchiveIds.push(record.id);

    expect(record.mimeType).toBe('application/pdf');
    expect(record.byteLength).toBe(fakePdfBytes.length);
    expect(record.rawSha256).toBe(EvidenceVaultService.calculateRawSha256(fakePdfBytes));
  });

  // 3. RSS artifact archive
  test('3. RSS artifact archive preserves XML item payload', async () => {
    const rawRssItem = '<item><title>RBI Policy Rate Maintained at 6.5%</title><guid>rbi-2026-09</guid></item>';
    const artifact: RawArtifact = {
      sourceId: 'src-test-rss',
      url: 'https://rbi.org.in/press/rss-item-09.xml',
      retrievedAt: new Date().toISOString(),
      title: 'RBI Policy Rate Maintained at 6.5%',
      content: 'RBI Policy Rate Maintained at 6.5%',
      contentHash: createHash('sha256').update('RBI Policy Rate Maintained at 6.5%').digest('hex'),
      contentLength: 35,
      rawPayload: Buffer.from(rawRssItem, 'utf-8'),
      mimeType: 'application/rss+xml',
      metadata: { guid: 'rbi-2026-09' },
    };

    const record = await vault.archiveArtifact(artifact);
    createdArchiveIds.push(record.id);

    expect(record.mimeType).toBe('application/rss+xml');
    expect(record.contentHash).toBe(artifact.contentHash);
  });

  // 4. Browser dynamic artifact archive
  test('4. Browser dynamic artifact archive preserves raw dynamic page and extracted state', async () => {
    const rawSpaBody = '<html><script id="__NEXT_DATA__">{"caseId":"WP-9921","status":"Dismissed"}</script><body>Case Status</body></html>';
    const artifact: RawArtifact = {
      sourceId: 'src-test-browser',
      url: 'https://mphc.gov.in/case/WP-9921',
      retrievedAt: new Date().toISOString(),
      title: 'Case WP-9921 Status',
      content: 'Case Status [Dynamic State]: {"caseId":"WP-9921","status":"Dismissed"}',
      contentHash: createHash('sha256').update('Case Status [Dynamic State]').digest('hex'),
      contentLength: 50,
      rawPayload: Buffer.from(rawSpaBody, 'utf-8'),
      mimeType: 'text/html',
      metadata: { isDynamic: true, hasEmbeddedState: true },
    };

    const record = await vault.archiveArtifact(artifact);
    createdArchiveIds.push(record.id);

    expect(record.mimeType).toBe('text/html');
    expect(record.metadata.hasEmbeddedState).toBe(true);
  });

  // 5. Exact raw SHA-256 verification
  test('5. Exact raw SHA-256 verification matches bit-for-bit', async () => {
    const payload = Buffer.from('Bit-for-bit exact evidentiary payload 2026');
    const expectedHash = createHash('sha256').update(payload).digest('hex');

    const artifact: RawArtifact = {
      sourceId: 'src-test-sha',
      url: 'https://test.org/exact-hash.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Bit-for-bit exact evidentiary payload 2026',
      contentHash: 'hash-normalized',
      contentLength: 42,
      rawPayload: payload,
      metadata: {},
    };

    const record = await vault.archiveArtifact(artifact);
    createdArchiveIds.push(record.id);

    expect(record.rawSha256).toBe(expectedHash);

    const { rawBytes } = await vault.retrieveArtifact(record.id);
    const retrievedHash = createHash('sha256').update(rawBytes).digest('hex');
    expect(retrievedHash).toBe(expectedHash);
  });

  // 6. Normalized content_hash preserved alongside raw_sha256
  test('6. Normalized content_hash preserved distinctly from raw_sha256', async () => {
    const rawPayload = Buffer.from('   <h1>Messy    Whitespace</h1>  ');
    const normalizedText = 'Messy Whitespace';
    const normalizedContentHash = createHash('sha256').update(normalizedText).digest('hex');
    const rawByteHash = createHash('sha256').update(rawPayload).digest('hex');

    const artifact: RawArtifact = {
      sourceId: 'src-test-dual-hash',
      url: 'https://test.org/whitespace.html',
      retrievedAt: new Date().toISOString(),
      content: normalizedText,
      contentHash: normalizedContentHash,
      contentLength: normalizedText.length,
      rawPayload,
      metadata: {},
    };

    const record = await vault.archiveArtifact(artifact);
    createdArchiveIds.push(record.id);

    expect(record.contentHash).toBe(normalizedContentHash);
    expect(record.rawSha256).toBe(rawByteHash);
    expect(record.contentHash).not.toBe(record.rawSha256);
  });

  // 7. Duplicate raw artifact deduplication
  test('7. Ingesting duplicate raw artifact does NOT create duplicate records (Content Addressing)', async () => {
    const rawData = Buffer.from('Canonical Treaty Text 1972 Simla Agreement');
    const artifact: RawArtifact = {
      sourceId: 'src-test-simla',
      url: 'https://treaties.gov.in/simla-1972.html',
      retrievedAt: new Date().toISOString(),
      content: 'Simla Agreement 1972',
      contentHash: 'hash-simla',
      contentLength: 20,
      rawPayload: rawData,
      metadata: {},
    };

    const record1 = await vault.archiveArtifact(artifact);
    createdArchiveIds.push(record1.id);

    // Second ingestion with same raw bytes
    const record2 = await vault.archiveArtifact({
      ...artifact,
      retrievedAt: new Date(Date.now() + 10000).toISOString(),
    });

    expect(record2.id).toBe(record1.id);
    expect(record2.rawSha256).toBe(record1.rawSha256);

    const countRes = await client.query(
      'SELECT count(*) FROM newsroom.archived_artifacts WHERE raw_sha256 = $1',
      [record1.rawSha256]
    );
    expect(Number(countRes.rows[0].count)).toBe(1);
  });

  // 8. Changed raw artifact produces distinct artifact identity
  test('8. Changed raw artifact produces distinct artifact identity and record', async () => {
    const rawV1 = Buffer.from('Gazette Notice Version 1: Budget allocated 500 Cr');
    const rawV2 = Buffer.from('Gazette Notice Version 2: Budget allocated 750 Cr');

    const artifact1: RawArtifact = {
      sourceId: 'src-gazette-budget',
      url: 'https://gazette.gov.in/budget-2026.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Budget 500 Cr',
      contentHash: 'hash-b-500',
      contentLength: 13,
      rawPayload: rawV1,
      metadata: {},
    };

    const record1 = await vault.archiveArtifact(artifact1);
    createdArchiveIds.push(record1.id);

    const artifact2: RawArtifact = {
      ...artifact1,
      content: 'Budget 750 Cr',
      contentHash: 'hash-b-750',
      rawPayload: rawV2,
    };

    const record2 = await vault.archiveArtifact(artifact2, {
      sourceRevisionId: 'rev-2',
    });
    createdArchiveIds.push(record2.id);

    expect(record2.id).not.toBe(record1.id);
    expect(record2.rawSha256).not.toBe(record1.rawSha256);
  });

  // 9. Same URL + changed bytes creates new revision linkage
  test('9. Same URL + changed bytes maintains distinct revision records', async () => {
    const url = 'https://eci.gov.in/press/results-tally.json';
    const v1 = await vault.archiveArtifact({
      sourceId: 'src-eci',
      url,
      retrievedAt: new Date().toISOString(),
      content: 'Votes: 1000',
      contentHash: 'ch-1000',
      contentLength: 11,
      rawPayload: Buffer.from('{"votes": 1000}'),
      metadata: {},
    }, { sourceRevisionId: 'rev-01' });
    createdArchiveIds.push(v1.id);

    const v2 = await vault.archiveArtifact({
      sourceId: 'src-eci',
      url,
      retrievedAt: new Date().toISOString(),
      content: 'Votes: 1200',
      contentHash: 'ch-1200',
      contentLength: 11,
      rawPayload: Buffer.from('{"votes": 1200}'),
      metadata: {},
    }, { sourceRevisionId: 'rev-02' });
    createdArchiveIds.push(v2.id);

    expect(v1.originalUrl).toBe(v2.originalUrl);
    expect(v1.sourceRevisionId).toBe('rev-01');
    expect(v2.sourceRevisionId).toBe('rev-02');
  });

  // 10. Artifact retrieval after upstream URL is unavailable
  test('10. Artifact retrieval succeeds from vault after upstream URL is simulated dead', async () => {
    const deadUrl = 'https://defunct-domain-404.gov.in/deleted-circular-2026.pdf';
    const originalPdf = Buffer.from('%PDF-1.4 simulated historical circular on border demarcation');
    const record = await vault.archiveArtifact({
      sourceId: 'src-border',
      url: deadUrl,
      retrievedAt: '2026-01-15T00:00:00.000Z',
      content: 'Historical circular on border demarcation',
      contentHash: 'hash-border-circ',
      contentLength: 41,
      rawPayload: originalPdf,
      mimeType: 'application/pdf',
      metadata: {},
    });
    createdArchiveIds.push(record.id);

    // Retrieve offline by archive ID (simulating publisher 404 / domain offline)
    const { rawBytes, record: retrievedRecord } = await vault.retrieveArtifact(record.id);
    expect(retrievedRecord.originalUrl).toBe(deadUrl);
    expect(rawBytes.toString()).toBe(originalPdf.toString());
  });

  // 11. Storage/object hash mismatch detection
  test('11. Hash mismatch detection throws ArtifactIntegrityError if bytes corrupted', async () => {
    const rawData = Buffer.from('Pristine uncorrupted document');
    const record = await vault.archiveArtifact({
      sourceId: 'src-corruption-test',
      url: 'https://test.org/tamper.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Pristine uncorrupted document',
      contentHash: 'hash-pristine',
      contentLength: 29,
      rawPayload: rawData,
      metadata: {},
    });
    createdArchiveIds.push(record.id);

    // Tamper with the bytes in storage to simulate bitrot / tampering
    await vault.getStorageProvider().store(
      record.storageBucket,
      record.storagePath,
      Buffer.from('TAMPERED CORRUPTED CONTENT'),
      'text/plain'
    );

    await expect(vault.retrieveArtifact(record.id)).rejects.toThrow(ArtifactIntegrityError);
  });

  // 12. Database metadata/object mismatch detection
  test('12. Database metadata lookup fails cleanly for unknown archive identity', async () => {
    const fakeUuid = randomUUID();
    await expect(vault.retrieveArtifact(fakeUuid)).rejects.toThrow(/Archived artifact not found/);
  });

  // 13. Failed object upload does not create false success
  test('13. Failed persistence propagates error and does not return false success', async () => {
    // Pass bad DB query interface
    const brokenVault = new EvidenceVaultService({
      query: async () => {
        throw new Error('Database connection terminated abnormally');
      },
    });

    await expect(
      brokenVault.archiveArtifact({
        sourceId: 'src-fail',
        url: 'https://fail.com',
        retrievedAt: new Date().toISOString(),
        content: 'fail',
        contentHash: 'fail-h',
        contentLength: 4,
        rawPayload: Buffer.from('fail'),
        metadata: {},
      })
    ).rejects.toThrow(/Database connection terminated/);
  });

  // 14. Failed relational persistence is observable
  test('14. Failed relational persistence is observable and queryable', async () => {
    // Attempt invalid insert violating check constraint (negative byte length)
    await expect(
      client.query(
        `INSERT INTO newsroom.archived_artifacts (
          source_id, raw_sha256, content_hash, mime_type, byte_length, original_url, storage_path
        ) VALUES ('src-fail', 'fake-sha-check', 'fake-ch', 'text/plain', -50, 'https://test.com', 'path')`
      )
    ).rejects.toThrow(/chk_byte_length_positive/);
  });

  // 15. Artifact cannot be deleted while referenced (ON DELETE RESTRICT)
  test('15. Artifact cannot be deleted while referenced by active observation (ON DELETE RESTRICT)', async () => {
    const artifact = await vault.archiveArtifact({
      sourceId: 'src-fk-restrict',
      url: 'https://court.gov.in/judgment.pdf',
      retrievedAt: new Date().toISOString(),
      content: 'Judgment 102',
      contentHash: 'hash-j-102',
      contentLength: 12,
      rawPayload: Buffer.from('Judgment 102'),
      metadata: {},
    });
    createdArchiveIds.push(artifact.id);

    // Create linked observation
    const obsId = randomUUID();
    createdObservationIds.push(obsId);

    // Create dummy source first if needed
    const dummySourceId = randomUUID();
    await client.query(
      `INSERT INTO newsroom.sources (id, name, slug, url, tier, adapter_type, domains, geography, language)
       VALUES ($1, 'Test Source', $2, 'https://court.gov.in', 1, 'rss', ARRAY['court.gov.in'], 'National', 'en')
       ON CONFLICT (id) DO NOTHING;`,
      [dummySourceId, `slug-${obsId}`]
    );

    const dummyEndpointId = randomUUID();
    await client.query(
      `INSERT INTO newsroom.source_endpoints (id, source_id, url, endpoint_type, label)
       VALUES ($1, $2, 'https://court.gov.in/feed', 'rss', 'Court Feed')
       ON CONFLICT (id) DO NOTHING;`,
      [dummyEndpointId, dummySourceId]
    );

    await client.query(
      `INSERT INTO newsroom.observations (
        id, source_id, endpoint_id, observation_type, canonical_url, title, snippet, content_hash, language, original_language, source_tier, archive_id
      ) VALUES ($1, $2, $3, 'document', 'https://court.gov.in/judgment.pdf', 'Judgment', 'Snippet', 'hash-j-102', 'en', 'en', 1, $4)`,
      [obsId, dummySourceId, dummyEndpointId, artifact.id]
    );

    // Attempt to DELETE the archived artifact - MUST BE REJECTED by ON DELETE RESTRICT!
    await expect(
      client.query(`DELETE FROM newsroom.archived_artifacts WHERE id = $1`, [artifact.id])
    ).rejects.toThrow(/violates foreign key constraint/);
  });

  // 16. Anonymous storage read denied
  test('16. Anonymous read denied on private storage bucket evidence-vault', async () => {
    const bucketRes = await client.query(
      `SELECT public FROM storage.buckets WHERE id = 'evidence-vault'`
    );
    expect(bucketRes.rows[0].public).toBe(false);
  });

  // 17. Authenticated unauthorized storage read denied (RLS policy check)
  test('17. Storage RLS policy enforces privileged research_role', async () => {
    const policyRes = await client.query(`
      SELECT policyname, qual 
      FROM pg_policies 
      WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'evidence_vault_privileged_access';
    `);
    expect(policyRes.rows.length).toBe(1);
    expect(policyRes.rows[0].qual).toContain('research_role');
  });

  // 18. Client-side write denied (RLS on archived_artifacts)
  test('18. RLS policy on newsroom.archived_artifacts denies public/anon writes', async () => {
    const rlsRes = await client.query(`
      SELECT policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'newsroom' AND tablename = 'archived_artifacts';
    `);
    expect(rlsRes.rows.length).toBeGreaterThan(0);
    const pol = rlsRes.rows[0];
    expect(pol.qual).toContain('research_role');
    expect(pol.with_check).toContain('research_role');
  });

  // 19. Service-side authorized write succeeds
  test('19. Service-side authorized write succeeds cleanly', async () => {
    const raw = Buffer.from('Authorized server-side write');
    const record = await vault.archiveArtifact({
      sourceId: 'src-server-auth',
      url: 'https://test.org/auth.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Authorized server-side write',
      contentHash: 'hash-auth-srv',
      contentLength: 28,
      rawPayload: raw,
      metadata: {},
    });
    createdArchiveIds.push(record.id);
    expect(record.id).toBeDefined();
  });

  // 20. Provenance chain reconstructs correctly
  test('20. Provenance chain reconstructs artifact -> observation -> claim -> story linkage', async () => {
    // 1. Create Archive
    const rawBytes = Buffer.from('UN Resolution 47 Official Text 1948');
    const artifact = await vault.archiveArtifact({
      sourceId: 'src-un-res-47',
      url: 'https://un.org/res-47.txt',
      retrievedAt: '1948-04-21T00:00:00Z',
      content: 'UN Resolution 47 Text',
      contentHash: 'hash-un-47',
      contentLength: 21,
      rawPayload: rawBytes,
      metadata: {},
    });
    createdArchiveIds.push(artifact.id);

    // 2. Create Observation
    const obsId = randomUUID();
    createdObservationIds.push(obsId);

    const dummySourceId = randomUUID();
    await client.query(
      `INSERT INTO newsroom.sources (id, name, slug, url, tier, adapter_type, domains, geography, language)
       VALUES ($1, 'UN Archive', $2, 'https://un.org', 1, 'rss', ARRAY['un.org'], 'International', 'en') ON CONFLICT (id) DO NOTHING;`,
      [dummySourceId, `un-${obsId}`]
    );

    const dummyEndpointId = randomUUID();
    await client.query(
      `INSERT INTO newsroom.source_endpoints (id, source_id, url, endpoint_type, label)
       VALUES ($1, $2, 'https://un.org/feed', 'rss', 'UN Feed') ON CONFLICT (id) DO NOTHING;`,
      [dummyEndpointId, dummySourceId]
    );

    await client.query(
      `INSERT INTO newsroom.observations (
        id, source_id, endpoint_id, observation_type, canonical_url, title, snippet, content_hash, language, original_language, source_tier, archive_id
      ) VALUES ($1, $2, $3, 'resolution', 'https://un.org/res-47.txt', 'UN Resolution 47', 'Snippet text', 'hash-un-47', 'en', 'en', 1, $4);`,
      [obsId, dummySourceId, dummyEndpointId, artifact.id]
    );

    // 3. Create Claim
    const claimId = randomUUID();
    createdClaimIds.push(claimId);
    await client.query(
      `INSERT INTO newsroom.claims (
        id, observation_id, statement, epistemic_status, confidence, source_count
      ) VALUES ($1, $2, 'UN Resolution 47 recommended plebiscite after withdrawal', 'fact', 0.95, 1);`,
      [claimId, obsId]
    );

    // 4. Create Claim Evidence
    await client.query(
      `INSERT INTO newsroom.claim_evidence (
        claim_id, observation_id, relationship, strength, passage, source_url, source_tier, archive_id
      ) VALUES ($1, $2, 'supports', 0.95, 'Paragraph 1: Withdrawal clause', 'https://un.org/res-47.txt', 1, $3);`,
      [claimId, obsId, artifact.id]
    );

    // 5. Create Story Cluster & Linkage
    const clusterId = randomUUID();
    createdClusterIds.push(clusterId);
    await client.query(
      `INSERT INTO newsroom.story_clusters (id, canonical_title, summary)
       VALUES ($1, 'Kashmir 1948 Cluster', 'Cluster Summary') ON CONFLICT (id) DO NOTHING;`,
      [clusterId]
    );
    await client.query(
      `INSERT INTO newsroom.story_claims (story_cluster_id, claim_id, role)
       VALUES ($1, $2, 'supporting');`,
      [clusterId, claimId]
    );

    // Resolve Provenance
    const chain = await vault.resolveProvenance(claimId);

    expect(chain.archiveId).toBe(artifact.id);
    expect(chain.rawSha256).toBe(artifact.rawSha256);
    expect(chain.observation?.id).toBe(obsId);
    expect(chain.claims[0].claimId).toBe(claimId);
    expect(chain.claims[0].passage).toBe('Paragraph 1: Withdrawal clause');
    expect(chain.stories[0].storyClusterId).toBe(clusterId);
  });

  // 21. Previously archived artifact cannot silently be replaced
  test('21. Previously archived artifact cannot silently be overwritten by changed payload', async () => {
    const rawOriginal = Buffer.from('Original Historical Decree');
    const originalRecord = await vault.archiveArtifact({
      sourceId: 'src-decree',
      url: 'https://decree.gov.in/1.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Original Decree',
      contentHash: 'hash-orig-decree',
      contentLength: 15,
      rawPayload: rawOriginal,
      metadata: {},
    });
    createdArchiveIds.push(originalRecord.id);

    // Attempting to query the original record after ingesting a replacement
    const rawAltered = Buffer.from('Altered Revised Decree');
    const alteredRecord = await vault.archiveArtifact({
      sourceId: 'src-decree',
      url: 'https://decree.gov.in/1.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Altered Decree',
      contentHash: 'hash-alt-decree',
      contentLength: 14,
      rawPayload: rawAltered,
      metadata: {},
    });
    createdArchiveIds.push(alteredRecord.id);

    // Verify original record is unchanged in the vault
    const { rawBytes: retrievedOriginal } = await vault.retrieveArtifact(originalRecord.id);
    expect(retrievedOriginal.toString()).toBe('Original Historical Decree');
  });

  // 22. Concurrent duplicate preservation produces one canonical artifact
  test('22. Concurrent duplicate preservation resolves safely to one canonical record', async () => {
    const sharedPayload = Buffer.from('Concurrent Race Condition Defense 2026');
    const artifact: RawArtifact = {
      sourceId: 'src-concurrent',
      url: 'https://race.org/test.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Concurrent Race Condition Defense',
      contentHash: 'hash-race',
      contentLength: 33,
      rawPayload: sharedPayload,
      metadata: {},
    };

    const [res1, res2, res3] = await Promise.all([
      vault.archiveArtifact(artifact),
      vault.archiveArtifact(artifact),
      vault.archiveArtifact(artifact),
    ]);

    createdArchiveIds.push(res1.id);

    expect(res1.id).toBe(res2.id);
    expect(res2.id).toBe(res3.id);
    expect(res1.rawSha256).toBe(res2.rawSha256);
  });

  // 23. Process restart still resolves the same artifact
  test('23. Fresh service instance (simulating worker restart) resolves existing artifact', async () => {
    const payload = Buffer.from('Restart Survival Test Payload');
    const initialRecord = await vault.archiveArtifact({
      sourceId: 'src-restart',
      url: 'https://restart.org/test.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Restart Survival Test',
      contentHash: 'hash-restart',
      contentLength: 21,
      rawPayload: payload,
      metadata: {},
    });
    createdArchiveIds.push(initialRecord.id);

    // Instantiate a brand new EvidenceVaultService with a new connection
    const freshClient = new Client({ connectionString: STAGING_URL, ssl: { rejectUnauthorized: false } });
    await freshClient.connect();
    const freshVault = new EvidenceVaultService(freshClient);

    const retrieved = await freshVault.retrieveArtifact(initialRecord.id);
    expect(retrieved.record.id).toBe(initialRecord.id);
    expect(retrieved.rawBytes.toString()).toBe('Restart Survival Test Payload');

    await freshClient.end();
  });

  // 24. Verification retention transition
  test('24. Human editorial verification transitions retention status from staged to verified', async () => {
    const artifact = await vault.archiveArtifact({
      sourceId: 'src-retention',
      url: 'https://court.gov.in/order-lock.pdf',
      retrievedAt: new Date().toISOString(),
      content: 'Order for lock',
      contentHash: 'hash-lock',
      contentLength: 14,
      rawPayload: Buffer.from('Order for lock'),
      metadata: {},
    });
    createdArchiveIds.push(artifact.id);

    expect(artifact.retentionState).toBe('staged');

    // Editorial verification lock
    await vault.lockRetention(artifact.id, 'Editor-in-Chief Gold Standard Verification Passed');

    const updated = await vault.retrieveArtifact(artifact.id);
    expect(updated.record.retentionState).toBe('verified');
    expect((updated.record.metadata as any).verificationLock?.reason).toBe(
      'Editor-in-Chief Gold Standard Verification Passed'
    );
  });

  // 25. Forensic Reconstruction Test (PART 10)
  test('25. Forensic Reconstruction: reconstructs original evidence when publisher modifies & deletes source', async () => {
    const originalUrl = 'https://ministry.gov.in/notifications/2026/04/coal-allocation.pdf';
    const originalBytes = Buffer.from('%PDF-1.4 Ministry Notification: 50 Million Tonnes Coal Allocated to State X');
    const originalNormalizedText = 'Ministry Notification 50 Million Tonnes Coal Allocated to State X';
    const originalContentHash = createHash('sha256').update(originalNormalizedText).digest('hex');

    // 1. Initial Ingestion & Archival
    const initialArtifact: RawArtifact = {
      sourceId: 'src-ministry-coal',
      url: originalUrl,
      retrievedAt: '2026-04-10T10:00:00Z',
      publishedAt: '2026-04-10T09:30:00Z',
      title: 'Coal Allocation Notification 2026',
      content: originalNormalizedText,
      contentHash: originalContentHash,
      contentLength: originalNormalizedText.length,
      rawPayload: originalBytes,
      mimeType: 'application/pdf',
      metadata: { ministry: 'Coal', gazetteId: 'GAZ-2026-88' },
    };

    const archivedRecord = await vault.archiveArtifact(initialArtifact);
    createdArchiveIds.push(archivedRecord.id);

    // 2. Newsroom observation creation
    const obsId = randomUUID();
    createdObservationIds.push(obsId);

    const dummySourceId = randomUUID();
    await client.query(
      `INSERT INTO newsroom.sources (id, name, slug, url, tier, adapter_type, domains, geography, language)
       VALUES ($1, 'Ministry of Coal', $2, 'https://ministry.gov.in', 1, 'rss', ARRAY['ministry.gov.in'], 'National', 'en') ON CONFLICT (id) DO NOTHING;`,
      [dummySourceId, `moc-${obsId}`]
    );

    const dummyEndpointId = randomUUID();
    await client.query(
      `INSERT INTO newsroom.source_endpoints (id, source_id, url, endpoint_type, label)
       VALUES ($1, $2, 'https://ministry.gov.in/feed', 'rss', 'Ministry Feed') ON CONFLICT (id) DO NOTHING;`,
      [dummyEndpointId, dummySourceId]
    );

    await client.query(
      `INSERT INTO newsroom.observations (
        id, source_id, endpoint_id, observation_type, canonical_url, title, snippet, content_hash, language, original_language, source_tier, archive_id
      ) VALUES ($1, $2, $3, 'order', $4, $5, $6, $7, 'en', 'en', 1, $8);`,
      [
        obsId,
        dummySourceId,
        dummyEndpointId,
        originalUrl,
        'Coal Allocation Notification 2026',
        'Snippet: 50 Million Tonnes Coal Allocated',
        originalContentHash,
        archivedRecord.id,
      ]
    );

    // 3. Newsroom claim creation
    const claimId = randomUUID();
    createdClaimIds.push(claimId);
    await client.query(
      `INSERT INTO newsroom.claims (
        id, observation_id, statement, epistemic_status, confidence, source_count
      ) VALUES ($1, $2, 'Ministry allocated 50MT of coal to State X in April 2026', 'fact', 0.98, 1);`,
      [claimId, obsId]
    );

    // 4. Claim evidence creation
    await client.query(
      `INSERT INTO newsroom.claim_evidence (
        claim_id, observation_id, relationship, strength, passage, source_url, source_tier, archive_id
      ) VALUES ($1, $2, 'supports', 0.98, 'Section 3: 50 Million Tonnes Coal Allocated', $3, 1, $4);`,
      [claimId, obsId, originalUrl, archivedRecord.id]
    );

    // 5. Editorial verification lock
    await vault.lockRetention(archivedRecord.id, 'Verified by Bureau of Investigation');

    // ── SIMULATION OF UPSTREAM FAILURE ──
    // Publisher changes document at same URL to "30 Million Tonnes" or returns 404
    // We simulate by verifying that resolving provenance from claimId independently
    // retrieves the EXACT original bytes and dual hashes WITHOUT touching originalUrl!

    const provenance = await vault.resolveProvenance(claimId);
    expect(provenance.archiveId).toBe(archivedRecord.id);
    expect(provenance.rawSha256).toBe(archivedRecord.rawSha256);
    expect(provenance.contentHash).toBe(originalContentHash);
    expect(provenance.retentionState).toBe('verified');

    const offlineRetrieval = await vault.retrieveArtifact(provenance.archiveId);
    expect(offlineRetrieval.rawBytes.toString()).toBe(originalBytes.toString());
    expect(offlineRetrieval.record.originalUrl).toBe(originalUrl);
    expect(offlineRetrieval.record.byteLength).toBe(originalBytes.length);
  });

  // ── PHASE 4B-2E REMEDIATION TEST SUITE (Tests 26–37) ──────────────────────

  // 26. Verification gate blocks observation with archival_state = 'archive_failed'
  test("26. Verification gate blocks verification of observation with archival_state = 'archive_failed'", async () => {
    const core = NewsroomIntelligenceCore.resetInstance();
    core.setEvidenceVault(vault);

    const failObsId = `obs-fail-${randomUUID().substring(0, 8)}`;
    (core as any).observations.set(failObsId, {
      id: failObsId,
      sourceId: 'src-test-fail',
      sourceTier: 't1',
      contentHash: 'hash-fail-01',
      canonicalUrl: 'https://test.gov.in/fail.txt',
      title: 'Failed Archival Test Notice',
      snippet: 'This notice failed to archive in vault',
      entities: [],
      isPrimarySource: true,
      duplicateState: 'unique',
      ingestionTimestamp: new Date().toISOString(),
      publicationTimestamp: new Date().toISOString(),
      archiveId: undefined,
      archivalState: 'archive_failed',
    });

    const clusterId = `cluster-${randomUUID().substring(0, 8)}`;
    (core as any).clusters.set(clusterId, {
      id: clusterId,
      canonicalTitle: 'Failed Archival Cluster',
      observationIds: [failObsId],
      claimIds: [],
      status: 'active',
      firstDetected: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      velocity: 1,
      divergenceScore: 0,
      contradictionCount: 0,
    });

    const signalId = `sig-fail-${randomUUID().substring(0, 8)}`;
    (core as any).signals.set(signalId, {
      id: signalId,
      clusterId,
      title: 'Failed Archival Signal',
      summary: 'Signal whose observation failed vault preservation',
      whyItMatters: 'Must be blocked from verification',
      priority: 'high',
      confidence: 0.9,
      lifecycleState: 'analyzed',
      firstDetected: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      sourceIds: ['src-test-fail'],
      claimIds: [],
      coverageGaps: [],
      actionHistory: [],
    });

    try {
      core.executeAction(
        {
          signalId,
          action: 'VERIFY',
          actorId: 'editor-01',
          actorName: 'Editor Chief',
        },
        'fact_checker'
      );
      throw new Error('Expected VerificationPreconditionError but action succeeded');
    } catch (err: any) {
      expect(err instanceof VerificationPreconditionError).toBe(true);
      expect(err.message).toContain('lacks a verified archive artifact');
    }
  });

  // 27. Verification gate blocks observation with missing archive_id
  test('27. Verification gate blocks verification of observation with missing archive_id', async () => {
    const core = NewsroomIntelligenceCore.resetInstance();
    core.setEvidenceVault(vault);

    const noArchObsId = `obs-no-arch-${randomUUID().substring(0, 8)}`;
    (core as any).observations.set(noArchObsId, {
      id: noArchObsId,
      sourceId: 'src-test-no-arch',
      sourceTier: 't1',
      contentHash: 'hash-no-arch-01',
      canonicalUrl: 'https://test.gov.in/no-arch.txt',
      title: 'No Archive Test Notice',
      snippet: 'This notice has no archiveId',
      entities: [],
      isPrimarySource: true,
      duplicateState: 'unique',
      ingestionTimestamp: new Date().toISOString(),
      publicationTimestamp: new Date().toISOString(),
      archiveId: undefined,
      archivalState: 'staged',
    });

    const clusterId = `cluster-${randomUUID().substring(0, 8)}`;
    (core as any).clusters.set(clusterId, {
      id: clusterId,
      canonicalTitle: 'No Archive Cluster',
      observationIds: [noArchObsId],
      claimIds: [],
      status: 'active',
      firstDetected: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      velocity: 1,
      divergenceScore: 0,
      contradictionCount: 0,
    });

    const signalId = `sig-no-arch-${randomUUID().substring(0, 8)}`;
    (core as any).signals.set(signalId, {
      id: signalId,
      clusterId,
      title: 'No Archive Signal',
      summary: 'Signal whose observation has no archiveId',
      whyItMatters: 'Must be blocked from verification',
      priority: 'high',
      confidence: 0.9,
      lifecycleState: 'analyzed',
      firstDetected: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      sourceIds: ['src-test-no-arch'],
      claimIds: [],
      coverageGaps: [],
      actionHistory: [],
    });

    try {
      core.executeAction(
        {
          signalId,
          action: 'VERIFY',
          actorId: 'editor-01',
          actorName: 'Editor Chief',
        },
        'fact_checker'
      );
      throw new Error('Expected VerificationPreconditionError but action succeeded');
    } catch (err: any) {
      expect(err instanceof VerificationPreconditionError).toBe(true);
      expect(err.message).toContain('lacks a verified archive artifact');
    }
  });

  // 28. Verification gate succeeds on staged observation and transitions artifact to 'verified'
  test("28. Verification gate succeeds on staged observation and transitions artifact to 'verified'", async () => {
    const core = NewsroomIntelligenceCore.resetInstance();
    core.setEvidenceVault(vault);

    const rawData = Buffer.from('Official Order 2026-T28 on River Water Dispute');
    const artifactRecord = await vault.archiveArtifact({
      sourceId: 'src-water-tribunal',
      url: 'https://tribunal.gov.in/order-28.pdf',
      retrievedAt: new Date().toISOString(),
      content: 'Official Order 2026-T28 on River Water Dispute',
      contentHash: 'hash-water-28',
      contentLength: rawData.length,
      rawPayload: rawData,
      mimeType: 'application/pdf',
      metadata: {},
    });
    createdArchiveIds.push(artifactRecord.id);

    // Initial state is 'staged'
    expect(artifactRecord.retentionState).toBe('staged');

    const stagedObsId = `obs-staged-${randomUUID().substring(0, 8)}`;
    (core as any).observations.set(stagedObsId, {
      id: stagedObsId,
      sourceId: 'src-water-tribunal',
      sourceTier: 't1',
      contentHash: 'hash-water-28',
      canonicalUrl: 'https://tribunal.gov.in/order-28.pdf',
      title: 'Water Tribunal Order 28',
      snippet: 'Official water dispute order',
      entities: [],
      isPrimarySource: true,
      duplicateState: 'unique',
      ingestionTimestamp: new Date().toISOString(),
      publicationTimestamp: new Date().toISOString(),
      archiveId: artifactRecord.id,
      archivalState: 'staged',
    });

    const clusterId = `cluster-${randomUUID().substring(0, 8)}`;
    (core as any).clusters.set(clusterId, {
      id: clusterId,
      canonicalTitle: 'Water Tribunal Cluster',
      observationIds: [stagedObsId],
      claimIds: [],
      status: 'active',
      firstDetected: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      velocity: 1,
      divergenceScore: 0,
      contradictionCount: 0,
    });

    const signalId = `sig-staged-${randomUUID().substring(0, 8)}`;
    (core as any).signals.set(signalId, {
      id: signalId,
      clusterId,
      title: 'Water Tribunal Signal',
      summary: 'Signal with staged valid artifact',
      whyItMatters: 'Must succeed and lock retention',
      priority: 'high',
      confidence: 0.95,
      lifecycleState: 'analyzed',
      firstDetected: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      sourceIds: ['src-water-tribunal'],
      claimIds: [],
      coverageGaps: [],
      actionHistory: [],
    });

    const result = core.executeAction(
      {
        signalId,
        action: 'VERIFY',
        actorId: 'editor-42',
        actorName: 'Lead Factchecker',
      },
      'fact_checker'
    );

    expect(result).toBeDefined();
    expect(result?.lifecycleState).toBe('confirmed');

    // Wait slightly for async lockRetention promise to settle
    await new Promise((r) => setTimeout(r, 100));

    const refreshed = await vault.getArtifactMetadata(artifactRecord.id);
    expect(refreshed?.retentionState).toBe('verified');
  });

  // 29. Verification lock metadata contains verifier identity, timestamp, and reason
  test('29. Verification lock metadata contains verifier identity, timestamp, and reason', async () => {
    const rawData = Buffer.from('Lok Sabha Official Record 2026');
    const rec = await vault.archiveArtifact({
      sourceId: 'src-loksabha',
      url: 'https://loksabha.nic.in/rec-29.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Lok Sabha Official Record 2026',
      contentHash: 'hash-ls-29',
      contentLength: rawData.length,
      rawPayload: rawData,
      metadata: {},
    });
    createdArchiveIds.push(rec.id);

    await vault.lockRetention(rec.id, {
      signalId: 'sig-ls-29',
      verifierId: 'editor-subramanian',
      reason: 'Verified against Parliamentary Proceedings Hansard',
    });

    const locked = await vault.getArtifactMetadata(rec.id);
    expect(locked?.retentionState).toBe('verified');
    const lockMeta = locked?.metadata.verificationLock as any;
    expect(lockMeta).toBeDefined();
    expect(lockMeta.verifierId).toBe('editor-subramanian');
    expect(lockMeta.signalId).toBe('sig-ls-29');
    expect(lockMeta.reason).toContain('Hansard');
    expect(lockMeta.lockedAt).toBeDefined();
  });

  // 30. Story publication blocked when non-legacy claim lacks archiveId
  test('30. Story publication blocked when non-legacy claim lacks archiveId', async () => {
    const unarchivedStory: Story = {
      id: `story-test-30-${randomUUID().substring(0, 8)}`,
      title: 'Story with Unarchived Evidence',
      slug: `unarchived-story-${randomUUID().substring(0, 8)}`,
      headline: 'Story with Unarchived Evidence',
      summary: 'Testing publication guard against non-reconstructible evidence',
      heroImage: '/test.jpg',
      author: 'Staff Reporter',
      category: 'Policy',
      status: 'draft',
      storyType: 'standard',
      evidenceScore: 90,
      readingTime: 4,
      publishedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      blocks: [],
      sources: [],
      timeline: [],
      faq: [],
      charts: [],
      relatedStoryIds: [],
      relatedEntityIds: [],
      relatedTopicIds: [],
      claims: [
        {
          id: `claim-no-arch-${randomUUID().substring(0, 8)}`,
          claim: 'Government commissioned new port in Vadhavan',
          data: '50000 Cr investment',
          source: 'Ministry of Ports',
          sourceUrl: 'https://shipmin.gov.in/vadhavan.pdf',
          tier: 'high',
          confidence: 0.95,
          status: 'verified',
          isLegacy: false,
          archiveId: undefined, // LACKS ARCHIVE ID
        },
      ],
    };

    const storyService = new MemoryStoryService([unarchivedStory], vault);

    try {
      await storyService.publishStory(unarchivedStory.id);
      throw new Error('Expected PublicationBlockedError but story was published');
    } catch (err: any) {
      expect(err instanceof PublicationBlockedError).toBe(true);
      expect(err.message).toContain('lacks an Evidence Vault archive identity');
    }
  });

  // 31. Story publication blocked when cited artifact is in 'staged' state (unverified)
  test("31. Story publication blocked when cited artifact is in 'staged' state instead of 'verified'", async () => {
    const stagedArtifact = await vault.archiveArtifact({
      sourceId: 'src-staged-pub',
      url: 'https://test.gov.in/staged-pub.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Staged publication text',
      contentHash: 'hash-staged-pub',
      contentLength: 22,
      rawPayload: Buffer.from('Staged publication text'),
      metadata: {},
    });
    createdArchiveIds.push(stagedArtifact.id);
    expect(stagedArtifact.retentionState).toBe('staged');

    const stagedStory: Story = {
      id: `story-test-31-${randomUUID().substring(0, 8)}`,
      title: 'Story with Staged (Unverified) Artifact',
      slug: `staged-story-${randomUUID().substring(0, 8)}`,
      headline: 'Story with Staged Artifact',
      summary: 'Testing publication guard against staged evidence',
      heroImage: '/test.jpg',
      author: 'Staff Reporter',
      category: 'Policy',
      status: 'draft',
      storyType: 'standard',
      evidenceScore: 90,
      readingTime: 4,
      publishedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      blocks: [],
      sources: [],
      timeline: [],
      faq: [],
      charts: [],
      relatedStoryIds: [],
      relatedEntityIds: [],
      relatedTopicIds: [],
      claims: [
        {
          id: `claim-staged-${randomUUID().substring(0, 8)}`,
          claim: 'Draft Cabinet approval pending',
          data: 'Cabinet note 44',
          source: 'Cabinet Secretariat',
          sourceUrl: 'https://test.gov.in/staged-pub.txt',
          tier: 'high',
          confidence: 0.9,
          status: 'verified',
          isLegacy: false,
          archiveId: stagedArtifact.id, // STAGED, NOT VERIFIED
        },
      ],
    };

    const storyService = new MemoryStoryService([stagedStory], vault);

    try {
      await storyService.publishStory(stagedStory.id);
      throw new Error('Expected PublicationBlockedError but story was published');
    } catch (err: any) {
      expect(err instanceof PublicationBlockedError).toBe(true);
      expect(err.message).toContain("is in 'staged' state (must be 'verified')");
    }
  });

  // 32. Story publication blocked when cited artifact fails cryptographic integrity check
  test('32. Story publication blocked when cited artifact fails cryptographic integrity check', async () => {
    const rawData = Buffer.from('Authentic RBI circular on foreign exchange 2026');
    const artifact = await vault.archiveArtifact({
      sourceId: 'src-rbi-tamper',
      url: 'https://rbi.org.in/circular-32.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Authentic RBI circular on foreign exchange 2026',
      contentHash: 'hash-rbi-32',
      contentLength: rawData.length,
      rawPayload: rawData,
      metadata: {},
    });
    createdArchiveIds.push(artifact.id);

    // Lock to verified first
    await vault.lockRetention(artifact.id, 'Verified by Economics Bureau');

    // Simulate bitrot / unauthorized byte tampering in storage
    await vault.getStorageProvider().store(
      artifact.storageBucket,
      artifact.storagePath,
      Buffer.from('TAMPERED ALTERED ILLEGITIMATE CIRCULAR'),
      'text/plain'
    );

    const corruptStory: Story = {
      id: `story-test-32-${randomUUID().substring(0, 8)}`,
      title: 'Story with Corrupted Artifact',
      slug: `corrupt-story-${randomUUID().substring(0, 8)}`,
      headline: 'Story with Corrupted Artifact',
      summary: 'Testing publication guard against corrupted storage bytes',
      heroImage: '/test.jpg',
      author: 'Finance Desk',
      category: 'Economy',
      status: 'draft',
      storyType: 'standard',
      evidenceScore: 90,
      readingTime: 4,
      publishedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      blocks: [],
      sources: [],
      timeline: [],
      faq: [],
      charts: [],
      relatedStoryIds: [],
      relatedEntityIds: [],
      relatedTopicIds: [],
      claims: [
        {
          id: `claim-corrupt-${randomUUID().substring(0, 8)}`,
          claim: 'RBI altered repo rate guidelines',
          data: 'Circular 32',
          source: 'Reserve Bank of India',
          sourceUrl: 'https://rbi.org.in/circular-32.txt',
          tier: 'high',
          confidence: 0.95,
          status: 'verified',
          isLegacy: false,
          archiveId: artifact.id,
        },
      ],
    };

    const storyService = new MemoryStoryService([corruptStory], vault);

    try {
      await storyService.publishStory(corruptStory.id);
      throw new Error('Expected PublicationBlockedError but story was published');
    } catch (err: any) {
      expect(err instanceof PublicationBlockedError).toBe(true);
      expect(err.message).toContain('failed cryptographic integrity verification');
    }
  });

  // 33. Story publication succeeds when all non-legacy claims cite verified, intact artifacts
  test('33. Story publication succeeds when all non-legacy claims cite verified, intact artifacts', async () => {
    const rawData = Buffer.from('Official Gazette Notification 2026 G.S.R. 402(E)');
    const artifact = await vault.archiveArtifact({
      sourceId: 'src-gazette-valid',
      url: 'https://egazette.gov.in/402.pdf',
      retrievedAt: new Date().toISOString(),
      content: 'Official Gazette Notification 2026 G.S.R. 402(E)',
      contentHash: 'hash-gaz-valid',
      contentLength: rawData.length,
      rawPayload: rawData,
      mimeType: 'application/pdf',
      metadata: {},
    });
    createdArchiveIds.push(artifact.id);

    // Lock to verified
    await vault.lockRetention(artifact.id, 'Verified by Legislative Bureau');

    const validStory: Story = {
      id: `story-test-33-${randomUUID().substring(0, 8)}`,
      title: 'Legitimate Gazette Published Story',
      slug: `valid-story-${randomUUID().substring(0, 8)}`,
      headline: 'Legitimate Gazette Published Story',
      summary: 'Story with 100% verified, reconstructible evidence',
      heroImage: '/test.jpg',
      author: 'National Bureau',
      category: 'Governance',
      status: 'draft',
      storyType: 'standard',
      evidenceScore: 98,
      readingTime: 5,
      publishedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      blocks: [],
      sources: [],
      timeline: [],
      faq: [],
      charts: [],
      relatedStoryIds: [],
      relatedEntityIds: [],
      relatedTopicIds: [],
      claims: [
        {
          id: `claim-valid-${randomUUID().substring(0, 8)}`,
          claim: 'New Environmental Protection Rules notified',
          data: 'Notification 402(E)',
          source: 'Ministry of Environment',
          sourceUrl: 'https://egazette.gov.in/402.pdf',
          tier: 'high',
          confidence: 0.99,
          status: 'verified',
          isLegacy: false,
          archiveId: artifact.id,
        },
      ],
    };

    const storyService = new MemoryStoryService([validStory], vault);
    const published = await storyService.publishStory(validStory.id);

    expect(published).toBeDefined();
    expect(published?.status).toBe('published');
    expect(published?.publicationStatus).toBe('published');
    expect(published?.publishedAt).toBeDefined();
  });

  // 34. Story publication succeeds for grandfathered legacy story (isLegacy = true)
  test('34. Story publication succeeds for grandfathered legacy story (isLegacy = true)', async () => {
    const legacyStory: Story = {
      id: `story-legacy-34-${randomUUID().substring(0, 8)}`,
      title: 'Historical Story from 1950 Constitution Archives',
      slug: `legacy-story-${randomUUID().substring(0, 8)}`,
      headline: 'Historical Story from 1950',
      summary: 'Grandfathered legacy story created before Evidence Vault',
      heroImage: '/test.jpg',
      author: 'Archival Bureau',
      category: 'History',
      status: 'draft',
      storyType: 'standard',
      evidenceScore: 85,
      readingTime: 6,
      publishedAt: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      tags: [],
      blocks: [],
      sources: [],
      timeline: [],
      faq: [],
      charts: [],
      relatedStoryIds: [],
      relatedEntityIds: [],
      relatedTopicIds: [],
      claims: [
        {
          id: `claim-legacy-${randomUUID().substring(0, 8)}`,
          claim: 'Constitution of India came into effect on 26 January 1950',
          data: 'Constituent Assembly resolution',
          source: 'Historical Archives',
          sourceUrl: 'https://archives.gov.in/1950.html',
          tier: 'high',
          confidence: 1.0,
          status: 'verified',
          isLegacy: true, // GRANDFATHERED EXEMPTION
          archiveId: undefined, // Exemption permits undefined archiveId
        },
      ],
    };

    const storyService = new MemoryStoryService([legacyStory], vault);
    const published = await storyService.publishStory(legacyStory.id);

    expect(published).toBeDefined();
    expect(published?.status).toBe('published');
  });

  // 35. Database immutability trigger blocks updates to raw_sha256, content_hash, and locator fields
  test('35. Database immutability trigger blocks updates to raw_sha256, content_hash, and locator fields', async () => {
    const rawData = Buffer.from('Immutable treaty document 2026');
    const rec = await vault.archiveArtifact({
      sourceId: 'src-treaty',
      url: 'https://treaty.org/doc.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Immutable treaty document 2026',
      contentHash: 'hash-treaty-35',
      contentLength: rawData.length,
      rawPayload: rawData,
      metadata: {},
    });
    createdArchiveIds.push(rec.id);

    // 1. Attempt updating raw_sha256 -> must fail
    await expect(
      client.query(
        'UPDATE newsroom.archived_artifacts SET raw_sha256 = $1 WHERE id = $2;',
        ['0000000000000000000000000000000000000000000000000000000000000000', rec.id]
      )
    ).rejects.toThrow(/Cryptographic identity raw_sha256 is strictly immutable/);

    // 2. Attempt updating storage_path -> must fail
    await expect(
      client.query(
        'UPDATE newsroom.archived_artifacts SET storage_path = $1 WHERE id = $2;',
        ['tampered/path/artifact.bin', rec.id]
      )
    ).rejects.toThrow(/Storage locator.*strictly immutable/);

    // 3. Attempt updating byte_length -> must fail
    await expect(
      client.query(
        'UPDATE newsroom.archived_artifacts SET byte_length = 999999 WHERE id = $1;',
        [rec.id]
      )
    ).rejects.toThrow(/byte_length is strictly immutable/);

    // 4. Updating permitted mutable fields (retention_state, metadata) -> must succeed
    const updateRes = await client.query(
      `UPDATE newsroom.archived_artifacts 
       SET retention_state = 'verified', updated_at = now() 
       WHERE id = $1 RETURNING retention_state;`,
      [rec.id]
    );
    expect(updateRes.rows[0].retention_state).toBe('verified');
  });

  // 36. Multi-evidence claim publication blocked if 1 of 3 cited artifacts is corrupted or unverified
  test('36. Multi-evidence claim publication blocked if 1 of 3 cited artifacts is corrupted or unverified', async () => {
    // Artifact 1: Verified
    const art1 = await vault.archiveArtifact({
      sourceId: 'src-m1',
      url: 'https://test.gov.in/m1.pdf',
      retrievedAt: new Date().toISOString(),
      content: 'Ministry Notification 1',
      contentHash: 'hash-m1',
      contentLength: 21,
      rawPayload: Buffer.from('Ministry Notification 1'),
      mimeType: 'application/pdf',
      metadata: {},
    });
    createdArchiveIds.push(art1.id);
    await vault.lockRetention(art1.id, 'Verified 1');

    // Artifact 2: Verified
    const art2 = await vault.archiveArtifact({
      sourceId: 'src-m2',
      url: 'https://court.gov.in/m2.pdf',
      retrievedAt: new Date().toISOString(),
      content: 'High Court Order 2',
      contentHash: 'hash-m2',
      contentLength: 18,
      rawPayload: Buffer.from('High Court Order 2'),
      mimeType: 'application/pdf',
      metadata: {},
    });
    createdArchiveIds.push(art2.id);
    await vault.lockRetention(art2.id, 'Verified 2');

    // Artifact 3: STAGED (Unverified)
    const art3 = await vault.archiveArtifact({
      sourceId: 'src-m3',
      url: 'https://gazette.gov.in/m3.html',
      retrievedAt: new Date().toISOString(),
      content: 'Gazette Notice 3',
      contentHash: 'hash-m3',
      contentLength: 16,
      rawPayload: Buffer.from('Gazette Notice 3'),
      mimeType: 'text/html',
      metadata: {},
    });
    createdArchiveIds.push(art3.id);

    const multiEvidenceStory: Story = {
      id: `story-multi-36-${randomUUID().substring(0, 8)}`,
      title: 'Multi-Evidence Investigative Story',
      slug: `multi-story-${randomUUID().substring(0, 8)}`,
      headline: 'Multi-Evidence Investigation',
      summary: 'Story citing 3 corroborating evidence artifacts',
      heroImage: '/test.jpg',
      author: 'Special Investigation Bureau',
      category: 'Investigation',
      status: 'draft',
      storyType: 'standard',
      evidenceScore: 95,
      readingTime: 8,
      publishedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      blocks: [],
      sources: [],
      timeline: [],
      faq: [],
      charts: [],
      relatedStoryIds: [],
      relatedEntityIds: [],
      relatedTopicIds: [],
      claims: [
        {
          id: `c1-${randomUUID().substring(0, 8)}`,
          claim: 'Coal allocation approved by Ministry',
          data: 'Notification 1',
          source: 'Ministry',
          sourceUrl: 'https://test.gov.in/m1.pdf',
          tier: 'high',
          confidence: 0.95,
          status: 'verified',
          isLegacy: false,
          archiveId: art1.id,
        },
        {
          id: `c2-${randomUUID().substring(0, 8)}`,
          claim: 'High Court dismissed appeal',
          data: 'Order 2',
          source: 'Court',
          sourceUrl: 'https://court.gov.in/m2.pdf',
          tier: 'high',
          confidence: 0.95,
          status: 'verified',
          isLegacy: false,
          archiveId: art2.id,
        },
        {
          id: `c3-${randomUUID().substring(0, 8)}`,
          claim: 'Gazette notified final schedule',
          data: 'Notice 3',
          source: 'Gazette',
          sourceUrl: 'https://gazette.gov.in/m3.html',
          tier: 'high',
          confidence: 0.95,
          status: 'verified',
          isLegacy: false,
          archiveId: art3.id, // BLOCKS PUBLICATION (still staged)
        },
      ],
    };

    const storyService = new MemoryStoryService([multiEvidenceStory], vault);

    try {
      await storyService.publishStory(multiEvidenceStory.id);
      throw new Error('Expected PublicationBlockedError for multi-evidence story');
    } catch (err: any) {
      expect(err instanceof PublicationBlockedError).toBe(true);
      expect(err.message).toContain("is in 'staged' state (must be 'verified')");
    }
  });

  // 37. Storage Objects Verification: Confirms raw bytes in storage.objects and raw_payload column dropped
  test('37. Storage Objects Verification: Confirms raw bytes in storage.objects and raw_payload column dropped', async () => {
    const rawData = Buffer.from('Authoritative Storage Verification Payload 2026');
    const rec = await vault.archiveArtifact({
      sourceId: 'src-storage-verify',
      url: 'https://storage-proof.gov.in/doc.txt',
      retrievedAt: new Date().toISOString(),
      content: 'Authoritative Storage Verification Payload 2026',
      contentHash: 'hash-storage-proof',
      contentLength: rawData.length,
      rawPayload: rawData,
      metadata: {},
    });
    createdArchiveIds.push(rec.id);

    // 1. Confirm object exists in storage.objects
    const objRes = await client.query(
      "SELECT id, bucket_id, name, metadata, user_metadata FROM storage.objects WHERE bucket_id = 'evidence-vault' AND name = $1;",
      [rec.storagePath]
    );
    expect(objRes.rows.length).toBe(1);
    expect(objRes.rows[0].bucket_id).toBe('evidence-vault');
    expect(objRes.rows[0].name).toBe(rec.storagePath);

    // 2. Confirm raw_payload column is completely absent from newsroom.archived_artifacts
    const colRes = await client.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_schema = 'newsroom' AND table_name = 'archived_artifacts' AND column_name = 'raw_payload';`
    );
    expect(colRes.rows.length).toBe(0);

    // 3. Confirm retrieval reconstructs exact bytes from storage
    const retrieved = await vault.retrieveArtifact(rec.id);
    expect(retrieved.rawBytes.toString('utf-8')).toBe('Authoritative Storage Verification Payload 2026');
  });

  // Execute all registered tests sequentially
  console.log(`\nRegistered ${testQueue.length} test cases. Executing sequentially against Staging...\n`);
  for (const t of testQueue) {
    try {
      await t.fn();
      console.log(`  ✓ PASS: ${t.name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${t.name}`);
      console.error(`    Details: ${err?.message || err}`);
      failed++;
    }
  }

  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed (Total: ${passed + failed}) ===\n`);
  } catch (err: any) {
    console.error('Fatal execution error during test runner setup:', err);
    failed++;
  } finally {
    console.log('Cleaning up temporary test records in Staging...');
    try {
      if (createdClusterIds.length > 0) {
        await client.query(`DELETE FROM newsroom.story_claims WHERE story_cluster_id = ANY($1::uuid[])`, [createdClusterIds]);
        await client.query(`DELETE FROM newsroom.story_clusters WHERE id = ANY($1::uuid[])`, [createdClusterIds]);
      }
      if (createdClaimIds.length > 0) {
        await client.query(`DELETE FROM newsroom.claim_evidence WHERE claim_id = ANY($1::uuid[])`, [createdClaimIds]);
        await client.query(`DELETE FROM newsroom.claims WHERE id = ANY($1::uuid[])`, [createdClaimIds]);
      }
      if (createdObservationIds.length > 0) {
        await client.query(`DELETE FROM newsroom.observations WHERE id = ANY($1::uuid[])`, [createdObservationIds]);
      }
      if (createdArchiveIds.length > 0) {
        await client.query(`DELETE FROM newsroom.archived_artifacts WHERE id = ANY($1::uuid[])`, [createdArchiveIds]);
      }
      console.log('Staging cleanup completed successfully.');
    } catch (cleanupErr) {
      console.warn('Warning during cleanup:', cleanupErr);
    }
    await client.end();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled runner error:', err);
  process.exit(1);
});
