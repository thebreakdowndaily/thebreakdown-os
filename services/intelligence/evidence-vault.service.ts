/**
 * ─── Evidence Preservation Vault Service (Phase 4B-2E Remediation) ────────────
 *
 * Governing Documents:
 *   - AGENTS.md (Verification & Idempotency, Knowledge First)
 *   - docs/editorial/editorial-constitution.md (Article III - Evidence Hierarchy)
 *   - .planning/PHASE-4B-2A-EVIDENCE-PRESERVATION-DESIGN.md
 *   - .planning/PHASE-4B-2C-EVIDENCE-VAULT-FORENSIC-VALIDATION.md
 *   - .planning/PHASE-4B-2D-EVIDENCE-PROVENANCE-REMEDIATION-DESIGN.md
 *
 * Objectives:
 *   1. Calculate exact cryptographic SHA-256 over raw upstream bytes.
 *   2. Enforce content-addressed deduplication (identical bytes resolve to existing artifact).
 *   3. Authoritative object storage: Store raw artifact bytes in Supabase Storage (`evidence-vault/artifacts/${raw_sha256}.bin`).
 *   4. Relational metadata ledger: Maintain immutable provenance metadata in `newsroom.archived_artifacts`.
 *   5. Deprecate and eliminate PostgreSQL `raw_payload BYTEA` to avoid heap bloat and split-brain storage.
 *   6. Provide cryptographic integrity verification upon retrieval and prior to publication.
 *   7. Support two-stage preservation: staged at ingestion -> locked on human verification (`retention_state = 'verified'`).
 *   8. Strict referential integrity (ON DELETE RESTRICT on observations and claims).
 */

import { createHash } from 'crypto';
import type { Client as PgClient } from 'pg';
import type { RawArtifact } from '../radar/types';

declare const __non_webpack_require__: typeof require | undefined;

function getPgClientClass(): any {
  if (typeof window !== 'undefined') return null;
  try {
    const req = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : require;
    return req('pg').Client;
  } catch {
    return null;
  }
}

export interface ArchivedArtifactRecord {
  id: string;
  sourceId: string;
  sourceRevisionId?: string | null;
  observationId?: string | null;
  rawSha256: string;
  contentHash: string;
  mimeType: string;
  byteLength: number;
  retrievalTimestamp: string;
  originalUrl: string;
  storageBucket: string;
  storagePath: string;
  preservationState: 'staged' | 'preserved' | 'failed' | 'corrupted' | 'missing';
  retentionState: 'staged' | 'verified' | 'locked' | 'corrupted' | 'missing' | 'archive_failed';
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveArtifactOptions {
  sourceRevisionId?: string;
  observationId?: string;
  captureProvenance?: Record<string, unknown>;
}

export interface EvidenceProvenanceChain {
  archiveId: string;
  rawSha256: string;
  contentHash: string;
  sourceId: string;
  originalUrl: string;
  retrievalTimestamp: string;
  preservationState: string;
  retentionState: string;
  observation?: {
    id: string;
    title: string;
    snippet: string;
    canonicalUrl?: string;
  };
  claims: Array<{
    claimId: string;
    statement: string;
    epistemicStatus?: string;
    passage?: string;
  }>;
  stories: Array<{
    storyClusterId?: string;
    storyId?: string;
  }>;
}

export class ArtifactIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArtifactIntegrityError';
  }
}

export interface ArtifactStorageProvider {
  store(
    bucket: string,
    path: string,
    data: Buffer,
    contentType: string,
    metadata?: Record<string, unknown>
  ): Promise<void>;
  retrieve(bucket: string, path: string): Promise<Buffer>;
  exists(bucket: string, path: string): Promise<boolean>;
  delete?(bucket: string, path: string): Promise<void>;
}

/**
 * Direct PostgreSQL Storage Objects Provider.
 * Writes object metadata and payload to `storage.objects` for full staging compatibility.
 */
export class PostgresStorageObjectsProvider implements ArtifactStorageProvider {
  constructor(private db: { query: (text: string, params?: unknown[]) => Promise<any> }) {}

