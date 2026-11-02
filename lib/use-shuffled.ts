"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export function useRandomValue(): number {
  const [value] = useState(() => Math.random());
  return value;
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  let state = Math.floor(seed * 2 ** 32) >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useShuffled<T>(items: T[]): { items: T[]; ready: boolean } {
  const hydrated = useHydrated();
  const seed = useRandomValue();
  const shuffled = useMemo(() => (hydrated ? shuffleWithSeed(items, seed) : items), [hydrated, items, seed]);

  return { items: shuffled, ready: hydrated };
}
