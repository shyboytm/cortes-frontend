"use client";

import { useEffect, useState } from "react";
import { PREVIOUS_PATH_KEY } from "@/lib/navigation-history";

export function useSmartBackHref(fallbackHref: string, exactMatchPath: string, matchHref: string): string {
  const [href, setHref] = useState(fallbackHref);

  useEffect(() => {
    let previousPath: string | null = null;
    try {
      previousPath = window.sessionStorage.getItem(PREVIOUS_PATH_KEY);
    } catch {
      previousPath = null;
    }
    setHref(previousPath === exactMatchPath ? matchHref : fallbackHref);
  }, [fallbackHref, exactMatchPath, matchHref]);

  return href;
}
