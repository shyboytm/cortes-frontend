import PrimaryNav from "@/components/ui/PrimaryNav";

// Instant loading placeholder shown while the Writing index page's Sanity
// fetch resolves, so navigation doesn't leave a blank tab.
export default function WritingLoading() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <div className="mb-10 h-10 w-48 animate-pulse rounded bg-black/5 dark:bg-white/5" />

        <div className="mb-8 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
