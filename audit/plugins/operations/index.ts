import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

export const name = 'operations-audit';
export const description = 'Verifies repository operations and delivery readiness';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

interface Finding {
  severity: Severity;
  message: string;
}

interface Metrics {
  repositoryCoverage: number;
  workflowCoverage: number;
  releaseCoverage: number;
  configIntegrity: number;
  auditFrameworkHealth: number;
  operationsComplianceScore: number;
}

export async function run(context: AuditContext): Promise<AuditResult> {
  const { repoRoot } = context;
  const policyPath = path.join(repoRoot, 'audit/plugins/operations/policy.json');
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

  const findings: Finding[] = [];
  
  // Track compliance items for OCS
  const stats = {
    repository: { passed: 0, total: 0 },
    workflow: { passed: 0, total: 0 },
    release: { passed: 0, total: 0 },
    config: { passed: 0, total: 0 },
    auditHealth: { passed: 0, total: 0 }
  };
  
  function record(category: keyof typeof stats, passed: boolean, failSeverity: Severity, failMessage: string) {
    stats[category].total++;
    if (passed) {
      stats[category].passed++;
    } else {
      findings.push({ severity: failSeverity, message: failMessage });
    }
  }

  // 1. Repository Operations
  const repoPolicy = policy.repository || {};
  const pkgPath = path.join(repoRoot, 'package.json');
  const pkgExists = fs.existsSync(pkgPath);
  record('repository', pkgExists, 'critical', 'Missing package.json');

  let pkgData: any = null;
  if (pkgExists) {
    try {
      pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (e) {
      record('repository', false, 'critical', 'package.json is invalid JSON');
    }
  }

  // Node Version Policy
  if (repoPolicy.nodeVersion) {
    const nvmrcExists = fs.existsSync(path.join(repoRoot, '.nvmrc')) || fs.existsSync(path.join(repoRoot, '.node-version'));
    if (repoPolicy.nodeVersion.recommendNvmrc) {
      record('repository', nvmrcExists, repoPolicy.nodeVersion.recommendNvmrc, 'Missing .nvmrc or .node-version');
    }
    
    if (repoPolicy.nodeVersion.requireEnginesNode && pkgData) {
      const hasEngine = pkgData.engines && pkgData.engines.node;
      record('repository', !!hasEngine, repoPolicy.nodeVersion.requireEnginesNode, 'Missing engines.node in package.json');
    }
  }

  // Package Manager
  if (repoPolicy.packageManager) {
    const lockfilePath = path.join(repoRoot, repoPolicy.packageManager.lockfile);
    record('repository', fs.existsSync(lockfilePath), 'critical', `Missing expected lockfile: ${repoPolicy.packageManager.lockfile}`);

    for (const alt of (repoPolicy.packageManager.disallowAlternatives || [])) {
      const altPath = path.join(repoRoot, alt);
      record('repository', !fs.existsSync(altPath), 'high', `Disallowed package manager lockfile found: ${alt}`);
    }
  }

  // Required Files
  for (const file of (repoPolicy.requiredFiles || [])) {
    const filePath = path.join(repoRoot, file.path);
    record('repository', fs.existsSync(filePath), file.severity, `Missing required file: ${file.path}`);
  }

  // Scripts
  if (pkgData && pkgData.scripts) {
    for (const reqScript of (repoPolicy.requiredScripts || [])) {
      record('repository', !!pkgData.scripts[reqScript], 'critical', `Missing required script: ${reqScript}`);
    }
    for (const recScript of (repoPolicy.recommendedScripts || [])) {
      record('repository', !!pkgData.scripts[recScript], 'medium', `Missing recommended script: ${recScript}`);
    }
  }

  // 2. Release Readiness
  const releasePolicy = policy.releaseReadiness || {};
  for (const file of (releasePolicy.requiredFiles || [])) {
    const filePath = path.join(repoRoot, file.path);
    record('release', fs.existsSync(filePath), file.severity, `Missing release readiness file: ${file.path}`);
  }

  // 3. CI Health
  const ciPolicy = policy.ci || {};
  const seenWorkflows = new Set<string>();
  
  for (const workflow of (ciPolicy.requiredWorkflows || [])) {
    const wfPath = path.join(repoRoot, workflow.path);
    const exists = fs.existsSync(wfPath);
    record('workflow', exists, workflow.severity, `Missing required workflow: ${workflow.path}`);

    if (exists) {
      try {
        const wfContent = fs.readFileSync(wfPath, 'utf8');
        const parsed: any = yaml.load(wfContent);
        record('workflow', !!parsed, 'critical', `Workflow ${workflow.path} is invalid YAML`);
        
        if (parsed) {
          const wfName = parsed.name || path.basename(workflow.path);
          record('workflow', !seenWorkflows.has(wfName), 'high', `Duplicate workflow name found: ${wfName}`);
          seenWorkflows.add(wfName);
          
          for (const reqJob of (workflow.requiredJobs || [])) {
            const hasJob = parsed.jobs && parsed.jobs[reqJob];
            record('workflow', !!hasJob, 'critical', `Workflow ${workflow.path} is missing required job: ${reqJob}`);
          }
        }
      } catch (e: any) {
        record('workflow', false, 'critical', `Workflow ${workflow.path} failed to parse: ${e.message}`);
      }
    }
  }

  // 4. Config Integrity
  const configPolicy = policy.configIntegrity || {};
  for (const jsonFile of (configPolicy.json || [])) {
    const filePath = path.join(repoRoot, jsonFile);
    if (fs.existsSync(filePath)) {
      try {
        JSON.parse(fs.readFileSync(filePath, 'utf8'));
        record('config', true, 'critical', ''); // Success
      } catch (e) {
        record('config', false, 'critical', `Malformed JSON in ${jsonFile}`);
      }
    }
  }
  for (const yamlFile of (configPolicy.yaml || [])) {
    const filePath = path.join(repoRoot, yamlFile);
    if (fs.existsSync(filePath)) {
      try {
        yaml.load(fs.readFileSync(filePath, 'utf8'));
        record('config', true, 'critical', ''); // Success
      } catch (e) {
        record('config', false, 'critical', `Malformed YAML in ${yamlFile}`);
      }
    }
  }

  // 5. Audit Framework Health
  const auditHealth = policy.auditHealth || {};
  if (auditHealth.requireUniformManifests || auditHealth.validateDependsOn) {
    const pluginsDir = path.join(repoRoot, 'audit', 'plugins');
    if (fs.existsSync(pluginsDir)) {
      const pluginFolders = fs.readdirSync(pluginsDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !['types', 'utils'].includes(d.name))
        .map(d => d.name);

      let expectedSdkVersion: string | null = null;
      let expectedSchemaVersion: string | null = null;
      
      const allPlugins = new Set<string>();
      const manifestDeps: Record<string, string[]> = {};

      // First pass: collect plugins and uniform versions
      for (const pFolder of pluginFolders) {
        const manifestPath = path.join(pluginsDir, pFolder, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            allPlugins.add(m.name);
            if (m.dependsOn) {
              manifestDeps[m.name] = m.dependsOn;
            }
            if (auditHealth.requireUniformManifests) {
              if (!expectedSdkVersion && m.sdkVersion) expectedSdkVersion = m.sdkVersion;
              if (!expectedSchemaVersion && m.schemaVersion) expectedSchemaVersion = m.schemaVersion;

              if (m.sdkVersion && expectedSdkVersion && m.sdkVersion !== expectedSdkVersion) {
                record('auditHealth', false, 'high', `Plugin ${m.name} has non-uniform sdkVersion: ${m.sdkVersion} (expected ${expectedSdkVersion})`);
              } else {
                record('auditHealth', true, 'high', '');
              }
              if (m.schemaVersion && expectedSchemaVersion && m.schemaVersion !== expectedSchemaVersion) {
                record('auditHealth', false, 'high', `Plugin ${m.name} has non-uniform schemaVersion: ${m.schemaVersion} (expected ${expectedSchemaVersion})`);
              } else {
                record('auditHealth', true, 'high', '');
              }
            }
          } catch (e) {
            // Ignored here, Architecture plugin checks invalid JSON
          }
        }
      }

      // Second pass: validate dependsOn targets exist
      if (auditHealth.validateDependsOn) {
        for (const [pName, deps] of Object.entries(manifestDeps)) {
          for (const dep of deps) {
            record('auditHealth', allPlugins.has(dep), 'critical', `Plugin ${pName} depends on unknown plugin: ${dep}`);
          }
        }
      }
    }
  }

  // Calculate Metrics
  const calcScore = (stat: { passed: number, total: number }) => stat.total > 0 ? (stat.passed / stat.total) * 100 : 100;
  
  const metrics: Metrics = {
    repositoryCoverage: calcScore(stats.repository),
    workflowCoverage: calcScore(stats.workflow),
    releaseCoverage: calcScore(stats.release),
    configIntegrity: calcScore(stats.config),
    auditFrameworkHealth: calcScore(stats.auditHealth),
    operationsComplianceScore: 0
  };

  metrics.operationsComplianceScore = (
    metrics.repositoryCoverage * 0.4 +
    metrics.releaseCoverage * 0.2 +
    metrics.workflowCoverage * 0.2 +
    metrics.configIntegrity * 0.1 +
    metrics.auditFrameworkHealth * 0.1
  );

  const hasCritical = findings.some(f => f.severity === 'critical');
  const hasHigh = findings.some(f => f.severity === 'high');
  
  const finalState = (hasCritical || hasHigh) ? LifecycleState.FAILED : LifecycleState.PASSED;

  return {
    pluginName: name,
    state: finalState,
    data: {
      score: metrics.operationsComplianceScore,
      coverage: 100, // Policy defines the surface area completely
      findings,
      metrics,
    }
  };
}
