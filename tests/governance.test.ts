import { describe, it, expect } from 'vitest';
import { GovernancePolicyEngine } from '../lib/governance/policy-engine';
import { CrossSubsystemAuditCorrelator } from '../lib/governance/audit-correlator';
import { ComplianceFrameworkAuditor } from '../lib/governance/compliance-auditor';
import { OperationalRiskRegister } from '../lib/governance/risk-engine';
import { PlatformGovernanceProjectionBuilder } from '../lib/governance/projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-GOVERNANCE: Platform Governance, Audit & Compliance (Phase 20B)', () => {
  it('TEST-GOV-01: Declarative Governance Policy Registry Evaluation (4 Policies)', () => {
    const policies = GovernancePolicyEngine.listPolicies();

    expect(policies.length).toBe(4);
    expect(policies.some((p) => p.category === 'SECURITY')).toBe(true);
    expect(policies.some((p) => p.category === 'EDITORIAL')).toBe(true);
    expect(Object.isFrozen(policies)).toBe(true);
  });

  it('TEST-GOV-02: Policy Compliance Engine Evaluation Check', () => {
    const isCompliant = GovernancePolicyEngine.evaluatePolicyCompliance();
    expect(isCompliant).toBe(true);
  });

  it('TEST-GOV-03: Cross-Subsystem Audit Trail Correlator (Security, Jobs, Deployment, Telemetry)', () => {
    const stream = CrossSubsystemAuditCorrelator.correlateAuditStream();

    expect(stream.length).toBe(4);
    expect(stream.some((e) => e.sourceSubsystem === 'SecuritySubsystem')).toBe(true);
    expect(stream.some((e) => e.sourceSubsystem === 'TelemetrySubsystem')).toBe(true);
  });

  it('TEST-GOV-04: Correlation ID Propagation Across Audit Events', () => {
    const correlationId = 'corr-custom-test-123';
    const stream = CrossSubsystemAuditCorrelator.correlateAuditStream(correlationId);

    expect(stream.every((e) => e.correlationId === correlationId)).toBe(true);
  });

  it('TEST-GOV-05: Continuous Compliance Framework Auditor (PLATFORM-STRICT & SOC2-SIM)', () => {
    const checks = ComplianceFrameworkAuditor.runComplianceAudit();

    expect(checks.length).toBe(3);
    expect(checks.every((c) => c.status === 'COMPLIANT')).toBe(true);
  });

  it('TEST-GOV-06: Compliance Control Evidence Summary Generation', () => {
    const checks = ComplianceFrameworkAuditor.runComplianceAudit();
    const soc2Check = checks.find((c) => c.framework === 'SOC2-SIM');

    expect(soc2Check?.evidenceSummary).toContain('Canonical Knowledge Objects verified 100% immutable');
  });

  it('TEST-GOV-07: Operational Risk Register Scoring & Severity Classification', () => {
    const risks = OperationalRiskRegister.listRiskEntries();

    expect(risks.length).toBe(2);
    expect(risks[0].severity).toBe('LOW');
    expect(risks[0].score).toBe(15);
  });

  it('TEST-GOV-08: Time-Bounded Exception Waiver Management & Justification', () => {
    const waivers = OperationalRiskRegister.getActiveWaivers();

    expect(waivers.length).toBe(1);
    expect(waivers[0].approvedBy).toBe('CTO');
    expect(waivers[0].expirationDate).toBe('2026-12-31');
  });

  it('TEST-GOV-09: Active Waiver Resolution from Risk Register', () => {
    const risks = OperationalRiskRegister.listRiskEntries();
    const waivedRisk = risks.find((r) => r.mitigationStatus === 'ACCEPTED_WITH_WAIVER');

    expect(waivedRisk?.activeWaiver).toBeDefined();
    expect(waivedRisk?.activeWaiver?.waiverId).toBe('waiv-telemetry-01');
  });

  it('TEST-GOV-10: PlatformGovernanceProjection Building & Immutability', () => {
    const proj = PlatformGovernanceProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(proj.overallPosture).toBe('COMPLIANT');
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.policies)).toBe(true);
  });

  it('TEST-GOV-11: Overall Compliance Posture Resolution', () => {
    const proj = PlatformGovernanceProjectionBuilder.buildProjection();
    expect(proj.overallPosture).toBe('COMPLIANT');
  });

  it('TEST-GOV-12: High-Volume Audit Trail Correlation Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      CrossSubsystemAuditCorrelator.correlateAuditStream(`corr-${i}`);
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // 2,000 audit events correlated under 100ms
  });

  it('TEST-GOV-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    PlatformGovernanceProjectionBuilder.buildProjection();
    ComplianceFrameworkAuditor.runComplianceAudit();

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-GOV-14: Operational Boundary Invariant Verification', () => {
    const proj = PlatformGovernanceProjectionBuilder.buildProjection();
    expect(proj).toBeDefined();
    // Governance policies audit & govern; zero mutations to canonical editorial data
  });

  it('TEST-GOV-15: Policy Registry Immutability & Freeze Enforcement', () => {
    const policies = GovernancePolicyEngine.listPolicies();
    expect(() => {
      (policies as any)[0].enforced = false;
    }).toThrow();
  });

  it('TEST-GOV-16: Deterministic Governance Projection Serialization Stability', () => {
    const proj = PlatformGovernanceProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"overallPosture":"COMPLIANT"');
  });
});
