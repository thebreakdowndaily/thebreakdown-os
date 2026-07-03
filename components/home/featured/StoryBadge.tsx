interface StoryBadgeProps {
  category: string;
}

const labels: Record<string, string> = {
  economy: 'Economy', policy: 'Policy', technology: 'Tech',
  environment: 'Environment', education: 'Education',
  investigation: 'Investigation', solutions: 'Solutions',
  geopolitics: 'Geopolitics', diplomacy: 'Diplomacy',
};

export default function StoryBadge({ category }: StoryBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-gray-800 text-gray-300 border border-gray-700">
      {labels[category] || category}
    </span>
  );
}
