// components/explorer/ExplorerResultCard.tsx
// Sprint 5C — Thin Result Card with Dynamic Render Logic per Canonical Type
// Governing Docs: Editorial Constitution v1.1, AGENTS.md Sprint 5C Spec

import Link from 'next/link';
import type { KnowledgeExplorerResultItem } from '@/types/explorer';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface ExplorerResultCardProps {
  item: KnowledgeExplorerResultItem;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ExplorerResultCard({ item, isSelected, onClick }: ExplorerResultCardProps) {
  // Derive badge variant based on trust presentation icon
  const getTrustBadgeVariant = (icon: string) => {
    switch (icon) {
      case 'verified':
        return 'success';
      case 'partial':
        return 'info';
      case 'developing':
        return 'warning';
      case 'disputed':
        return 'error';
      case 'corrected':
        return 'breaking';
      default:
        return 'neutral';
    }
  };

  // Safe type-guarded getter for trustPresentation to avoid explicit 'any'
  const getTrustPresentation = () => {
    if (item.type === 'story' || item.type === 'claim') {
      return item.trustPresentation;
    }
    return undefined;
  };

  const renderMetadata = () => {
    switch (item.type) {
      case 'story':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-gray-800 text-amber-300 px-2 py-0.5 rounded border border-gray-700">
              Story
            </span>
            {item.readingTime && (
              <span>• {item.readingTime} min read</span>
            )}
            {item.verificationState && (
              <span>• State: <span className="capitalize">{item.verificationState.replace('_', ' ')}</span></span>
            )}
          </div>
        );

      case 'claim':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-red-950/40 text-red-300 px-2 py-0.5 rounded border border-red-900/40">
              Claim
            </span>
            <span>• Status: <span className="capitalize font-mono text-amber-400">{item.claimStatus}</span></span>
            {item.evidenceCount > 0 && (
              <span>• {item.evidenceCount} sources linked</span>
            )}
          </div>
        );

      case 'source':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-900/40">
              Document
            </span>
            {item.tierLabel && (
              <span className="text-emerald-400 font-bold">{item.tierLabel}</span>
            )}
            {item.publisher && (
              <span className="truncate max-w-[150px]">• {item.publisher}</span>
            )}
          </div>
        );

      case 'entity':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded border border-blue-900/40">
              Entity
            </span>
            <span className="capitalize font-mono text-blue-400">• {item.entityType}</span>
            <span>• Linked in {item.storyCount} stories</span>
          </div>
        );

      case 'timeline':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-purple-950/40 text-purple-300 px-2 py-0.5 rounded border border-purple-900/40">
              Timeline
            </span>
            <span>• {item.eventCount} key events</span>
          </div>
        );

      case 'topic':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-teal-950/40 text-teal-300 px-2 py-0.5 rounded border border-teal-900/40">
              Topic
            </span>
            <span>• {item.storyCount} stories</span>
          </div>
        );

      case 'collection':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-amber-950/40 text-amber-300 px-2 py-0.5 rounded border border-amber-900/40">
              Collection
            </span>
            <span>• {item.volumeCount} volumes</span>
          </div>
        );

      case 'evidence':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-900/40">
              Evidence
            </span>
            {item.hierarchyTier && (
              <span>• Tier: {item.hierarchyTier}</span>
            )}
            {item.confidenceScore !== undefined && (
              <span>• Confidence: {(item.confidenceScore * 100).toFixed(0)}%</span>
            )}
          </div>
        );

      case 'correction':
        return (
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-gray-400">
            <span className="font-mono bg-orange-950/40 text-orange-300 px-2 py-0.5 rounded border border-orange-900/40">
              Correction
            </span>
            {item.versionLabel && (
              <span className="text-orange-400 font-bold">{item.versionLabel}</span>
            )}
            {item.category && (
              <span className="capitalize">• {item.category}</span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const matchesInfo = item.matchReasons.length > 0 && (
    <div className="flex flex-wrap gap-1 items-center pt-1">
      <span className="text-[10px] text-gray-500 font-mono">Matched by:</span>
      {item.matchReasons.map((reason) => (
        <span
          key={reason}
          className="text-[9px] font-mono bg-gray-900 text-gray-400 border border-gray-800 px-1.5 py-0.2 rounded"
        >
          {reason.replace('_', ' ')}
        </span>
      ))}
    </div>
  );

  const trustPresentation = getTrustPresentation();

  const cardContent = (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        {/* Render primary Metadata tags */}
        {renderMetadata()}

        {/* Dynamic Trust Presentation Badge */}
        {trustPresentation && (
          <Badge
            variant={getTrustBadgeVariant(trustPresentation.icon)}
            showIcon={true}
            className="text-[10px] px-2 py-0.5 shrink-0"
          >
            {trustPresentation.label}
          </Badge>
        )}
      </div>

      <h4 className="text-sm font-bold text-gray-100 group-hover:text-amber-400 transition-colors line-clamp-2">
        {item.title}
      </h4>

      {item.summary && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-sans">
          {item.summary}
        </p>
      )}

      {matchesInfo}
    </div>
  );

  const cardClasses = `group w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
    isSelected
      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5'
      : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600'
  } focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none`;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cardClasses}
        type="button"
        aria-selected={isSelected}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link href={item.href} className="block focus:outline-none">
      <Card hover={true} className={cardClasses}>
        {cardContent}
      </Card>
    </Link>
  );
}
