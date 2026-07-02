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

interface TopicLayoutProps {
  children: React.ReactNode;
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

const TopicLayout: React.FC<TopicLayoutProps> = ({ children, breadcrumbs }) => (
  <>
    <Breadcrumbs items={breadcrumbs} />
    <main className="flex-1 w-full" role="main">
      <Container className="py-8">{children}</Container>
    </main>
  </>
);

export default TopicLayout;
