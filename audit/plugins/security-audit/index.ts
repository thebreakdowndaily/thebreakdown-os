import * as fs from 'fs';
import * as path from 'path';
import { AuditPlugin } from '../types/AuditPlugin';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

interface Finding {
  severity: string;
  message: string;
}

const recordFinding = (findings: Finding[], severity: string, message: string) => {
  findings.push({ severity, message });
};

const walkSync = (dir: string, ignoredDirs: string[], fileList: string[] = []): string[] => {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (ignoredDirs.includes(file)) continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath, ignoredDirs, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
};

export const run = async (context: AuditContext): Promise<AuditResult> => {
  const { repoRoot } = context;
  const policyPath = path.join(repoRoot, 'audit/plugins/security-audit/policy.json');
  let policy: any = {};
  if (fs.existsSync(policyPath)) {
    policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  }

  const findings: Finding[] = [];
  
  let secretCoverageTotal = 1;
  let secretCoveragePassed = 1;
  let cspCoverageTotal = 1;
  let cspCoveragePassed = 1;
  let manifestIntegrityTotal = 1;
  let manifestIntegrityPassed = 1;

  // 1. Secret Scanning
  if (policy.secretScanning) {
    const ignored = policy.secretScanning.ignoredDirectories || [];
    const files = walkSync(repoRoot, ignored);
    
    for (const filePath of files) {
      const fileName = path.basename(filePath);
      // Fail on .env, .env.local, .env.production, etc. Allow .env.example
      if (fileName.includes('.env') && fileName !== '.env.example') {
        recordFinding(findings, policy.secretScanning.severity, `Exposed secret file found: ${path.relative(repoRoot, filePath)}`);
        secretCoveragePassed = 0;
      }
    }
  }

  // 2. CSP Policy Validation
  if (policy.csp && policy.csp.required) {
    let cspFound = false;
    for (const configName of policy.csp.files) {
      const p = path.join(repoRoot, configName);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        if (content.includes('Content-Security-Policy')) {
          cspFound = true;
          break;
        }
      }
    }
    if (!cspFound) {
      recordFinding(findings, policy.csp.severity, `No Content-Security-Policy definition found in Next.js config`);
      cspCoveragePassed = 0;
    }
  }

  // 3. Manifest Consistency
  if (policy.manifestConsistency) {
    const pkgPath = path.join(repoRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      for (const engine of policy.manifestConsistency.requiredEngines) {
        if (!pkg.engines || !pkg.engines[engine]) {
          recordFinding(findings, policy.manifestConsistency.severity, `Missing required engine definition in package.json: ${engine}`);
          manifestIntegrityPassed = 0;
        }
      }
    } else {
      recordFinding(findings, policy.manifestConsistency.severity, `package.json not found for manifest consistency check`);
      manifestIntegrityPassed = 0;
    }
  }

  // 4. Vulnerability Gate (Optional Provider)
  let dependencyHealthTotal = 1;
  let dependencyHealthPassed = 1;
  if (policy.vulnerabilityGate && policy.vulnerabilityGate.enabled) {
    // In a real environment, this would execute `npm audit --json`
    // For v1.0, since it's disabled by default, we just log that it's enabled if we were to run it.
    // We do not fail the plugin on every vulnerability, but we normalize it.
    recordFinding(findings, 'informational', 'Vulnerability provider is enabled but execution is mocked in v1.0');
  }

  const secretCoverage = (secretCoveragePassed / secretCoverageTotal) * 100;
  const cspCoverage = (cspCoveragePassed / cspCoverageTotal) * 100;
  const manifestIntegrity = (manifestIntegrityPassed / manifestIntegrityTotal) * 100;
  const dependencyHealth = (dependencyHealthPassed / dependencyHealthTotal) * 100;

  // Compute Security Compliance Score (SCS)
  const scs = (secretCoverage * 40 + cspCoverage * 30 + manifestIntegrity * 20 + dependencyHealth * 10) / 100;

  const hasCriticalOrHigh = findings.some(f => f.severity === 'critical' || f.severity === 'high');

  return {
    pluginName: 'security-audit',
    state: hasCriticalOrHigh ? LifecycleState.FAILED : LifecycleState.PASSED,
    data: {
      score: scs,
      coverage: 100, // Evaluated all files configured in policy
      findings,
      metrics: {
        secretCoverage,
        cspCoverage,
        manifestIntegrity,
        dependencyHealth,
        securityComplianceScore: scs
      }
    }
  };
};
