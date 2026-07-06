import Badge from '@/components/ui/Badge';

interface EvidenceBadgeProps {
  score: number;
}

export default function EvidenceBadge({ score }: EvidenceBadgeProps) {
  return (
    <Badge variant="evidence">Evidence {score}</Badge>
  );
}
