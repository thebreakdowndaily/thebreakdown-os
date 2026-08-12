// components/explorer/KnowledgeExplorerView.tsx
// Sprint 5C — Production Knowledge Explorer Reader UI Wiring
// Governing Docs: Editorial Constitution v1.1, AGENTS.md Sprint 5C Spec, RXS Search Spec

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Fix, VerificationState } from '@/types/canonical';
import type {
  DiscoveryMode,
  ExplorerSearchResponse,
  KnowledgeExplorerResultItem,
  StoryResult,
  ClaimResult,
  SourceResult,
  EntityResult,
  CorrectionResult,
} from '@/types/explorer';
import { FixGraphEngine } from '@/services/fixes/fix-graph.service';
import { EvidenceNetworkService } from '@/services/intelligence/evidence-network.service';
import { FixMetadataService } from '@/services/fixes/fix-metadata.service';
import ExplorerResultCard from './ExplorerResultCard';
import Pagination from '../ui/Pagination';
import Skeleton from '../ui/Skeleton';

interface KnowledgeExplorerViewProps {
  fixes: Fix[];
  initialSearch?: string;
  initialNodeId?: string;
  initialType?: string;
}

const DISCOVERY_MODES: { value: DiscoveryMode; label: string; desc: string }[] = [
  { value: 'all', label: 'All', desc: 'Search all registries' },
  { value: 'story', label: 'Stories', desc: 'Narratives and investigations' },
  { value: 'claim', label: 'Claims', desc: 'Canonical claims and assertions' },
  { value: 'document', label: 'Documents', desc: 'Statutory and source documents' },
  { value: 'evidence', label: 'Evidence', desc: 'Verified evidence chains' },
  { value: 'topic', label: 'Topics', desc: 'Knowledge domains' },
  { value: 'timeline', label: 'Timelines', desc: 'Diplomatic and military chronology' },
  { value: 'collection', label: 'Collections', desc: 'Knowledge platform volumes' },
  { value: 'learning_path', label: 'Learning Paths', desc: 'Structured learning routes' },
  { value: 'thinker', label: 'Thinkers', desc: 'Historical figures and authors' },
  { value: 'country', label: 'Countries', desc: 'Geopolitical sovereign entities' },
  { value: 'organization', label: 'Organizations', desc: 'Institutions and agencies' },
];

const RESULT_TYPES: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Results' },
  { value: 'story', label: 'Stories' },
  { value: 'claim', label: 'Claims' },
  { value: 'source', label: 'Documents' },
  { value: 'entity', label: 'Entities' },
  { value: 'timeline', label: 'Timelines' },
  { value: 'topic', label: 'Topics' },
  { value: 'collection', label: 'Collections' },
  { value: 'evidence', label: 'Evidence' },
  { value: 'correction', label: 'Corrections' },
];

