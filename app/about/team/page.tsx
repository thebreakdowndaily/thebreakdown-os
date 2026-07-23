import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import { getPublicStories } from '@/utils/data-layer/store';

export const metadata: Metadata = {
  title: 'Team — The Breakdown',
  description: 'The editorial team behind The Breakdown.',
};

export default function TeamPage() {
  const { data: stories } = getPublicStories({ pageSize: 50 });
  const authorMap = new Map<string, { name: string; stories: string[] }>();
  for (const s of stories) {
    const name = s.author.name;
    if (!authorMap.has(name)) authorMap.set(name, { name, stories: [] });
    authorMap.get(name)!.stories.push(s.headline);
  }
  const authors = Array.from(authorMap.values());
  return (
    <Container>
      <div className="py-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-6">Our Team</h1>
        <div className="grid gap-6">
          {authors.map((author) => (
            <div key={author.name} className="p-6 bg-[#151515] rounded-lg border border-[#2A2A2A]">
              <h2 className="text-xl font-semibold text-white mb-2">{author.name}</h2>
              <p className="text-sm text-gray-400 mb-3">Contributing journalist</p>
              <div className="text-xs text-gray-500">
                <span className="text-amber-400/80">{author.stories.length} stories</span>
                <ul className="mt-2 space-y-1">
                  {author.stories.map((headline) => (
                    <li key={headline} className="text-gray-500">&bull; {headline}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
