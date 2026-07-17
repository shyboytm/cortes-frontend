import PrimaryNav from "@/components/ui/PrimaryNav";

// Instant loading placeholder shown while the Work index page's Sanity
// fetch resolves, so navigation doesn't leave a blank tab.
export default function WorkLoading() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <div className="mb-10 h-10 w-64 animate-pulse rounded bg-black/5 dark:bg-white/5" />

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/3] w-full animate-pulse rounded-sm bg-black/5 dark:bg-white/5" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-black/5 dark:bg-white/5" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-black/5 dark:bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
