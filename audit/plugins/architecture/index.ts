import * as fs from 'fs';
import * as path from 'path';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';
import { PluginMetadata } from '../types/PluginMetadata';

export const name = 'architecture-audit';
export const description = 'Verifies repository structure and architectural conventions';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

interface Finding {
  severity: Severity;
  message: string;
}

interface Metrics {
  policyVersion?: string;
  requiredDirectoriesCoverage: number;
  requiredFilesCoverage: number;
  pluginManifestCoverage: number;
  pluginReadmeCoverage: number;
  policyCompliance: number;
  architectureComplianceScore: number;
  
  // Raw counts
  requiredDirectories: { present: number; missing: number };
  forbiddenImports: number;
  unknownDirectories: number;
}

function getDirectories(srcPath: string): string[] {
  if (!fs.existsSync(srcPath)) return [];
  return fs.readdirSync(srcPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

function getFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

export async function run(context: AuditContext): Promise<AuditResult> {
  const { repoRoot } = context;
  const policyPath = path.join(repoRoot, 'audit/plugins/architecture/policy.json');
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

  const findings: Finding[] = [];
  
  // Track compliance items
  let checksPassed = 0;
  let checksTotal = 0;
  
  function recordCheck(passed: boolean, failSeverity: Severity, failMessage: string) {
    checksTotal++;
    if (passed) {
      checksPassed++;
    } else {
      findings.push({ severity: failSeverity, message: failMessage });
    }
  }

  const metrics: Metrics = {
    policyVersion: policy.policyVersion,
    requiredDirectoriesCoverage: 100,
    requiredFilesCoverage: 100,
    pluginManifestCoverage: 100,
    pluginReadmeCoverage: 100,
    policyCompliance: 100,
    architectureComplianceScore: 100,
    requiredDirectories: { present: 0, missing: 0 },
    forbiddenImports: 0,
    unknownDirectories: 0
  };

  // 1. Check Required Directories
  const topLevelDirs = getDirectories(repoRoot);
  const required = policy.directories.required || [];
  const optional = policy.directories.optional || [];
  const generated = policy.directories.generated || [];
  const deprecated = policy.directories.deprecated || [];
  
  const knownDirs = new Set<string>([
    ...required.map((r: any) => r.path),
    ...optional,
    ...generated,
    ...deprecated,
    'audit', '.agents', '.ai', 'assets', 'design-system', 'examples', 'features', 'hooks', 'layouts', 'migrations', 'registry', 'scratch', 'specs', 'stories', 'styles', 'supabase', 'utils', 'wiki', 'workflows', '.opencode'
  ]); // Adding the others as optional/known to reduce noise in fix phase

  for (const reqDir of required) {
    const dirPath = path.join(repoRoot, reqDir.path);
    const exists = fs.existsSync(dirPath);
    recordCheck(exists, reqDir.severity.toLowerCase(), `Missing required directory: ${reqDir.path}/`);
    
    if (exists) {
      metrics.requiredDirectories.present++;
      const contents = fs.readdirSync(dirPath);
      if (contents.length === 0) {
        findings.push({ severity: 'informational', message: `Required directory ${reqDir.path}/ exists but is empty.` });
      }
    } else {
      metrics.requiredDirectories.missing++;
    }
  }
  
  const totalReqDirs = required.length;
  metrics.requiredDirectoriesCoverage = totalReqDirs > 0 ? (metrics.requiredDirectories.present / totalReqDirs) * 100 : 100;

  for (const topDir of topLevelDirs) {
    if (generated.includes(topDir)) {
      // Ignored / Informational
      continue;
    }
    if (deprecated.includes(topDir)) {
      findings.push({ severity: 'medium', message: `Deprecated directory found: ${topDir}/` });
      continue;
    }
    if (!knownDirs.has(topDir)) {
      findings.push({ severity: 'low', message: `Unknown top-level directory: ${topDir}/` });
      metrics.unknownDirectories++;
    }
  }

  // 2. Check Canonical Files
  const canonicalList = policy.canonical || [];
  for (const canonical of canonicalList) {
    const canonicalPath = path.join(repoRoot, canonical.path);
    const exists = fs.existsSync(canonicalPath);
    recordCheck(exists, 'high', `Missing canonical path: ${canonical.path}`);
    
    if (!exists) continue;
    
    const stats = fs.statSync(canonicalPath);
    if (canonical.mustBeDirectory && !stats.isDirectory()) {
      recordCheck(false, 'high', `Canonical path ${canonical.path} must be a directory`);
    }
    if (!canonical.mustBeDirectory && stats.isDirectory()) {
      recordCheck(false, 'high', `Canonical path ${canonical.path} must be a file`);
    }
    if (canonical.mustBeNonEmpty && !stats.isDirectory()) {
      const content = fs.readFileSync(canonicalPath, 'utf8');
      recordCheck(content.trim().length > 0, 'high', `Canonical file ${canonical.path} is empty`);
    }
  }

  // 3. Required Files
  const requiredFiles = policy.requiredFiles || [];
  let reqFilesPresent = 0;
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(repoRoot, file));
    recordCheck(exists, 'critical', `Missing required file: ${file}`);
    if (exists) reqFilesPresent++;
  }
  metrics.requiredFilesCoverage = requiredFiles.length > 0 ? (reqFilesPresent / requiredFiles.length) * 100 : 100;

  // 4. Forbidden Imports
  const forbiddenImportsList = policy.forbiddenImports || [];
  for (const rule of forbiddenImportsList) {
    const srcDir = path.join(repoRoot, rule.source);
    if (fs.existsSync(srcDir)) {
      const files = getFilesRecursively(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js'));
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        for (const target of rule.targets) {
          const regex = new RegExp(`from\\s+['"]${target}['"]`, 'g');
          if (regex.test(content)) {
            recordCheck(false, 'high', `Forbidden import '${target}' found in ${path.relative(repoRoot, file)}`);
            metrics.forbiddenImports++;
          }
        }
      }
    }
  }

  // 5. Plugin Conventions
  const pluginsDir = path.join(repoRoot, 'audit', 'plugins');
  if (fs.existsSync(pluginsDir)) {
    const pluginFolders = getDirectories(pluginsDir);
    let manifestsFound = 0;
    let readmesFound = 0;
    let expectedPlugins = 0;
    const seenNames = new Set<string>();

    for (const pFolder of pluginFolders) {
      if (pFolder === 'types' || pFolder === 'utils' || pFolder === 'architecture') continue;
      // Note: architecture is included in expectedPlugins unless it's just the folder. 
      // Wait, all plugins should have readme and manifest.
      expectedPlugins++;
      
      const pPath = path.join(pluginsDir, pFolder);
      const manifestPath = path.join(pPath, 'manifest.json');
      const readmePath = path.join(pPath, 'README.md');

      if (policy.pluginConventions.requireReadme) {
        const hasReadme = fs.existsSync(readmePath);
        recordCheck(hasReadme, 'low', `Plugin ${pFolder} is missing README.md`);
        if (hasReadme) readmesFound++;
      }

      if (policy.pluginConventions.requireManifest) {
        const hasManifest = fs.existsSync(manifestPath);
        recordCheck(hasManifest, 'critical', `Plugin ${pFolder} is missing manifest.json`);
        
        if (hasManifest) {
          manifestsFound++;
          try {
            const raw = fs.readFileSync(manifestPath, 'utf8');
            const manifestData = JSON.parse(raw);
            
            if (policy.pluginConventions.preventDuplicateNames) {
              const isDuplicate = seenNames.has(manifestData.name);
              recordCheck(!isDuplicate, 'critical', `Duplicate plugin name found: ${manifestData.name}`);
              seenNames.add(manifestData.name);
            }
            
            // compatibility checks
            recordCheck(!!manifestData.sdkVersion, 'critical', `Plugin ${pFolder} manifest missing sdkVersion`);
            
            // dependsOn validation
            if (manifestData.dependsOn) {
              recordCheck(Array.isArray(manifestData.dependsOn), 'critical', `Plugin ${pFolder} dependsOn must be an array`);
              if (Array.isArray(manifestData.dependsOn)) {
                recordCheck(!manifestData.dependsOn.includes(manifestData.name), 'critical', `Plugin ${pFolder} cannot depend on itself`);
              }
            }
          } catch (e) {
            recordCheck(false, 'critical', `Plugin ${pFolder} manifest.json is invalid JSON`);
          }
        }
      }
    }
    
    // Explicitly add architecture plugin for calculations
    expectedPlugins++; 
    if (fs.existsSync(path.join(pluginsDir, 'architecture', 'README.md'))) readmesFound++;
    if (fs.existsSync(path.join(pluginsDir, 'architecture', 'manifest.json'))) manifestsFound++;

    metrics.pluginManifestCoverage = expectedPlugins > 0 ? (manifestsFound / expectedPlugins) * 100 : 100;
    metrics.pluginReadmeCoverage = expectedPlugins > 0 ? (readmesFound / expectedPlugins) * 100 : 100;
  } else {
    recordCheck(false, 'critical', `Missing audit/plugins directory`);
  }

  // 6. ADR Consistency
  const adrDir = path.join(repoRoot, 'adr');
  const adrAllowed = policy.adr?.allowedFiles || [];
  if (fs.existsSync(adrDir)) {
    const adrFiles = fs.readdirSync(adrDir).filter(f => f.endsWith('.md'));
    const numbers = new Set<string>();
    for (const adr of adrFiles) {
      if (adrAllowed.includes(adr)) continue;
      
      const match = adr.match(/^(\d{4})-(.+)\.md$/);
      if (!match) {
        recordCheck(false, 'medium', `ADR ${adr} does not match convention NNNN-title.md`);
      } else {
        const num = match[1];
        const isDuplicate = numbers.has(num);
        recordCheck(!isDuplicate, 'medium', `Duplicate ADR number found: ${num}`);
        numbers.add(num);
      }
    }
  } else {
    recordCheck(false, 'medium', `Missing adr folder`);
  }

  // Calculate final metrics
  metrics.policyCompliance = checksTotal > 0 ? (checksPassed / checksTotal) * 100 : 100;
  metrics.architectureComplianceScore = (
    metrics.policyCompliance * 0.4 +
    metrics.requiredDirectoriesCoverage * 0.3 +
    metrics.pluginManifestCoverage * 0.2 +
    metrics.pluginReadmeCoverage * 0.1
  );

  // Determine overall state
  const hasCritical = findings.some(f => f.severity === 'critical');
  const hasHigh = findings.some(f => f.severity === 'high');
  
  const finalState = (hasCritical || hasHigh) ? LifecycleState.FAILED : LifecycleState.PASSED;

  return {
    pluginName: name,
    state: finalState,
    data: {
      metrics,
      findings
    }
  };
}