  async store(
    bucket: string,
    path: string,
    data: Buffer,
    contentType: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const rawSha256 = createHash('sha256').update(data).digest('hex');
    const pathTokens = path.split('/').filter(Boolean);
    const b64 = data.toString('base64');
    const metaObj = {
      mimetype: contentType,
      size: data.length,
      ...metadata,
    };
    const userMetaObj = {
      raw_sha256: rawSha256,
      payload_b64: b64,
    };

    try {
      const existing = await this.db.query(
        'SELECT id FROM storage.objects WHERE bucket_id = $1 AND name = $2 LIMIT 1;',
        [bucket, path]
      );

      if (existing.rows.length > 0) {
        await this.db.query(
          `UPDATE storage.objects 
           SET metadata = $1, user_metadata = $2, updated_at = now() 
           WHERE bucket_id = $3 AND name = $4;`,
          [JSON.stringify(metaObj), JSON.stringify(userMetaObj), bucket, path]
        );
      } else {
        await this.db.query(
          `INSERT INTO storage.objects (
             bucket_id, name, metadata, user_metadata
           ) VALUES ($1, $2, $3, $4);`,
          [bucket, path, JSON.stringify(metaObj), JSON.stringify(userMetaObj)]
        );
      }
    } catch (err: any) {
      if (err.code === '23505') {
        // Concurrent race condition: another worker just inserted this object
        await this.db.query(
          `UPDATE storage.objects 
           SET metadata = $1, user_metadata = $2, updated_at = now() 
           WHERE bucket_id = $3 AND name = $4;`,
          [JSON.stringify(metaObj), JSON.stringify(userMetaObj), bucket, path]
        );
      } else {
        throw err;
      }
    }
  }

  async retrieve(bucket: string, path: string): Promise<Buffer> {
    const res = await this.db.query(
      'SELECT metadata, user_metadata FROM storage.objects WHERE bucket_id = $1 AND name = $2 LIMIT 1;',
      [bucket, path]
    );
    if (res.rows.length === 0) {
      throw new ArtifactIntegrityError(`Object not found in storage bucket '${bucket}' at path '${path}'`);
    }

    const row = res.rows[0];
    const userMeta = typeof row.user_metadata === 'string' ? JSON.parse(row.user_metadata) : row.user_metadata;
    if (!userMeta?.payload_b64) {
      throw new ArtifactIntegrityError(`Object payload missing in storage.objects user_metadata for path '${path}'`);
    }
    return Buffer.from(userMeta.payload_b64, 'base64');
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    const res = await this.db.query(
      'SELECT 1 FROM storage.objects WHERE bucket_id = $1 AND name = $2 LIMIT 1;',
      [bucket, path]
    );
    return res.rows.length > 0;
  }

  async delete(bucket: string, path: string): Promise<void> {
    await this.db.query('BEGIN;');
    await this.db.query("SET LOCAL storage.allow_delete_query = 'true';");
    await this.db.query('DELETE FROM storage.objects WHERE bucket_id = $1 AND name = $2;', [bucket, path]);
    await this.db.query('COMMIT;');
  }
}

/**
 * Supabase Storage REST API Provider.
 * Uses official Supabase client when available (Production & Serverless environments).
 */
export class SupabaseStorageApiProvider implements ArtifactStorageProvider {
  constructor(private client: any) {}

  async store(
    bucket: string,
    path: string,
    data: Buffer,
    contentType: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.client.storage.from(bucket).upload(path, data, {
      contentType,
      upsert: true,
      metadata,
    });
    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }
  }

  async retrieve(bucket: string, path: string): Promise<Buffer> {
    const { data, error } = await this.client.storage.from(bucket).download(path);
    if (error || !data) {
      throw new ArtifactIntegrityError(`Supabase Storage download failed for path '${path}': ${error?.message}`);
    }
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    const dir = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';
    const filename = path.includes('/') ? path.substring(path.lastIndexOf('/') + 1) : path;
    const { data, error } = await this.client.storage.from(bucket).list(dir, {
      search: filename,
    });
    if (error || !data) return false;
    return data.some((item: any) => item.name === filename);
  }

  async delete(bucket: string, path: string): Promise<void> {
    await this.client.storage.from(bucket).remove([path]);
  }
}

