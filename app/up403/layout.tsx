import Link from 'next/link';
import { Up403NavLink } from '@/components/up403/nav-link';

const NAV = [
  { href: '/up403', label: 'Home', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { href: '/up403/map', label: 'Map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { href: '/up403/compare', label: 'Compare', icon: 'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01' },
  { href: '/up403/stories', label: 'Stories', icon: 'M12 6.25c1.5-2 4.5-2.5 6.5-1v13c-2-1.5-5-1-6.5 1-1.5-2-4.5-2.5-6.5-1v-13c2-1.5 5-1 6.5 1z' },
  { href: '/up403/search', label: 'Search', icon: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z' },
];

export const metadata = {
  title: 'UP403 Constituency Intelligence — The Breakdown',
  description: 'Evidence-first intelligence on Uttar Pradesh\'s 403 assembly constituencies — 69 districts, 3 elections, every figure traced to a source.',
};

export default function Up403Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E5E5E5]">
      <a
        href="#up403-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#D4A843] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <div className="border-b border-[#2A2A2A] bg-[#111111]">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href="/up403" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4A843] text-xs font-bold text-black">UP</span>
                <div>
                  <div className="text-sm font-semibold text-[#F5F5F5]">UP403 Constituency Intelligence</div>
                  <div className="text-[11px] text-[#A1A1AA]">Dataset v1.1.0 · Research cutoff 30 Jul 2026 · Evidence-first</div>
                </div>
              </Link>
            </div>
            <nav className="flex flex-wrap items-center gap-1" aria-label="Primary">
              {NAV.map(item => (
                <Up403NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
              ))}
              <Link
                href="/up403/explore"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-sm text-[#6B6B6B] transition-colors hover:border-[#D4A843]/40 hover:text-[#D4A843] focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:outline-none"
              >
                Research tools
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <main id="up403-main" tabIndex={-1} className="mx-auto max-w-[1400px] px-4 py-6">{children}</main>
    </div>
  );
}
