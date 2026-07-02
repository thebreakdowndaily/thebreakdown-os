import React from 'react';

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

interface HomepageLayoutProps {
  children: React.ReactNode;
  seo: SEOData;
}

const HomepageLayout: React.FC<HomepageLayoutProps> = ({ children }) => (
  <>{children}</>
);

export default HomepageLayout;
