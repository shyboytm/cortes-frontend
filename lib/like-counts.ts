const BATCH_DELAY_MS = 30;
const CACHE_TTL_MS = 60_000;

type CachedCount = { count: number; fetchedAt: number };

const cache = new Map<string, CachedCount>();
const waiting = new Map<string, Array<(count: number) => void>>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  flushTimer = null;
  const batch = new Map(waiting);
  waiting.clear();
  const ids = [...batch.keys()].sort();

  let counts: Record<string, number> = {};
  try {
    const res = await fetch(`/api/likes?ids=${encodeURIComponent(ids.join(","))}`);
    if (res.ok) {
      const data = (await res.json()) as { likes?: Record<string, number> };
      counts = data.likes ?? {};
    }
  } catch {
    counts = {};
  }

  const now = Date.now();
  batch.forEach((resolvers, id) => {
    const count = counts[id] ?? 0;
    cache.set(id, { count, fetchedAt: now });
    resolvers.forEach((resolve) => resolve(count));
  });
}

export function getLikeCount(id: string): Promise<number> {
  const cached = cache.get(id);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return Promise.resolve(cached.count);
  }

  return new Promise((resolve) => {
    const resolvers = waiting.get(id) ?? [];
    resolvers.push(resolve);
    waiting.set(id, resolvers);
    if (!flushTimer) {
      flushTimer = setTimeout(flush, BATCH_DELAY_MS);
    }
  });
}

export function setLikeCount(id: string, count: number) {
  cache.set(id, { count, fetchedAt: Date.now() });
}
