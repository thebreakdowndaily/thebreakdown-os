import * as fs from 'fs';
import * as path from 'path';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

export const name = 'knowledge-graph-audit';
export const description = 'Verifies the structural integrity of the canonical knowledge graph';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

interface Finding {
  severity: Severity;
  message: string;
}

export async function run(context: AuditContext): Promise<AuditResult> {
  const { repoRoot } = context;
  const policyPath = path.join(repoRoot, 'audit/plugins/knowledge-graph-audit/policy.json');
  let policy: any = {};
  if (fs.existsSync(policyPath)) {
    policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  }

  const findings: Finding[] = [];
  
  let registriesPassed = 1;
  let registriesTotal = 1;
  
  let schemasPassed = 1;
  let schemasTotal = 1;
  
  let integrityPassed = 1;
  let integrityTotal = 1;

  const kgPolicy = policy.knowledgeGraph || {};

  // 1. Registries
  if (kgPolicy.registries && kgPolicy.registries.required) {
    const registryPaths = kgPolicy.registries.paths || [];
    let allRegistriesExist = true;
    
    for (const regPath of registryPaths) {
      if (!fs.existsSync(path.join(repoRoot, regPath))) {
        findings.push({ 
          severity: kgPolicy.registries.severity, 
          message: `Missing canonical knowledge registry: ${regPath}` 
        });
        allRegistriesExist = false;
      }
    }

    if (!allRegistriesExist) {
      registriesPassed = 0;
    }
  }

  // 2. Schemas
  if (kgPolicy.schemas && kgPolicy.schemas.required) {
    const schemaPaths = kgPolicy.schemas.paths || [];
    let allSchemasExist = true;
    
    for (const schemaPath of schemaPaths) {
      if (!fs.existsSync(path.join(repoRoot, schemaPath))) {
        findings.push({ 
          severity: kgPolicy.schemas.severity, 
          message: `Missing canonical schema file: ${schemaPath}` 
        });
        allSchemasExist = false;
      }
    }

    if (!allSchemasExist) {
      schemasPassed = 0;
    }
  }

  // 3. Integrity (Unique IDs) - Prototype implementation
  if (kgPolicy.integrity && kgPolicy.integrity.uniqueIds && kgPolicy.integrity.uniqueIds.required) {
    const registryBase = path.join(repoRoot, 'registry');
    if (fs.existsSync(registryBase)) {
      const seenIds = new Set<string>();
      const walkSync = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isDirectory()) {
            walkSync(filePath);
          } else if (file.endsWith('.json')) {
            try {
              const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              if (content.id) {
                if (seenIds.has(content.id)) {
                  findings.push({
                    severity: kgPolicy.integrity.uniqueIds.severity,
                    message: `Duplicate Knowledge Object ID found: ${content.id} in ${path.relative(repoRoot, filePath)}`
                  });
                  integrityPassed = 0;
                }
                seenIds.add(content.id);
              }
            } catch (e) {
              // Ignore malformed JSON, operations plugin catches this
            }
          }
        }
      };
      
      walkSync(registryBase);
    }
  }

  const registriesScore = (registriesPassed / registriesTotal) * 100;
  const schemasScore = (schemasPassed / schemasTotal) * 100;
  const integrityScore = (integrityPassed / integrityTotal) * 100;

  // Compute Knowledge Graph Health Score (KGHS)
  const kgHealthScore = (registriesScore * 30 + schemasScore * 30 + integrityScore * 40) / 100;

  const hasCriticalOrHigh = findings.some(f => f.severity === 'critical' || f.severity === 'high');

  return {
    pluginName: name,
    state: hasCriticalOrHigh ? LifecycleState.FAILED : LifecycleState.PASSED,
    data: {
      score: kgHealthScore,
      coverage: 100, // Evaluated all schemas/registries
      findings,
      metrics: {
        registriesScore,
        schemasScore,
        integrityScore,
        knowledgeGraphHealthScore: kgHealthScore
      }
    }
  };
}