export class EvidenceVaultService {
  private db: { query: (text: string, params?: unknown[]) => Promise<any> };
  private storageProvider: ArtifactStorageProvider;
  private ownsClient = false;

  constructor(
    customDb?: { query: (text: string, params?: unknown[]) => Promise<any> },
    storageProvider?: ArtifactStorageProvider
  ) {
    if (customDb) {
      this.db = customDb;
    } else {
      const url =
        process.env.STAGING_DATABASE_URL ||
        process.env.DATABASE_URL ||
        'postgresql://postgres:Ntn%40supabase403@db.lvfovvidtowadmnggzzf.supabase.co:5432/postgres';

      // Safety check: protect production against accidental test runs
      if (process.env.NODE_ENV !== 'production' && url.includes('mskyhaunnlwtwvsqcmav') && !process.env.ALLOW_PROD_VAULT) {
        throw new Error('FATAL: Production database targeted without explicit authorization.');
      }

      const PgClientClass = getPgClientClass();
      if (!PgClientClass) {
        this.db = { query: async () => ({ rows: [] }) };
      } else {
        const client = new PgClientClass({ connectionString: url, ssl: { rejectUnauthorized: false } });
        client.connect().catch((err: any) => {
          console.error('[EvidenceVaultService] Database connection error:', err);
        });
        this.db = client;
        this.ownsClient = true;
      }
    }

    if (storageProvider) {
      this.storageProvider = storageProvider;
    } else {
      this.storageProvider = new PostgresStorageObjectsProvider(this.db);
    }
  }

  public getStorageProvider(): ArtifactStorageProvider {
    return this.storageProvider;
  }

  /**
   * Calculates exact raw SHA-256 over binary buffer or UTF-8 string.
   */
  public static calculateRawSha256(payload: Buffer | Uint8Array | string): string {
    const buffer = Buffer.isBuffer(payload)
      ? payload
      : typeof payload === 'string'
      ? Buffer.from(payload, 'utf-8')
      : Buffer.from(payload);
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Normalizes raw payload to Buffer.
   */
  private static toBuffer(payload: Buffer | Uint8Array | string): Buffer {
    if (Buffer.isBuffer(payload)) return payload;
    if (typeof payload === 'string') return Buffer.from(payload, 'utf-8');
    return Buffer.from(payload);
  }

  /**
   * Archives a raw artifact into the vault.
   * Enforces content-addressing, deduplication, and authoritative object storage.
   */
  public async archiveArtifact(
    artifact: RawArtifact,
    options: ArchiveArtifactOptions = {}
  ): Promise<ArchivedArtifactRecord> {
    const rawBuffer = artifact.rawPayload
      ? EvidenceVaultService.toBuffer(artifact.rawPayload)
      : Buffer.from(artifact.content, 'utf-8');

    const rawSha256 = artifact.rawSha256 || EvidenceVaultService.calculateRawSha256(rawBuffer);
    const mimeType = artifact.mimeType || (artifact.metadata?.isPdf ? 'application/pdf' : 'text/html');

    const storageBucket = 'evidence-vault';
    const storagePath = `artifacts/${rawSha256}.bin`;

    // 1. Check if artifact already exists (Content-Addressed Deduplication)
    const existing = await this.findByRawSha256(rawSha256);
    if (existing) {
      // Ensure storage object exists
      const inStorage = await this.storageProvider.exists(storageBucket, storagePath);
      if (!inStorage) {
        await this.storageProvider.store(storageBucket, storagePath, rawBuffer, mimeType, {
          rawSha256,
          originalUrl: artifact.url,
        });
      }

      // If observationId was supplied and not yet linked, link it idempotently
      if (options.observationId && !existing.observationId) {
        await this.db.query(
          `UPDATE newsroom.archived_artifacts 
           SET observation_id = $1, updated_at = now() 
           WHERE id = $2`,
          [options.observationId, existing.id]
        );
        existing.observationId = options.observationId;
      }

      if (options.observationId) {
        await this.db.query(
          `UPDATE newsroom.observations 
           SET archive_id = $1, archival_state = 'staged', updated_at = now() 
           WHERE id = $2;`,
          [existing.id, options.observationId]
        );
      }

      return existing;
    }

    // 2. Store binary blob into Authoritative Storage FIRST
    await this.storageProvider.store(storageBucket, storagePath, rawBuffer, mimeType, {
      rawSha256,
      originalUrl: artifact.url,
    });

    const mergedMetadata = {
      ...artifact.metadata,
      captureProvenance: {
        retrievedAt: artifact.retrievedAt,
        sourceId: artifact.sourceId,
        url: artifact.url,
        ...options.captureProvenance,
      },
    };

    // 3. Atomically persist relational metadata ledger (NO raw_payload bytea)
    const insertRes = await this.db.query(
      `INSERT INTO newsroom.archived_artifacts (
        source_id,
        source_revision_id,
        observation_id,
        raw_sha256,
        content_hash,
        mime_type,
        byte_length,
        retrieval_timestamp,
        original_url,
        storage_bucket,
        storage_path,
        preservation_state,
        retention_state,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (raw_sha256) DO UPDATE SET updated_at = now()
      RETURNING *;`,
      [
        artifact.sourceId,
        options.sourceRevisionId || null,
        options.observationId || null,
        rawSha256,
        artifact.contentHash,
        mimeType,
        rawBuffer.length,
        artifact.retrievedAt || new Date().toISOString(),
        artifact.url,
        storageBucket,
        storagePath,
        'preserved',
        'staged',
        JSON.stringify(mergedMetadata),
      ]
    );

    const row = insertRes.rows[0];

    // 4. Link observation if provided
    if (options.observationId) {
      await this.db.query(
        `UPDATE newsroom.observations 
         SET archive_id = $1, archival_state = 'staged', updated_at = now() 
         WHERE id = $2;`,
        [row.id, options.observationId]
      );
    }

    return this.mapRowToRecord(row);
  }

  /**
   * Retrieves an archived artifact and its exact raw bytes from Object Storage,
   * verifying cryptographic integrity bit-for-bit against the raw_sha256 ledger.
   */
  public async retrieveArtifact(
    archiveIdOrHash: string
  ): Promise<{ record: ArchivedArtifactRecord; rawBytes: Buffer }> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      archiveIdOrHash
    );

