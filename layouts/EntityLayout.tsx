import React from 'react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Container from '../components/layout/Container';

interface Breadcrumb {
  label: string;
  href: string;
}

interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  ogImage?: string;
  ogPublishDate?: string;
  twitterCard?: string;
  keywords?: string;
}

interface EntityLayoutProps {
  children: React.ReactNode;
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
  entityType: string;
}

const entityTabs = [
  { label: 'Overview', href: '', icon: 'document' },
  { label: 'Timeline', href: '/timeline', icon: 'clock' },
  { label: 'Data', href: '/data', icon: 'tag' },
  { label: 'Sources', href: '/sources', icon: 'link' },
  { label: 'Stories', href: '/stories', icon: 'document' },
];

const EntityLayout: React.FC<EntityLayoutProps> = ({ children, breadcrumbs }) => (
  <>
    <Breadcrumbs items={breadcrumbs} />

    <Container>
      <nav
        className="flex items-center gap-1 overflow-x-auto py-4 border-b border-gray-800"
        aria-label="Entity navigation"
      >
        {entityTabs.map((tab) => {
          const href = breadcrumbs.length > 0
            ? `${breadcrumbs[breadcrumbs.length - 1].href}${tab.href}`
            : `/entity${tab.href}`;
          return (
            <a
              key={tab.label}
              href={href}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors aria-current-page:text-amber-400 aria-current-page:bg-amber-400/10"
              aria-current={tab.href === '' ? 'page' : undefined}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>
    </Container>

    <main className="flex-1 w-full" role="main">
      <Container narrow className="py-8">{children}</Container>
    </main>
  </>
);

export default EntityLayout;
