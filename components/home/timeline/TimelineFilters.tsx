interface TimelineFiltersProps {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}

const labels: Record<string, string> = {
  all: 'All',
  economy: 'Economy',
  technology: 'Technology',
  policy: 'Governance',
  climate: 'Climate',
  defence: 'Defence',
};

export default function TimelineFilters({ categories, active, onSelect }: TimelineFiltersProps) {
  const allCats = ['all', ...categories.filter((c) => c !== 'all')];

  return (
    <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Timeline filters">
      {allCats.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-[#D4A843] text-black'
                : 'bg-[#1D1D1D] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843]/30 hover:text-[#D4A843]'
            }`}
          >
            {labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
