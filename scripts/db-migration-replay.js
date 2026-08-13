/**
 * db-migration-replay.js
 *
 * Replays supabase/migrations/001..013 against a COMPLETELY THROWAWAY local
 * PostgreSQL instance (embedded-postgres) and verifies the resulting schema.
 *
 * The embedded cluster is initialised in a temp directory with Supabase
 * compatible stubs (anon/authenticated/service_role roles, auth.jwt(),
 * auth.uid(), a minimal auth.users table) so the migrations and their RLS
 * policies behave as they would on Supabase. The data directory is destroyed
 * when the script exits.
 *
 * NEVER point this at a production database. It is intentionally self-contained.
 *
 * Usage:
 *   node scripts/db-migration-replay.js
 */

const EmbeddedPostgres = require('embedded-postgres').default;
const fs = require('fs');
const os = require('os');
const net = require('net');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

function migrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    // Scope is migrations 001..013 (W3/W4 Forensic Audit remediation).
    // Later migrations (e.g. 014 Reader Workspace) are out of scope for this
    // replay harness and must not be swept in by a generic glob.
    .filter((f) => /^(00[1-9]|01[0-3])_.*\.sql$/.test(f))
    .sort();
}

function splitStatements(sql) {
  return sql
    .split('-- COMMIT_SPLIT')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

// ---------------------------------------------------------------------------
// Supabase-compatible bootstrap (local replay only, not a migration file)
// ---------------------------------------------------------------------------

const BOOTSTRAP_SQL = `
  -- Roles mirroring Supabase defaults
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
      CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;
  END $$;

  -- auth schema stubs (auth.jwt/auth.uid read the request.jwt.claims GUC,
  -- exactly as Supabase's native functions do)
  CREATE SCHEMA IF NOT EXISTS auth;
  GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

  CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
  LANGUAGE sql STABLE AS $fn$
    SELECT COALESCE(current_setting('request.jwt.claims', true)::jsonb, '{}'::jsonb);
  $fn$;

  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE sql STABLE AS $fn$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
  $fn$;

  -- Minimal auth.users stub required by migration 010's FK
  CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY,
    email text,
    raw_app_meta_data jsonb DEFAULT '{}'::jsonb
  );
  GRANT SELECT ON auth.users TO anon, authenticated, service_role;

  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  -- Mirror Supabase default table grants so RLS tests exercise policies,
  -- not privilege checks. (newsroom is granted after migrations apply.)
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
`;

// ---------------------------------------------------------------------------
// Migration application
// ---------------------------------------------------------------------------

async function applyMigration(client, file) {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
  for (const part of splitStatements(sql)) {
    await client.query(part);
  }
}

// ---------------------------------------------------------------------------
// Schema verification
// ---------------------------------------------------------------------------

async function snapshotSchema(client, results) {
  const schemas = await client.query(
    "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_schema') AND schema_name NOT LIKE 'pg_toast%' AND schema_name NOT LIKE 'pg_temp%' ORDER BY 1"
  );
  console.log('Schemas:', schemas.rows.map((r) => r.schema_name).join(', '));

  const tables = await client.query(`
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'editorial', 'graph', 'audit', 'identity', 'search', 'newsroom')
    ORDER BY schemaname, tablename
  `);
  const bySchema = {};
  for (const t of tables.rows) (bySchema[t.schemaname] = bySchema[t.schemaname] || []).push(t.tablename);
  for (const [s, list] of Object.entries(bySchema)) console.log(`  ${s} (${list.length}): ${list.join(', ')}`);

  const enums = await client.query(`
    SELECT t.typname, string_agg(e.enumlabel::text, ', ' ORDER BY e.enumsortorder) AS labels
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    GROUP BY t.typname ORDER BY t.typname
  `);
  for (const e of enums.rows) console.log(`  enum ${e.typname} = [${e.labels}]`);

  const rls = await client.query(`
    SELECT c.relname, c.relrowsecurity AS rls_enabled,
           (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policies
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  `);
  const noRls = rls.rows.filter((r) => !r.rls_enabled);
  console.log(`RLS: ${rls.rows.length - noRls.length}/${rls.rows.length} public tables have RLS enabled`);
  if (noRls.length) console.log(`  NOT ENABLED: ${noRls.map((r) => r.relname).join(', ')}`);

  const finConstraints = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conrelid = 'research_financial_records'::regclass
    ORDER BY conname
  `);
  console.log('research_financial_records constraints:');
  for (const c of finConstraints.rows) console.log(`  ${c.conname}: ${c.def}`);

  const triggers = await client.query(`
    SELECT t.tgname, c.relname AS table_name
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE NOT t.tgisinternal
    ORDER BY c.relname, t.tgname
  `);
  console.log('Triggers:');
  for (const tr of triggers.rows) console.log(`  ${tr.table_name}.${tr.tgname}`);
}

async function runAssertions(client, results) {
  const t = (name, fn) =>
    Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  [PASS] ${name}`);
        results.push({ name, ok: true });
      })
      .catch((e) => {
        console.error(`  [FAIL] ${name}\n         ${e.message}`);
        results.push({ name, ok: false, error: e.message });
      })
      .finally(() => client.query('ROLLBACK').catch(() => {}));

  await t('REPORTED is present in value_availability_status_type after KNOWN', async () => {
    const r = await client.query(`
      SELECT string_agg(e.enumlabel::text, ',' ORDER BY e.enumsortorder) AS labels
      FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'value_availability_status_type'
    `);
    const labels = r.rows[0].labels.split(',');
    const known = labels.indexOf('KNOWN');
    const reported = labels.indexOf('REPORTED');
    if (reported === -1) throw new Error('REPORTED missing from enum');
    if (reported < known) throw new Error(`REPORTED (${reported}) should sort after KNOWN (${known})`);
  });

  await t('exactly one research_financial_records_check with REPORTED-aware definition', async () => {
    const r = await client.query(`
      SELECT count(*)::int AS n FROM pg_constraint WHERE conname = 'research_financial_records_check'
    `);
    if (r.rows[0].n !== 1) throw new Error(`expected exactly 1, found ${r.rows[0].n}`);
    const d = await client.query(`
      SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
      WHERE conname = 'research_financial_records_check'
    `);
    const def = d.rows[0].def;
    if (!def.includes('REPORTED')) throw new Error('constraint definition does not reference REPORTED');
    if (def.includes('amount_status != ')) throw new Error('stale KNOWN-only clause present');
  });

  async function seedProject() {
    const r = await client.query(
      "INSERT INTO research_projects (name, ingestion_method) VALUES ('REPLAY_PROJECT', 'REPLAY_TEST') RETURNING id"
    );
    return r.rows[0].id;
  }

  await t('financial record accepts amount_status=REPORTED with value', async () => {
    const projectId = await seedProject();
    await client.query("BEGIN");
    await client.query(`
      INSERT INTO research_financial_records
        (project_id, stage, amount_status, amount_value, currency, valid_from, ingestion_method, canonical_id)
      VALUES ($1, 'BUDGET_PROVISION', 'REPORTED', 1200000.00, 'INR', CURRENT_DATE, 'REPLAY_TEST', 'FIN-REPLAY-A1')
    `, [projectId]);
    await client.query("ROLLBACK");
  });

  await t('financial record rejects REPORTED with NULL value', async () => {
    const projectId = await seedProject();
    await client.query("BEGIN");
    try {
      await client.query(`
        INSERT INTO research_financial_records
          (project_id, stage, amount_status, amount_value, currency, valid_from, ingestion_method, canonical_id)
        VALUES ($1, 'BUDGET_PROVISION', 'REPORTED', NULL, 'INR', CURRENT_DATE, 'REPLAY_TEST', 'FIN-REPLAY-B1')
      `, [projectId]);
      throw new Error('expected CHECK violation');
    } catch (e) {
      if (!e.message.includes('research_financial_records_check')) throw e;
    } finally {
      await client.query("ROLLBACK");
    }
  });

  await t('financial record still rejects KNOWN with NULL value', async () => {
    const projectId = await seedProject();
    await client.query("BEGIN");
    try {
      await client.query(`
        INSERT INTO research_financial_records
          (project_id, stage, amount_status, amount_value, currency, valid_from, ingestion_method, canonical_id)
        VALUES ($1, 'BUDGET_PROVISION', 'KNOWN', NULL, 'INR', CURRENT_DATE, 'REPLAY_TEST', 'FIN-REPLAY-C1')
      `, [projectId]);
      throw new Error('expected CHECK violation');
    } catch (e) {
      if (!e.message.includes('research_financial_records_check')) throw e;
    } finally {
      await client.query("ROLLBACK");
    }
  });

  await t('every public table with updated_at has an auto-update trigger', async () => {
    const r = await client.query(`
      WITH tables_with_updated_at AS (
        SELECT c.table_name
        FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.column_name = 'updated_at'
          AND c.table_name NOT LIKE 'dataset_%'
      )
      SELECT tw.table_name
      FROM tables_with_updated_at tw
      LEFT JOIN pg_trigger t
        ON t.tgname = 'trg_' || tw.table_name || '_updated_at'
      WHERE t.tgname IS NULL
      ORDER BY 1
    `);
    const r2 = await client.query(`
      SELECT c.relname AS table_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
        AND EXISTS (SELECT 1 FROM pg_trigger t
                    WHERE t.tgrelid = c.oid AND t.tgname = 'trg_' || c.relname || '_updated_at')
      ORDER BY 1
    `);
    console.log(`     trigger coverage: ${r2.rows.map((x) => x.table_name).join(', ')}`);
    if (r.rows.length > 0) throw new Error(`missing triggers on: ${r.rows.map((x) => x.table_name).join(', ')}`);
  });

  await t('join tables without updated_at have NO auto-update trigger', async () => {
    const joinTables = ['story_topics', 'story_entities', 'topic_entities', 'story_timelines', 'entity_relationships'];
    const r = await client.query(`
      SELECT c.relname AS table_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
        AND c.relname = ANY($1)
        AND EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgrelid = c.oid AND t.tgname = 'trg_' || c.relname || '_updated_at')
    `, [joinTables]);
    if (r.rows.length > 0) throw new Error(`unexpected triggers on: ${r.rows.map((x) => x.table_name).join(', ')}`);
  });

  await t('UPDATE on a join table (story_topics) succeeds (non-recursive)', async () => {
    await client.query("BEGIN");
    await client.query(`
      INSERT INTO public.stories (slug, title) VALUES ('replay-trigger-test', 'Trigger Test')
        ON CONFLICT (slug) DO NOTHING
    `);
    const story = await client.query("SELECT id FROM public.stories WHERE slug = 'replay-trigger-test'");
    const topic = await client.query("INSERT INTO public.topics (slug, name) VALUES ('replay-trigger-test', 'Trigger Test') RETURNING id");
    await client.query("INSERT INTO public.story_topics (story_id, topic_id) VALUES ($1, $2)", [story.rows[0].id, topic.rows[0].id]);
    const res = await client.query("UPDATE public.story_topics SET topic_id = topic_id WHERE story_id = $1", [story.rows[0].id]);
    if (res.rowCount !== 1) throw new Error('expected 1 row updated');
    await client.query("ROLLBACK");
  });

  await t('UPDATE on a trigger-bearing table bumps updated_at', async () => {
    await client.query("BEGIN");
    const story = await client.query(`
      INSERT INTO public.stories (slug, title) VALUES ('replay-updated-at-test', 'T') RETURNING id
    `);
    // Disable the trigger so we can backdate without it overwriting the value,
    // then prove the trigger advances updated_at on the next UPDATE.
    await client.query("ALTER TABLE public.stories DISABLE TRIGGER trg_stories_updated_at");
    await client.query(
      "UPDATE public.stories SET updated_at = now() - interval '1 hour' WHERE id = $1",
      [story.rows[0].id]
    );
    const before = await client.query("SELECT updated_at FROM public.stories WHERE id = $1", [story.rows[0].id]);
    await client.query("ALTER TABLE public.stories ENABLE TRIGGER trg_stories_updated_at");
    await client.query("UPDATE public.stories SET title = 'T2' WHERE id = $1", [story.rows[0].id]);
    const after = await client.query("SELECT updated_at FROM public.stories WHERE id = $1", [story.rows[0].id]);
    if (after.rows[0].updated_at <= before.rows[0].updated_at) throw new Error('updated_at did not advance');
    await client.query("ROLLBACK");
  });

  // -- RLS coverage ----------------------------------------------------------

  const EXPECTED_PUBLIC_RLS = [
    'corrections', 'reader_corrections',
    'research_claim_evidence_relationships', 'research_claim_subject_relationships',
    'research_claims', 'research_collectors', 'research_constituencies',
    'research_corrections', 'research_diff_alerts', 'research_evidence_items',
    'research_financial_records', 'research_gaps', 'research_ingestion_queue',
    'research_party_affiliation_history', 'research_persons', 'research_political_parties',
    'research_projects', 'research_search_protocols', 'research_sources',
    'workspace_cases', 'workspace_evidence', 'workspace_exports', 'workspace_notes',
    'workspace_tasks', 'workspace_timeline_events',
    'gov_audits', 'gov_budgets', 'gov_contractors', 'gov_ministries',
    'gov_projects', 'gov_schemes'
  ].sort();

  const EXPECTED_NEWSROOM_RLS = [
    'sources', 'source_endpoints', 'source_health_log', 'source_reputation',
    'observations', 'claims', 'claim_evidence', 'verification_events',
    'story_clusters', 'story_observations', 'story_claims', 'story_velocity',
    'signals', 'alerts', 'editorial_feedback', 'coverage_gaps', 'pipeline_metrics'
  ].sort();

  await t('RLS enabled on every protected table and nothing else', async () => {
    const r = await client.query(`
      SELECT n.nspname AS schema, c.relname AS table
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname IN ('public', 'newsroom')
        AND c.relrowsecurity
      ORDER BY 1, 2
    `);
    const publicRls = r.rows.filter((x) => x.schema === 'public').map((x) => x.table).sort();
    const newsroomRls = r.rows.filter((x) => x.schema === 'newsroom').map((x) => x.table).sort();
    const missing = EXPECTED_PUBLIC_RLS.filter((t) => !publicRls.includes(t));
    const extra = publicRls.filter((t) => !EXPECTED_PUBLIC_RLS.includes(t));
    const missingN = EXPECTED_NEWSROOM_RLS.filter((t) => !newsroomRls.includes(t));
    const extraN = newsroomRls.filter((t) => !EXPECTED_NEWSROOM_RLS.includes(t));
    if (missing.length) throw new Error(`RLS missing on public: ${missing.join(', ')}`);
    if (missingN.length) throw new Error(`RLS missing on newsroom: ${missingN.join(', ')}`);
    if (extra.length) throw new Error(`unexpected public RLS: ${extra.join(', ')}`);
    if (extraN.length) throw new Error(`unexpected newsroom RLS: ${extraN.join(', ')}`);
  });

  async function actAs(role, claims) {
    await client.query(`SET LOCAL role ${role}`);
    await client.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)]);
  }

  await t('anon cannot read research_evidence_items; researcher can', async () => {
    await client.query("BEGIN");
    const source = await client.query(`
      INSERT INTO research_sources (title, source_type, ingestion_method)
      VALUES ('replay-source', 'web', 'REPLAY_TEST') RETURNING id
    `);
    await client.query(`
      INSERT INTO research_evidence_items (source_id, extracted_text, ingestion_method)
      VALUES ($1, 'confidential extraction', 'REPLAY_TEST')
    `, [source.rows[0].id]);

    await actAs('anon', {});
    const anonRows = await client.query('SELECT count(*)::int AS n FROM research_evidence_items');
    if (anonRows.rows[0].n !== 0) throw new Error(`anon saw ${anonRows.rows[0].n} evidence rows`);

    await actAs('authenticated', { app_metadata: { research_role: 'researcher' } });
    const resRows = await client.query('SELECT count(*)::int AS n FROM research_evidence_items');
    if (resRows.rows[0].n !== 1) throw new Error(`researcher saw ${resRows.rows[0].n} evidence rows (expected 1)`);
    await client.query("ROLLBACK");
  });

  await t('workspace cases visible to owner and internal roles only', async () => {
    await client.query("BEGIN");
    const ownerId = '11111111-1111-1111-1111-111111111111';
    const otherId = '22222222-2222-2222-2222-222222222222';
    await client.query("INSERT INTO auth.users (id) VALUES ($1), ($2)", [ownerId, otherId]);
    const caseId = (await client.query(`
      INSERT INTO workspace_cases (title, owner_id) VALUES ('owner case', $1) RETURNING id
    `, [ownerId])).rows[0].id;
    await client.query(`
      INSERT INTO workspace_notes (case_id, content) VALUES ($1, 'private note')
    `, [caseId]);

    await actAs('anon', {});
    const anonCases = await client.query('SELECT count(*)::int AS n FROM workspace_cases');
    const anonNotes = await client.query('SELECT count(*)::int AS n FROM workspace_notes');
    if (anonCases.rows[0].n !== 0) throw new Error('anon saw workspace cases');
    if (anonNotes.rows[0].n !== 0) throw new Error('anon saw workspace notes');

    await actAs('authenticated', { sub: ownerId, app_metadata: { research_role: 'researcher' } });
    const ownerCases = await client.query('SELECT count(*)::int AS n FROM workspace_cases');
    const ownerNotes = await client.query('SELECT count(*)::int AS n FROM workspace_notes');
    if (ownerCases.rows[0].n !== 1) throw new Error(`owner saw ${ownerCases.rows[0].n} cases (expected 1)`);
    if (ownerNotes.rows[0].n !== 1) throw new Error(`owner saw ${ownerNotes.rows[0].n} notes (expected 1)`);

    await actAs('authenticated', { sub: otherId, app_metadata: { research_role: 'researcher' } });
    const otherCases = await client.query('SELECT count(*)::int AS n FROM workspace_cases');
    if (otherCases.rows[0].n !== 1) throw new Error('internal role should be able to access any case');

    await actAs('authenticated', { sub: otherId });
    const plainCases = await client.query('SELECT count(*)::int AS n FROM workspace_cases');
    if (plainCases.rows[0].n !== 0) throw new Error('plain authenticated user saw another user\'s case');
    await client.query("ROLLBACK");
  });

  await t('public.corrections is readable by anon; reader_corrections is not', async () => {
    await client.query("BEGIN");
    const story = await client.query(`
      INSERT INTO public.stories (slug, title) VALUES ('replay-rls-corrections', 'T') RETURNING id
    `);
    await actAs('authenticated', { app_metadata: { research_role: 'editor' } });
    await client.query(`
      INSERT INTO public.corrections
        (story_id, category, previous_wording, corrected_wording, explanation)
      VALUES ($1, 'factual', 'old', 'new', 'explained')
    `, [story.rows[0].id]);
    await client.query(`
      INSERT INTO public.reader_corrections (story_slug, passage_excerpt, suggested_correction)
      VALUES ('replay-rls-corrections', 'quote', 'fix')
    `);
    await actAs('anon', {});
    const anonCorr = await client.query('SELECT count(*)::int AS n FROM public.corrections');
    if (anonCorr.rows[0].n !== 1) throw new Error('anon could not read public.corrections');
    const anonReader = await client.query('SELECT count(*)::int AS n FROM public.reader_corrections');
    if (anonReader.rows[0].n !== 0) throw new Error('anon read reader_corrections (submitter data leaked)');
    await client.query("ROLLBACK");
  });

  await t('reader_corrections accepts anon submissions but only in received state', async () => {
    await client.query("BEGIN");
    await actAs('anon', {});
    await client.query(`
      INSERT INTO public.reader_corrections (story_slug, passage_excerpt, suggested_correction)
      VALUES ('replay-rls-corrections', 'quote', 'fix')
    `);
    let rejected = false;
    try {
      await client.query(`
        INSERT INTO public.reader_corrections (story_slug, passage_excerpt, suggested_correction, status)
        VALUES ('replay-rls-corrections', 'quote', 'fix', 'resolved')
      `);
    } catch (e) {
      rejected = true;
    }
    if (!rejected) throw new Error('anon was able to insert with non-received status');
    await client.query("ROLLBACK");
  });

  await t('researcher cannot DELETE research_financial_records (no DELETE policy)', async () => {
    await client.query("BEGIN");
    const projectId = (await client.query(`
      INSERT INTO research_projects (name, ingestion_method) VALUES ('P', 'REPLAY_TEST') RETURNING id
    `)).rows[0].id;
    await client.query(`
      INSERT INTO research_financial_records
        (project_id, stage, amount_status, amount_value, currency, valid_from, ingestion_method, canonical_id)
      VALUES ($1, 'BUDGET_PROVISION', 'REPORTED', 100, 'INR', CURRENT_DATE, 'REPLAY_TEST', 'FIN-RLS-DEL-1')
    `, [projectId]);
    await actAs('authenticated', { app_metadata: { research_role: 'researcher' } });
    const del = await client.query(
      "DELETE FROM research_financial_records WHERE canonical_id = 'FIN-RLS-DEL-1'"
    );
    if (del.rowCount !== 0) throw new Error('DELETE unexpectedly succeeded');
    await client.query("ROLLBACK");
  });

  await t('newsroom tables are internal-only (anon denied, researcher allowed)', async () => {
    await client.query("BEGIN");
    await client.query(`
      INSERT INTO newsroom.sources (name, slug, url, tier, adapter_type, geography, language)
      VALUES ('replay-source', 'replay-source', 'https://example.test', 1, 'rss', 'IN', 'en')
    `);
    await actAs('anon', {});
    const anonSources = await client.query('SELECT count(*)::int AS n FROM newsroom.sources');
    if (anonSources.rows[0].n !== 0) throw new Error('anon saw newsroom.sources');
    await actAs('authenticated', { app_metadata: { research_role: 'researcher' } });
    const resSources = await client.query('SELECT count(*)::int AS n FROM newsroom.sources');
    if (resSources.rows[0].n !== 1) throw new Error(`researcher saw ${resSources.rows[0].n} newsroom rows (expected 1)`);
    await client.query("ROLLBACK");
  });

  // -- Referential integrity (Phase 10) ---------------------------------------

  await t('every declared 009-013 foreign key is materialized', async () => {
    const expectedFks = [
      ['public', 'workspace_evidence', 'public', 'workspace_cases'],
      ['public', 'workspace_notes', 'public', 'workspace_cases'],
      ['public', 'workspace_timeline_events', 'public', 'workspace_cases'],
      ['public', 'workspace_tasks', 'public', 'workspace_cases'],
      ['public', 'workspace_exports', 'public', 'workspace_cases'],
      ['public', 'research_ingestion_queue', 'public', 'research_collectors'],
      ['public', 'research_ingestion_queue', 'public', 'research_sources'],
      ['public', 'gov_budgets', 'public', 'gov_ministries'],
      ['public', 'gov_schemes', 'public', 'gov_ministries'],
      ['public', 'gov_projects', 'public', 'gov_schemes'],
      ['public', 'gov_audits', 'public', 'gov_projects'],
      ['public', 'corrections', 'public', 'stories'],
      ['public', 'corrections', 'audit', 'story_versions'],
      ['public', 'corrections', 'newsroom', 'claims'],
      ['public', 'corrections', 'newsroom', 'verification_events'],
      ['public', 'corrections', 'public', 'corrections'],
      ['public', 'reader_corrections', 'public', 'stories'],
      ['public', 'reader_corrections', 'newsroom', 'claims'],
    ];
    const r = await client.query(`
      SELECT n1.nspname AS t_schema, c1.relname AS t_name,
             n2.nspname AS ref_schema, c2.relname AS ref_table
      FROM pg_constraint con
      JOIN pg_class c1 ON c1.oid = con.conrelid
      JOIN pg_namespace n1 ON n1.oid = c1.relnamespace
      JOIN pg_class c2 ON c2.oid = con.confrelid
      JOIN pg_namespace n2 ON n2.oid = c2.relnamespace
      WHERE con.contype = 'f'
    `);
    const got = r.rows.map((x) => `${x.t_schema}.${x.t_name}->${x.ref_schema}.${x.ref_table}`).sort();
    const want = expectedFks.map((x) => `${x[0]}.${x[1]}->${x[2]}.${x[3]}`).sort();
    const missing = want.filter((w) => !got.includes(w));
    if (missing.length) throw new Error(`missing foreign keys: ${missing.join(', ')}`);

    const newsroomFks = r.rows.filter((x) => x.t_schema === 'newsroom').length;
    if (newsroomFks < 15) throw new Error(`only ${newsroomFks} newsroom FKs materialized`);
  });
}