export default function KnowledgeExplorerView({
  fixes,
  initialSearch = '',
  initialNodeId = '',
  initialType: _initialType = 'ALL',
}: KnowledgeExplorerViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read params from URL to ensure shareable state is single source of truth
  const urlQuery = searchParams.get('q') || '';
  const urlMode = (searchParams.get('mode') || 'all') as DiscoveryMode;
  const urlType = searchParams.get('type') || 'ALL';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlNode = searchParams.get('node') || '';

  // Local state for debouncing input and async execution
  const [inputValue, setInputValue] = useState(urlQuery || initialSearch);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<KnowledgeExplorerResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>(urlNode || initialNodeId || (fixes[0]?.id || ''));

  const inputRef = useRef<HTMLInputElement>(null);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  // 1. Debounce Search Input: URL updates 250ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const queryVal = inputValue.trim();
      if (queryVal) {
        params.set('q', queryVal);
      } else {
        params.delete('q');
      }
      params.set('page', '1'); // reset page on search update
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, router, pathname]);

  // 2. Fetch results from GET /api/v2/explorer on parameter changes
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchExplorerData = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('q', urlQuery);
        queryParams.set('mode', urlMode);
        if (urlType !== 'ALL') {
          queryParams.set('type', urlType.toLowerCase());
        }
        queryParams.set('page', String(urlPage));
        queryParams.set('pageSize', '10');

        const res = await fetch(`/api/v2/explorer?${queryParams.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = (await res.json()) as unknown as { error?: string };
          throw new Error(errData.error || 'Server error fetching explorer data');
        }

        const payload = (await res.json()) as unknown as ExplorerSearchResponse;
        if (active) {
          setResults(payload.data);
          setTotalResults(payload.meta.total);
          setTypeCounts(payload.meta.typeCounts);

          // Screen reader announcements
          if (payload.data.length > 0) {
            setScreenReaderAnnouncement('Loaded ' + String(payload.meta.total) + ' results.');
          } else {
            setScreenReaderAnnouncement('No results found.');
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError' && active) {
          setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchExplorerData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [urlQuery, urlMode, urlType, urlPage]);

  // Sync selectedNodeId to URL query param "node"
  useEffect(() => {
    if (selectedNodeId) {
      const params = new URLSearchParams(window.location.search);
      params.set('node', selectedNodeId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [selectedNodeId, router, pathname]);

  // 3. Global scoped keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.getAttribute('contenteditable') === 'true'
      );

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === 'Escape') {
        if (activeElement === inputRef.current) {
          setInputValue('');
          const params = new URLSearchParams(window.location.search);
          params.delete('q');
          params.set('page', '1');
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, pathname]);

  const handleClear = () => {
    setInputValue('');
    const params = new URLSearchParams(window.location.search);
    params.delete('q');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    inputRef.current?.focus();
  };

  const handleModeSelect = (modeVal: DiscoveryMode) => {
    const params = new URLSearchParams(window.location.search);
    params.set('mode', modeVal);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTypeSelect = (typeVal: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('type', typeVal);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageSelect = (pageVal: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(pageVal));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 4. Resolve currently selected search result item
  const selectedItem = useMemo(() => {
    if (selectedNodeId) {
      const found = results.find((r) => r.id === selectedNodeId);
      if (found) return found;
      
      // Fallback: check if matches CHAPTER_1_FIX
      if (fixes.length > 0) {
        const defaultFix = fixes[0];
        const defFixObj = defaultFix as unknown as Record<string, unknown>;
        const verificationState = (typeof defFixObj.verificationState === 'string' ? defFixObj.verificationState : 'evidence_reviewed') as VerificationState;
        
        if (defaultFix.id === selectedNodeId || defaultFix.slug === selectedNodeId) {
          return {
            id: defaultFix.id,
            type: 'story',
            title: defaultFix.title || defaultFix.headline,
            summary: defaultFix.summary,
            href: `/fix/${defaultFix.slug}`,
            matchReasons: [],
            readingTime: defaultFix.readingTime,
            verificationState,
          };
        }
      }
    }

    if (results.length > 0) return results[0];

    if (fixes.length > 0) {
      const defaultFix = fixes[0];
      const defFixObj = defaultFix as unknown as Record<string, unknown>;
      const verificationState = (typeof defFixObj.verificationState === 'string' ? defFixObj.verificationState : 'evidence_reviewed') as VerificationState;
      
      return {
        id: defaultFix.id,
        type: 'story',
        title: defaultFix.title || defaultFix.headline,
        summary: defaultFix.summary,
        href: `/fix/${defaultFix.slug}`,
        matchReasons: [],
        readingTime: defaultFix.readingTime,
        verificationState,
      };
    }

    return null;
  }, [results, selectedNodeId, fixes]);

  // Resolve selected item to canonical Fix object for rendering topology modules
  const selectedFix = useMemo(() => {
    if (!selectedItem) return null;
    return fixes.find(f => f.id === selectedItem.id || f.slug === selectedItem.id) || null;
  }, [fixes, selectedItem]);

  // Derive Graph View & Evidence Network for selected Fix (from existing logic)
  const graphEdges = useMemo(() => {
    if (!selectedFix) return [];
    return FixGraphEngine.generateEdges(selectedFix);
  }, [selectedFix]);

  const evidenceChain = useMemo(() => {
    if (!selectedFix) return null;
    return EvidenceNetworkService.analyzeEvidenceNetwork(selectedFix);
  }, [selectedFix]);

  const risCitation = useMemo(() => {
    if (!selectedFix) return '';
    return FixMetadataService.toRISCitation(selectedFix);
  }, [selectedFix]);

  const totalPages = Math.ceil(totalResults / 10);

  // Render detail fields dynamically depending on selected item type
  const renderItemDetails = () => {
    if (!selectedItem) return null;

    switch (selectedItem.type) {
      case 'story': {
        const story = selectedItem as StoryResult;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-gray-700/50 pt-4">
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Object Type</span>
              <strong className="text-amber-300 font-mono uppercase">{selectedItem.type}</strong>
            </div>
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Reading Time</span>
              <strong className="text-blue-400 font-mono">{story.readingTime || 5} Min</strong>
            </div>
            {story.verificationState && (
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800 sm:col-span-2">
                <span className="text-gray-400 block text-[11px]">Verification State</span>
                <strong className="text-emerald-400 font-mono capitalize">
                  {story.verificationState.replace('_', ' ')}
                </strong>
              </div>
            )}
          </div>
        );
      }
      case 'claim': {
        const claim = selectedItem as ClaimResult;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-gray-700/50 pt-4">
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Object Type</span>
              <strong className="text-amber-300 font-mono uppercase">{selectedItem.type}</strong>
            </div>
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Status</span>
              <strong className="text-red-400 font-mono uppercase">{claim.claimStatus}</strong>
            </div>
            {claim.storyTitle && (
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800 sm:col-span-2">
                <span className="text-gray-400 block text-[11px]">Asserted In Story</span>
                <span className="text-gray-200">{claim.storyTitle}</span>
              </div>
            )}
          </div>
        );
      }
      case 'source': {
        const src = selectedItem as SourceResult;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-gray-700/50 pt-4">
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Object Type</span>
              <strong className="text-amber-300 font-mono uppercase">{selectedItem.type}</strong>
            </div>
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Tier Placement</span>
              <strong className="text-emerald-400 font-mono">{src.tierLabel}</strong>
            </div>
            {src.publisher && (
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800 sm:col-span-2">
                <span className="text-gray-400 block text-[11px]">Publisher</span>
                <strong className="text-gray-300 font-mono truncate block">{src.publisher}</strong>
              </div>
            )}
          </div>
        );
      }
      case 'entity': {
        const ent = selectedItem as EntityResult;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-gray-700/50 pt-4">
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Object Type</span>
              <strong className="text-amber-300 font-mono uppercase">{selectedItem.type}</strong>
            </div>
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Entity Subtype</span>
              <strong className="text-blue-400 font-mono uppercase">{ent.entityType}</strong>
            </div>
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800 sm:col-span-2">
              <span className="text-gray-400 block text-[11px]">Coverage Index</span>
              <strong className="text-gray-300">Linked in {ent.storyCount} stories</strong>
            </div>
          </div>
        );
      }
      case 'correction': {
        const corr = selectedItem as CorrectionResult;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-gray-700/50 pt-4">
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Object Type</span>
              <strong className="text-amber-300 font-mono uppercase">{selectedItem.type}</strong>
            </div>
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Audit Phase</span>
              <strong className="text-orange-400 font-mono">{corr.versionLabel}</strong>
            </div>
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Classification</span>
              <strong className="text-gray-300 capitalize">{corr.category}</strong>
            </div>
            {corr.explanation && (
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800 sm:col-span-2">
                <span className="text-gray-400 block text-[11px]">Correction Narrative</span>
                <p className="text-gray-300 mt-1 leading-relaxed">{corr.explanation}</p>
              </div>
            )}
          </div>
        );
      }
      default:
        return (
          <div className="grid grid-cols-1 gap-3 text-xs border-t border-gray-700/50 pt-4">
            <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
              <span className="text-gray-400 block text-[11px]">Object Type</span>
              <strong className="text-amber-300 font-mono uppercase">{selectedItem.type}</strong>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 text-gray-100 font-sans selection:bg-amber-500/30">
      {/* Screen Reader Live region */}
      <div className="sr-only" aria-live="polite">
        {screenReaderAnnouncement}
      </div>

      {/* Global Explorer Filters */}
      <section aria-labelledby="explorer-filters-heading" className="bg-[#151515] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
        <h2 id="explorer-filters-heading" className="sr-only">Faceted Search Controls</h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Debounced Search Bar */}
          <div className="relative w-full md:flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={inputValue.trim().length > 0}
              aria-label="Search across canonical knowledge registries"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); }}
              placeholder="Search claims, documents, timelines, thinkers..."
              className="w-full bg-gray-900/60 border border-gray-800 hover:border-gray-700/80 focus:border-amber-400/85 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-all font-sans shadow-inner"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => { handleClear(); }}
                aria-label="Clear search input"
                className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-gray-300 font-medium px-1 py-0.5 rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter Select */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label htmlFor="explorer-type-filter" className="text-xs text-gray-400 font-medium whitespace-nowrap">
              Type Filter:
            </label>
            <select
              id="explorer-type-filter"
              value={urlType}
              onChange={(e) => { handleTypeSelect(e.target.value); }}
              className="w-full md:w-48 bg-gray-900 border border-gray-855 hover:border-gray-750 text-gray-200 text-xs rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-none transition-all"
            >
              {RESULT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} {t.value.toLowerCase() in typeCounts ? '(' + String(typeCounts[t.value.toLowerCase()]) + ')' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 12 Discovery Modes Tab List */}
        <div className="border-t border-gray-800/60 pt-4">
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Discovery Mode</span>
          <div 
            role="tablist" 
            aria-label="Discovery categories"
            className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800"
          >
            {DISCOVERY_MODES.map((mode) => {
              const isActive = urlMode === mode.value;
              return (
                <button
                  key={mode.value}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={mode.desc}
                  onClick={() => { handleModeSelect(mode.value); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-amber-400 text-gray-950 border-amber-400 font-bold shadow-md shadow-amber-400/5'
                      : 'bg-gray-900 border-gray-855 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid: Left List (4 Cols) + Right Details (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Result cards */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Search Results {totalResults > 0 && '(' + String(totalResults) + ')'}
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">
              Page {urlPage} of {totalPages || 1}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3" aria-label="Loading search results">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-gray-850/30 p-4 rounded-xl border border-gray-800/50 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl text-center">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="bg-[#151515] border border-gray-855 p-8 rounded-xl text-center space-y-2">
              <svg className="w-8 h-8 text-gray-650 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-sm font-bold text-gray-300">No Registry Matches</h4>
              <p className="text-xs text-gray-400">
                No items in the registries match your search criteria. Try relaxing your filter or typing a different query.
              </p>
            </div>
          ) : (
            <div 
              className="space-y-3 max-h-[720px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-gray-800"
              tabIndex={0}
              aria-label="Search results list"
            >
              {results.map((item) => (
                <ExplorerResultCard
                  key={item.type + ':' + item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onClick={() => { setSelectedNodeId(item.id); }}
                />
              ))}
            </div>
          )}

          {/* Bottom Pagination */}
          {!loading && results.length > 0 && (
            <Pagination
              currentPage={urlPage}
              totalPages={totalPages}
              onPageChange={(pageVal) => { handlePageSelect(pageVal); }}
            />
          )}
        </aside>

        {/* Right Side: Selected Node Detail Context */}
        <section aria-label="Details inspector panel" className="lg:col-span-8 space-y-6">
          {selectedItem ? (
            <>
              {/* Module 1: Node Core Overview */}
              <div className="bg-[#151515] border border-gray-850 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-800 pb-4 flex-wrap gap-3">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block mb-1">
                      Target Node ID: {selectedItem.id}
                    </span>
                    <h2 className="text-xl font-bold text-gray-100">
                      {selectedItem.title}
                    </h2>
                  </div>
                  <Link 
                    href={selectedItem.href} 
                    className="text-xs font-bold bg-amber-400 hover:bg-amber-350 text-gray-955 px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-400/5 hover:-translate-y-0.5"
                  >
                    View Full Surface →
                  </Link>
                </div>

                {selectedItem.summary && (
                  <p className="text-sm text-gray-300 leading-relaxed font-sans">
                    {selectedItem.summary}
                  </p>
                )}

                {renderItemDetails()}
              </div>

              {/* Module 2: Progressive Relationship Graph Traversal */}
              {selectedFix && (
                <div className="bg-[#151515] border border-gray-855 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                      Relationship Topology & Edge Taxonomy ({graphEdges.length} Edges)
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">
                      Progressive 1st-Degree Expansion
                    </span>
                  </div>

                  {graphEdges.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No direct 1st-degree graph edges recorded for this node.</p>
                  ) : (
                    <div 
                      className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800"
                      tabIndex={0}
                      aria-label="Relationship topology edges list"
                    >
                      {graphEdges.map((edge) => {
                        const isEvidentiary = ['cites_source', 'supported_by_claim'].includes(edge.edgeType);
                        return (
                          <div 
                            key={edge.sourceId + '-' + edge.targetId + '-' + edge.edgeType} 
                            className="bg-gray-900/40 p-3.5 rounded-xl border border-gray-855 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-gray-300 font-bold">{edge.sourceId}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                                  isEvidentiary
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                    : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                }`}>
                                  {isEvidentiary ? 'EVIDENTIARY' : 'STRUCTURAL'}: {edge.edgeType}
                                </span>
                                <span className="font-mono text-gray-300 font-bold">→ {edge.targetId}</span>
                              </div>
                              <span className="text-gray-400 text-[10px]">Direction: {edge.direction}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Module 3: Evidence Web Inspection */}
              {selectedFix && evidenceChain && (
                <div className="bg-[#151515] border border-gray-855 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      Evidence Web & Source Attestation ({evidenceChain.supportingChains.length} Chains)
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">
                      Tier 1 vs 3 Attestation Depth
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-855 space-y-1">
                      <span className="text-gray-400 block">Supporting Evidence Chains:</span>
                      <strong className="text-emerald-400 text-lg">{evidenceChain.supportingChains.length} Chains</strong>
                    </div>
                    <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-855 space-y-1">
                      <span className="text-gray-400 block">Root Node:</span>
                      <strong className="text-amber-300 text-sm font-mono">{evidenceChain.rootFixId}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Module 4: Citation Export (RIS / JSON-LD) */}
              {selectedFix && risCitation && (
                <div className="bg-[#151515] border border-gray-855 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-md font-bold text-gray-100 border-b border-gray-800 pb-2">
                    Academic Citation Export (RIS Format)
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-400 font-mono block mb-1">RIS Format (EndNote / Zotero):</span>
                      <pre className="bg-gray-950 p-3 rounded-lg border border-gray-900 text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {risCitation}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#151515] border border-gray-855 p-8 rounded-2xl text-center space-y-2">
              <p className="text-xs text-gray-400">Select an object from the search results to inspect its metadata and graph topology.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
