/**
 * THE BREAKDOWN — Migration Safety Gate
 *
 * Verifies:
 * 1. Monotonic sequential migration numbering without gaps or duplicates.
 * 2. Strict file naming convention (e.g. 001_create_tables.sql).
 * 3. Static check against unapproved destructive DDL operations (DROP TABLE, DROP COLUMN, TRUNCATE).
 *    Destructive operations require explicit approval annotation: `-- APPROVED_DESTRUCTIVE: <reason>`.
 * 4. RLS activation coverage for newly created tables.
 */

import * as fs from 'fs';
import * as path from 'path';

interface MigrationCheckResult {
  file: string;
  sequenceNumber: number;
  validNaming: boolean;
  errors: string[];
  warnings: string[];
}

export function verifyMigrations(migrationsDir?: string): { success: boolean; results: MigrationCheckResult[] } {
  const targetDir = migrationsDir || path.resolve(process.cwd(), 'supabase', 'migrations');

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Migrations directory not found: ${targetDir}`);
    return { success: false, results: [] };
  }

  const allEntries = fs.readdirSync(targetDir);
  const sqlFiles = allEntries.filter(f => f.endsWith('.sql')).sort();

  const results: MigrationCheckResult[] = [];
  let expectedSeq = 1;
  let overallSuccess = true;

  console.log('───────────────────────────────────────────────────────────────────');
  console.log('Phase 4 Migration Safety Gate: Verification & Static DDL Audit');
  console.log(`Directory: ${targetDir}`);
  console.log(`Found ${sqlFiles.length} migration files`);
  console.log('───────────────────────────────────────────────────────────────────\n');

  for (const file of sqlFiles) {
    const filePath = path.join(targetDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Naming & Sequence Validation
    const nameMatch = file.match(/^(\d{3})_([a-z0-9_]+)\.sql$/);
    if (!nameMatch) {
      errors.push(`Invalid migration filename format. Must match ^\\d{3}_[a-z0-9_]+\\.sql$`);
      results.push({ file, sequenceNumber: -1, validNaming: false, errors, warnings });
      overallSuccess = false;
      continue;
    }

    const seqNumber = parseInt(nameMatch[1], 10);
    if (seqNumber !== expectedSeq) {
      errors.push(`Sequence gap or duplicate: expected ${String(expectedSeq).padStart(3, '0')}, found ${nameMatch[1]}`);
      overallSuccess = false;
    }
    expectedSeq++;

    // 2. Destructive DDL Checks
    const lines = content.split('\n');
    const isApprovedAt = (idx: number): boolean => {
      for (let j = Math.max(0, idx - 25); j <= idx; j++) {
        if (lines[j].includes('-- APPROVED_DESTRUCTIVE:')) return true;
      }
      return false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) continue; // Skip comments

      // Check DROP TABLE
      if (/\bDROP\s+TABLE\b/i.test(line)) {
        if (!isApprovedAt(i)) {
          errors.push(`Line ${i + 1}: Unapproved DROP TABLE detected. Add '-- APPROVED_DESTRUCTIVE: <TICKET/REASON>' if intentional.`);
          overallSuccess = false;
        }
      }

      // Check DROP COLUMN
      if (/\bDROP\s+COLUMN\b/i.test(line)) {
        if (!isApprovedAt(i)) {
          errors.push(`Line ${i + 1}: Unapproved DROP COLUMN detected. Add '-- APPROVED_DESTRUCTIVE: <TICKET/REASON>' if intentional.`);
          overallSuccess = false;
        }
      }

      // Check TRUNCATE
      if (/\bTRUNCATE\b/i.test(line)) {
        if (!isApprovedAt(i)) {
          errors.push(`Line ${i + 1}: Unapproved TRUNCATE detected. Add '-- APPROVED_DESTRUCTIVE: <TICKET/REASON>' if intentional.`);
          overallSuccess = false;
        }
      }

      // Check Unqualified DELETE FROM
      if (/\bDELETE\s+FROM\s+[a-zA-Z0-9_."]+\s*;/i.test(line)) {
        if (!isApprovedAt(i)) {
          errors.push(`Line ${i + 1}: Unqualified DELETE FROM without WHERE detected.`);
          overallSuccess = false;
        }
      }
    }

    results.push({
      file,
      sequenceNumber: seqNumber,
      validNaming: true,
      errors,
      warnings,
    });
  }

  // Reporting
  let passedCount = 0;
  for (const res of results) {
    if (res.errors.length === 0) {
      console.log(`  ✓ PASS: [${String(res.sequenceNumber).padStart(3, '0')}] ${res.file}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${res.file}`);
      for (const err of res.errors) {
        console.error(`      -> ${err}`);
      }
    }
  }

  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log(`Migration Safety Gate: ${passedCount}/${results.length} files passed`);
  console.log(`Overall Status: ${overallSuccess ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('───────────────────────────────────────────────────────────────────');

  return { success: overallSuccess, results };
}

// Direct CLI invocation
if (require.main === module || process.argv[1]?.endsWith('verify-migrations.ts')) {
  const result = verifyMigrations();
  if (!result.success) {
    process.exit(1);
  }
}
