import React from 'react';
import Breadcrumbs from '../components/ui/Breadcrumbs';

interface Breadcrumb { label: string; href: string; }
interface SEOData { title: string; description: string; canonical: string; ogType: string; }

interface FixLayoutProps {
  children: React.ReactNode;
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

const FixLayout: React.FC<FixLayoutProps> = ({ children, seo, breadcrumbs }) => (
  <>
    <Breadcrumbs items={breadcrumbs} />
    <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
      <article aria-label={seo.title}>{children}</article>
    </main>
  </>
);

export default FixLayout;
