'use client';

export default function KnowledgeGraphPreview() {
  return (
    <section className="py-24 bg-neutral-950 border-t border-neutral-900 overflow-hidden" aria-labelledby="graph-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-950/30 border border-emerald-900/50 px-3 py-1.5 rounded-full text-xs font-mono text-emerald-400 uppercase tracking-widest">
              Architecture
            </div>
            <h2 id="graph-heading" className="text-4xl md:text-5xl font-serif text-white leading-tight">
              Powered by the<br />
              <span className="text-emerald-500">Knowledge Graph</span>
            </h2>
            <p className="text-lg text-neutral-400 max-w-lg mx-auto lg:mx-0">
              Every story, entity, and topic is interconnected in a graph of verifiable intelligence.
            </p>
          </div>
          
          <div className="flex-1 w-full max-w-md mx-auto relative h-[400px]">
            {/* Lightweight Static SVG Graph per CTO request */}
            <svg viewBox="0 0 400 400" className="w-full h-full text-neutral-800 drop-shadow-2xl">
              {/* Edges */}
              <line x1="200" y1="200" x2="100" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" style={{ animationDelay: '0s' }} />
              <line x1="200" y1="200" x2="300" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" style={{ animationDelay: '1s' }} />
              <line x1="200" y1="200" x2="100" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" style={{ animationDelay: '2s' }} />
              <line x1="200" y1="200" x2="300" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" style={{ animationDelay: '3s' }} />
              
              {/* Nodes */}
              <circle cx="200" cy="200" r="40" fill="#059669" className="shadow-xl" />
              <text x="200" y="205" textAnchor="middle" fill="white" className="font-mono text-xs font-bold uppercase tracking-widest">AI</text>

              <circle cx="100" cy="100" r="30" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
              <text x="100" y="104" textAnchor="middle" fill="#a1a1aa" className="font-sans text-[10px] font-medium">OpenAI</text>

              <circle cx="300" cy="100" r="30" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
              <text x="300" y="104" textAnchor="middle" fill="#a1a1aa" className="font-sans text-[10px] font-medium">Apple</text>

              <circle cx="100" cy="300" r="30" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
              <text x="100" y="304" textAnchor="middle" fill="#a1a1aa" className="font-sans text-[10px] font-medium">Microsoft</text>

              <circle cx="300" cy="300" r="30" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
              <text x="300" y="304" textAnchor="middle" fill="#a1a1aa" className="font-sans text-[10px] font-medium">Altman</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
