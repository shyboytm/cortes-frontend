import PrimaryNav from "@/components/ui/PrimaryNav";

// Instant loading placeholder shown while the Photos page's Sanity fetch
// resolves, so navigation doesn't leave a blank tab.
export default function PhotosLoading() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <div className="mb-10 h-10 w-64 animate-pulse rounded bg-black/5 dark:bg-white/5" />

        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="mb-4 aspect-[4/5] w-full animate-pulse rounded-sm bg-black/5 break-inside-avoid dark:bg-white/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
