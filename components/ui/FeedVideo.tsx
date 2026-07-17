'use client';

import { useState } from 'react';

export interface FeedVideoProps {
  url: string;
  mimeType?: string;
}

// Renders a video, falling back to a text message if the browser can't play
// back the uploaded container/codec (e.g. an iPhone .mov saved with HEVC).
export default function FeedVideo({ url, mimeType }: FeedVideoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-black/60 dark:text-white/60">
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
