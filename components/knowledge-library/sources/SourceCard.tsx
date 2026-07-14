import type { FC } from 'react';
import type { Source } from '@/types/canonical';

export const SourceCard: FC<{ source: Source; index: number }> = ({ source, index }) => {
  return (
    <div className="text-sm p-3 bg-white border rounded-lg shadow-sm">
      <div className="font-medium">{source.title}</div>
      {source.tier && (
        <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded ${
          source.tier <= 2 ? 'bg-green-100 text-green-700' :
          source.tier <= 3 ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          Tier {source.tier}
        </span>
      )}
      {source.url && (
        <a href={source.url} target="_blank" rel="noopener noreferrer"
           className="block mt-1 text-blue-600 hover:underline truncate">
          {source.url}
        </a>
      )}
    </div>
  );
};
