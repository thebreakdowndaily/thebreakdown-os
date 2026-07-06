type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface StackProps {
  children: React.ReactNode;
  gap?: SpacingToken;
  className?: string;
  as?: 'div' | 'section';
}

const gapMap: Record<SpacingToken, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
  '3xl': 'gap-16',
  '4xl': 'gap-24',
};

export default function Stack({ children, gap = 'md', className = '', as: Tag = 'div' }: StackProps) {
  return (
    <Tag className={`flex flex-col ${gapMap[gap]} ${className}`}>
      {children}
    </Tag>
  );
}
