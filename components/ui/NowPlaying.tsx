"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiLastdotfm } from "@icons-pack/react-simple-icons";
import type { NowPlayingTrack } from "@/lib/lastfm";

export default function NowPlaying() {
  const [track, setTrack] = useState<NowPlayingTrack | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/now-playing");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setTrack(data?.track ?? null);
      } catch {
        if (!cancelled) setTrack(null);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!track) return null;

  return (
    <Link
      href={track.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center gap-4 rounded-md border border-black/10 py-4 pr-6 pl-4 transition-colors hover:border-black/20 sm:w-[380px] bg-transparent dark:hover:bg-white/5 hover:bg-black/10 dark:border-white/10 dark:hover:border-white/20"
    >
      <div className="relative h-16 w-16 shrink-0 rounded-full bg-black shadow-inner [animation:spin_7s_linear_infinite] motion-reduce:animate-none dark:bg-neutral-800">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at center, transparent 0px, transparent 3px, rgba(255,255,255,0.12) 4px)",
          }}
        />
        <div className="absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/20 bg-black/40">
          {track.imageUrl ? (
            <Image
              src={track.imageUrl}
              alt={track.album || track.title}
              fill
              className="object-cover"
              sizes="28px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/60">
              <SiLastdotfm size={12} />
            </div>
          )}
        </div>
        <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
      </div>

      <div className="flex flex-col gap-1 overflow-hidden tracking-wider">
        <span className="dot-font font-doto text-xs tracking-widest text-green-800 uppercase dark:text-green-400">
          {track.isNowPlaying ? "Now Playing" : "Last Played"}
        </span>
        <span className="max-w-[300px] truncate text-sm text-black dark:text-white">{track.title}</span>
        <span className="max-w-[300px] truncate text-xs text-black/60 dark:text-white/60">by {track.artist}</span>
      </div>
    </Link>
  );
}
