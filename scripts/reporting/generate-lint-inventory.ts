// scripts/reporting/generate-lint-inventory.ts
/*
 * Lint Inventory Generator – robust, reusable reporting utility
 * -----------------------------------------------------------
 * 1. Executes ESLint with JSON output (captures via execSync, no shell redirection).
 * 2. Handles large output buffers and non‑zero exit codes.
 * 3. Aggregates results:
 *    - per‑rule counts split by severity (error / warning)
 *    - per‑rule fixable counts (derived from ESLint's fixableErrorCount / fixableWarningCount)
 *    - top files and directories
 *    - rule categories (external JSON config)
 * 4. Emits three artifacts in a configurable output directory (default: `.artifacts/lint`):
 *    - eslint-report.json (raw output, retained for debugging)
 *    - lint_inventory.md  (human‑readable report)
 *    - lint_inventory.csv (machine‑readable summary)
 * 5. Adds repository metadata (git branch, commit SHA, repo root) and tool versions.
 */

import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/** Run a command synchronously, capturing stdout/stderr without throwing on non‑zero exit. */
function runCommand(cmd: string, args: string[] = []): { stdout: string; stderr: string; status: number } {
  const result = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 });
  return { stdout: result.stdout as string, stderr: result.stderr as string, status: result.status ?? 0 };
}

// Resolve repo root (script resides under <repo>/scripts/reporting)
const repoRoot = path.resolve(__dirname, "../../../");

// Default artifact output directory (git‑ignored)
const defaultOutDir = path.join(repoRoot, ".artifacts", "lint");

// Simple CLI: optional '--out <path>' to override output location
const argv = process.argv.slice(2);
let outDir = defaultOutDir;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--out" && i + 1 < argv.length) {
    outDir = path.resolve(argv[i + 1]);
    i++;
  }
}
fs.mkdirSync(outDir, { recursive: true });

const jsonPath = path.join(outDir, "eslint-report.json");
const mdPath = path.join(outDir, "lint_inventory.md");
const csvPath = path.join(outDir, "lint_inventory.csv");

/** 1️⃣ Run ESLint (JSON) */
const lintCmd = "npm";
const lintArgs = ["run", "lint", "--", "--format", "json"];
const lintResult = runCommand(lintCmd, lintArgs);

// Write raw JSON regardless of exit code (ESLint returns non‑zero when errors exist)
fs.writeFileSync(jsonPath, lintResult.stdout, "utf8");

if (lintResult.status !== 0 && lintResult.stdout.trim() === "") {
  console.error("ESLint failed without JSON output. Stderr:\n", lintResult.stderr);
  process.exit(1);
}

/** Parse JSON */
interface ESLintMessage { ruleId: string | null; severity: number; message: string; line: number; column: number; fix?: any; }
interface ESLintResult { filePath: string; messages: ESLintMessage[]; errorCount: number; warningCount: number; fixableErrorCount?: number; fixableWarningCount?: number; }
let raw: ESLintResult[] = [];
try { raw = JSON.parse(lintResult.stdout) as ESLintResult[]; } catch (e) { console.error("Failed to parse ESLint JSON", e); process.exit(1); }

/** Load rule categories from external config */
const categoriesPath = path.join(repoRoot, "scripts", "config", "lint-rule-categories.json");
let ruleCategories: Record<string, string> = {};
try { ruleCategories = JSON.parse(fs.readFileSync(categoriesPath, "utf8")) as Record<string, string>; } catch { /* ignore – default to 'Other' */ }

