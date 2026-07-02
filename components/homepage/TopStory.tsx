import React from 'react';
import StoryImage from '@/components/story/StoryImage';
import Container from '@/components/layout/Container';

interface Story {
  slug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
}

interface TopStoryProps {
  story: Story;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));

const evidenceBadgeColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-400';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const TopStory: React.FC<TopStoryProps> = ({ story }) => (
  <section
    className="relative w-full min-h-[65vh] flex items-end bg-gray-900 overflow-hidden"
    aria-label="Top story"
  >
    {story.heroImage && (
      <>
        <StoryImage
          src={story.heroImage}
          category={story.category}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/30" />
      </>
    )}

    <div className="relative z-10 w-full pb-8 sm:pb-12 lg:pb-16">
      <Container narrow>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-gray-900 mb-4">
        {story.category}
      </span>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-100 leading-tight mb-4">
        {story.headline}
      </h2>
      <p className="text-lg sm:text-xl text-gray-300 max-w-3xl leading-relaxed mb-6">
        {story.summary}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
        <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
        <span aria-hidden="true">&middot;</span>
        <span>{story.readingTime} min read</span>
        <span aria-hidden="true">&middot;</span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${evidenceBadgeColor(story.evidenceScore)}`}
        >
          {story.evidenceScore}% Evidence
        </span>
      </div>

      <a
        href={`/story/${story.slug}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors"
      >
        Read Story &rarr;
      </a>
      </Container>
    </div>
  </section>
);

export default TopStory;
