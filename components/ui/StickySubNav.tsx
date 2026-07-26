"use client";

import { useSentinelVisible } from "@/lib/hooks/useSentinelVisible";
import { cn } from "@/lib/utils";

export interface StickySubNavProps {
  sentinelId: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

export default function StickySubNav({ sentinelId, ariaLabel, children }: StickySubNavProps) {
  const visible = useSentinelVisible(sentinelId);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "glass fixed inset-x-0 top-[92px] z-40 hidden px-3 transition-all duration-200 ease-out sm:block md:px-4 lg:px-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
      )}
    >
      <nav
        aria-label={ariaLabel}
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 rounded-lg border border-black/10 bg-white/80 px-6 py-3 dark:border-white/10 dark:bg-black/80"
      >
        {children}
      </nav>
    </div>
  );
}
