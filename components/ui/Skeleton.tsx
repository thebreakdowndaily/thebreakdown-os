import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string;
  height?: string;
}

const variants: Record<string, string> = {
  text: 'rounded-sm h-4',
  rect: 'rounded-md',
  circle: 'rounded-full',
};

export default function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-tertiary",
        variants[variant],
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
