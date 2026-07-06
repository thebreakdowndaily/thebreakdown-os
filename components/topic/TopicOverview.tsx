export default function TopicOverview({ overview }: { overview: string }) {
  if (!overview) return null;

  return (
    <section aria-label="Overview" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Overview</h2>
      <div className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed space-y-4 max-w-3xl">
        {overview.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
