import Link from 'next/link';

export interface EosNavItem {
  href: string;
  label: string;
}

const NAV: EosNavItem[] = [
  { href: '/editor', label: 'Dashboard' },
  { href: '/editor/assignments', label: 'Assignments' },
  { href: '/editor/collections', label: 'Collections' },
  { href: '/editor/analytics', label: 'Analytics' },
  { href: '/editor/governance', label: 'Governance' },
];

function isActive(href: string, pathname: string): boolean {
  if (href === '/editor') return pathname === '/editor';
  return pathname.startsWith(href);
}

export default function EosShell({
  children,
  title,
  subtitle,
  pathname = '/editor',
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  pathname?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-amber-500/30 pb-24">
      <header className="border-b border-gray-800 bg-gray-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/editor" className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
                  EOS
                </span>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-100">
                  Editorial <span className="text-amber-400">Operating System</span>
                </h1>
              </Link>
              <span className="bg-amber-500/10 text-amber-300 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded font-bold border border-amber-500/30">
                RELEASE-4.0
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                UP403 v1.1.0 · Research Cutoff 2026-07-30
              </span>
            </div>
          </div>
          <nav aria-label="Editorial workspace" className="flex gap-1 -mb-px overflow-x-auto">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  isActive(item.href, pathname)
                    ? 'border-amber-400 text-amber-300 font-semibold'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8" id="main-content">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-100">{title}</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