    const query = isUuid
      ? 'SELECT * FROM newsroom.archived_artifacts WHERE id = $1'
      : 'SELECT * FROM newsroom.archived_artifacts WHERE raw_sha256 = $1';

    const res = await this.db.query(query, [archiveIdOrHash]);
    if (res.rows.length === 0) {
      throw new Error(`Archived artifact not found: ${archiveIdOrHash}`);
    }

    const row = res.rows[0];
    const record = this.mapRowToRecord(row);

    // Retrieve raw bytes from object storage
    let rawBytes: Buffer;
    try {
      rawBytes = await this.storageProvider.retrieve(record.storageBucket, record.storagePath);
    } catch (storageErr: any) {
      await this.db.query(
        `UPDATE newsroom.archived_artifacts SET preservation_state = 'missing', updated_at = now() WHERE id = $1;`,
        [record.id]
      );
      throw new ArtifactIntegrityError(
        `Artifact payload missing in storage for archive ID ${record.id} (${record.rawSha256}): ${storageErr.message}`
      );
    }

    // Cryptographic content verification
    const computedHash = EvidenceVaultService.calculateRawSha256(rawBytes);
    if (computedHash !== record.rawSha256) {
      await this.db.query(
        `UPDATE newsroom.archived_artifacts SET preservation_state = 'corrupted', updated_at = now() WHERE id = $1;`,
        [record.id]
      );
      throw new ArtifactIntegrityError(
        `Cryptographic integrity failure! Expected ${record.rawSha256}, got ${computedHash}`
      );
    }

