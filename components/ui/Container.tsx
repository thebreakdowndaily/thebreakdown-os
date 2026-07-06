interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div';
}

export default function Container({ children, className = '', as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag className={`w-full max-w-[1440px] mx-auto px-4 sm:px-8 ${className}`}>
      {children}
    </Tag>
  );
}
