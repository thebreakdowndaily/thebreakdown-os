interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string;
  height?: string;
}

const variants: Record<string, string> = {
  text: 'rounded-md h-4',
  rect: 'rounded-2xl',
  circle: 'rounded-full',
};

export default function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#2A2A2A] ${variants[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