// ---------------------------------------------------------------------------
// Upgrade-path check (Phase 13): a second throwaway cluster that applies the
// legacy chain 001-008 first, then applies 009-013 on top, mirroring a
// production DB that already ran the W1/W2 migrations.
// ---------------------------------------------------------------------------

async function runUpgradePath(results) {
  const port = await freePort();
  const dbDir = path.join(os.tmpdir(), 'breakdown-db-upgrade-' + Date.now());
  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port,
    user: 'postgres',
    password: 'replay-test',
    persistent: false,
    initdbFlags: ['--locale=C', '--encoding=UTF8'],
    onLog: () => {},
    onError: () => {},
  });

  let client;
  try {
    await pg.initialise();
    await pg.start();
    client = pg.getPgClient();
    await client.connect();
    await client.query(BOOTSTRAP_SQL);

    const files = migrationFiles();
    const legacy = files.filter((f) => /^(001|002|003|004|005|006|007|008)_/.test(f));
    const w3w4 = files.filter((f) => /^(009|010|011|012|013)_/.test(f));

    console.log('\n=== UPGRADE PATH (001-008, then 009-013) ===');
    for (const f of legacy) {
      await applyMigration(client, f);
      console.log(`  [OK]   ${f}`);
    }
    const preCount = await client.query(`
      SELECT count(*)::int AS n FROM pg_tables
      WHERE schemaname = 'public' AND tablename NOT LIKE 'dataset_%'
    `);
    console.log(`  -> 001-008 applied (${legacy.length} files, ${preCount.rows[0].n} public tables before 009)`);

    for (const f of w3w4) {
      try {
        await applyMigration(client, f);
        console.log(`  [OK]   ${f}`);
      } catch (err) {
        console.error(`  [FAIL] ${f}\n         ${err.message}`);
        results.push({ name: `upgrade-path migration ${f}`, ok: false, error: err.message });
        return;
      }
    }

    const check = async (sql, label) => {
      const r = await client.query(sql);
      if (!r.rows[0].ok) throw new Error(label);
    };
    await check(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'newsroom' AND table_name = 'sources') AS ok
    `, 'newsroom.sources missing after upgrade');
    await check(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'corrections') AS ok
    `, 'public.corrections missing after upgrade');
    await check(`
      SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'research_sources' AND column_name = 'organization') AS ok
    `, 'research_sources.organization column missing after upgrade');
    console.log('  [OK]   upgrade-path integrity checks');
    results.push({ name: 'upgrade path 001-008 → 009-013', ok: true });
  } finally {
    if (client) await client.end().catch(() => {});
    await pg.stop().catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const port = await freePort();
  const dbDir = path.join(os.tmpdir(), 'breakdown-db-replay-' + Date.now());
  const results = [];

  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port,
    user: 'postgres',
    password: 'replay-test',
    persistent: false,
    initdbFlags: ['--locale=C', '--encoding=UTF8'],
    onLog: () => {},
    onError: () => {},
  });

  console.log('=== THE BREAKDOWN — MIGRATION CHAIN REPLAY ===');
  console.log(`throwaway cluster: ${dbDir} (port ${port}, PostgreSQL ${pg === null ? '' : 'embedded'})\n`);

  let client;
  try {
    await pg.initialise();
    await pg.start();
    client = pg.getPgClient();
    await client.connect();

    console.log('Bootstraping Supabase-compatible roles/auth stubs...');
    await client.query(BOOTSTRAP_SQL);
    console.log('Bootstrap complete.\n');

    console.log('Applying migrations in dependency order:');
    for (const file of migrationFiles()) {
      const started = Date.now();
      try {
        await applyMigration(client, file);
        console.log(`  [OK]   ${file} (${Date.now() - started}ms)`);
      } catch (err) {
        console.error(`  [FAIL] ${file} (${Date.now() - started}ms)\n         ${err.message}`);
        results.push({ name: `migration ${file}`, ok: false, error: err.message });
      }
    }
    // Supabase grants default privileges on public tables to anon/authenticated/
    // service_role via ALTER DEFAULT PRIVILEGES; the migrations create tables
    // after the bootstrap grant, so re-apply the blanket grants here to mirror
    // that behaviour. RLS is the actual access gate under test.
    await client.query(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role'
    );
    await client.query('GRANT USAGE ON SCHEMA newsroom TO anon, authenticated, service_role');
    await client.query(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA newsroom TO anon, authenticated, service_role'
    );
    console.log('');

    console.log('Schema snapshot:');
    await snapshotSchema(client, results);
    console.log('');

    console.log('Verification assertions:');
    await runAssertions(client, results);
    console.log('');

    const failed = results.filter((r) => !r.ok);
    console.log(`Results: ${results.length - failed.length}/${results.length} assertions passed.`);
    for (const f of failed) console.log(`  FAILED: ${f.name} — ${f.error}`);
    process.exitCode = failed.length ? 1 : 0;

    await runUpgradePath(results);
  } finally {
    if (client) await client.end().catch(() => {});
    await pg.stop().catch(() => {});
    console.log('Throwaway cluster stopped; data directory removed.');
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
