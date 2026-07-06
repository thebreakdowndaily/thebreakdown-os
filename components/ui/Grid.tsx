type GridCols = 1 | 2 | 3 | 4 | 6 | 12;
type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface GridProps {
  children: React.ReactNode;
  cols?: GridCols;
  gap?: GridGap;
  className?: string;
}

const colsMap: Record<GridCols, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  12: 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12',
};

const gapMap: Record<GridGap, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

export default function Grid({ children, cols = 1, gap = 'lg', className = '' }: GridProps) {
  return (
    <div className={`grid grid-cols-1 ${colsMap[cols]} gap-4 sm:${gapMap[gap]} ${className}`}>
      {children}
    </div>
  );
}
