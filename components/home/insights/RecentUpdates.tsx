import Link from 'next/link';
import Card from '@/components/ui/Card';

interface UpdateCategory {
  category: string;
  count: number;
}

interface RecentUpdatesProps {
  categories: UpdateCategory[];
}

const categorySlugs: Record<string, string> = {
  economy: 'topic/economy',
  technology: 'topic/technology',
  policy: 'topic/policy',
  agriculture: 'topic/agriculture',
  environment: 'topic/climate',
  education: 'topic/education',
  health: 'topic/healthcare',
  politics: 'topic/policy',
};

export default function RecentUpdates({ categories }: RecentUpdatesProps) {
  if (categories.length === 0) return null;

  return (
    <Card className="p-5 sm:p-6" hover={false} accent="none">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#D4A843] mb-4">
        Recently Updated Intelligence
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const href = categorySlugs[cat.category] || `/${cat.category}`;
          return (
            <Link
              key={cat.category}
              href={href}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1D1D1D] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843]/30 hover:text-[#D4A843] transition-colors duration-200"
            >
              {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
              <span className="tablular-nums text-[#A1A1AA]/60">{cat.count}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
