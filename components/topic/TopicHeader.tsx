import React from 'react';

interface TopicHeaderProps {
  topic: {
    id: string;
    slug: string;
    name: string;
    description: string;
    image?: string;
    storyCount: number;
    entityCount: number;
  };
}

const TopicHeader: React.FC<TopicHeaderProps> = ({ topic }) => (
  <section
    className="relative w-full min-h-[40vh] flex items-center bg-gray-900 overflow-hidden"
    aria-label={`Topic: ${topic.name}`}
  >
    {topic.image && (
      <>
        <img src={topic.image} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60" />
      </>
    )}

    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!topic.image && (
        <div className="w-16 h-1 bg-amber-400 rounded-full mb-6" aria-hidden="true" />
      )}

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-100 leading-tight mb-4">
        {topic.name}
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 max-w-3xl leading-relaxed mb-6">
        {topic.description}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5 text-gray-300">
          <span className="text-amber-400 font-bold">{topic.storyCount}</span>
          Stories
        </span>
        <span className="text-gray-600" aria-hidden="true">|</span>
        <span className="inline-flex items-center gap-1.5 text-gray-300">
          <span className="text-amber-400 font-bold">{topic.entityCount}</span>
          Entities
        </span>
      </div>
    </div>
  </section>
);

export default TopicHeader;
