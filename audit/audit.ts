// audit/audit.ts
import { loadConfig } from "./config/loader";
import { Logger } from "./utils/logger";
import { PerformanceMonitor } from "./utils/performanceMonitor";
import { AuditContext } from "./plugins/types/AuditContext";
import { runPlugins } from "./plugins/loader";
import { aggregateReport } from "./utils/aggregator";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const repoRoot = process.cwd();
  const config = loadConfig();
  const logger = new Logger();
  const performance = new PerformanceMonitor();

  const context: AuditContext = {
    repoRoot,
    config,
    logger,
    performance,
    timeoutMs: config.defaultTimeoutMs,
  };

  const start = Date.now();
  const results = await runPlugins(context);
  const report = aggregateReport(results, start, config.reportDir);

  // Ensure report directory exists
  const reportDir = config.reportDir;
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  logger.info(`Audit report written to ${reportPath}`);
}

main().catch((err) => {
  console.error("Audit execution failed:", err);
  process.exit(1);
});
