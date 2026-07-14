import type { ReactNode } from 'react';

export function StoryLayout({
  children,
  sidebar,
  toc,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
  toc?: ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {toc && (
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              {toc}
            </div>
          </div>
        )}
        <div className={`${toc ? 'lg:col-span-6' : 'lg:col-span-8'} min-w-0`}>
          {children}
        </div>
        {sidebar && (
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6">
              {sidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
