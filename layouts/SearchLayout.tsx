import React from 'react';
import SearchBar from '@/components/ui/SearchBar';
import Sidebar from '../components/layout/Sidebar';
import Pagination from '../components/ui/Pagination';
import Container from '../components/layout/Container';

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

interface SearchLayoutProps {
  children: React.ReactNode;
  seo: SEOData;
  query: string;
}

const SearchLayout: React.FC<SearchLayoutProps> = ({ children, query }) => (
  <main className="flex-1 w-full" role="main">
    <Container className="py-6">
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar initialValue={query} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0" aria-label="Search filters">
          <Sidebar
            sections={[
              {
                title: 'Filter by Type',
                items: [
                  { label: 'All Results', href: `?q=${encodeURIComponent(query)}`, icon: 'tag' },
                  { label: 'Stories', href: `?q=${encodeURIComponent(query)}&type=story`, icon: 'document' },
                  { label: 'Entities', href: `?q=${encodeURIComponent(query)}&type=entity`, icon: 'link' },
                  { label: 'Topics', href: `?q=${encodeURIComponent(query)}&type=topic`, icon: 'tag' },
                ],
              },
            ]}
            sticky
          />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="space-y-4">{children}</div>
          <Pagination currentPage={1} totalPages={1} baseUrl={`/search?q=${encodeURIComponent(query)}`} />
        </div>
      </div>
    </Container>
  </main>
);

export default SearchLayout;
