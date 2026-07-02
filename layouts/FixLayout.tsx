import React from 'react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Container from '../components/layout/Container';

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
    <main className="flex-1 w-full" role="main">
      <Container narrow className="py-8">
        <article aria-label={seo.title}>{children}</article>
      </Container>
    </main>
  </>
);

export default FixLayout;
