"use client";

import { useEffect, useState } from "react";

// Watches a sentinel DOM element (looked up by id) via IntersectionObserver
// and reports whether it has scrolled out of view. Used to drive "sticky bar
// takes over once the in-page original scrolls away" patterns.
export function useSentinelVisible(sentinelId: string): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  return visible;
}
