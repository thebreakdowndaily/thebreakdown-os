import React from 'react';
import { ExternalInterfaceProjection } from '@/types/extensibility';

interface ExternalInterfaceControlPanelProps {
  projection: ExternalInterfaceProjection;
}

export default function ExternalInterfaceControlPanel({ projection }: ExternalInterfaceControlPanelProps) {
  const { apiVersions, endpoints, activeWebhooks, webhookMetrics, registeredPlugins, sdkContracts } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              {projection.platformVersion} External Interfaces & Extensibility
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/40 font-bold font-mono">
              APIs: {apiVersions.length} Versions Active
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Public API Gateway, HMAC Webhooks & SDK Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Webhook Health:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
            {(webhookMetrics.successRate * 100).toFixed(1)}% Success
          </span>
        </div>
      </div>

      {/* API Version Registry & Endpoints */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Public API Gateway Versioned Contracts ({endpoints.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          {endpoints.map((ep) => (
            <div key={ep.endpointId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-amber-400 font-bold">{ep.method} {ep.path}</strong>
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded font-bold">
                  {ep.version}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Contract: {ep.projectionContract}</p>
              <span className="text-[10px] text-gray-400 block pt-1 border-t border-gray-800">
                Rate Limit: {ep.rateLimitReqPerMin} req/min
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Delivery & Registered Plugins (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Active Webhook Subscriptions */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Active HMAC Webhook Subscriptions ({activeWebhooks.length})
            </span>
            <span className="text-[10px] text-gray-400">HMAC SHA-256 Signed</span>
          </div>
          <div className="space-y-2">
            {activeWebhooks.map((sub) => (
              <div key={sub.subscriptionId} className="border-b border-gray-800 pb-2">
                <strong className="text-gray-200 block truncate">{sub.targetUrl}</strong>
                <span className="text-[10px] text-emerald-300">Events: {sub.subscribedEvents.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Registered Extension Plugins */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Registered Extension Plugins ({registeredPlugins.length})
          </span>
          <div className="space-y-2">
            {registeredPlugins.map((plug) => (
              <div key={plug.manifest.pluginId} className="border-b border-gray-800 pb-2">
                <div className="flex justify-between items-center">
                  <strong className="text-gray-200 font-bold">{plug.manifest.name}</strong>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded uppercase font-bold">
                    {plug.manifest.trustLevel}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">
                  Capabilities: {plug.manifest.requiredCapabilities.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer SDK Pipeline Status */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Developer Client SDK Code Generation ({sdkContracts.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {sdkContracts.map((sdk) => (
            <div key={sdk.language} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <strong className="text-emerald-300 font-bold block">{sdk.language} Client SDK ({sdk.sdkVersion})</strong>
                <span className="text-[10px] text-gray-400">Spec: {sdk.generatedFromSpec}</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded uppercase">
                {sdk.buildStatus}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
