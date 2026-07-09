import Link from 'next/link';

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 group shrink-0"
      aria-label="The Breakdown — Home"
    >
      {/* Mark: single amber square — simple, recognizable */}
      <div
        className="w-[10px] h-[10px] bg-amber-400 rounded-[2px] transition-all duration-300 group-hover:rounded-full"
        aria-hidden="true"
      />
      <div className="flex flex-col leading-none">
        <span
          className="text-[17px] font-bold tracking-[-0.01em] text-white leading-none"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          The Breakdown
        </span>
        <span className="text-[10px] font-medium text-neutral-500 tracking-[0.12em] uppercase mt-[3px]">
          India Explained
        </span>
      </div>
    </Link>
  );
}
