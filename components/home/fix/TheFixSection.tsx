import type { APIFix } from '@/utils/data-layer/types';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import FixCard from './FixCard';

interface TheFixSectionProps {
  fixes: APIFix[];
}

export default function TheFixSection({ fixes }: TheFixSectionProps) {
  if (fixes.length === 0) return null;

  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A]/60">
      <Container as="div" className="py-16 sm:py-20">
        <SectionHeader
          eyebrow="Solutions"
          title="The Fix"
          description="Not just what's wrong. What would fix it."
          accent="green"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {fixes.slice(0, 3).map((fix) => (
            <FixCard key={fix.id} fix={fix} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href="/fix" variant="secondary" accent="green">
            View All Fix Frameworks
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>
      </Container>
    </section>
  );
}
