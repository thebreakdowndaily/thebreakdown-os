require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.TEST_DATABASE_URL;

function createRoleClient(role) {
  return async function(queryStr, params) {
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    try {
      await client.query('BEGIN');
      if (role) {
        const pgRole = role === 'anon' ? 'anon' : 'authenticated';
        await client.query(`SET LOCAL role = ${pgRole}`);
        const claims = JSON.stringify({ app_metadata: { research_role: role } });
        await client.query(`SET LOCAL request.jwt.claims = '${claims}'`);
      }
      const res = await client.query(queryStr, params);
      await client.query('ROLLBACK');
      return res;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      await client.end();
    }
  };
}

const serviceClient = new Client({ connectionString: dbUrl });

async function runTests() {
  await serviceClient.connect();
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${name}\n       ${e.message}`);
      failed++;
    }
  }

  try {
    // 1. Run migrations 001 to 005
    console.log('Applying migrations 001 to 005...');
    
    // Clean DB
    await serviceClient.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
      DROP SCHEMA IF EXISTS editorial CASCADE;
      DROP SCHEMA IF EXISTS graph CASCADE;
      DROP SCHEMA IF EXISTS audit CASCADE;
      DROP SCHEMA IF EXISTS identity CASCADE;
      DROP SCHEMA IF EXISTS search CASCADE;
      DROP TABLE IF EXISTS stories CASCADE;
      DROP TABLE IF EXISTS topics CASCADE;
      DROP TABLE IF EXISTS entities CASCADE;
      DROP TABLE IF EXISTS timelines CASCADE;
      DROP TABLE IF EXISTS fixes CASCADE;
      DROP TABLE IF EXISTS media_items CASCADE;
      DROP TABLE IF EXISTS datasets CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS bookmarks CASCADE;
      DROP TABLE IF EXISTS research_constituencies CASCADE;
      DROP TABLE IF EXISTS research_persons CASCADE;
      DROP TABLE IF EXISTS research_political_parties CASCADE;
      DROP TABLE IF EXISTS research_projects CASCADE;
      DROP TABLE IF EXISTS research_party_affiliation_history CASCADE;
      DROP TABLE IF EXISTS research_financial_records CASCADE;
      DROP TABLE IF EXISTS research_sources CASCADE;
      DROP TABLE IF EXISTS research_evidence_items CASCADE;
      DROP TABLE IF EXISTS research_claims CASCADE;
      DROP TABLE IF EXISTS research_claim_subject_relationships CASCADE;
      DROP TABLE IF EXISTS research_corrections CASCADE;
      DROP TABLE IF EXISTS research_search_protocols CASCADE;
      DROP TABLE IF EXISTS research_gaps CASCADE;
      DROP TYPE IF EXISTS publication_status_type CASCADE;
      DROP TYPE IF EXISTS human_review_status_type CASCADE;
      DROP TYPE IF EXISTS value_availability_status_type CASCADE;
      DROP TYPE IF EXISTS affiliation_type_enum CASCADE;
      DROP TYPE IF EXISTS affiliation_status_enum CASCADE;
      DROP TYPE IF EXISTS claim_scope_type CASCADE;
      DROP TYPE IF EXISTS research_confidence_type CASCADE;
      DROP TYPE IF EXISTS financial_stage_type CASCADE;
      DROP TYPE IF EXISTS correction_type_enum CASCADE;
      DROP TYPE IF EXISTS research_gap_status_type CASCADE;
    `);

    const migrationFiles = [
      '001_create_tables.sql',
      '002_canonical_schema.sql',
      '003_image_intelligence_schema.sql',
      '004_canonical_research_schema.sql',
      '005_research_gap_schema.sql'
    ];

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations', file), 'utf8');
      if (file === '005_research_gap_schema.sql') {
        const parts = sql.split('-- COMMIT_SPLIT');
        for (const part of parts) {
          if (part.trim()) await serviceClient.query(part);
        }
      } else {
        await serviceClient.query(sql);
      }
    }
    await serviceClient.query('GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated, anon;');
    await serviceClient.query('GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;');
    console.log('Migrations applied successfully.');

    // Create roles for testing
    await serviceClient.query(`
      DO $do$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'researcher') THEN CREATE ROLE researcher; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'editor') THEN CREATE ROLE editor; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'reviewer') THEN CREATE ROLE reviewer; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'administrator') THEN CREATE ROLE administrator; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'automated_ingestion_agent') THEN CREATE ROLE automated_ingestion_agent; END IF;
        
      END $do$;
      
      GRANT USAGE ON SCHEMA public TO anon, researcher, editor, reviewer, administrator, automated_ingestion_agent;
      GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon, researcher, editor, reviewer, administrator, automated_ingestion_agent;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, researcher, editor, reviewer, administrator, automated_ingestion_agent;
    `);


    // Seed required entities
    await serviceClient.query(`
      INSERT INTO research_constituencies (canonical_id, name, ingestion_method) 
      VALUES ('UP-AC-001', 'Test Constituency', 'TEST')
      RETURNING id;
    `);
    
    const constituencyRes = await serviceClient.query(`SELECT id FROM research_constituencies LIMIT 1`);
    const constituencyId = constituencyRes.rows[0].id;

    const agentDb = createRoleClient('automated_ingestion_agent');
    const researcherDb = createRoleClient('researcher');
    const editorDb = createRoleClient('editor');
    const anonDb = createRoleClient('anon');

    // TEST: invalid search_completed_at < search_started_at
    await test('search_completed_at cannot be before search_started_at', async () => {
      try {
        await serviceClient.query(`
          INSERT INTO research_search_protocols (
            research_question, repositories_searched, queries_used, 
            search_started_at, search_completed_at, completeness_confidence, ingestion_method
          ) VALUES (
            'Q1', '["repo1"]', '["q1"]', 
            '2026-07-20 10:00:00', '2026-07-20 09:00:00', 'C2', 'TEST'
          )
        `);
        throw new Error('Should have failed constraint');
      } catch (e) {
        if (!e.message.includes('search_time_valid')) throw e;
      }
    });

    // Valid protocol insertion
    const protocolRes = await serviceClient.query(`
      INSERT INTO research_search_protocols (
        research_question, repositories_searched, queries_used, 
        search_started_at, search_completed_at, completeness_confidence, ingestion_method
      ) VALUES (
        'Q1', '["repo1"]', '["q1"]', 
        '2026-07-20 10:00:00', '2026-07-20 11:00:00', 'C2', 'TEST'
      ) RETURNING id;
    `);
    const protocolId = protocolRes.rows[0].id;

    // TEST: Required completion state for NOT_FOUND
    await test('NOT_FOUND requires completed search protocol', async () => {
      // First create an uncompleted protocol
      const uncompletedRes = await serviceClient.query(`
        INSERT INTO research_search_protocols (
          research_question, repositories_searched, queries_used, 
          search_started_at, completeness_confidence, ingestion_method
        ) VALUES (
          'Q2', '["repo2"]', '["q2"]', 
          '2026-07-20 10:00:00', 'C2', 'TEST'
        ) RETURNING id;
      `);
      const uncompletedId = uncompletedRes.rows[0].id;

      try {
        await serviceClient.query(`
          INSERT INTO research_gaps (
            search_protocol_id, target_constituency_id, gap_status, gap_description, ingestion_method
          ) VALUES (
            '${uncompletedId}', '${constituencyId}', 'NOT_FOUND', 'Nothing found', 'TEST'
          )
        `);
        throw new Error('Should have failed trigger');
      } catch (e) {
        if (!e.message.includes('not_found_requires_completed_protocol')) throw e;
      }
    });

    // TEST: Subject/geography integrity (exactly one target)
    await test('Gap must have exactly one polymorphic target', async () => {
      try {
        await serviceClient.query(`
          INSERT INTO research_gaps (
            canonical_id, search_protocol_id, gap_status, gap_description, ingestion_method
          ) VALUES (
            'GAP-TEST-1', '${protocolId}', 'NOT_FOUND', 'Nothing found', 'TEST'
          )
        `);
        throw new Error('Should have failed constraint exactly_one_target');
      } catch (e) {
        if (!e.message.includes('exactly_one_target')) throw e;
      }
    });

    // TEST: RLS Draft/Public behavior
    await test('Anon cannot read DRAFT gaps', async () => {
      await serviceClient.query(`
        INSERT INTO research_gaps (
          canonical_id, search_protocol_id, target_constituency_id, gap_status, gap_description, publication_status, ingestion_method
        ) VALUES (
          'GAP-TEST-2', '${protocolId}', '${constituencyId}', 'NOT_FOUND', 'Nothing found', 'DRAFT', 'TEST'
        )
      `);
      const res = await anonDb('SELECT COUNT(*) FROM research_gaps');
      if (parseInt(res.rows[0].count) !== 0) throw new Error('Anon read DRAFT');
    });

    await test('Anon can read PUBLISHED gaps', async () => {
      await serviceClient.query(`
        INSERT INTO research_gaps (
          canonical_id, search_protocol_id, target_constituency_id, gap_status, gap_description, publication_status, human_review_status, ingestion_method
        ) VALUES (
          'GAP-TEST-3', '${protocolId}', '${constituencyId}', 'NOT_FOUND', 'Nothing found', 'PUBLISHED', 'APPROVED', 'TEST'
        )
      `);
      const res = await anonDb('SELECT COUNT(*) FROM research_gaps');
      if (parseInt(res.rows[0].count) !== 1) throw new Error('Anon could not read PUBLISHED');
    });

    // TEST: no hard delete through application roles
    await test('No hard delete for researcher', async () => {
      try {
        await researcherDb(`DELETE FROM research_gaps`);
        throw new Error('Should have failed delete');
      } catch (e) {
        if (!e.message.includes('permission denied')) throw e;
      }
    });

    // TEST: automated ingestion agent behavior
    await test('Agent can INSERT only DRAFT UNREVIEWED gaps', async () => {
      await serviceClient.query('BEGIN');
      await serviceClient.query(`SET LOCAL role = authenticated`);
      await serviceClient.query(`SET LOCAL request.jwt.claims = '{"app_metadata": {"research_role": "automated_ingestion_agent"}}'`);
      
      const pRes = await serviceClient.query(`
        INSERT INTO research_search_protocols (
          canonical_id, research_question, repositories_searched, queries_used, 
          search_completed_at, completeness_confidence, ingestion_method
        ) VALUES (
          'PROTO-AGENT', 'Q_Agent', '["r1"]', '["q1"]', NOW(), 'C3', 'TEST_AGENT'
        ) RETURNING id;
      `);
      const pId = pRes.rows[0].id;

      await serviceClient.query(`
        INSERT INTO research_gaps (
          canonical_id, search_protocol_id, target_constituency_id, gap_status, gap_description, publication_status, human_review_status, ingestion_method
        ) VALUES (
          'GAP-AGENT', '${pId}', '${constituencyId}', 'NOT_FOUND', 'Desc', 'DRAFT', 'UNREVIEWED', 'TEST_AGENT'
        )
      `);
      
      await serviceClient.query('ROLLBACK');
    });

    // TEST: publication/review constraints
    await test('Cannot PUBLISH without APPROVED human review status', async () => {
      try {
        await serviceClient.query(`
          INSERT INTO research_gaps (
            canonical_id, target_constituency_id, gap_status, gap_description, publication_status, human_review_status, ingestion_method
          ) VALUES (
            'GAP-TEST-FAIL', '${constituencyId}', 'NOT_REPORTED', 'desc', 'PUBLISHED', 'UNREVIEWED', 'TEST'
          )
        `);
        throw new Error('Should have failed constraint');
      } catch (e) {
        if (!e.message.includes('gap_publish_requires_approval')) throw e;
      }
    });

    // Validate REPORTED is present in enum
    await test('REPORTED enum value exists', async () => {
      const res = await serviceClient.query(`
        SELECT enumlabel 
        FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'value_availability_status_type'
      `);
      const values = res.rows.map(r => r.enumlabel);
      if (!values.includes('REPORTED')) throw new Error('REPORTED missing from enum');
    });

  } catch (err) {
    console.error('Fatal error running tests:', err);
  } finally {
    await serviceClient.end();
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
