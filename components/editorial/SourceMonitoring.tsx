import React from 'react';

interface SourceMonitoringProps {
  data: {
    totalSources: number;
    activeSources: number;
    failingSources: number;
    updatesToday: number;
  };
  systemStatus: {
    scheduler: string;
    registry: string;
    engine: string;
  };
}

export default function SourceMonitoring({ data, systemStatus }: SourceMonitoringProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Knowledge Source Monitoring
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-5 rounded-xl">
          <div className="text-neutral-500 font-mono text-xs uppercase tracking-wider mb-2">Total Sources</div>
          <div className="text-3xl font-light text-white">{data.totalSources}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-5 rounded-xl">
          <div className="text-neutral-500 font-mono text-xs uppercase tracking-wider mb-2">Active</div>
          <div className="text-3xl font-light text-emerald-400">{data.activeSources}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-rose-900/50 p-5 rounded-xl">
          <div className="text-rose-500/70 font-mono text-xs uppercase tracking-wider mb-2">Failing</div>
          <div className="text-3xl font-light text-rose-500">{data.failingSources}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-5 rounded-xl">
          <div className="text-neutral-500 font-mono text-xs uppercase tracking-wider mb-2">Updates Today</div>
          <div className="text-3xl font-light text-blue-400">+{data.updatesToday}</div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 flex gap-8">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${systemStatus.scheduler === 'Operational' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <span className="text-sm text-neutral-400 font-mono">Scheduler: {systemStatus.scheduler}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${systemStatus.registry === 'Operational' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <span className="text-sm text-neutral-400 font-mono">Registry: {systemStatus.registry}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${systemStatus.engine === 'Operational' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <span className="text-sm text-neutral-400 font-mono">Engine: {systemStatus.engine}</span>
        </div>
      </div>
    </section>
  );
}