/** 2️⃣ Aggregate statistics */
interface RuleStats { ruleId: string; errors: number; warnings: number; fixableErrors: number; fixableWarnings: number; total: number; category: string; files: Set<string>; dirCounts: Map<string, number>; }
const ruleMap = new Map<string, RuleStats>();
const fileCounts = new Map<string, number>();
let totalFiles = 0, filesWithIssues = 0, totalErrors = 0, totalWarnings = 0;
for (const fileResult of raw) {
  totalFiles++;
  const relPath = path.relative(repoRoot, fileResult.filePath);
  const dir = path.dirname(relPath);
  if (fileResult.messages.length) {
    filesWithIssues++;
    fileCounts.set(relPath, (fileCounts.get(relPath) ?? 0) + fileResult.messages.length);
  }
  for (const msg of fileResult.messages) {
    if (!msg.ruleId) continue;
    const isError = msg.severity === 2;
    if (!ruleMap.has(msg.ruleId)) {
      ruleMap.set(msg.ruleId, { ruleId: msg.ruleId, errors: 0, warnings: 0, fixableErrors: 0, fixableWarnings: 0, total: 0, category: ruleCategories[msg.ruleId] ?? "Other", files: new Set([relPath]), dirCounts: new Map([[dir, 1]]) });
    } else {
      const rs = ruleMap.get(msg.ruleId)!;
      rs.files.add(relPath);
      rs.dirCounts.set(dir, (rs.dirCounts.get(dir) ?? 0) + 1);
    }
    const rs = ruleMap.get(msg.ruleId)!;
    if (isError) { rs.errors++; totalErrors++; if (msg.fix) rs.fixableErrors++; } else { rs.warnings++; totalWarnings++; if (msg.fix) rs.fixableWarnings++; }
    rs.total++;
  }
}

function topN<T>(map: Map<T, number>, n: number): [T, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

/** 3️⃣ Repository metadata */
const gitBranch = runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"]).stdout.trim();
const gitCommit = runCommand("git", ["rev-parse", "HEAD"]).stdout.trim();
const nodeVersion = process.version;
const eslintVersion = runCommand("npx", ["eslint", "-v"]).stdout.trim();

/** 4️⃣ Markdown report */
let md = `# Lint Inventory Report\n\n`;
md += `**Generated:** ${new Date().toISOString()}\n`;
md += `**Branch:** ${gitBranch}\n**Commit:** ${gitCommit}\n**Repo root:** ${repoRoot}\n**Node:** ${nodeVersion}\n**ESLint:** ${eslintVersion}\n\n`;
md += `## Summary Metrics\n| Metric | Value |\n|--------|-------|\n`;
md += `| Files scanned | ${totalFiles} |\n| Files with issues | ${filesWithIssues} |\n| Total issues | ${totalErrors + totalWarnings} |\n| Errors | ${totalErrors} |\n| Warnings | ${totalWarnings} |\n| Distinct rules | ${ruleMap.size} |\n\n`;
md += `## Rule Summary (by category)\n| Category | Rule | Errors | Warnings | Fixable Errors | Fixable Warnings | Total |\n|----------|------|--------|----------|----------------|-------------------|-------|\n`;
for (const rs of Array.from(ruleMap.values()).sort((a, b) => b.total - a.total)) {
  md += `| ${rs.category} | ${rs.ruleId} | ${rs.errors} | ${rs.warnings} | ${rs.fixableErrors} | ${rs.fixableWarnings} | ${rs.total} |\n`;
}
md += `\n---\n\n## Top 10 Files by Issue Count\n| File | Issues |\n|------|--------|\n`;
for (const [file, cnt] of topN(fileCounts, 10)) md += `| ${file} | ${cnt} |\n`;
md += `\n---\n\n## Top 10 Directories per Rule\n`;
for (const rs of Array.from(ruleMap.values()).sort((a, b) => b.total - a.total)) {
  md += `### ${rs.ruleId} (total ${rs.total})\n| Directory | Issues |\n|-----------|--------|\n`;
  for (const [dir, cnt] of topN(rs.dirCounts, 10)) md += `| ${dir} | ${cnt} |\n`;
  md += `\n`;
}
fs.writeFileSync(mdPath, md, "utf8");
console.log(`✅ Markdown written to ${mdPath}`);

/** 5️⃣ CSV report */
let csv = `Rule,Category,Errors,Warnings,FixableErrors,FixableWarnings,Total\n`;
for (const rs of Array.from(ruleMap.values()).sort((a, b) => b.total - a.total)) {
  csv += `"${rs.ruleId}","${rs.category}",${rs.errors},${rs.warnings},${rs.fixableErrors},${rs.fixableWarnings},${rs.total}\n`;
}
fs.writeFileSync(csvPath, csv, "utf8");
console.log(`✅ CSV written to ${csvPath}`);

process.exit(0);
