'use client';

import React from 'react';
import ReadingProgress from '../progress/ReadingProgress';
import EditorialHeader from '../header/EditorialHeader';
import type { BreadcrumbItem } from '../navigation/Breadcrumb';

interface EditorialLayoutProps {
  children: React.ReactNode;
  breadcrumbItems: BreadcrumbItem[];
  tableOfContents?: Array<{ id: string; label: string }>;
  activeSectionId?: string;
  onSectionSelect?: (id: string) => void;
}

export default function EditorialLayout({
  children,
  breadcrumbItems,
  tableOfContents = [],
  activeSectionId = '',
  onSectionSelect,
}: EditorialLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#D4A843]/30 selection:text-white">
      {/* Sticky Top-bar progress */}
      <ReadingProgress />

      {/* Editorial Header */}
      <EditorialHeader breadcrumbItems={breadcrumbItems} />

      {/* Main Grid Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 relative items-start">
          
          {/* Left Table of Contents rail */}
          {tableOfContents.length > 0 && (
            <aside className="hidden lg:block sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
              <nav aria-label="Table of contents" className="space-y-1.5 border-l border-[#2A2A2A] pl-4 py-2">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#737373] mb-4">
                  Sections
                </h3>
                {tableOfContents.map((item) => {
                  const isActive = activeSectionId === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onSectionSelect) {
                          onSectionSelect(item.id);
                        } else {
                          const el = document.getElementById(item.id);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      }}
                      className={`block text-xs transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4A843] ${
                        isActive
                          ? 'text-[#D4A843] font-semibold border-l-2 border-[#D4A843] pl-2 -ml-[18px]'
                          : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </aside>
          )}

          {/* Core content column */}
          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
