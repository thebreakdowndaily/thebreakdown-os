import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('audit.activity_log append-only protection migration (037)', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/037_protect_activity_log_append_only.sql'
  );
  const sql = fs.readFileSync(migrationPath, 'utf8');

  it('enables Row Level Security on audit.activity_log', () => {
    expect(sql).toContain("ALTER TABLE audit.activity_log ENABLE ROW LEVEL SECURITY");
  });

  it('revokes all permissions from public/anon and mutation permissions from authenticated/service_role', () => {
    expect(sql).toContain("REVOKE ALL ON TABLE audit.activity_log FROM PUBLIC, anon");
    expect(sql).toContain("REVOKE UPDATE, DELETE, TRUNCATE ON TABLE audit.activity_log FROM authenticated");
    expect(sql).toContain("REVOKE UPDATE, DELETE, TRUNCATE ON TABLE audit.activity_log FROM service_role");
    expect(sql).toContain("GRANT SELECT, INSERT ON TABLE audit.activity_log TO authenticated, service_role");
  });

  it('creates defense-in-depth trigger raising an exception on UPDATE or DELETE', () => {
    expect(sql).toContain('fn_prevent_activity_log_tamper');
    expect(sql).toContain("RAISE EXCEPTION 'audit.activity_log is append-only: % operations are strictly prohibited.', TG_OP;");
    expect(sql).toContain('CREATE TRIGGER trg_activity_log_append_only');
    expect(sql).toContain('BEFORE UPDATE OR DELETE ON audit.activity_log');
  });

  it('establishes RLS policies for staff read and insert while omitting update/delete policies', () => {
    expect(sql).toContain('CREATE POLICY staff_read_activity_log ON audit.activity_log');
    expect(sql).toContain('CREATE POLICY staff_insert_activity_log ON audit.activity_log');
    expect(sql).not.toContain('FOR UPDATE');
    expect(sql).not.toContain('FOR DELETE');
  });

  it('contains approved destructive comment for static safety gate compliance', () => {
    expect(sql).toContain('-- APPROVED_DESTRUCTIVE:');
  });
});
