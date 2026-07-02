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
    <section aria-label="Data and statistics" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Data &amp; Statistics</h2>

      {Object.keys(statistics).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(statistics).map(([key, value]) => (
            <div key={key} className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-amber-400">{value}</p>
              <p className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          ))}
        </div>
      )}

      {datasets.length > 0 && (
        <div className="space-y-6">
          {datasets.map((dataset, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{dataset.label}</h3>
              <p className="text-gray-300 text-sm mb-4">{dataset.description}</p>

              {dataset.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {Object.keys(dataset.data[0]).map((col) => (
                          <th key={col} className="px-3 py-2 text-gray-400 font-medium capitalize">
                            {col.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.data.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-gray-700/50 last:border-0">
                          {Object.values(row).map((val, vIdx) => (
                            <td key={vIdx} className="px-3 py-2 text-gray-300">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dataset.data.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">Showing 10 of {dataset.data.length} rows</p>
                  )}
                </div>
              )}

              {dataset.source && (
                <a
                  href={dataset.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Source &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default EntityData;
