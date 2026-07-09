import React from 'react';

interface EntityDataProps {
  datasets: Array<{
    label: string;
    description: string;
    data: Array<Record<string, unknown>>;
    source?: string;
  }>;
  statistics: Record<string, number | string>;
}

const EntityData: React.FC<EntityDataProps> = ({ datasets, statistics }) => {
  if (Object.keys(statistics).length === 0 && datasets.length === 0) return null;

  return (
    <div className="w-full">
      {Object.keys(statistics).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-800 border border-neutral-800 rounded-xl overflow-hidden mb-8">
          {Object.entries(statistics).map(([key, value]) => (
            <div key={key} className="bg-neutral-950 p-6 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-3xl font-bold tracking-tight text-white leading-none">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {datasets.length > 0 && (
        <div className="space-y-8">
          {datasets.map((dataset, i) => (
            <div key={i} className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
              <div className="p-5 sm:p-6 border-b border-neutral-800">
                <h3 className="text-lg font-medium text-neutral-100 mb-1">{dataset.label}</h3>
                <p className="text-sm text-neutral-400">{dataset.description}</p>
              </div>

              {dataset.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-900/50">
                      <tr>
                        {Object.keys(dataset.data[0]).map((col) => (
                          <th key={col} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                            {col.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                      {dataset.data.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-neutral-900/30 transition-colors">
                          {Object.values(row).map((val, vIdx) => (
                            <td key={vIdx} className="px-5 py-3 text-neutral-300 font-medium">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-3 bg-neutral-900/30 border-t border-neutral-800/50 flex justify-between items-center">
                    <span className="text-[11px] font-medium text-neutral-500">
                      {dataset.data.length > 10 ? `Showing 10 of ${dataset.data.length} rows` : `${dataset.data.length} rows total`}
                    </span>
                    {dataset.source && (
                      <a
                        href={dataset.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold uppercase tracking-widest text-amber-500/80 hover:text-amber-400 transition-colors"
                      >
                        Source &rarr;
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntityData;
