import Link from 'next/link';
import Card from '@/components/ui/Card';

interface TrendingItem {
  label: string;
  count: number;
  slug?: string;
}

interface TrendingListProps {
  items: TrendingItem[];
}

export default function TrendingList({ items }: TrendingListProps) {
  return (
    <Card className="p-5 sm:p-6" accent="gold">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-5">
        Trending Intelligence
      </h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.label}>
            {item.slug ? (
              <Link
                href={`/topic/${item.slug}`}
                className="flex items-center gap-4 group"
              >
                <span className="text-green-500 text-sm font-bold">&#9650;</span>
                <span className="text-sm font-serif text-text-primary group-hover:text-brand-400 transition-colors duration-200">
                  {item.label}
                </span>
                <span className="ml-auto text-xs text-text-muted tabular-nums font-mono">
                  {item.count}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-green-500 text-sm font-bold">&#9650;</span>
                <span className="text-sm font-serif text-text-primary">{item.label}</span>
                <span className="ml-auto text-xs text-text-muted tabular-nums font-mono">
                  {item.count}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
