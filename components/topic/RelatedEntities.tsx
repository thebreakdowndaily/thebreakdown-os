import Link from 'next/link';

interface EntityCard {
  slug: string;
  name: string;
  type: string;
}

const typeColors: Record<string, string> = {
  person: 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30',
  organization: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
  policy: 'bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/30',
  budget: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30',
  report: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
};

export default function RelatedEntities({ entities }: { entities: EntityCard[] }) {
  if (entities.length === 0) return null;

  return (
    <section aria-label="Related entities" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Related Entities</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {entities.map((e) => (
          <Link
            key={e.slug}
            href={`/entity/${e.slug}`}
            className="group rounded-xl bg-[#151515] border border-[#2A2A2A] p-4 hover:border-[#D4A843]/30 transition-colors"
          >
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border mb-2 ${typeColors[e.type] || typeColors.report}`}>
              {e.type}
            </span>
            <h3 className="text-sm font-medium text-[#F5F5F5] group-hover:text-[#D4A843] transition-colors">{e.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
