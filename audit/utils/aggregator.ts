// audit/utils/aggregator.ts
import { AuditResult } from "../plugins/types/AuditResult";
import { readFileSync } from "fs";
import * as path from "path";

export interface Report {
  frameworkVersion: string;
  sdkVersion: string;
  schemaVersion: string;
  timestamp: string;
  gitSha?: string;
  gitBranch?: string;
  nodeVersion: string;
  os: string;
  executionDurationMs: number;
  overallScore: number;
  plugins: AuditResult[];
}

/** Compute overall score as average of plugin scores */
export function aggregateReport(
  results: AuditResult[],
  startTime: number,
  reportDir: string
): Report {
  const endTime = Date.now();
  const overallScore =
    results.reduce((sum, r) => sum + r.score, 0) / (results.length || 1);

  // Git info (optional)
  let gitSha: string | undefined;
  let gitBranch: string | undefined;
  try {
    const cwd = process.cwd();
    gitSha = require("child_process")
      .execSync("git rev-parse HEAD", { cwd })
      .toString()
      .trim();
    gitBranch = require("child_process")
      .execSync("git rev-parse --abbrev-ref HEAD", { cwd })
      .toString()
      .trim();
  } catch (e) {
    // ignore if not a git repo
  }

  const pkg = JSON.parse(
    readFileSync(path.resolve(__dirname, "../package.json"), "utf-8")
  );

  return {
    frameworkVersion: pkg.version,
    sdkVersion: "1.0.0",
    schemaVersion: "2.0",
    timestamp: new Date().toISOString(),
    gitSha,
    gitBranch,
    nodeVersion: process.version,
    os: process.platform,
    executionDurationMs: endTime - startTime,
    overallScore,
    plugins: results,
  };
}
