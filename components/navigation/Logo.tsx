import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="The Breakdown — Home">
      <div className="w-[14px] h-[14px] bg-amber-500 rounded-sm transition-transform duration-200 group-hover:scale-110" />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-amber-500 leading-none">The Breakdown</span>
        <span className="text-[11px] text-gray-400 tracking-widest uppercase leading-tight">India Explained</span>
      </div>
    </Link>
  );
}
