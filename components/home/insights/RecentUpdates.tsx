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
  environment: 'topic/environment',
  education: 'topic/employment',
  health: 'topic/policy',
  politics: 'topic/policy',
};

export default function RecentUpdates({ categories }: RecentUpdatesProps) {
  if (categories.length === 0) return null;

  return (
    <Card className="p-5 sm:p-6" hover={false} accent="none">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-5">
        Recently Updated Intelligence
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const href = categorySlugs[cat.category] || `/${cat.category}`;
          return (
            <Link
              key={cat.category}
              href={href}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest bg-surface-tertiary text-text-secondary border border-border hover:border-brand-400/50 hover:text-brand-400 transition-colors duration-200"
            >
              {cat.category}
              <span className="tabular-nums text-text-muted/60 font-mono">{cat.count}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
