"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { setPreviousPath } from "@/lib/navigation-history";

export default function NavigationHistoryTracker() {
  const pathname = usePathname();
  const previousRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousRef.current && previousRef.current !== pathname) {
      setPreviousPath(previousRef.current);
    }
    previousRef.current = pathname;
  }, [pathname]);

  return null;
}
