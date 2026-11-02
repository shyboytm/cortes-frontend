"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const CAPABLE_DEVICE_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const REVEAL_DELAY_MS = 1500;

function subscribe(onChange: () => void) {
  const media = window.matchMedia(CAPABLE_DEVICE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(CAPABLE_DEVICE_QUERY).matches;
const getServerSnapshot = () => false;

export function useShaderEligible(): boolean {
  const capable = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [delayElapsed, setDelayElapsed] = useState(false);

  useEffect(() => {
    if (!capable) return;
    const id = window.setTimeout(() => setDelayElapsed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [capable]);

  return capable && delayElapsed;
}
