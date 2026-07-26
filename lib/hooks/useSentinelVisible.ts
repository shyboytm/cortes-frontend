"use client";

import { useEffect, useState } from "react";

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
