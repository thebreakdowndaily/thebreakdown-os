import Link from 'next/link';
import type { RelatedIntelligenceData } from './types';
import Card from '@/components/ui/Card';

function entityHref(entity: { slug: string; type: string }): string {
  if (entity.type === 'organization') return `/organization/${entity.slug}`;
  if (entity.type === 'country') return `/country/${entity.slug}`;
  return `/entity/${entity.slug}`;
}

export default function RelatedIntelligenceBlock({ topics, entities, countries, organizations, stories }: RelatedIntelligenceData) {
  const hasContent = (topics && topics.length > 0) || (entities && entities.length > 0) ||
    (countries && countries.length > 0) || (organizations && organizations.length > 0) ||
    (stories && stories.length > 0);

  if (!hasContent) return null;

  return (
    <section id="related-intelligence" aria-label="Related intelligence" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Continue Exploring</h2>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        {stories && stories.length > 0 && (
          <Card className="p-5" accent="gold">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">Stories</h3>
            <ul className="space-y-2">
              {stories.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link href={`/story/${s.slug}`} className="text-sm text-[#A1A1AA] hover:text-[#D4A843] transition-colors line-clamp-1">
                    {s.headline}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {topics && topics.length > 0 && (
          <Card className="p-5" accent="gold">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <Link key={t.slug} href={`/topic/${t.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#1D1D1D] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843]/30 hover:text-[#D4A843] transition-colors"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </Card>
        )}

        {entities && entities.length > 0 && (
          <Card className="p-5" accent="gold">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">Entities</h3>
            <div className="flex flex-wrap gap-2">
              {entities.map((e) => (
                <Link key={e.slug} href={entityHref(e)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#1D1D1D] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843]/30 hover:text-[#D4A843] transition-colors"
                >
                  {e.name}
                </Link>
              ))}
            </div>
          </Card>
        )}

        {countries && countries.length > 0 && (
          <Card className="p-5" accent="gold">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">Countries</h3>
            <div className="flex flex-wrap gap-2">
              {countries.map((c) => (
                <Link key={c.slug} href={`/country/${c.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#1D1D1D] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843]/30 hover:text-[#D4A843] transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </Card>
        )}

        {organizations && organizations.length > 0 && (
          <Card className="p-5" accent="gold">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">Organizations</h3>
            <div className="flex flex-wrap gap-2">
              {organizations.map((o) => (
                <Link key={o.slug} href={`/organization/${o.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#1D1D1D] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843]/30 hover:text-[#D4A843] transition-colors"
                >
                  {o.name}
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
