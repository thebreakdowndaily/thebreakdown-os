import React from 'react';

interface SidebarSection {
  title: string;
  items: Array<{ label: string; href: string; icon?: string }>;
}

interface SidebarProps {
  sections: SidebarSection[];
  sticky?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  document: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  link: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  tag: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const Sidebar: React.FC<SidebarProps> = ({ sections, sticky = false }) => (
  <aside aria-label="Sidebar" className={`space-y-6 ${sticky ? 'sticky top-24' : ''}`}>
    {sections.map((section) => (
      <div key={section.title} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-3">
          {section.title}
        </h3>
        <nav aria-label={section.title}>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400 hover:text-amber-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  {item.icon && (
                    <span className="flex-shrink-0 text-gray-500" aria-hidden="true">
                      {iconMap[item.icon] || iconMap.link}
                    </span>
                  )}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    ))}
  </aside>
);

export default Sidebar;
