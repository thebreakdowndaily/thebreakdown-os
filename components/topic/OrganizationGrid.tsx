import Link from 'next/link';

interface OrgCard {
  slug: string;
  name: string;
}

export default function OrganizationGrid({ organizations }: { organizations: OrgCard[] }) {
  if (organizations.length === 0) return null;

  return (
    <section aria-label="Organizations" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Organizations</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {organizations.map((org) => (
          <Link
            key={org.slug}
            href={`/entity/${org.slug}`}
            className="group rounded-xl bg-[#151515] border border-[#2A2A2A] p-4 hover:border-[#D4A843]/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center mb-3">
              <span className="text-xs font-bold text-[#D4A843]">{org.name.charAt(0)}</span>
            </div>
            <h3 className="text-sm font-medium text-[#F5F5F5] group-hover:text-[#D4A843] transition-colors">{org.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
