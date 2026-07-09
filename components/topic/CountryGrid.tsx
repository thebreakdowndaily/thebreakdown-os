import Link from 'next/link';

interface CountryCard {
  slug: string;
  name: string;
}

export default function CountryGrid({ countries }: { countries: CountryCard[] }) {
  if (countries.length === 0) return null;

  return (
    <section aria-label="Countries" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Countries</h2>
      <div className="flex flex-wrap gap-2">
        {countries.map((c) => (
          <Link
            key={c.slug}
            href={`/entity/${c.slug}`}
            className="px-4 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-sm text-[#A1A1AA] hover:text-[#F5F5F5] hover:border-[#D4A843]/30 transition-all"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
