"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { setPreviousPath } from "@/lib/navigation-history";

// Mounted once in the root layout. Records the pathname you were on right
// before the current client-side navigation, in sessionStorage — so a page
// like the Work case study's back button can send you back to wherever you
// actually came from (e.g. the /work index vs. the homepage) instead of one
// hardcoded destination. `document.referrer` can't be used for this: the
// browser only sets it on a real page load, not on Next.js's pushState-based
// client navigations, so it stays stuck on whatever referred the very first
// page of the session.
export default function NavigationHistoryTracker() {
  const pathname = usePathname();
  // Ref rather than state: this only needs to persist the last-seen
  // pathname across renders, and must not itself trigger a re-render.
  const previousRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousRef.current && previousRef.current !== pathname) {
      setPreviousPath(previousRef.current);
    }
    previousRef.current = pathname;
  }, [pathname]);

  return null;
}
