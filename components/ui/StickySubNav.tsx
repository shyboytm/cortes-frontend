"use client";

import { useSentinelVisible } from "@/lib/hooks/useSentinelVisible";
import { cn } from "@/lib/utils";

export interface StickySubNavProps {
  // The id of a sentinel element the page renders right after its own
  // in-page nav row — once that scrolls out of view (past PrimaryNav), this
  // bar takes over showing the same links so they stay reachable.
  sentinelId: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

// Mirrors an in-page nav (e.g. Blog's year jump links, Music's streaming
// links) into a bar pinned under PrimaryNav, revealed via
// IntersectionObserver once the original nav scrolls out of view.
export default function StickySubNav({ sentinelId, ariaLabel, children }: StickySubNavProps) {
  const visible = useSentinelVisible(sentinelId);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        // Hidden below sm; the mirrored links only appear at tablet/desktop
        // widths.
        //
        // top-[92px] matches PrimaryNav's height (Logo + hamburger) at
        // every breakpoint. No dot-font here, since its dark-mode
        // text-shadow would add extra glow to these pills.
        "glass fixed inset-x-0 top-[92px] z-40 hidden px-3 transition-all duration-200 ease-out sm:block md:px-4 lg:px-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
      )}
    >
      {/* These links are plain buttonVariants pills with no font override,
          so the mirrored version stays in the sans font family. */}
      <nav
        aria-label={ariaLabel}
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 rounded-lg border border-black/10 bg-white/80 px-6 py-3 dark:border-white/10 dark:bg-black/80"
      >
        {children}
      </nav>
    </div>
  );
}
