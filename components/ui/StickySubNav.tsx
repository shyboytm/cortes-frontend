"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface StickySubNavProps {
  // The id of a sentinel element the page renders right after its own
  // in-page nav row — once that scrolls out of view (past PrimaryNav), this
  // bar takes over showing the same links so they stay reachable.
  sentinelId: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

// Generic version of the same idea BlogStickyBar uses for a single post's
// title/back/like row: mirrors an in-page nav (Blog's year jump links,
// Music's streaming links) into a bar pinned under PrimaryNav, revealed via
// IntersectionObserver once the real one scrolls out of view rather than a
// hardcoded scroll offset.
export default function StickySubNav({ sentinelId, ariaLabel, children }: StickySubNavProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "dot-font glass fixed inset-x-0 top-20 z-40 px-3 transition-all duration-200 ease-out md:px-4 lg:px-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
      )}
    >
      {/* No font-doto override here (unlike BlogStickyBar's wrapper) — these
          links are plain buttonVariants pills with no font override in
          their original, inline nav, so the mirrored version stays in the
          same Ufficio/sans family rather than picking up the dot font. */}
      <nav
        aria-label={ariaLabel}
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 rounded-lg border border-black/10 bg-white/80 px-6 py-3 dark:border-white/10 dark:bg-black/80"
      >
        {children}
      </nav>
    </div>
  );
}
