import React from 'react';

interface ChartDef {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table';
  title: string;
  description?: string;
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  color?: string;
}

interface TopicChartsProps {
  charts: ChartDef[];
}

const TopicCharts: React.FC<TopicChartsProps> = ({ charts }) => {
  if (charts.length === 0) return null;

  return (
    <section aria-label="Charts" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Charts &amp; Visualizations</h2>
      <div className="space-y-6">
        {charts.map((chart, i) => (
          <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-1">{chart.title}</h3>
            {chart.description && (
              <p className="text-sm text-gray-400 mb-4">{chart.description}</p>
            )}

            {chart.type === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {chart.data.length > 0 &&
                        Object.keys(chart.data[0]).map((col) => (
                          <th key={col} className="px-3 py-2 text-gray-400 font-medium capitalize">
                            {col.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.data.map((row, rIdx) => (
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
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                <div className="text-center text-gray-500">
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
                  </p>
                  <p className="text-xs">
                    x: <span className="text-amber-400">{chart.xKey}</span>, y:{' '}
                    <span className="text-amber-400">{chart.yKey}</span> ({chart.data.length} data points)
                  </p>
                  <p className="text-xs mt-1 text-gray-600">Render with your preferred charting library</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopicCharts;
