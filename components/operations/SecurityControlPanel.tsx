import React from 'react';
import { SecurityContextProjection } from '@/types/security';

interface SecurityControlPanelProps {
  projection: SecurityContextProjection;
}

export default function SecurityControlPanel({ projection }: SecurityControlPanelProps) {
  const { identity, sessionState, capabilities, recentAuditLogs } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              {projection.platformVersion} Security & RBAC Subsystem
            </span>
            <span className="text-[10px] bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded border border-red-500/40 font-bold font-mono">
              Security Projection v{projection.projectionVersion}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Security Context & Role-Based Access Control
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Identity: <strong className="text-gray-200">{identity.username}</strong></span>
          <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/40 font-bold uppercase">
            Role: {identity.role}
          </span>
          <span className={`px-2.5 py-1 rounded-full border font-bold uppercase ${
            sessionState === 'ACTIVE'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : sessionState === 'ANONYMOUS'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40'
          }`}>
            {sessionState}
          </span>
        </div>
      </div>

      {/* Capabilities Matrix Grid (8 Capability Badges) */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Effective User Capabilities Matrix
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          <div className={`p-3 rounded-lg border flex justify-between items-center ${capabilities.canReadPublic ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-gray-900/60 border-gray-800 text-gray-500'}`}>
            <span>Read Public</span>
            <span className="font-mono font-bold">{capabilities.canReadPublic ? '✓' : '✗'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${capabilities.canResearch ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-gray-900/60 border-gray-800 text-gray-500'}`}>
            <span>Research</span>
            <span className="font-mono font-bold">{capabilities.canResearch ? '✓' : '✗'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${capabilities.canEditContent ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-gray-900/60 border-gray-800 text-gray-500'}`}>
            <span>Edit Drafts</span>
            <span className="font-mono font-bold">{capabilities.canEditContent ? '✓' : '✗'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${capabilities.canReviewContent ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-gray-900/60 border-gray-800 text-gray-500'}`}>
            <span>Review Content</span>
            <span className="font-mono font-bold">{capabilities.canReviewContent ? '✓' : '✗'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${capabilities.canPublishContent ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-gray-900/60 border-gray-800 text-gray-500'}`}>
            <span>Publish Content</span>
            <span className="font-mono font-bold">{capabilities.canPublishContent ? '✓' : '✗'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${capabilities.canViewOperations ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-gray-900/60 border-gray-800 text-gray-500'}`}>
            <span>View Operations</span>
            <span className="font-mono font-bold">{capabilities.canViewOperations ? '✓' : '✗'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${capabilities.canRunJobs ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-gray-900/60 border-gray-800 text-gray-500'}`}>
            <span>Run Jobs</span>
            <span className="font-mono font-bold">{capabilities.canRunJobs ? '✓' : '✗'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${capabilities.canManageSecurity ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-gray-900/60 border-gray-800 text-gray-500'}`}>
            <span>Manage Security</span>
            <span className="font-mono font-bold">{capabilities.canManageSecurity ? '✓' : '✗'}</span>
          </div>

        </div>
      </div>

      {/* Audit Stream Log */}
      {recentAuditLogs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Security Authorization Audit Log ({recentAuditLogs.length})
          </h4>
          <div className="space-y-2 text-xs font-mono">
            {recentAuditLogs.map((log) => (
              <div key={log.eventId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                    log.decision === 'ALLOW'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {log.decision}
                  </span>
                  <span className="text-gray-200 font-bold">[{log.resourceCategory}] {log.action}</span>
                  <span className="text-gray-400 text-[11px]">{log.reason}</span>
                </div>
                <span className="text-gray-500 text-[11px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