    return { record, rawBytes };
  }

  /**
   * Cryptographically verifies that the stored artifact bytes match the ledger SHA-256.
   */
  public async verifyCryptographicIntegrity(archiveId: string): Promise<boolean> {
    try {
      const record = await this.getArtifactMetadata(archiveId);
      if (!record) return false;
      if (record.preservationState === 'corrupted') return false;

      const exists = await this.storageProvider.exists(record.storageBucket, record.storagePath);
      if (!exists) {
        await this.db.query(
          `UPDATE newsroom.archived_artifacts SET preservation_state = 'missing', updated_at = now() WHERE id = $1;`,
          [record.id]
        );
        return false;
      }

      const rawBytes = await this.storageProvider.retrieve(record.storageBucket, record.storagePath);
      const computedHash = EvidenceVaultService.calculateRawSha256(rawBytes);
      if (computedHash !== record.rawSha256) {
        await this.db.query(
          `UPDATE newsroom.archived_artifacts SET preservation_state = 'corrupted', updated_at = now() WHERE id = $1;`,
          [record.id]
        );
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves artifact metadata without downloading the raw bytes.
   */
  public async getArtifactMetadata(archiveId: string): Promise<ArchivedArtifactRecord | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(archiveId);
    const query = isUuid
      ? 'SELECT * FROM newsroom.archived_artifacts WHERE id = $1'
      : 'SELECT * FROM newsroom.archived_artifacts WHERE raw_sha256 = $1';

    const res = await this.db.query(query, [archiveId]);
    if (res.rows.length === 0) return null;
    return this.mapRowToRecord(res.rows[0]);
  }

  /**
   * Finds an existing artifact record by its raw SHA-256 hash.
   */
  public async findByRawSha256(rawSha256: string): Promise<ArchivedArtifactRecord | null> {
    const res = await this.db.query(
      'SELECT * FROM newsroom.archived_artifacts WHERE raw_sha256 = $1',
      [rawSha256]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToRecord(res.rows[0]);
  }

  /**
   * Finds an existing artifact record by normalized content_hash.
   */
  public async findByContentHash(contentHash: string): Promise<ArchivedArtifactRecord | null> {
    const res = await this.db.query(
      'SELECT * FROM newsroom.archived_artifacts WHERE content_hash = $1 ORDER BY created_at DESC LIMIT 1',
      [contentHash]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToRecord(res.rows[0]);
  }

  /**
   * Stage 2: Locks the retention status of an artifact upon human editorial verification.
   */
  public async lockRetention(
    archiveId: string,
    options?: { signalId?: string; verifierId?: string; reason?: string } | string
  ): Promise<void> {
    const normalized = typeof options === 'string' ? { reason: options } : options || {};
    const reason = normalized.reason || 'Human editorial claim verification lock';
    const lockPayload = {
      lockedAt: new Date().toISOString(),
      reason,
      signalId: normalized.signalId,
      verifierId: normalized.verifierId,
    };

    const updateRes = await this.db.query(
      `UPDATE newsroom.archived_artifacts 
       SET retention_state = 'verified', 
           updated_at = now(),
           metadata = jsonb_set(metadata, '{verificationLock}', $1::jsonb, true)
       WHERE id = $2 RETURNING id;`,
      [JSON.stringify(lockPayload), archiveId]
    );

    if (updateRes.rows.length === 0) {
      throw new Error(`Cannot lock retention: archive artifact ${archiveId} not found.`);
    }
  }

  /**
   * Marks observation archival state as failed in the newsroom observations table.
   */
  public async markArchivalFailed(observationId: string, reason?: string): Promise<void> {
    await this.db.query(
      `UPDATE newsroom.observations 
       SET archival_state = 'archive_failed', 
           updated_at = now(),
           metadata = jsonb_set(metadata, '{archivalFailure}', $1::jsonb, true)
       WHERE id = $2;`,
      [JSON.stringify({ failedAt: new Date().toISOString(), reason: reason || 'Archival failed' }), observationId]
    );
  }

  /**
   * Reconstructs the complete forensic evidentiary provenance chain from an archive ID or claim ID.
   */
  public async resolveProvenance(archiveIdOrClaimId: string): Promise<EvidenceProvenanceChain> {
    let archiveRow: any;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(archiveIdOrClaimId);

    if (isUuid) {
      const archRes = await this.db.query(
        'SELECT * FROM newsroom.archived_artifacts WHERE id = $1',
        [archiveIdOrClaimId]
      );
      if (archRes.rows.length > 0) {
        archiveRow = archRes.rows[0];
      }
    }

    if (!archiveRow) {
      const claimRes = await this.db.query(
        `SELECT a.* FROM newsroom.archived_artifacts a
         JOIN newsroom.claim_evidence ce ON ce.archive_id = a.id
         WHERE ce.claim_id = $1::uuid
         UNION
         SELECT a.* FROM newsroom.archived_artifacts a
         JOIN newsroom.observations o ON o.archive_id = a.id
         JOIN newsroom.claims c ON c.observation_id = o.id
         WHERE c.id = $1::uuid
         LIMIT 1;`,
        [archiveIdOrClaimId]
      );
      if (claimRes.rows.length > 0) {
        archiveRow = claimRes.rows[0];
      }
    }

    if (!archiveRow) {
      throw new Error(`Unable to resolve evidentiary provenance for identity: ${archiveIdOrClaimId}`);
    }

    const archiveRecord = this.mapRowToRecord(archiveRow);

    // Resolve Observation
    const obsRes = await this.db.query(
      `SELECT id, title, snippet, canonical_url 
       FROM newsroom.observations 
       WHERE archive_id = $1 OR id = $2 
       LIMIT 1;`,
      [archiveRecord.id, archiveRecord.observationId || '00000000-0000-0000-0000-000000000000']
    );

    const observation = obsRes.rows[0]
      ? {
          id: obsRes.rows[0].id,
          title: obsRes.rows[0].title,
          snippet: obsRes.rows[0].snippet,
          canonicalUrl: obsRes.rows[0].canonical_url,
        }
      : undefined;

    // Resolve Claims & Claim Evidence
    const claimsRes = await this.db.query(
      `SELECT c.id as claim_id, c.statement, c.epistemic_status, ce.passage 
       FROM newsroom.claims c
       LEFT JOIN newsroom.claim_evidence ce ON ce.claim_id = c.id
       WHERE ce.archive_id = $1 OR c.observation_id = $2;`,
      [archiveRecord.id, observation?.id || '00000000-0000-0000-0000-000000000000']
    );

    const claims = claimsRes.rows.map((r: any) => ({
      claimId: r.claim_id,
      statement: r.statement,
      epistemicStatus: r.epistemic_status,
      passage: r.passage,
    }));

    // Resolve Story Links
    const claimIds = claims.map((c: any) => c.claimId);
    let stories: Array<{ storyClusterId?: string; storyId?: string }> = [];

    if (claimIds.length > 0) {
      const storyRes = await this.db.query(
        `SELECT story_cluster_id FROM newsroom.story_claims 
         WHERE claim_id = ANY($1::uuid[]);`,
        [claimIds]
      );
      stories = storyRes.rows.map((r: any) => ({ storyClusterId: r.story_cluster_id }));
    }

    return {
      archiveId: archiveRecord.id,
      rawSha256: archiveRecord.rawSha256,
      contentHash: archiveRecord.contentHash,
      sourceId: archiveRecord.sourceId,
      originalUrl: archiveRecord.originalUrl,
      retrievalTimestamp: archiveRecord.retrievalTimestamp,
      preservationState: archiveRecord.preservationState,
      retentionState: archiveRecord.retentionState,
      observation,
      claims,
      stories,
    };
  }

  /**
   * Maps a database row to an ArchivedArtifactRecord.
   */
  private mapRowToRecord(row: any): ArchivedArtifactRecord {
    return {
      id: row.id,
      sourceId: row.source_id,
      sourceRevisionId: row.source_revision_id,
      observationId: row.observation_id,
      rawSha256: row.raw_sha256,
      contentHash: row.content_hash,
      mimeType: row.mime_type,
      byteLength: row.byte_length,
      retrievalTimestamp:
        row.retrieval_timestamp instanceof Date
          ? row.retrieval_timestamp.toISOString()
          : String(row.retrieval_timestamp),
      originalUrl: row.original_url,
      storageBucket: row.storage_bucket,
      storagePath: row.storage_path,
      preservationState: row.preservation_state,
      retentionState: row.retention_state,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
    };
  }
}

let defaultVaultInstance: EvidenceVaultService | null = null;

export function getEvidenceVaultService(): EvidenceVaultService {
  if (!defaultVaultInstance) {
    defaultVaultInstance = new EvidenceVaultService();
  }
  return defaultVaultInstance;
}

export function setEvidenceVaultService(vault: EvidenceVaultService | null): void {
  defaultVaultInstance = vault;
}

