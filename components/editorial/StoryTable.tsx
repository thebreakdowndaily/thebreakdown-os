'use client';

import Link from 'next/link';

interface StoryRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  score: number;
  visual: number;
  evidence: number;
  timeline: number;
  seo: number;
  accessibility: number;
  updatedAt: string;
  editor: string;
  publishReady: boolean;
  issues: Array<{ level: string; message: string }>;
}

export default function StoryTable({ stories }: { stories: StoryRow[] }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-400/10';
    if (score >= 70) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-8">
      <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
        <h2 className="text-xl font-bold text-white">Stories Needing Attention</h2>
        <div className="flex gap-2">
          <span className="text-xs bg-neutral-800 px-3 py-1 rounded text-neutral-300">Filters:</span>
          <span className="text-xs bg-red-900/30 text-red-400 px-3 py-1 rounded border border-red-900/50 cursor-pointer hover:bg-red-900/50">Needs Images</span>
          <span className="text-xs bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded border border-yellow-900/50 cursor-pointer hover:bg-yellow-900/50">Needs Timeline</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="bg-neutral-950 text-xs uppercase tracking-widest font-mono text-neutral-500 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">Vis</th>
              <th className="px-6 py-4">Evi</th>
              <th className="px-6 py-4">TL</th>
              <th className="px-6 py-4">SEO</th>
              <th className="px-6 py-4">A11y</th>
              <th className="px-6 py-4">Editor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {stories.map(story => (
              <tr key={story.id} className="hover:bg-neutral-800/50 transition-colors group">
                <td className="px-6 py-4">
                  <Link href={`/story/${story.slug}`} className="font-medium text-neutral-200 group-hover:text-white block truncate max-w-xs">
                    {story.title}
                  </Link>
                  {story.issues.length > 0 && (
                    <div className="text-[10px] text-red-400 mt-1 truncate max-w-xs">
                      {story.issues[0].level}: {story.issues[0].message}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-neutral-800 rounded text-neutral-300">{story.status}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-mono px-2 py-1 rounded font-bold ${getScoreColor(story.score)}`}>{story.score}%</span>
                </td>
                <td className={`px-6 py-4 font-mono ${story.visual < 100 ? 'text-red-400' : 'text-emerald-400'}`}>{story.visual}</td>
                <td className={`px-6 py-4 font-mono ${story.evidence < 100 ? 'text-red-400' : 'text-emerald-400'}`}>{story.evidence}</td>
                <td className={`px-6 py-4 font-mono ${story.timeline < 100 ? 'text-red-400' : 'text-emerald-400'}`}>{story.timeline}</td>
                <td className={`px-6 py-4 font-mono ${story.seo < 100 ? 'text-red-400' : 'text-emerald-400'}`}>{story.seo}</td>
                <td className={`px-6 py-4 font-mono ${story.accessibility < 100 ? 'text-red-400' : 'text-emerald-400'}`}>{story.accessibility}</td>
                <td className="px-6 py-4 text-xs">{story.editor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
