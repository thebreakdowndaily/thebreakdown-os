import * as fs from 'fs';
import * as path from 'path';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

export const name = 'editorial-audit';
export const description = 'Verifies editorial completeness and alignment with the Editorial Constitution';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

interface Finding {
  severity: Severity;
  message: string;
}

export async function run(context: AuditContext): Promise<AuditResult> {
  const { repoRoot } = context;
  const policyPath = path.join(repoRoot, 'audit/plugins/editorial-audit/policy.json');
  let policy: any = {};
  if (fs.existsSync(policyPath)) {
    policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  }

  const findings: Finding[] = [];
  
  let constitutionPassed = 1;
  let constitutionTotal = 1;
  
  let structurePassed = 1;
  let structureTotal = 1;
  
  let metadataPassed = 1;
  let metadataTotal = 1;

  let evidencePassed = 1;
  let evidenceTotal = 1;

  const edPolicy = policy.editorial || {};

  // 1. Constitution Presence
  if (edPolicy.constitution && edPolicy.constitution.required) {
    const constitutionPaths = edPolicy.constitution.paths || [];
    let hasConstitution = false;
    
    for (const p of constitutionPaths) {
      if (fs.existsSync(path.join(repoRoot, p))) {
        hasConstitution = true;
        break;
      }
    }

    if (!hasConstitution) {
      findings.push({ 
        severity: edPolicy.constitution.severity, 
        message: `Missing Editorial Constitution document (e.g. ${constitutionPaths.join(', ')})` 
      });
      constitutionPassed = 0;
    }
  }

  // Helper to scan JSON registry objects
  const scanKnowledgeObjects = (callback: (content: any, filePath: string) => void) => {
    const registryBase = path.join(repoRoot, 'registry');
    if (!fs.existsSync(registryBase)) return;
    
    const walkSync = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          walkSync(filePath);
        } else if (file.endsWith('.json')) {
          try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            callback(content, filePath);
          } catch (e) {
            // Ignore malformed JSON
          }
        }
      }
    };
    walkSync(registryBase);
  };

  // Keep track of failures to avoid spamming the same error
  let missingStructure = false;
  let missingMetadata = false;
  let missingEvidence = false;
  let scannedObjects = 0;

  scanKnowledgeObjects((content, filePath) => {
    scannedObjects++;
    // We only care about objects that look like full stories/chapters for some of these checks
    // For prototype purposes, we'll check any object that has a 'title' or 'status'
    const isStory = content.type === 'story' || content.type === 'chapter';
    
    if (isStory) {
      // 2. Structure (Four-layer markers)
      // Check for layers in content (e.g. whatHappened, whatEvidenceShows, whereHistoriansDisagree, whyItMatters)
      if (edPolicy.structure && edPolicy.structure.required) {
        if (!content.whatHappened && !content.layers) {
          missingStructure = true;
        }
      }

      // 3. Metadata
      if (edPolicy.metadata && edPolicy.metadata.required) {
        for (const field of (edPolicy.metadata.fields || [])) {
          if (content[field] === undefined) {
            missingMetadata = true;
          }
        }
      }

      // 4. Evidence Sections
      if (edPolicy.evidenceSections && edPolicy.evidenceSections.required) {
        for (const section of (edPolicy.evidenceSections.sections || [])) {
          if (content[section] === undefined || (Array.isArray(content[section]) && content[section].length === 0)) {
            missingEvidence = true;
          }
        }
      }
    }
  });

  if (scannedObjects > 0) {
    if (missingStructure) {
      findings.push({
        severity: edPolicy.structure.severity || 'high',
        message: 'Some knowledge objects are missing Four-Layer structure markers'
      });
      structurePassed = 0;
    }
    
    if (missingMetadata) {
      findings.push({
        severity: edPolicy.metadata.severity || 'high',
        message: 'Some knowledge objects are missing required metadata fields'
      });
      metadataPassed = 0;
    }

    if (missingEvidence) {
      findings.push({
        severity: edPolicy.evidenceSections.severity || 'medium',
        message: 'Some knowledge objects are missing required evidence sections (e.g. claims, sources)'
      });
      evidencePassed = 0;
    }
  }

  const constitutionScore = (constitutionPassed / constitutionTotal) * 100;
  const structureScore = (structurePassed / structureTotal) * 100;
  const metadataScore = (metadataPassed / metadataTotal) * 100;
  const evidenceScore = (evidencePassed / evidenceTotal) * 100;

  // Compute Editorial Quality Score (EQS)
  const editorialQualityScore = (constitutionScore * 40 + structureScore * 20 + metadataScore * 20 + evidenceScore * 20) / 100;

  const hasCriticalOrHigh = findings.some(f => f.severity === 'critical' || f.severity === 'high');

  return {
    pluginName: name,
    state: hasCriticalOrHigh ? LifecycleState.FAILED : LifecycleState.PASSED,
    data: {
      score: editorialQualityScore,
      coverage: scannedObjects > 0 ? 100 : 0, // Coverage based on whether we found objects to scan
      findings,
      metrics: {
        constitutionScore,
        structureScore,
        metadataScore,
        evidenceScore,
        editorialQualityScore,
        scannedObjects
      }
    }
  };
}
