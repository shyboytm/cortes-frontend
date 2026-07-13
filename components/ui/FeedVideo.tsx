'use client';

import { useState } from 'react';

export interface FeedVideoProps {
  url: string;
  mimeType?: string;
}

// Split out from FeedGrid (a server component) purely so this can listen for
// a failed decode — most likely cause is a browser that can't play back
// whatever container/codec was uploaded (e.g. an iPhone .mov saved with HEVC)
// — and show something visible instead of silently rendering an empty box.
export default function FeedVideo({ url, mimeType }: FeedVideoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-black/40 dark:text-white/40">
        This video format isn&apos;t playable in this browser.
      </div>
    );
  }

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
    >
      <source src={url} type={mimeType} />
    </video>
  );
}
