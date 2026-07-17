import PrimaryNav from "@/components/ui/PrimaryNav";

// Instant loading placeholder shown while the Releases page's Sanity fetch
// resolves, so navigation doesn't leave a blank tab.
export default function MusicReleasesLoading() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <div className="mb-10 h-10 w-40 animate-pulse rounded bg-black/5 dark:bg-white/5" />

        <div className="mb-8 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square w-full animate-pulse rounded-sm bg-black/5 dark:bg-white/5" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-black/5 dark:bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
