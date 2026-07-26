import PrimaryNav from "@/components/ui/PrimaryNav";

export default function RecsLoading() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <div className="mb-10 h-10 w-40 animate-pulse rounded bg-black/5 dark:bg-white/5" />

        <div className="mb-8 flex flex-wrap gap-2 border-b border-black/10 pb-8 dark:border-white/10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
