"use client";

import { useEffect, useState } from "react";

// Tracks whether the tab is currently the active/visible one via the Page
// Visibility API. Used to pause permanently-mounted, GPU-heavy canvases
// (shader backgrounds, etc.) instead of letting them render forever in
// background tabs.
export function useIsTabVisible() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const update = () => setIsVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return isVisible;
}
