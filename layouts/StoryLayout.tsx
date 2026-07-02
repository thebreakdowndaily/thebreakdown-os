import React from 'react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Sidebar from '../components/layout/Sidebar';
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

interface StoryLayoutProps {
  children: React.ReactNode;
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

const StoryLayout: React.FC<StoryLayoutProps> = ({ children, seo, breadcrumbs }) => (
  <>
    <Breadcrumbs items={breadcrumbs} />

    <main className="flex-1 w-full" role="main">
      <Container>
        <div className="flex flex-col lg:flex-row gap-8 py-6">
          <article className="flex-1 min-w-0" aria-label={seo.title}>
            {children}
          </article>

          <aside className="w-full lg:w-72 flex-shrink-0" aria-label="Related content">
            <Sidebar
              sticky
              sections={[
                {
                  title: 'Table of Contents',
                  items: [
                    { label: 'Overview', href: '#overview', icon: 'document' },
                    { label: 'Evidence', href: '#evidence', icon: 'tag' },
                    { label: 'Timeline', href: '#timeline', icon: 'clock' },
                    { label: 'Sources', href: '#sources', icon: 'link' },
                  ],
                },
              ]}
            />
          </aside>
        </div>
      </Container>
    </main>
  </>
);

export default StoryLayout;
