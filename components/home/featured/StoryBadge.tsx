import Badge from '@/components/ui/Badge';

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
    <Badge variant="category">
      {labels[category] || category}
    </Badge>
  );
}
