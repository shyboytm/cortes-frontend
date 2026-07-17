"use client";

import { useMemo, useState } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import MusicReleaseCard from "@/components/ui/MusicReleaseCard";
import StickySubNav from "@/components/ui/StickySubNav";
import { cn } from "@/lib/utils";

export interface ReleaseFilterItem {
  _id: string;
  title: string;
  artist: string;
  releaseType?: string;
  genre?: string;
  releaseYear?: string;
  link?: string;
  likes?: number;
  artwork?: {
    alt?: string;
    asset?: SanityImageSource;
  } | null;
}

const RELEASE_TYPE_LABELS: Record<string, string> = {
  album: "Album",
  ep: "EP",
  remix: "Remix",
  single: "Single",
};

// Shared pill button used in both filter rows.
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs tracking-widest uppercase transition-colors",
        active
          ? "border-black/30 bg-black/5 text-black dark:border-white/30 dark:bg-white/10 dark:text-white"
          : "border-black/10 text-black/60 hover:border-black/30 hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

// Filters the release list (received as a prop) by artist and release
// type. The available artist and type options are derived from the data
// itself rather than a hardcoded list.
export default function MusicReleasesFilter({ releases }: { releases: ReleaseFilterItem[] }) {
  const [artist, setArtist] = useState<string | null>(null);
  const [releaseType, setReleaseType] = useState<string | null>(null);

  const artists = useMemo(
    () => Array.from(new Set(releases.map((r) => r.artist).filter(Boolean))).sort(),
    [releases]
  );
  const releaseTypes = useMemo(
    () =>
      Array.from(new Set(releases.map((r) => r.releaseType).filter(Boolean))) as string[],
    [releases]
  );

  const filtered = releases.filter(
    (r) => (!artist || r.artist === artist) && (!releaseType || r.releaseType === releaseType)
  );

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:gap-12">
        {artists.length > 1 && (
          <div>
            <h2 className="dot-font mb-3 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              / Artist
            </h2>
            <div className="flex flex-wrap gap-2">
              <FilterPill active={artist === null} onClick={() => setArtist(null)}>
                All
              </FilterPill>
              {artists.map((a) => (
                <FilterPill key={a} active={artist === a} onClick={() => setArtist(a)}>
                  {a}
                </FilterPill>
              ))}
            </div>
          </div>
        )}

        {releaseTypes.length > 1 && (
          <div>
            <h2 className="dot-font mb-3 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              / Type
            </h2>
            <div className="flex flex-wrap gap-2">
              <FilterPill active={releaseType === null} onClick={() => setReleaseType(null)}>
                All
              </FilterPill>
              {releaseTypes.map((t) => (
                <FilterPill
                  key={t}
                  active={releaseType === t}
                  onClick={() => setReleaseType(t)}
                >
                  {RELEASE_TYPE_LABELS[t] ?? t}
                </FilterPill>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sentinel marking where the in-page filter row ends. StickySubNav
          observes it and renders the same filter pills in a bar under
          PrimaryNav once it scrolls out of view; both sets of buttons share
          the same state, so clicking either filters the grid. */}
      <div id="releases-filter-sentinel" />
      <StickySubNav sentinelId="releases-filter-sentinel" ariaLabel="Filter releases">
        {artists.length > 1 && (
          <>
            <FilterPill active={artist === null} onClick={() => setArtist(null)}>
              All Artists
            </FilterPill>
            {artists.map((a) => (
              <FilterPill key={a} active={artist === a} onClick={() => setArtist(a)}>
                {a}
              </FilterPill>
            ))}
          </>
        )}
        {artists.length > 1 && releaseTypes.length > 1 && (
          <span aria-hidden className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />
        )}
        {releaseTypes.length > 1 && (
          <>
            <FilterPill active={releaseType === null} onClick={() => setReleaseType(null)}>
              All Types
            </FilterPill>
            {releaseTypes.map((t) => (
              <FilterPill key={t} active={releaseType === t} onClick={() => setReleaseType(t)}>
                {RELEASE_TYPE_LABELS[t] ?? t}
              </FilterPill>
            ))}
          </>
        )}
      </StickySubNav>

      {filtered.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">No releases match those filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((release) => (
            <MusicReleaseCard
              key={release._id}
              id={release._id}
              title={release.title}
              artist={release.artist}
              releaseType={release.releaseType}
              genre={release.genre}
              releaseYear={release.releaseYear}
              link={release.link}
              likes={release.likes}
              artwork={release.artwork}
            />
          ))}
        </div>
      )}
    </div>
  );
}
