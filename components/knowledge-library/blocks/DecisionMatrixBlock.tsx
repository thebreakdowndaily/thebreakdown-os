import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { DecisionMatrixBlockData } from '@/types/canonical';

export const DecisionMatrixBlock: FC<BlockComponentProps> = ({ data }) => {
  const { title, context, options } = data as unknown as DecisionMatrixBlockData;
  return (
    <section className="my-8 border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="font-semibold text-sm uppercase text-gray-500">Decision Matrix</h3>
        <p className="text-lg font-medium mt-1">{title}</p>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-b">
        <p className="text-sm text-gray-600">{context}</p>
      </div>
      <div className="divide-y">
        {options.map((opt, i) => (
          <div key={i} className="px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="min-w-0">
                <h4 className="font-semibold">{opt.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className="font-medium text-green-700 text-xs uppercase">Proponents</p>
                    <ul className="list-disc pl-4 text-gray-600 mt-1">
                      {opt.proponents.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-700 text-xs uppercase">Opponents</p>
                    <ul className="list-disc pl-4 text-gray-600 mt-1">
                      {opt.opponents.map((o, j) => <li key={j}>{o}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <p className="font-medium text-xs uppercase text-gray-500">Actual Outcome</p>
                  <p className="text-gray-700 mt-1">{opt.outcome}</p>
                </div>
                <div className="mt-2 text-sm">
                  <p className="font-medium text-xs uppercase text-gray-500">Counterfactual</p>
                  <p className="text-gray-500 italic mt-1">{opt.counterfactual}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
