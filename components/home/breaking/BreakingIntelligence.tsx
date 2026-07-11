import Link from 'next/link';

interface BreakingIntelligenceProps {
  items: Array<{ category: string; title: string; href: string }>;
}

export default function BreakingIntelligence({ items }: BreakingIntelligenceProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="bg-emerald-950/20 border-y border-emerald-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Live Intelligence</span>
          </div>
          
          <div className="flex-1 w-full overflow-hidden relative">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide snap-x">
              {items.map((item, index) => (
                <Link 
                  key={index} 
                  href={item.href}
                  className="flex items-center gap-2 group whitespace-nowrap snap-start shrink-0"
                >
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 group-hover:text-neutral-400 transition-colors">
                    {item.category}
                  </span>
                  <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
