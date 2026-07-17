"use client";

import { useEffect, useState } from "react";

// Tracks the OS light/dark preference via the prefers-color-scheme media
// query, listening for changes and cleaning up on unmount. Defaults to dark
// until the listener attaches (SSR-safe: no window access outside the
// effect).
export function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setIsDark(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDark;
}
