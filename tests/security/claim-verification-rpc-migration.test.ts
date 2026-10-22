import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('claim verification RPC privilege migration', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/036_restrict_claim_verification_rpc.sql'
  );
  const sql = fs.readFileSync(migrationPath, 'utf8');

  it('only changes grants when the exact verification RPC exists', () => {
    expect(sql).toContain(
      "to_regprocedure(\n    'editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[])'\n  )"
    );
    expect(sql).toContain('IF function_signature IS NULL THEN');
  });

  it('removes public and client-role execution and retains trusted server access', () => {
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC/);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION %s FROM anon/);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION %s FROM authenticated/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION %s TO service_role/);
  });

  it('does not revoke schema usage or alter unrelated function grants', () => {
    expect(sql).not.toMatch(/REVOKE USAGE ON SCHEMA editorial/i);
    expect(sql).not.toMatch(/REVOKE EXECUTE ON ALL FUNCTIONS/i);
    expect(sql).not.toMatch(/DROP FUNCTION/i);
  });
});
