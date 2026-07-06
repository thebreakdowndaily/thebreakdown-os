interface DividerProps {
  className?: string;
}

export default function Divider({ className = '' }: DividerProps) {
  return <hr className={`border-t border-[#2A2A2A] ${className}`} />;
}
