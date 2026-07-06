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
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#D4A843] mb-4">
        Trending Intelligence
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            {item.slug ? (
              <Link
                href={`/topic/${item.slug}`}
                className="flex items-center gap-3 group"
              >
                <span className="text-[#22C55E] text-sm font-bold">&#9650;</span>
                <span className="text-sm text-[#F5F5F5] group-hover:text-[#D4A843] transition-colors duration-200">
                  {item.label}
                </span>
                <span className="ml-auto text-xs text-[#A1A1AA] tabular-nums">
                  {item.count}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[#22C55E] text-sm font-bold">&#9650;</span>
                <span className="text-sm text-[#F5F5F5]">{item.label}</span>
                <span className="ml-auto text-xs text-[#A1A1AA] tabular-nums">
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
