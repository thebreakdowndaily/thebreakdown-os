import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { CounterfactualBlockData } from '@/types/canonical';

export const CounterfactualBlock: FC<BlockComponentProps> = ({ data }) => {
  const { question, scenario, historicalContext, analysis, probability, sources } = data as unknown as CounterfactualBlockData;
  return (
    <section className="my-8 border border-purple-200 rounded-lg overflow-hidden">
      <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
        <h3 className="font-semibold text-sm uppercase text-purple-600">Counterfactual</h3>
        <p className="text-lg font-medium mt-1 text-purple-900">{question}</p>
      </div>
      <div className="px-4 py-4 space-y-4">
        <div>
          <p className="font-medium text-xs uppercase text-gray-500">Scenario</p>
          <p className="text-gray-700 mt-1">{scenario}</p>
        </div>
        <div>
          <p className="font-medium text-xs uppercase text-gray-500">Historical Context</p>
          <p className="text-gray-700 mt-1">{historicalContext}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="font-medium text-xs uppercase text-purple-600">Analysis</p>
          <p className="text-gray-800 mt-1">{analysis}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-500">Plausibility:</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">{probability}</span>
        </div>
        {sources.length > 0 && (
          <div className="text-xs text-gray-400">
            <span className="font-medium">Sources:</span> {sources.join(', ')}
          </div>
        )}
      </div>
    </section>
  );
};
