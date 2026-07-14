import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { HistoriographyBlockData } from '@/types/canonical';

export const HistoriographyBlock: FC<BlockComponentProps> = ({ data }) => {
  const { title, approaches } = data as unknown as HistoriographyBlockData;
  return (
    <section className="my-8 border border-sky-200 rounded-lg overflow-hidden">
      <div className="bg-sky-50 px-4 py-3 border-b border-sky-200">
        <h3 className="font-semibold text-sm uppercase text-sky-600">Historiography</h3>
        <p className="text-lg font-medium mt-1 text-sky-900">{title}</p>
      </div>
      <div className="divide-y divide-sky-100">
        {approaches.map((a, i) => (
          <div key={i} className="px-4 py-4">
            <h4 className="font-semibold text-sky-800">{a.school}</h4>
            <p className="text-sm text-gray-700 mt-2">{a.summary}</p>
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <p className="font-medium text-xs uppercase text-gray-500">Key Historians</p>
                <ul className="list-disc pl-4 text-gray-600 mt-1">
                  {a.keyHistorians.map((h, j) => <li key={j}>{h}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-medium text-xs uppercase text-gray-500">Key Works</p>
                <ul className="list-disc pl-4 text-gray-600 mt-1">
                  {a.keyWorks.map((w, j) => <li key={j}>{w}</li>)}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div className="bg-green-50 rounded p-2">
                <p className="font-medium text-xs uppercase text-green-600">Strengths</p>
                <p className="text-gray-700 mt-1">{a.strengths}</p>
              </div>
              <div className="bg-amber-50 rounded p-2">
                <p className="font-medium text-xs uppercase text-amber-600">Limitations</p>
                <p className="text-gray-700 mt-1">{a.limitations}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
