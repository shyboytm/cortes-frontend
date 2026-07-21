"use client";

import { useEffect, useState } from "react";
import { PREVIOUS_PATH_KEY } from "@/lib/navigation-history";

// Resolves a "Back" link's destination based on the page you actually
// arrived from, tracked by NavigationHistoryTracker. Returns `fallbackHref`
// on the very first render (server-rendered markup can't know the client's
// navigation history), then swaps to `matchHref` after mount if the
// recorded previous pathname is an exact match for `exactMatchPath`.
export function useSmartBackHref(fallbackHref: string, exactMatchPath: string, matchHref: string): string {
  const [href, setHref] = useState(fallbackHref);

  useEffect(() => {
    let previousPath: string | null = null;
    try {
      previousPath = window.sessionStorage.getItem(PREVIOUS_PATH_KEY);
    } catch {
      previousPath = null;
    }
    // sessionStorage only exists client-side, so this can't be computed
    // during the initial (possibly server) render without risking a
    // hydration mismatch — it has to resolve here, once, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value, not a derived/re-render loop
    setHref(previousPath === exactMatchPath ? matchHref : fallbackHref);
  }, [fallbackHref, exactMatchPath, matchHref]);

  return href;
}
