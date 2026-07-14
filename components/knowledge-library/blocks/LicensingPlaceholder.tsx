import type { FC } from 'react';

interface LicensingPlaceholderProps {
  type: 'image' | 'map' | 'chart';
  title: string;
  caption?: string;
  creator?: string;
  source?: string;
  reference?: string;
  rights?: string;
  status: string;
}

const typeLabels: Record<string, string> = {
  image: 'Image Pending Licensing',
  map: 'Map Pending Recreation',
  chart: 'Chart Pending Recreation',
};

export const LicensingPlaceholder: FC<LicensingPlaceholderProps> = ({
  type,
  title,
  caption,
  creator,
  source,
  reference,
  rights,
  status,
}) => {
  const hasDetails = creator || source || reference || rights;
  return (
    <div className="w-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
          {typeLabels[type] || 'Asset Pending'}
        </p>
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
        <div className="flex">
          <span className="w-28 shrink-0 text-xs font-medium text-gray-500">Title:</span>
          <span className="text-gray-900 font-medium">{title}</span>
        </div>
        {caption && (
          <div className="flex">
            <span className="w-28 shrink-0 text-xs font-medium text-gray-500">Caption:</span>
            <span className="text-gray-700">{caption}</span>
          </div>
        )}
        {creator && (
          <div className="flex">
            <span className="w-28 shrink-0 text-xs font-medium text-gray-500">Creator:</span>
            <span className="text-gray-700">{creator}</span>
          </div>
        )}
        {source && (
          <div className="flex">
            <span className="w-28 shrink-0 text-xs font-medium text-gray-500">Collection:</span>
            <span className="text-gray-700">{source}</span>
          </div>
        )}
        {reference && (
          <div className="flex">
            <span className="w-28 shrink-0 text-xs font-medium text-gray-500">Reference:</span>
            <span className="text-gray-700 font-mono text-xs">{reference}</span>
          </div>
        )}
        {rights && (
          <div className="flex">
            <span className="w-28 shrink-0 text-xs font-medium text-gray-500">Rights:</span>
            <span className="text-gray-700">{rights}</span>
          </div>
        )}
        <div className="flex">
          <span className="w-28 shrink-0 text-xs font-medium text-gray-500">Status:</span>
          <span className="text-amber-700 font-medium text-xs uppercase tracking-wider">
            {status === 'requested' ? 'Pending Acquisition' :
             status === 'draft' ? 'Not Yet Created' :
             status === 'archived' ? 'File Not Placed' :
             'Pending'}
          </span>
        </div>
      </div>

      {hasDetails && (
        <p className="mt-3 text-xs text-gray-400 border-t border-amber-200 pt-3 text-center">
          Metadata and citation recorded. Licensed asset — replaced with placeholder until rights are cleared.
        </p>
      )}
    </div>
  );
};
