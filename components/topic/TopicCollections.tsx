import React, { useState } from 'react';

interface StoryCard {
  slug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
}

interface EntityCard {
  slug: string;
  name: string;
  type: string;
  description?: string;
}

interface TopicCollectionsProps {
  stories: StoryCard[];
  people: EntityCard[];
  organizations: EntityCard[];
  policies: EntityCard[];
  budgets: EntityCard[];
  reports: EntityCard[];
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

const tabs = ['Stories', 'People', 'Organizations', 'Policies', 'Budgets', 'Reports'] as const;

const evidenceBadgeColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-400';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const typeBadgeColor: Record<string, string> = {
  person: 'bg-blue-500',
  organization: 'bg-purple-500',
  policy: 'bg-amber-500',
  budget: 'bg-green-500',
  report: 'bg-red-500',
};

const TopicCollections: React.FC<TopicCollectionsProps> = ({
  stories,
  people,
  organizations,
  policies,
  budgets,
  reports,
}) => {
  const [activeTab, setActiveTab] = useState<string>('Stories');

  const hasContent: Record<string, boolean> = {
    Stories: stories.length > 0,
    People: people.length > 0,
    Organizations: organizations.length > 0,
    Policies: policies.length > 0,
    Budgets: budgets.length > 0,
    Reports: reports.length > 0,
  };

  return (
    <section aria-label="Topic collections" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={!hasContent[tab]}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-amber-400 border-amber-400'
                : hasContent[tab]
                  ? 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-500'
                  : 'text-gray-600 border-transparent cursor-not-allowed'
            }`}
            aria-pressed={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Stories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <a
              key={story.slug}
              href={`/story/${story.slug}`}
              className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-amber-400/50 transition-colors"
            >
              {story.heroImage && (
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={story.heroImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white mb-2 ${evidenceBadgeColor(story.evidenceScore)}`}
                >
                  {story.evidenceScore}% Evidence
                </span>
                <h3 className="text-base font-semibold text-gray-100 group-hover:text-amber-400 transition-colors mb-1">
                  {story.headline}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">{story.summary}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
                  <span aria-hidden="true">&middot;</span>
                  <span>{story.readingTime} min read</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {['People', 'Organizations', 'Policies', 'Budgets', 'Reports'].includes(activeTab) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            let items: EntityCard[] = [];
            if (activeTab === 'People') items = people;
            else if (activeTab === 'Organizations') items = organizations;
            else if (activeTab === 'Policies') items = policies;
            else if (activeTab === 'Budgets') items = budgets;
            else if (activeTab === 'Reports') items = reports;
            return items.map((item) => (
              <a
                key={item.slug}
                href={`/entity/${item.slug}`}
                className="group bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-amber-400/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-100 group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white flex-shrink-0 ${
                      typeBadgeColor[item.type] || 'bg-gray-500'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                )}
              </a>
            ));
          })()}
        </div>
      )}
    </section>
  );
};

export default TopicCollections;
