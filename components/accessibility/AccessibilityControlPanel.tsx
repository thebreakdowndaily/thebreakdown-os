import React from 'react';
import { AccessibilityAuditReport } from '@/types/accessibility';

interface AccessibilityControlPanelProps {
  report: AccessibilityAuditReport;
}

export default function AccessibilityControlPanel({ report }: AccessibilityControlPanelProps) {
  const { profiles, overallStatus, accessibilityDisclaimer, auditedAt, engineVersion, wcagVersion } = report;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {report.platformVersion} Accessibility Subsystem
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded border font-bold font-mono ${
                overallStatus === 'COMPLIANT'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              Current Status: {overallStatus}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mt-1">
            WCAG 2.2 AA Accessibility & UX Certification Telemetry
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Audited at: {auditedAt} | Engine: {engineVersion} | Standard: {wcagVersion}
          </p>
        </div>
      </div>

      {/* Accessibility Safeguard Banner (Refinement 1) */}
      <div className="bg-gray-900/80 border border-emerald-500/40 rounded-xl p-4 text-xs font-mono text-emerald-300 space-y-1">
        <strong className="block uppercase text-[11px] font-bold">♿ Accessibility Infrastructure Safeguard</strong>
        <p className="text-gray-300 text-[11px]">{accessibilityDisclaimer}</p>
      </div>

      {/* Audited Profiles & Criterion Scores (Refinement 3) */}
      <div className="space-y-4 font-mono text-xs">
        <strong className="text-xs font-bold text-gray-300 uppercase">Audited Reader Surface Compliance Profiles ({profiles.length})</strong>
        
        {profiles.map((prof) => (
          <div key={prof.profileId} className="bg-gray-900/60 p-5 rounded-xl border border-gray-800 space-y-4">
            
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700 font-bold uppercase">
                  Target Route: {prof.routePath}
                </span>
                <h4 className="text-sm font-bold text-gray-200 mt-1">WCAG Level {prof.level} Profile</h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-400">{prof.overallScore}/100</span>
                <span className="block text-[10px] text-gray-400">Compliance Score</span>
              </div>
            </div>

            {/* Feature Check Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-gray-800/40 p-2 rounded border border-gray-800 flex justify-between items-center">
                <span>Keyboard Trap:</span>
                <strong className={prof.hasKeyboardTrap ? 'text-red-400' : 'text-emerald-400'}>
                  {prof.hasKeyboardTrap ? 'TRAP DETECTED' : 'NONE'}
                </strong>
              </div>
              <div className="bg-gray-800/40 p-2 rounded border border-gray-800 flex justify-between items-center">
                <span>Skip Link:</span>
                <strong className={prof.hasSkipLink ? 'text-emerald-400' : 'text-amber-400'}>
                  {prof.hasSkipLink ? 'PRESENT' : 'MISSING'}
                </strong>
              </div>
              <div className="bg-gray-800/40 p-2 rounded border border-gray-800 flex justify-between items-center">
                <span>Contrast AA:</span>
                <strong className={prof.contrastRatioPass ? 'text-emerald-400' : 'text-red-400'}>
                  {prof.contrastRatioPass ? 'PASS' : 'FAIL'}
                </strong>
              </div>
              <div className="bg-gray-800/40 p-2 rounded border border-gray-800 flex justify-between items-center">
                <span>Reduced Motion:</span>
                <strong className={prof.motionPass ? 'text-emerald-400' : 'text-amber-400'}>
                  {prof.motionPass ? 'PASS' : 'WARNING'}
                </strong>
              </div>
            </div>

            {/* Criterion-Level Scoring Table (Refinement 3) */}
            <div className="space-y-2">
              <strong className="text-[11px] font-bold text-gray-400 uppercase block">WCAG 2.2 Criterion Audit Scores</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {prof.criteriaScores.map((crit) => (
                  <div key={crit.criterionId} className="bg-gray-800/40 p-2.5 rounded border border-gray-800 flex justify-between items-center">
                    <div>
                      <span className="text-gray-300 font-bold block">{crit.criterionId} {crit.criterionName}</span>
                      <span className="text-gray-500 text-[10px]">Principle: {crit.principle} | Level {crit.level}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      crit.isCompliant
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}>
                      {crit.isCompliant ? 'PASS' : `FAIL (${crit.violationCount})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
