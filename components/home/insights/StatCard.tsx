import Link from 'next/link';
import Card from '@/components/ui/Card';

interface StatCardProps {
  label: string;
  value: number;
  href?: string;
}

export default function StatCard({ label, value, href }: StatCardProps) {
  const formatted = value.toLocaleString('en-IN');

  const inner = (
    <>
      <span className="text-4xl sm:text-5xl font-bold text-[#F5F5F5] tabular-nums leading-none">
        {formatted}
      </span>
      <span className="text-sm text-[#A1A1AA] mt-2">{label}</span>
    </>
  );

  if (href) {
    return (
      <Card hover accent="gold" className="p-5 sm:p-6">
        <Link href={href} className="flex flex-col gap-1">
          {inner}
        </Link>
      </Card>
    );
  }

  return (
    <Card hover={false} accent="none" className="p-5 sm:p-6 flex flex-col gap-1">
      {inner}
    </Card>
  );
}
